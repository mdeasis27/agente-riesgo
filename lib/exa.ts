// Cliente Exa.ai — búsqueda profunda de personas y empresas

const EXA_BASE = "https://api.exa.ai";

export interface ExaResult {
  title: string;
  url: string;
  text: string;
  score: number;
  publishedDate?: string;
  author?: string;
}

async function search(query: string, numResults = 5): Promise<ExaResult[]> {
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

  const res = await fetch(`${EXA_BASE}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.EXA_API_KEY,
    },
    body: JSON.stringify({
      query,
      numResults,
      type: "neural",
      useAutoprompt: true,
      contents: { text: { maxCharacters: 2000 } },
    }),
  });

  if (!res.ok) throw new Error(`Exa error: ${res.status}`);
  const data = await res.json();
  return data.results as ExaResult[];
}

export async function searchSubject(params: {
  name: string;
  context?: string;
  country?: string;
}) {
  const queries = [
    `${params.name} ${params.country ?? ""} noticias fraude riesgo`,
    `${params.name} historial profesional trayectoria`,
    `${params.name} ${params.context ?? ""}`,
  ];

  const results = await Promise.all(queries.map((q) => search(q)));
  return results.flat();
}
