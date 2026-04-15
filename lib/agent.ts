// Motor principal del agente de riesgo — razonamiento + decisión + escalamiento

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import type { TruoraVerification } from "./truora";
import type { ExaResult } from "./exa";
import { computeConfidence, shouldEscalate } from "./confidence";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

export type Decision = "approve" | "reject" | "escalate";

export interface AgentDecision {
  decision: Decision;
  confidence: number;
  reasoning: string;
  red_flags: string[];
  positive_signals: string[];
  escalation_reason?: string;
  evidence_sources: string[];
}

const decisionSchema = z.object({
  decision: z.enum(["approve", "reject", "escalate"]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  red_flags: z.array(z.string()),
  positive_signals: z.array(z.string()),
  escalation_reason: z.string().nullish().transform((v) => v ?? undefined),
});

function sanitizeInput(value: string, maxLength = 200): string {
  return value.replace(/[\r\n\t\x00-\x1F\x7F]/g, " ").slice(0, maxLength).trim();
}

// Cache de modelos gratuitos disponibles en OpenRouter (TTL: 10 min)
let _cachedFreeModels: string[] = [];
let _cacheExpiry = 0;

async function getAvailableFreeModels(): Promise<string[]> {
  if (_cachedFreeModels.length > 0 && Date.now() < _cacheExpiry) {
    return _cachedFreeModels;
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as {
      data: Array<{ id: string; pricing: { completion: string; prompt: string } }>;
    };

    const freeModels = data.data
      .filter(
        (m) =>
          m.id.endsWith(":free") &&
          parseFloat(m.pricing?.completion ?? "1") === 0
      )
      .map((m) => m.id);

    if (freeModels.length > 0) {
      _cachedFreeModels = freeModels;
      _cacheExpiry = Date.now() + 10 * 60 * 1000;
      console.log(`[agent] ${freeModels.length} modelos gratuitos disponibles en OpenRouter`);
    }

    return freeModels;
  } catch (err) {
    console.warn("[agent] No se pudo obtener la lista de modelos, usando fallback:", err);
    return [];
  }
}

// Modelos preferidos — se usan primero si están en la lista de disponibles
const PREFERRED_MODELS = [
  "google/gemma-4-31b-it:free",
  "google/gemma-3-27b-it:free",
  "google/gemma-3-12b-it:free",
  "meta-llama/llama-4-scout:free",
  "meta-llama/llama-4-maverick:free",
  "qwen/qwen3-30b-a3b:free",
  "qwen/qwen3-14b:free",
  "qwen/qwen3-8b:free",
  "deepseek/deepseek-r1:free",
  "mistralai/mistral-small-24b-instruct-2501:free",
];

export async function evaluateCase(params: {
  name: string;
  context: string;
  truora: TruoraVerification;
  exaResults: ExaResult[];
}): Promise<AgentDecision> {
  const hasConflictingSignals =
    params.truora.identity_confirmed &&
    (params.truora.sanctions_hit || params.truora.judicial_records);

  const confidence = computeConfidence({
    truora: params.truora,
    exaResultCount: params.exaResults.length,
    hasConflictingSignals,
  });

  const webEvidence = params.exaResults
    .map((r) => `[${r.title}] ${r.text.slice(0, 500)}`)
    .join("\n\n");

  const evidenceSources = params.exaResults
    .filter((r) => r.url.startsWith("https://"))
    .map((r) => r.url);

  const safeName = sanitizeInput(params.name);
  const safeContext = sanitizeInput(params.context, 50);

  const prompt = `Eres un agente experto en decisiones de riesgo. Analiza la evidencia y toma una decisión sobre la solicitud.

SUJETO: ${safeName}
CONTEXTO: ${safeContext}

VALIDACIÓN DE IDENTIDAD (Truora):
- Identidad confirmada: ${params.truora.identity_confirmed}
- Sanciones: ${params.truora.sanctions_hit ? "POSITIVO — ALERTA" : "limpio"}
- PEP (Persona Expuesta Políticamente): ${params.truora.pep_hit ? "SÍ" : "NO"}
- Antecedentes judiciales: ${params.truora.judicial_records ? "SÍ" : "NO"}

EVIDENCIA WEB (Exa.ai):
${webEvidence}

CONFIANZA INICIAL CALCULADA: ${confidence.toFixed(2)}

Responde ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto adicional:
{
  "decision": "approve" | "reject" | "escalate",
  "confidence": número entre 0 y 1,
  "reasoning": "razonamiento completo en español",
  "red_flags": ["señal negativa 1", "señal negativa 2"],
  "positive_signals": ["señal positiva 1"],
  "escalation_reason": "motivo de escalamiento si aplica, omitir si no"
}`;

  // Obtener modelos disponibles en tiempo real y ordenar por preferencia
  const available = await getAvailableFreeModels();
  const modelsToTry =
    available.length > 0
      ? [
          // Preferidos que estén disponibles, en orden
          ...PREFERRED_MODELS.filter((m) => available.includes(m)),
          // Resto de disponibles como último recurso
          ...available.filter((m) => !PREFERRED_MODELS.includes(m)).slice(0, 5),
        ]
      : PREFERRED_MODELS; // fallback si no se pudo consultar la API

  if (modelsToTry.length === 0) {
    throw new Error("No hay modelos gratuitos disponibles en este momento.");
  }

  let object: z.infer<typeof decisionSchema> | null = null;
  let lastError: unknown;

  for (const modelId of modelsToTry) {
    // 1. Llamar al modelo
    let text: string;
    try {
      const result = await generateText({
        model: openrouter.chat(modelId),
        prompt,
        maxRetries: 0,
      });
      text = result.text;
    } catch (err) {
      lastError = err;
      const statusCode = (err as { statusCode?: number }).statusCode;
      const msg = err instanceof Error ? err.message : String(err);
      const shouldRetry =
        statusCode === 429 ||
        statusCode === 404 ||
        msg.includes("rate") ||
        msg.includes("No endpoints found") ||
        msg.includes("Provider returned error");
      if (!shouldRetry) throw err;
      console.warn(`[agent] ${modelId} no disponible (${statusCode ?? "err"}), probando siguiente…`);
      continue;
    }

    // 2. Parsear JSON — si el modelo no sigue el formato, intentar con el siguiente
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const raw = (jsonMatch ? jsonMatch[1] : text).trim();
      object = decisionSchema.parse(JSON.parse(raw));
      console.log(`[agent] modelo usado: ${modelId}`);
      break;
    } catch {
      console.warn(`[agent] ${modelId} devolvió JSON inválido, probando siguiente…`);
      lastError = new Error(`${modelId} no siguió el formato JSON requerido`);
    }
  }

  if (!object) throw lastError ?? new Error("Ningún modelo disponible pudo procesar la solicitud.");

  let finalDecision = object.decision;
  if (shouldEscalate(object.confidence) && finalDecision !== "escalate") {
    finalDecision = "escalate";
  }

  return {
    decision: finalDecision,
    confidence: object.confidence,
    reasoning: object.reasoning,
    red_flags: object.red_flags,
    positive_signals: object.positive_signals,
    escalation_reason: object.escalation_reason,
    evidence_sources: evidenceSources,
  };
}
