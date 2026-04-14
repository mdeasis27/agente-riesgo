// Calcula el nivel de confianza de una decisión de riesgo

import type { TruoraVerification } from "./truora";

export function computeConfidence(params: {
  truora: TruoraVerification;
  exaResultCount: number;
  hasConflictingSignals: boolean;
}): number {
  let confidence = 0.5;

  if (params.truora.identity_confirmed) confidence += 0.2;
  if (!params.truora.sanctions_hit) confidence += 0.1;
  if (!params.truora.judicial_records) confidence += 0.1;
  if (params.exaResultCount >= 3) confidence += 0.1;
  if (params.hasConflictingSignals) confidence -= 0.2;

  // Señales de alerta bajan la confianza inmediatamente
  if (params.truora.sanctions_hit) confidence -= 0.3;
  if (params.truora.pep_hit) confidence -= 0.1;

  return Math.max(0, Math.min(1, confidence));
}

export const ESCALATION_THRESHOLD = 0.65;

export function shouldEscalate(confidence: number): boolean {
  return confidence < ESCALATION_THRESHOLD;
}
