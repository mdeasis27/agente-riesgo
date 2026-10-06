"use client";
import type { CSSProperties } from "react";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { StoryStage } from "@/design-system/demo/decision-lab";
import { OutcomeTape, useReducedMotion } from "@/design-system/demo/project-story";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import type { MissionResult } from "./mission";
import { revealedCases, riesgoCells, riesgoPlacements, type Placement } from "./scene-state";
import { STORY } from "./story";

type Decision = MissionResult["items"][number]["decision"];
type Box = { x: number; y: number; w: number; h: number };
type Point = { x: number; y: number };
type Layout = { w: number; h: number; queue: (slot: number) => Point; scan: Point; list: Box; boxes: Record<Decision, Box>; perRow: number; lanes: string[]; queueLabel: Point };

// One trace step is 800 ms at 1x: three staggered crossings fit inside it.
const STEP_MS = 160;
const CROSS_MS = 480;
const PERSON = 26;

// Wide stage: line on the left, scanner in the middle, destinations stacked on the right.
const WIDE: Layout = {
  w: 720, h: 380, perRow: 10,
  queue: s => ({ x: 270 - s * 20, y: 250 }), scan: { x: 315, y: 250 }, queueLabel: { x: 40, y: 196 },
  list: { x: 230, y: 20, w: 170, h: 60 },
  boxes: { stop: { x: 430, y: 20, w: 280, h: 78 }, proceed: { x: 430, y: 116, w: 280, h: 118 }, review: { x: 430, y: 252, w: 280, h: 118 } },
  lanes: ["M40 250 H300", "M345 250 Q390 250 430 175", "M345 250 Q390 250 430 311", "M345 250 Q390 100 430 59"],
};

// Phone stage: line on top, scanner beside the list, destinations stacked below in full width.
const TALL: Layout = {
  w: 360, h: 614, perRow: 12,
  queue: s => ({ x: 34 + s * 26, y: 84 }), scan: { x: 90, y: 196 }, queueLabel: { x: 14, y: 30 },
  list: { x: 170, y: 150, w: 176, h: 60 },
  boxes: { stop: { x: 10, y: 264, w: 340, h: 78 }, proceed: { x: 10, y: 356, w: 340, h: 118 }, review: { x: 10, y: 488, w: 340, h: 118 } },
  lanes: ["M34 84 H340"],
};

const TONE: Record<Decision, { fill: string; stroke: string; text: string }> = {
  proceed: { fill: "fill-success", stroke: "stroke-success", text: "fill-success" },
  review: { fill: "fill-info", stroke: "stroke-info", text: "fill-info" },
  stop: { fill: "fill-danger", stroke: "stroke-danger", text: "fill-danger" },
};

function spot(l: Layout, p: Placement): Point {
  if (p.at === "queue") return l.queue(p.slot);
  const b = l.boxes[p.at];
  return { x: b.x + 22 + (p.slot % l.perRow) * PERSON, y: b.y + 68 + Math.floor(p.slot / l.perRow) * 44 };
}

/** One passenger: head, body tinted by the decision, a bag whose lid opens on review and an × on a stop. */
function Passenger({ n, from, scan, at, decision, revealed, delay }: { n: number; from: Point | null; scan: Point; at: Point; decision: Decision; revealed: boolean; delay: number }) {
  const px = (p: Point) => ({ x: `${p.x}px`, y: `${p.y}px` });
  // Crossing now: keyframes walk it line -> scanner -> destination. Otherwise it glides (the line shuffling forward).
  const style = (from
    ? { "--fx": px(from).x, "--fy": px(from).y, "--sx": px(scan).x, "--sy": px(scan).y, "--tx": px(at).x, "--ty": px(at).y, animation: `riesgo-cross ${CROSS_MS}ms ease-in-out ${delay}ms backwards` }
    : {}) as CSSProperties;
  return <g data-crossing={from ? "" : undefined} style={{ ...style, transform: `translate(${at.x}px, ${at.y}px)` }} className={from ? "" : "transition-transform duration-500 ease-in-out motion-reduce:transition-none"}>
    <circle cy={-26} r={6} className="fill-muted-foreground" />
    <rect x={-9} y={-18} width={18} height={22} rx={5} style={{ transitionDelay: `${from ? delay + CROSS_MS / 2 : 0}ms` }} className={`transition-colors duration-200 motion-reduce:transition-none ${revealed ? TONE[decision].fill : "fill-muted-foreground/60"}`} />
    <rect x={9} y={-5} width={9} height={9} rx={2} className="fill-warning/70" />
    {revealed && decision === "review" ? <path d="M9 -5 l3 -8 h9 l-3 8" className="fill-warning" /> : null}
    <text y={-3} textAnchor="middle" fontSize={10} className="fill-background font-mono">{n}</text>
    {revealed && decision === "stop" ? <path d="M-8 -22 L8 -2 M8 -22 L-8 -2" strokeWidth={3} strokeLinecap="round" className="stroke-foreground" /> : null}
  </g>;
}

