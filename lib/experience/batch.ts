import { simulatePolicy } from "./policy";
import type { ExperienceInput, ExperienceResult } from "./types";

type Decision = ExperienceResult["decision"];
export type BatchCase = { id: string } & Omit<ExperienceInput, "reviewThreshold">;

/** Twelve fictional credit cases. The batch only picks the inputs; every decision comes from simulatePolicy. */
export const CASES: BatchCase[] = [
  ...[95, 90, 85, 80, 70, 60, 50, 40, 30].map((c, i) => ({ id: `case-${i + 1}`, verification: "confirmed" as const, sanctions: false, evidenceCoverage: c })),
  { id: "case-10", verification: "missing", sanctions: false, evidenceCoverage: 80 },
  { id: "case-11", verification: "missing", sanctions: false, evidenceCoverage: 60 },
  { id: "case-12", verification: "confirmed", sanctions: true, evidenceCoverage: 90 },
];

export type BatchResult = { items: { id: string; decision: Decision }[]; counts: Record<Decision, number> };

/** Runs every case at one review threshold. Without screening, the sanctions hit is ignored. */
export function runBatch(reviewThreshold: number, { screening = true }: { screening?: boolean } = {}): BatchResult {
  const items = CASES.map(({ id, ...c }) => ({ id, decision: simulatePolicy({ ...c, sanctions: screening && c.sanctions, reviewThreshold }).decision }));
  const counts: Record<Decision, number> = { proceed: 0, review: 0, stop: 0 };
  for (const i of items) counts[i.decision]++;
  return { items, counts };
}
