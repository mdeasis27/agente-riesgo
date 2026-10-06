import type { TapeStatus } from "@/design-system/demo/outcome-tape";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import type { ExperienceResult } from "./types";

const CELL: Record<ExperienceResult["decision"], TapeStatus> = { proceed: "served", review: "rerouted", stop: "lost" };

export function riesgoCells(items: readonly { decision: ExperienceResult["decision"] }[], revealed: number): TapeStatus[] {
  return items.map((c, i) => (i >= revealed ? "pending" : CELL[c.decision]));
}

export function revealedCases(frame: { visible: number; total: number; complete: boolean }, n: number, reducedMotion: boolean): number {
  if (reducedMotion || frame.complete || frame.total === 0) return n;
  return Math.ceil((n * frame.visible) / frame.total);
}

export const COMPLETE_FRAME: PlaybackFrame<TraceEvent> = { visible: 0, total: 0, event: undefined, complete: true };
