import type { Decision } from "@/lib/agent";

const STYLES: Record<Decision, string> = {
  approve: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  reject: "bg-red-500/15 text-red-400 border-red-500/30",
  escalate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const LABELS: Record<Decision, string> = {
  approve: "Aprobado",
  reject: "Rechazado",
  escalate: "Revisión humana",
};

export function DecisionBadge({ decision }: { decision: Decision }) {
  return (
    <span
      aria-label={`Decisión: ${LABELS[decision]}`}
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${STYLES[decision]}`}
    >
      {LABELS[decision]}
    </span>
  );
}
