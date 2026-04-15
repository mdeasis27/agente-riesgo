import Exa from "exa-js";

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ExaResult {
  title: string;
  url: string;
  text: string;
  score: number;
  publishedDate?: string;
  author?: string;
}

// ─── Estrategias por contexto ─────────────────────────────────────────────────

interface SearchQuery {
  query: string;
  category?: "news" | "people";
  numResults: number;
}

function getStrategyForContext(
  name: string,
  country: string,
  context?: string
): SearchQuery[] {
  const ctx = context ?? "onboarding";

  if (ctx === "credito") {
    return [
      {
        query: `${name} ${country} fraude deuda insolvencia`,
        category: "news",
        numResults: 4,
      },
      {
        query: `${name} demanda judicial embargo financiero`,
        category: "news",
        numResults: 4,
      },
      {
        query: `${name} ${country} riesgo crediticio historial`,
        numResults: 4,
      },
    ];
  }

  if (ctx === "contratacion") {
    return [
      {
        query: `${name} trayectoria profesional experiencia`,
        category: "people",
        numResults: 4,
      },
      {
        query: `${name} demanda laboral fraude empresa`,
        category: "news",
        numResults: 4,
      },
      {
        query: `${name} ${country} perfil ejecutivo directivo`,
        numResults: 4,
      },
    ];
  }

  // onboarding (default)
  return [
    {
      query: `${name} ${country} sanciones lista negra PEP`,
      category: "news",
      numResults: 4,
    },
    {
      query: `${name} lavado dinero corrupción`,
      category: "news",
      numResults: 4,
    },
    {
      query: `${name} identidad digital presencia web`,
      numResults: 4,
    },
  ];
}

// ─── Deduplicación ────────────────────────────────────────────────────────────

function deduplicateByUrl(results: ExaResult[]): ExaResult[] {
  const byUrl = new Map<string, ExaResult>();
  for (const r of results) {
    const existing = byUrl.get(r.url);
    if (!existing || r.score > existing.score) {
      byUrl.set(r.url, r);
    }
  }
  return Array.from(byUrl.values());
}

// ─── API pública ──────────────────────────────────────────────────────────────

export async function searchSubject(params: {
  name: string;
  context?: string;
  country?: string;
}): Promise<ExaResult[]> {
  if (!process.env.EXA_API_KEY) {
    return [
      {
        title: "Sin resultados de búsqueda",
        url: "#",
        text: "EXA_API_KEY no configurado — resultados de búsqueda web no disponibles en modo demo.",
        score: 0,
      },
    ];
  }

  const exa = new Exa(process.env.EXA_API_KEY);
  const queries = getStrategyForContext(
    params.name,
    params.country ?? "",
    params.context
  );

  const settled = await Promise.allSettled(
    queries.map(({ query, category, numResults }) =>
      exa.searchAndContents(query, {
        type: "auto",
        ...(category ? { category } : {}),
        numResults,
        highlights: { maxCharacters: 1500 },
      })
    )
  );

  const all: ExaResult[] = settled.flatMap((result) => {
    if (result.status === "rejected") return [];
    return result.value.results.map((r) => ({
      title: r.title ?? "",
      url: r.url,
      text:
        Array.isArray(r.highlights) && r.highlights.length > 0
          ? r.highlights.join(" ")
          : (r.text ?? ""),
      score: r.score ?? 0,
      publishedDate: r.publishedDate ?? undefined,
      author: r.author ?? undefined,
    }));
  });

  return deduplicateByUrl(all);
}
