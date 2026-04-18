import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">

        {/* Nav */}
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-amber-500/10 border border-amber-500/20">
              <svg
                className="h-4 w-4 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
              </svg>
            </div>
            <span className="text-sm font-bold text-foreground">Agente de Riesgo</span>
          </div>
          <a
            href="https://github.com/mdeasis27/agente-riesgo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] shadow-[var(--shadow-border-light)] bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-[var(--gray-50)] hover:text-foreground transition-colors duration-200"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </nav>

        {/* Hero content */}
        <div className="relative mx-auto max-w-3xl px-6 pt-16 pb-24 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-600 animate-pulse" aria-hidden="true" />
            <span className="text-xs font-medium text-violet-700">
              Motor de decisión con IA · Portafolio 2026
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Decisiones de riesgo en{" "}
            <span className="text-violet-600">
              segundos, no días
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-xl mx-auto">
            Un agente de IA que recopila evidencia, verifica identidad y razona
            sobre solicitudes de crédito, contratación y onboarding — de forma
            autónoma o escalando a revisión humana.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/app"
              className="flex items-center gap-2 rounded-[var(--radius-md)] bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-500 hover:shadow-violet-500/35 transition-all duration-200"
            >
              Ver demo en vivo
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="https://github.com/mdeasis27/agente-riesgo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-[var(--radius-md)] shadow-[var(--shadow-border-light)] bg-background px-6 py-3 text-sm font-semibold text-muted-foreground hover:bg-[var(--gray-50)] hover:text-foreground transition-all duration-200"
            >
              Ver en GitHub
            </a>
          </div>

          {/* Tech stack badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {["Next.js 15", "OpenRouter", "Exa.ai", "Truora", "TypeScript", "Tailwind v4"].map(
              (tech) => (
                <span
                  key={tech}
                  className="rounded-full shadow-[var(--shadow-border-light)] bg-[var(--gray-50)] px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Cómo funciona</h2>
          <p className="mt-3 text-muted-foreground">Tres pasos para una decisión fundamentada</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              color: "violet",
              title: "Recopila evidencia",
              description:
                "Busca información pública relevante sobre el sujeto usando búsqueda semántica avanzada.",
              tech: "Exa.ai · búsqueda semántica",
              bg: "bg-violet-500/10 border-violet-500/20",
              text: "text-violet-700",
              pill: "bg-violet-500/10 border-violet-500/20 text-violet-700",
              connector: "text-violet-400/50",
            },
            {
              step: "02",
              color: "amber",
              title: "Verifica identidad",
              description:
                "Valida la identidad del sujeto y consulta listas de sanciones, PEP y antecedentes judiciales.",
              tech: "Truora · background check",
              bg: "bg-amber-500/10 border-amber-500/20",
              text: "text-amber-700",
              pill: "bg-amber-500/10 border-amber-500/20 text-amber-700",
              connector: "text-amber-400/50",
            },
            {
              step: "03",
              color: "emerald",
              title: "Razona y decide",
              description:
                "Un LLM analiza toda la evidencia y genera una decisión fundamentada: aprobar, rechazar o escalar.",
              tech: "OpenRouter · LLM",
              bg: "bg-emerald-500/10 border-emerald-500/20",
              text: "text-emerald-700",
              pill: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700",
              connector: "",
            },
          ].map((item, idx) => (
            <div key={idx} className="relative">
              <div className={`rounded-[var(--radius-lg)] border p-6 ${item.bg} h-full`}>
                <div className="mb-4 flex items-center justify-between">
                  <span className={`text-4xl font-black ${item.text} opacity-40`}>{item.step}</span>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${item.pill}`}>
                    {item.tech}
                  </span>
                </div>
                <h3 className="mb-2 text-base font-bold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
              {/* Conector entre pasos */}
              {idx < 2 && (
                <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                  <svg className={`h-6 w-6 ${item.connector}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTEXTOS DISPONIBLES ────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Contextos disponibles</h2>
          <p className="mt-3 text-muted-foreground">El agente adapta su razonamiento según el caso de uso</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Crédito",
              description:
                "Detecta fraude, deudas impagas y riesgo crediticio. Integra historial financiero público y señales de comportamiento.",
              gradient: "from-violet-500/10 to-violet-500/5",
              border: "border-violet-500/20",
              accent: "text-violet-700",
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              ),
            },
            {
              title: "Contratación",
              description:
                "Valida trayectoria laboral, detecta litigios laborales activos y verifica referencias en fuentes públicas.",
              gradient: "from-amber-500/10 to-amber-500/5",
              border: "border-amber-500/20",
              accent: "text-amber-700",
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                </svg>
              ),
            },
            {
              title: "Onboarding",
              description:
                "Verifica identidad, detecta PEP y sanciones internacionales. Cumplimiento KYC/AML en tiempo real.",
              gradient: "from-emerald-500/10 to-emerald-500/5",
              border: "border-emerald-500/20",
              accent: "text-emerald-700",
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              ),
            },
          ].map((ctx) => (
            <div
              key={ctx.title}
              className={`rounded-[var(--radius-lg)] border bg-gradient-to-br p-6 ${ctx.border} ${ctx.gradient}`}
            >
              <div className={`mb-3 inline-flex rounded-[var(--radius-md)] p-2 ${ctx.gradient} border ${ctx.border}`}>
                <span className={ctx.accent}>{ctx.icon}</span>
              </div>
              <h3 className="mb-2 text-base font-bold text-foreground">{ctx.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{ctx.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24">
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Pruébalo en segundos
          </h2>
          <p className="mt-4 text-muted-foreground">
            Sin registro. Sin configuración. Los casos demo funcionan sin API keys.
          </p>
          <div className="mt-8">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-500 hover:shadow-violet-500/35 transition-all duration-200"
            >
              Abrir la app
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <span className="text-xs text-muted-foreground">Agente de Riesgo · Portafolio 2026</span>
          <span className="text-xs text-muted-foreground">
            Construido con Next.js · OpenRouter · Exa.ai · Truora
          </span>
        </div>
      </footer>
    </div>
  );
}
