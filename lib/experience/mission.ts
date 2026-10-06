import { runExperience, type ExperienceInput, type ExperienceResult } from "./adapter";
import type { DemoAdapter } from "@/design-system/demo/types";

export type MissionResult = ExperienceResult & {
  comparison: { cautious: ExperienceResult; permissive: ExperienceResult };
};

export const runMission: DemoAdapter<ExperienceInput, MissionResult> = async (input, signal, onEvent) => {
  const started = performance.now();
  const run = await runExperience(input, signal, onEvent);
  const cautious = await runExperience({ ...input, reviewThreshold: 20 }, signal, () => {});
  const permissive = await runExperience({ ...input, reviewThreshold: 50 }, signal, () => {});
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  return { ...run, executionMs: performance.now() - started, result: { ...run.result, comparison: { cautious: cautious.result, permissive: permissive.result } } };
};
