// Motor principal del agente de riesgo — razonamiento + decisión + escalamiento

import { generateObject } from "ai";
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

  const prompt = `Eres un agente experto en decisiones de riesgo. Analiza la evidencia (validación de identidad Truora + búsqueda web Exa.ai) y toma una decisión sobre la solicitud.

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

Toma una decisión fundamentada basada en toda la evidencia disponible.`;

  const { object } = await generateObject({
    model: openrouter.chat("google/gemini-2.0-flash-exp:free"),
    schema: decisionSchema,
    prompt,
  });

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
