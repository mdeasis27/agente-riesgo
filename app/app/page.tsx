"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { AgentDecision } from "@/lib/agent";
import type { DemoCase } from "@/lib/demo-cases";
import { DEMO_CASES } from "@/lib/demo-cases";
import { DecisionBadge } from "@/components/DecisionBadge";
import { EvaluationTimeline } from "@/components/EvaluationTimeline";
import type { UserApiKey } from "@/ai-kit/types";
import { ApiKeyInput } from "@/ai-kit/byok-input";
import { ProviderBadge } from "@/ai-kit/provider-badge";

interface CaseResult {
  case_id: string;
  subject: string;
  country: string;
  context: string;
  decision: AgentDecision;
  /** Datos de Truora para el timeline */
  truora?: {
    identity_confirmed: boolean;
    sanctions_hit: boolean;
    pep_hit: boolean;
    judicial_records: boolean;
  };
  /** Datos de Exa para el timeline */
  exa?: { sources_found: number; sources_relevant: number };
}

const CONTEXT_LABELS: Record<string, string> = {
  credito: "Crédito",
  contratacion: "Contratación",
  onboarding: "Onboarding",
};

const DECISION_BORDER: Record<string, string> = {
  approve: "border-l-emerald-500",
  reject: "border-l-red-500",
  escalate: "border-l-amber-500",
};

const DEMO_BORDER: Record<string, string> = {
  approve: "border-emerald-500/30 hover:border-emerald-500/60",
  reject: "border-red-500/30 hover:border-red-500/60",
  escalate: "border-amber-500/30 hover:border-amber-500/60",
};

