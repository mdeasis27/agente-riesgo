// Tipos compartidos para el agente de riesgo

export type CaseStatus = "pending" | "approved" | "rejected" | "escalated";
export type DecisionType = "automatic" | "human_review";

export interface RiskCase {
  id: string;
  subject_name: string;
  subject_document?: string;
  country: string;
  context: string; // "credito" | "contratacion" | "onboarding"
  status: CaseStatus;
  decision_type?: DecisionType;
  confidence?: number;
  reasoning?: string;
  red_flags: string[];
  positive_signals: string[];
  escalation_reason?: string;
  created_at: string;
  resolved_at?: string;
}

export interface CaseListItem
  extends Pick<
    RiskCase,
    "id" | "subject_name" | "status" | "confidence" | "created_at"
  > {}
