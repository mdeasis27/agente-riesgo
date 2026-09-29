import type { Decision } from "@/lib/agent";
import { StatusBadge } from "@/design-system/components/status-badge";
import type { Tone } from "@/design-system/components/tone";

const TONE: Record<Decision, Tone> = {
  approve: "success",
  reject: "danger",
  escalate: "warning",
};

const LABELS: Record<Decision, string> = {
  approve: "Aprobado",
  reject: "Rechazado",
  escalate: "Revisión humana",
};

export function DecisionBadge({ decision }: { decision: Decision }) {
  return (
    <StatusBadge
      tone={TONE[decision]}
      dot
      aria-label={`Decisión: ${LABELS[decision]}`}
      className="px-3 py-1 text-sm"
    >
      {LABELS[decision]}
    </StatusBadge>
  );
}