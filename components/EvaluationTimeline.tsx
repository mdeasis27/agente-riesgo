"use client";

import { useEffect, useState } from "react";

type StepStatus = "pending" | "active" | "done";

interface TimelineStep {
  id: number;
  label: string;
  description: string;
  pill?: string;
  status: StepStatus;
}

interface EvaluationTimelineProps {
  isRunning: boolean;
  isComplete: boolean;
  truora?: {
    identity_confirmed: boolean;
    sanctions_hit: boolean;
    pep_hit: boolean;
    judicial_records: boolean;
  };
  exa?: {
    sources_found: number;
    sources_relevant: number;
  };
}

const STEP_DELAYS = [0, 900, 1800, 2700]; // ms para cada paso

export function EvaluationTimeline({
  isRunning,
  isComplete,
  truora,
  exa,
}: EvaluationTimelineProps) {
  const [steps, setSteps] = useState<TimelineStep[]>([
    {
      id: 1,
      label: "Verificación de identidad",
      description: "Truora · background check",
      status: "pending",
    },
    {
      id: 2,
      label: "Búsqueda de evidencia",
      description: "Exa.ai · búsqueda semántica",
      status: "pending",
    },
    {
      id: 3,
      label: "Razonando decisión",
      description: "LLM · análisis de riesgo",
      status: "pending",
    },
    {
      id: 4,
      label: "Resultado final",
      description: "Decisión automatizada",
      status: "pending",
    },
  ]);

  useEffect(() => {
    if (!isRunning) {
      // Solo resetear si no hubo una evaluación completada — evita borrar pasos 1 y 2 al completar
      if (!isComplete) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSteps((prev) => prev.map((s) => ({ ...s, status: "pending", pill: undefined })));
      }
      return;
    }

    // Al iniciar una nueva evaluación siempre reseteamos
    setSteps((prev) => prev.map((s) => ({ ...s, status: "pending", pill: undefined })));

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Paso 1 — activo inmediato
    timers.push(
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((s) => (s.id === 1 ? { ...s, status: "active" } : s))
        );
      }, STEP_DELAYS[0])
    );

    // Paso 1 → done, paso 2 → activo
    timers.push(
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((s) => {
            if (s.id === 1) {
              const pill = truora
                ? truora.sanctions_hit
                  ? "Sanción detectada"
                  : truora.judicial_records
                  ? "Antecedentes encontrados"
                  : "Sin alertas · Identidad confirmada"
                : "Procesando…";
              return { ...s, status: "done", pill };
            }
            if (s.id === 2) return { ...s, status: "active" };
            return s;
          })
        );
      }, STEP_DELAYS[1])
    );

    // Paso 2 → done, paso 3 → activo
    timers.push(
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((s) => {
            if (s.id === 2) {
              const pill = exa
                ? `${exa.sources_found} fuentes · ${exa.sources_relevant} relevantes`
                : "Fuentes encontradas";
              return { ...s, status: "done", pill };
            }
            if (s.id === 3) return { ...s, status: "active" };
            return s;
          })
        );
      }, STEP_DELAYS[2])
    );

    return () => timers.forEach(clearTimeout);
  }, [isRunning, isComplete, truora, exa]);

  // Cuando la API completa: paso 3 → done, paso 4 → done
  useEffect(() => {
    if (!isComplete) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === 3) return { ...s, status: "done", pill: "Decisión generada" };
        if (s.id === 4) return { ...s, status: "done", pill: "Completado" };
        return s;
      })
    );
  }, [isComplete]);

  if (!isRunning && !isComplete) return null;

  return (
    <div className="rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] bg-card p-6">
      <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Proceso de evaluación
      </p>

      <div className="space-y-0">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex gap-4">
            {/* Columna izquierda: ícono + línea conectora */}
            <div className="flex flex-col items-center">
              <StepIcon status={step.status} />
              {idx < steps.length - 1 && (
                <div
                  className={`mt-1 w-px flex-1 min-h-[28px] transition-colors duration-500 ${
                    step.status === "done" ? "bg-[var(--accent)]/40" : "bg-[var(--border)]"
                  }`}
                />
              )}
            </div>

            {/* Columna derecha: texto */}
            <div className="pb-6 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    step.status === "done"
                      ? "text-foreground"
                      : step.status === "active"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {step.pill && (
                  <span className="rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)] animate-fade-in">
                    {step.pill}
                  </span>
                )}
              </div>
              <p
                className={`mt-0.5 text-xs transition-colors duration-300 text-muted-foreground`}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] border border-[var(--accent)]/40 transition-all duration-300">
        <svg
          className="h-3.5 w-3.5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
    );
  }

  if (status === "active") {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/50 bg-[var(--accent)]/10">
        <svg
          className="h-4 w-4 animate-spin text-[var(--accent)]"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  // pending
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-[var(--shadow-border-light)] bg-background">
      <div className="h-2 w-2 rounded-full bg-[var(--gray-100)]" />
    </div>
  );
}