export default function AppPage() {
  const [result, setResult] = useState<CaseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [timelineComplete, setTimelineComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [docId, setDocId] = useState("");
  const [context, setContext] = useState("credito");
  const [userApiKey, setUserApiKey] = useState<UserApiKey | null>(null);

  const demoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function resetState() {
    setResult(null);
    setTimelineComplete(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    resetState();
    setLoading(true);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userApiKey ? { "x-user-api-key": JSON.stringify(userApiKey) } : {}),
        },
        body: JSON.stringify({ name, country, document_id: docId || undefined, context }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Error desconocido al evaluar el caso.");
        return;
      }

      setResult({
        case_id: data.case_id,
        subject: data.subject,
        country: data.country,
        context: data.context,
        decision: data.decision,
      });
      setTimelineComplete(true);
      setName("");
      setCountry("");
      setDocId("");
      setContext("credito");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  function loadDemo(demo: DemoCase) {
    // Cancelar cualquier demo anterior en curso
    if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);

    resetState();
    setLoading(true);

    demoTimeoutRef.current = setTimeout(() => {
      setResult({
        case_id: demo.result.case_id,
        subject: demo.result.subject,
        country: demo.result.country,
        context: demo.result.context,
        decision: {
          decision: demo.result.decision,
          confidence: demo.result.confidence,
          reasoning: demo.result.reasoning,
          red_flags: demo.result.red_flags,
          positive_signals: demo.result.positive_signals,
          escalation_reason: demo.result.escalation_reason,
          evidence_sources: demo.result.evidence_sources,
        },
        truora: demo.timeline.truora,
        exa: demo.timeline.exa,
      });
      setTimelineComplete(true);
      setLoading(false);
      demoTimeoutRef.current = null;
    }, 3200);
  }

  const isRunning = loading;
  const activeResult = result;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Inicio
            </Link>
            <div className="h-4 w-px bg-[var(--border)]" aria-hidden="true" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
                <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground leading-tight">Agente de Riesgo</h1>
                <p className="text-xs text-muted-foreground">Motor de decisión IA</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="text-xs font-medium text-emerald-400">IA activa</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Columna izquierda — Demo cases + Formulario */}
          <div className="w-full lg:w-[340px] shrink-0 space-y-5">

            {/* Casos demo */}
            <div className="rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] bg-card p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Casos de ejemplo · clic para cargar
              </p>
              <div className="space-y-2">
                {DEMO_CASES.map((demo) => (
                  <button
                    key={demo.result.case_id}
                    onClick={() => loadDemo(demo)}
                    disabled={loading}
                    className={`w-full rounded-[var(--radius-md)] border border-l-4 px-4 py-3 text-left transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 bg-background hover:bg-[var(--gray-50)] ${
                      DECISION_BORDER[demo.result.decision]
                    } ${DEMO_BORDER[demo.result.decision]}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {demo.input.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {CONTEXT_LABELS[demo.input.context]} · {demo.input.country}
                        </p>
                      </div>
                      <DecisionBadge decision={demo.result.decision} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-xs text-muted-foreground">O ingresa un caso nuevo</span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            {/* Formulario */}
            <div className="rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] bg-card p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                    Nombre del sujeto <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan García Pérez"
                    className="w-full rounded-[var(--radius-md)] shadow-[var(--shadow-border-light)] bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-foreground mb-1.5">
                    País <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="country"
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Ej. México"
                    className="w-full rounded-[var(--radius-md)] shadow-[var(--shadow-border-light)] bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="document" className="block text-sm font-medium text-foreground mb-1.5">
                    Documento <span className="text-muted-foreground font-normal">(opcional)</span>
                  </label>
                  <input
                    id="document"
                    type="text"
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                    placeholder="CURP, DNI, pasaporte…"
                    className="w-full rounded-[var(--radius-md)] shadow-[var(--shadow-border-light)] bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="context" className="block text-sm font-medium text-foreground mb-1.5">
                    Contexto
                  </label>
                  <select
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] shadow-[var(--shadow-border-light)] bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50 transition-colors duration-200 cursor-pointer"
                  >
                    <option value="credito">Crédito</option>
                    <option value="contratacion">Contratación</option>
                    <option value="onboarding">Onboarding</option>
                  </select>
                </div>

                {error && (
                  <div role="alert" className="rounded-[var(--radius-md)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div aria-live="polite" aria-atomic="true" className="sr-only">
                  {loading ? "Evaluando caso, por favor espera." : ""}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:bg-violet-500 hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Analizando…
                    </>
                  ) : (
                    "Evaluar solicitud"
                  )}
                </button>
              </form>
            </div>

            {/* BYOK */}
            <details className="rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] bg-card overflow-hidden">
              <summary className="cursor-pointer px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground select-none hover:text-foreground transition-colors list-none flex items-center justify-between">
                <span>Usa tu propia API key</span>
                <svg className="h-3.5 w-3.5 transition-transform duration-200 [[open]_&]:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-5 pb-5 pt-1">
                <ApiKeyInput onKeyChange={setUserApiKey} />
              </div>
            </details>
          </div>

          {/* Columna derecha — Timeline + Resultado */}
          <div className="flex-1 space-y-5">
            <EvaluationTimeline
              isRunning={isRunning}
              isComplete={timelineComplete}
              truora={activeResult?.truora}
              exa={activeResult?.exa}
            />

            {/* Panel de resultado */}
            {(isRunning || activeResult) && (
              <div
                className={`transition-all duration-700 ${
                  timelineComplete ? "opacity-100 blur-none" : "opacity-40 blur-sm pointer-events-none"
                }`}
              >
                {activeResult && <CaseDetail caseResult={activeResult} />}
              </div>
            )}

            {/* Estado vacío */}
            {!isRunning && !activeResult && (
              <div className="rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] bg-card p-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] bg-card">
                  <svg className="h-7 w-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-muted-foreground">Resultado aparecerá aquí</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Selecciona un caso demo o completa el formulario.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseDetail({ caseResult }: { caseResult: CaseResult }) {
  const d = caseResult.decision;
  const confidencePct = Math.round(d.confidence * 100);

  return (
    <div className="rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] bg-card p-6 space-y-5">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground truncate">{caseResult.subject}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {CONTEXT_LABELS[caseResult.context] ?? caseResult.context} · {caseResult.country}
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{caseResult.case_id}</p>
        </div>
        <DecisionBadge decision={d.decision} />
      </div>

      {d.provider && d.model && d.latency_ms != null && (
        <ProviderBadge provider={d.provider} model={d.model} latency_ms={d.latency_ms} />
      )}

      <div className="border-t border-[var(--border)]" />

      {/* Confianza */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Confianza</p>
          <span className="text-xs font-semibold text-foreground">{confidencePct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[var(--gray-100)] overflow-hidden">
          <div
            role="progressbar"
            aria-valuenow={confidencePct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Confianza: ${confidencePct}%`}
            className={`h-full rounded-full transition-all duration-700 ${
              d.decision === "approve" ? "bg-emerald-500" : d.decision === "reject" ? "bg-red-500" : "bg-amber-500"
            }`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      <div className="border-t border-[var(--border)]" />

      {/* Razonamiento */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Razonamiento</p>
        <p className="text-sm text-foreground leading-relaxed">{d.reasoning}</p>
      </div>

      {/* Escalation reason */}
      {d.escalation_reason && (
        <>
          <div className="border-t border-[var(--border)]" />
          <div className="rounded-[var(--radius-md)] border border-amber-500/20 bg-amber-500/10 px-4 py-3">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Motivo de escalamiento</p>
            <p className="text-sm text-amber-800">{d.escalation_reason}</p>
          </div>
        </>
      )}

      {/* Red flags */}
      {d.red_flags.length > 0 && (
        <>
          <div className="border-t border-[var(--border)]" />
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Señales de alerta</p>
            <ul className="space-y-1.5">
              {d.red_flags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span aria-hidden="true" className="mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-red-500" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Positive signals */}
      {d.positive_signals.length > 0 && (
        <>
          <div className="border-t border-[var(--border)]" />
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Señales positivas</p>
            <ul className="space-y-1.5">
              {d.positive_signals.map((signal, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span aria-hidden="true" className="mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {signal}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Evidence sources */}
      {d.evidence_sources.length > 0 && (
        <>
          <div className="border-t border-[var(--border)]" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Fuentes de evidencia</p>
            <ul className="space-y-1">
              {d.evidence_sources.map((url, i) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--accent)] hover:text-[var(--accent)]/80 underline underline-offset-2 break-all transition-colors duration-150"
                  >
                    {url}
                    <span className="sr-only"> (abre en nueva pestaña)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