export function RiesgoStoryScene({ frame, result, threshold, locale }: { frame: PlaybackFrame<TraceEvent>; result: MissionResult; threshold: number; locale: "en" | "es" }) {
  const copy = STORY[locale].scene;
  const a = copy.airport;
  const reduced = useReducedMotion();
  const n = result.items.length;
  const revealed = revealedCases(frame, n, reduced);
  const cells = riesgoCells(result.items, revealed);
  const counts = tapeCounts(cells);
  const placements = riesgoPlacements(result.items, revealed);
  const scanning = !reduced && revealed < n;
  const listHit = counts.lost > 0;
  const label = copy.summary(n, counts.served, counts.rerouted, counts.lost);
  // The newest batch crosses one by one; earlier ones are already seated.
  const batchStart = revealed - Math.min(3, revealed);

  const stage = (l: Layout, className: string) => <svg viewBox={`0 0 ${l.w} ${l.h}`} role="img" aria-label={label} className={`h-auto w-full ${className}`}>
    {/* First lane is the floor of the line; the rest are thin routes out of the scanner. */}
    {l.lanes.map((d, i) => <path key={d} d={d} fill="none" strokeWidth={i === 0 ? 40 : 2} strokeDasharray={i === 0 ? undefined : "4 6"} strokeLinecap="round" className={i === 0 ? "stroke-foreground/5" : "stroke-foreground/25"} />)}
    <text x={l.queueLabel.x} y={l.queueLabel.y} fontSize={15} className="fill-muted-foreground">{a.queue}</text>
    <g transform={`translate(${l.list.x} ${l.list.y})`}>
      <rect width={l.list.w} height={l.list.h} rx={8} strokeWidth={listHit ? 4 : 1} className={`fill-surface ${listHit ? "stroke-danger" : "stroke-border"}`} />
      <text x={l.list.w / 2} y={24} textAnchor="middle" fontSize={15} className="fill-foreground">{a.list}</text>
      <rect x={18} y={36} width={l.list.w - 36} height={5} rx={2} className="fill-foreground/20" />
      <rect x={18} y={46} width={(l.list.w - 36) * 0.6} height={5} rx={2} className="fill-foreground/20" />
    </g>
    <g transform={`translate(${l.scan.x} ${l.scan.y})`}>
      <rect x={-22} y={-60} width={44} height={70} className={scanning ? "fill-accent/30 animate-pulse" : "fill-transparent"} />
      <path d="M-30 14 V-58 Q-30 -70 -18 -70 H18 Q30 -70 30 -58 V14" fill="none" strokeWidth={7} className="stroke-muted-foreground" />
      <text y={34} textAnchor="middle" fontSize={14} className="fill-muted-foreground">{a.scanner}</text>
      <text y={52} textAnchor="middle" fontSize={14} className="fill-foreground font-mono">{a.threshold(threshold)}</text>
    </g>
    {(["stop", "proceed", "review"] as const).map(d => {
      const b = l.boxes[d];
      return <g key={d} transform={`translate(${b.x} ${b.y})`}>
        <rect width={b.w} height={b.h} rx={10} fill="none" strokeWidth={2} strokeDasharray={d === "stop" ? "6 4" : undefined} className={TONE[d].stroke} />
        <text x={12} y={22} fontSize={15} className={TONE[d].text}>{d === "proceed" ? a.gate : d === "review" ? a.bag : a.noBoard}</text>
      </g>;
    })}
    {/* First in line drawn last so it sits on top of the queue. */}
    {result.items.map((c, i) => ({ c, i })).reverse().map(({ c, i }) => { const crossing = !reduced && i >= batchStart && i < revealed; return <Passenger key={c.id} n={i + 1} from={crossing ? l.queue(i - batchStart) : null} scan={l.scan} at={spot(l, placements[i])} decision={c.decision} revealed={i < revealed} delay={crossing ? (i - batchStart) * STEP_MS : 0} />; })}
  </svg>;

  return <StoryStage locale={locale} title={copy.title} caption={copy.caption} step={frame.visible} total={frame.total}>
    {stage(WIDE, "hidden sm:block")}
    {stage(TALL, "sm:hidden")}
    <div className="mt-6">
      <OutcomeTape cells={cells} labels={copy.tape} ariaLabel={copy.tapeLabel} columns={12} />
      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight">{copy.throughOf(counts.served)}</p>
    </div>
  </StoryStage>;
}
