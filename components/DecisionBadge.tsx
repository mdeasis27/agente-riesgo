import type { Decision } from "@/lib/agent";

const STYLES: Record<Decision, string> = {
  approve: "bg-green-50 text-green-700 border-green-200",
  reject: "bg-red-50 text-red-700 border-red-200",
  escalate: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const LABELS: Record<Decision, string> = {
  approve: "Aprobado",
  reject: "Rechazado",
  escalate: "Revisión humana",
};

export function DecisionBadge({ decision }: { decision: Decision }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${STYLES[decision]}`}
    >
      {LABELS[decision]}
    </span>
  );
}
