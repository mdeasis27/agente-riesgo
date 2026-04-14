"use client";

import { useState } from "react";
import type { AgentDecision } from "@/lib/agent";
import { DecisionBadge } from "@/components/DecisionBadge";

interface CaseResult {
  case_id: string;
  subject: string;
  country: string;
  context: string;
  decision: AgentDecision;
}

const CONTEXT_LABELS: Record<string, string> = {
  credito: "Crédito",
  contratacion: "Contratación",
  onboarding: "Onboarding",
};

export default function Home() {
  const [cases, setCases] = useState<CaseResult[]>([]);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [document, setDocument] = useState("");
  const [context, setContext] = useState("credito");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          country,
          document_id: document || undefined,
          context,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Error desconocido al evaluar el caso.");
        return;
      }

      const newCase: CaseResult = {
        case_id: data.case_id,
        subject: data.subject,
        country: data.country,
        context: data.context,
        decision: data.decision,
      };

      setCases((prev) => [newCase, ...prev]);
      setSelectedCase(newCase.case_id);
      setName("");
      setCountry("");
      setDocument("");
      setContext("credito");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  function toggleCase(id: string) {
    setSelectedCase((prev) => (prev === id ? null : id));
  }

  const activeCase = cases.find((c) => c.case_id === selectedCase) ?? null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">
            Agente de Riesgo
          </h1>
          <p className="mt-1 text-zinc-500 text-sm">
            Evalúa solicitudes de crédito, contratación y onboarding con IA.
            El agente recopila evidencia, razona y decide automáticamente o
            escala a revisión humana.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Columna izquierda — Formulario */}
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-zinc-800">
                Nueva solicitud
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-zinc-700 mb-1"
                  >
                    Nombre del sujeto{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan García Pérez"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-zinc-700 mb-1"
                  >
                    País <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="country"
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Ej. México"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="document"
                    className="block text-sm font-medium text-zinc-700 mb-1"
                  >
                    Documento{" "}
                    <span className="text-zinc-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    id="document"
                    type="text"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="Ej. CURP, DNI, pasaporte"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="context"
                    className="block text-sm font-medium text-zinc-700 mb-1"
                  >
                    Tipo de contexto
                  </label>
                  <select
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 bg-white"
                  >
                    <option value="credito">Crédito</option>
                    <option value="contratacion">Contratación</option>
                    <option value="onboarding">Onboarding</option>
                  </select>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Recopilando evidencia y razonando..." : "Evaluar"}
                </button>
              </form>
            </div>

            {/* Panel de detalle del caso (desktop: bajo el form) */}
            {activeCase && (
              <CaseDetail caseResult={activeCase} />
            )}
          </div>

          {/* Columna derecha — Lista de casos */}
          <div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-zinc-800">
                Casos evaluados{" "}
                {cases.length > 0 && (
                  <span className="ml-1 text-sm font-normal text-zinc-400">
                    ({cases.length})
                  </span>
                )}
              </h2>

              {cases.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-zinc-400">
                    Aún no hay casos evaluados en esta sesión.
                  </p>
                  <p className="mt-1 text-xs text-zinc-300">
                    Completa el formulario para evaluar una solicitud.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {cases.map((c) => (
                    <li key={c.case_id}>
                      <button
                        onClick={() => toggleCase(c.case_id)}
                        className={`w-full rounded-lg border px-4 py-3 text-left transition-colors hover:bg-zinc-50 ${
                          selectedCase === c.case_id
                            ? "border-zinc-400 bg-zinc-50"
                            : "border-zinc-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-zinc-900">
                              {c.subject}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-400">
                              {CONTEXT_LABELS[c.context] ?? c.context} ·{" "}
                              {c.country}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <DecisionBadge decision={c.decision.decision} />
                            <span className="text-xs text-zinc-400">
                              {(c.decision.confidence * 100).toFixed(0)}% confianza
                            </span>
                          </div>
                        </div>
                      </button>

                      {/* Detalle expandible en mobile (bajo cada item) */}
                      {selectedCase === c.case_id && (
                        <div className="lg:hidden mt-2">
                          <CaseDetail caseResult={c} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseDetail({ caseResult }: { caseResult: CaseResult }) {
  const d = caseResult.decision;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-900">
            {caseResult.subject}
          </h3>
          <p className="text-xs text-zinc-400">
            {CONTEXT_LABELS[caseResult.context] ?? caseResult.context} ·{" "}
            {caseResult.country} · ID: {caseResult.case_id}
          </p>
        </div>
        <DecisionBadge decision={d.decision} />
      </div>

      {/* Confianza */}
      <div>
        <p className="text-xs font-medium text-zinc-500 mb-1">
          Confianza: {(d.confidence * 100).toFixed(0)}%
        </p>
        <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              d.decision === "approve"
                ? "bg-green-500"
                : d.decision === "reject"
                ? "bg-red-500"
                : "bg-yellow-400"
            }`}
            style={{ width: `${(d.confidence * 100).toFixed(0)}%` }}
          />
        </div>
      </div>

      {/* Razonamiento */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
          Razonamiento
        </p>
        <p className="text-sm text-zinc-700 leading-relaxed">{d.reasoning}</p>
      </div>

      {/* Escalation reason */}
      {d.escalation_reason && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3">
          <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-1">
            Motivo de escalamiento
          </p>
          <p className="text-sm text-yellow-800">{d.escalation_reason}</p>
        </div>
      )}

      {/* Red flags */}
      {d.red_flags.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
            Señales de alerta
          </p>
          <ul className="space-y-1">
            {d.red_flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full bg-red-500" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Positive signals */}
      {d.positive_signals.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
            Señales positivas
          </p>
          <ul className="space-y-1">
            {d.positive_signals.map((signal, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-green-700"
              >
                <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full bg-green-500" />
                {signal}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Evidence sources */}
      {d.evidence_sources.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
            Fuentes de evidencia
          </p>
          <ul className="space-y-1">
            {d.evidence_sources.map((url, i) => (
              <li key={i}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-zinc-800 underline break-all"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
