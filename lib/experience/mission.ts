import type { DemoAdapter, TraceEvent } from "@/design-system/demo/types";
import { CASES, runBatch, type BatchResult } from "./batch";

export type MissionInput = { reviewThreshold: number };
/** comparison counts sanctioned cases that went straight through. */
export type MissionResult = BatchResult & { comparison: { withCheck: number; withoutCheck: number } };

const STEP = 3;
const SANCTIONED = new Set(CASES.filter(c => c.sanctions).map(c => c.id));
const slipped = (b: BatchResult) => b.items.filter(i => SANCTIONED.has(i.id) && i.decision === "proceed").length;

/** Runs the 12 cases at one threshold; the trace reveals them three at a time. */
export const runMission: DemoAdapter<MissionInput, MissionResult> = async (input, signal, onEvent) => {
  const startedAt = performance.now();
  if (!Number.isFinite(input.reviewThreshold) || input.reviewThreshold < 0 || input.reviewThreshold > 100) throw new Error("The review threshold must be between 0 and 100.");
  const batch = runBatch(input.reviewThreshold);
  const trace: TraceEvent[] = [];
  for (let i = 0; i < batch.items.length; i += STEP) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const n = i / STEP + 1;
    const event: TraceEvent = { id: `batch-${n}`, step: n, kind: "decision", messageKey: `batch.${n}`, timestampMs: performance.now() - startedAt, evidenceIds: batch.items.slice(i, i + STEP).map(c => c.id) };
    trace.push(event);
    onEvent(event);
  }
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  const comparison = { withCheck: slipped(batch), withoutCheck: slipped(runBatch(input.reviewThreshold, { screening: false })) };
  return { input, result: { ...batch, comparison }, trace, executionMs: performance.now() - startedAt, mode: "simulation" };
};
