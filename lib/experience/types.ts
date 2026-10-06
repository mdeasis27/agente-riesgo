export type TraceEvent = { id: string; step: number; kind: "evidence" | "decision"; messageKey: string; timestampMs: number; evidenceIds?: string[] };
export type DemoRun<I, R> = { input: I; result: R; trace: TraceEvent[]; executionMs: number; mode: "simulation" };
export type DemoAdapter<I, R> = (input: I, signal: AbortSignal, onEvent: (event: TraceEvent) => void) => Promise<DemoRun<I, R>>;

export type ExperienceInput = { verification: "confirmed" | "missing"; sanctions: boolean; evidenceCoverage: number; reviewThreshold: number };
export type ExperienceResult = { decision: "proceed" | "review" | "stop"; evidence: { id: string; state: "positive" | "warning" | "block" }[]; queue: "standard" | "priority"; explanation: string };
