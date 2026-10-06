import type { ExperienceInput } from "./types";

export const riskScenarios: Record<"clear" | "blocked", ExperienceInput> = {
  clear: { verification: "confirmed", sanctions: false, evidenceCoverage: 85, reviewThreshold: 50 },
  blocked: { verification: "confirmed", sanctions: true, evidenceCoverage: 85, reviewThreshold: 50 },
};

export function isRiskScenario(input: ExperienceInput, id: keyof typeof riskScenarios) {
  const scenario = riskScenarios[id];
  return Object.keys(scenario).every((key) => input[key as keyof ExperienceInput] === scenario[key as keyof ExperienceInput]);
}
