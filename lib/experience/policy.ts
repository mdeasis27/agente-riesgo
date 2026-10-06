import type { ExperienceInput, ExperienceResult } from "./types";

export function simulatePolicy(input: ExperienceInput): ExperienceResult {
  const evidence = [
    { id: "verification-record", state: input.verification === "confirmed" ? "positive" as const : "warning" as const },
    { id: "sanctions-screen", state: input.sanctions ? "block" as const : "positive" as const },
    { id: "evidence-bundle", state: input.evidenceCoverage >= 70 ? "positive" as const : "warning" as const },
  ];
  if (input.sanctions) return { decision: "stop", queue: "priority", evidence, explanation: "A blocking screening signal requires a human stop decision." };
  const reviewScore = (input.verification === "missing" ? 55 : 0) + (100 - input.evidenceCoverage) / 2;
  const review = reviewScore >= input.reviewThreshold;
  return { decision: review ? "review" : "proceed", queue: review ? "priority" : "standard", evidence, explanation: review ? "The evidence policy routes this scenario to review." : "The configured policy allows the workflow to proceed." };
}
