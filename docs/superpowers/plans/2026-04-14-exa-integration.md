# Exa Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescribir `lib/exa.ts` usando el SDK oficial `exa-js` con queries especializadas por contexto (crédito, contratación, onboarding).

**Architecture:** `searchSubject` delega a `getStrategyForContext` que retorna un arreglo de queries con sus parámetros Exa. Las queries corren en paralelo con `Promise.allSettled`. Los resultados se deduplicán por URL (mayor score gana). La interfaz pública `ExaResult` y la firma de `searchSubject` no cambian — `agent.ts` y `route.ts` no requieren modificaciones.

**Tech Stack:** `exa-js` SDK, TypeScript, Next.js App Router (server-side).

---

## Mapa de archivos

| Archivo | Acción |
|---------|--------|
| `package.json` | Modificar — agregar `exa-js` |
| `lib/exa.ts` | Reescritura completa |
| `lib/agent.ts` | Sin cambios |
| `app/api/evaluate/route.ts` | Sin cambios |

---

### Task 1: Instalar `exa-js`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalar el paquete**

```bash
npm install exa-js
```

Salida esperada: `added 1 package` (o similar). Sin errores.

- [ ] **Step 2: Verificar que aparece en package.json**

Abrir `package.json` y confirmar que `dependencies` contiene:
```json
"exa-js": "^x.x.x"
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add exa-js SDK"
```

---

### Task 2: Reescribir `lib/exa.ts`

**Files:**
- Modify: `lib/exa.ts`

- [ ] **Step 1: Reemplazar el contenido completo de `lib/exa.ts`**

```typescript
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
  category?: "news" | "people" | "company";
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
      text: Array.isArray(r.highlights) ? r.highlights.join(" ") : "",
      score: r.score ?? 0,
      publishedDate: r.publishedDate ?? undefined,
      author: r.author ?? undefined,
    }));
  });

  return deduplicateByUrl(all);
}
```

- [ ] **Step 2: Verificar que TypeScript no reporta errores**

```bash
npx tsc --noEmit
```

Salida esperada: sin errores. Si hay errores de tipos del SDK, ver nota al pie*.

- [ ] **Step 3: Commit**

```bash
git add lib/exa.ts
git commit -m "feat: rewrite exa client with exa-js SDK and context-aware queries"
```

> *Nota: Si `r.highlights` reporta error de tipo, reemplazar esa línea por:
> ```typescript
> text: (r as { highlights?: string[] }).highlights?.join(" ") ?? "",
> ```

---

### Task 3: Smoke test manual

**Files:**
- No se crean archivos nuevos

- [ ] **Step 1: Levantar el servidor de desarrollo**

```bash
npm run dev
```

Salida esperada: servidor en `http://localhost:3000` sin errores de compilación.

- [ ] **Step 2: Abrir la app en el browser**

Navegar a `http://localhost:3000`.

- [ ] **Step 3: Evaluar un caso de crédito**

Completar el formulario:
- Nombre: `Juan García` (o cualquier nombre)
- País: `México`
- Tipo de contexto: `Crédito`
- Clic en **Evaluar**

Resultado esperado: el caso aparece en la lista con una decisión, confianza y al menos una fuente de evidencia en la sección "Fuentes de evidencia".

- [ ] **Step 4: Evaluar un caso de contratación**

Mismo nombre y país, contexto: `Contratación`. Verificar que el resultado incluye fuentes diferentes a las del caso de crédito (las queries son distintas).

- [ ] **Step 5: Evaluar un caso de onboarding**

Contexto: `Onboarding`. Verificar que el resultado incluye fuentes.

- [ ] **Step 6: Commit final**

```bash
git add .
git commit -m "chore: smoke test exa context-aware integration"
```

> Si el servidor muestra errores de red en los logs (`[/api/evaluate]`) pero la decisión igual se genera, es comportamiento esperado — `Promise.allSettled` absorbe fallos individuales y el agente razona con lo que hay.
