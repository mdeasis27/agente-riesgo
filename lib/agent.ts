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
  escalation_reason: z.string().optional(),
});

export async function evaluateCase(params: {
  name: string;
  context: string;
  truora: TruoraVerification;
  exaResults: ExaResult[];
}): Promise<AgentDecision> {
  const confidence = computeConfidence({
    truora: params.truora,
    exaResultCount: params.exaResults.length,
    hasConflictingSignals: false,
  });

  const webEvidence = params.exaResults
    .map((r) => `[${r.title}] ${r.text.slice(0, 500)}`)
    .join("\n\n");

  const evidenceSources = params.exaResults
    .filter((r) => r.url !== "#")
    .map((r) => r.url);

  const prompt = `Eres un agente experto en decisiones de riesgo. Analiza la evidencia y toma una decisión sobre la solicitud.

SUJETO: ${params.name}
CONTEXTO: ${params.context}

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

  const { text } = await generateText({
    model: openrouter.chat("google/gemma-4-31b-it:free"),
    prompt,
  });

  // Extraer JSON de posibles bloques markdown (```json ... ```)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (jsonMatch ? jsonMatch[1] : text).trim();
  const object = decisionSchema.parse(JSON.parse(raw));

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
