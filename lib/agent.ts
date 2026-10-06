// Motor principal del agente de riesgo — razonamiento + decisión + escalamiento

import { z } from "zod";
import { chat, AllProvidersFailedError } from "@/ai-kit/client";
import type { UserApiKey } from "@/ai-kit/types";
import type { TruoraVerification } from "./truora";
import type { ExaResult } from "./exa";
import { computeConfidence, shouldEscalate } from "./confidence";

export type Decision = "approve" | "reject" | "escalate";

export interface AgentDecision {
  decision: Decision;
  confidence: number;
  reasoning: string;
  red_flags: string[];
  positive_signals: string[];
  escalation_reason?: string;
  evidence_sources: string[];
  provider?: string;
  model?: string;
  latency_ms?: number;
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

export async function evaluateCase(params: {
  name: string;
  context: string;
  truora: TruoraVerification;
  exaResults: ExaResult[];
  userApiKey?: UserApiKey;
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

  const systemPrompt = `Eres un agente experto en decisiones de riesgo. Analiza la evidencia y toma una decisión.
Responde ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto adicional:
{
  "decision": "approve" | "reject" | "escalate",
  "confidence": número entre 0 y 1,
  "reasoning": "razonamiento completo en español",
  "red_flags": ["señal negativa 1"],
  "positive_signals": ["señal positiva 1"],
  "escalation_reason": "motivo si aplica, omitir si no"
}`;

  const userContent = `SUJETO: ${safeName}
CONTEXTO: ${safeContext}

VALIDACIÓN DE IDENTIDAD (proveedor configurado):
- Identidad confirmada: ${params.truora.identity_confirmed}
- Sanciones: ${params.truora.sanctions_hit ? "POSITIVO — ALERTA" : "limpio"}
- PEP: ${params.truora.pep_hit ? "SÍ" : "NO"}
- Antecedentes judiciales: ${params.truora.judicial_records ? "SÍ" : "NO"}

EVIDENCIA WEB (Exa.ai):
${webEvidence}

CONFIANZA INICIAL: ${confidence.toFixed(2)}`;

  let response: Awaited<ReturnType<typeof chat>>;
  try {
    response = await chat({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      maxTokens: 1024,
      userApiKey: params.userApiKey,
    });
  } catch (err) {
    if (err instanceof AllProvidersFailedError) {
      throw new Error("No hay modelos de IA disponibles en este momento.");
    }
    throw err;
  }

  const jsonMatch = response.text.match(/```(?:json)?\s*([\s\S]*?)```/) ??
    response.text.match(/\{[\s\S]*\}/);
  const raw = jsonMatch
    ? (jsonMatch[1] ?? jsonMatch[0]).trim()
    : response.text.trim();

  const object = decisionSchema.parse(JSON.parse(raw));
  console.log(`[agent] provider=${response.provider} model=${response.model}`);

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
    provider: response.provider,
    model: response.model,
    latency_ms: response.latency_ms,
  };
}
