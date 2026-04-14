# Diseño: Integración Exa con queries especializadas por contexto

**Fecha:** 2026-04-14  
**Estado:** Aprobado  
**Alcance:** `lib/exa.ts` + `package.json`

---

## Problema

El cliente Exa actual (`lib/exa.ts`) tiene tres deficiencias:

1. Usa `useAutoprompt: true` (parámetro deprecado) y `type: "neural"` (reemplazado por `"auto"`).
2. Usa `fetch` manual en lugar del SDK oficial `exa-js`.
3. Lanza las mismas 3 queries genéricas sin importar el contexto (crédito, contratación, onboarding), desaprovechando las categorías semánticas de Exa.

---

## Solución

Reescribir `lib/exa.ts` usando el SDK `exa-js` con estrategias de búsqueda diferenciadas por contexto. La interfaz `ExaResult` y la firma de `searchSubject` se mantienen sin cambios para no afectar `agent.ts` ni `route.ts`.

---

## Arquitectura

```
searchSubject({ name, context, country })
  └─ getStrategyForContext(context)
       ├── credito      → 3 queries: fraude/deuda, judicial, riesgo crediticio
       ├── contratacion → 3 queries: perfil people, litigios laborales, ejecutivo
       └── onboarding   → 3 queries: sanciones/PEP, lavado/corrupción, identidad
  └─ Promise.allSettled(queries.map(exa.searchAndContents))
  └─ deduplicar por URL (mayor score gana)
  └─ ExaResult[]
```

---

## Estrategias por contexto

### Crédito
Objetivo: detectar riesgo financiero y fraude.

| # | category | query |
|---|----------|-------|
| 1 | `news` | `{name} {country} fraude deuda insolvencia` |
| 2 | `news` | `{name} demanda judicial embargo financiero` |
| 3 | `auto` | `{name} {country} riesgo crediticio historial` |

### Contratación
Objetivo: validar reputación profesional y detectar litigios laborales.

| # | category | query |
|---|----------|-------|
| 1 | `people` | `{name} trayectoria profesional experiencia` |
| 2 | `news` | `{name} demanda laboral fraude empresa` |
| 3 | `auto` | `{name} {country} perfil ejecutivo directivo` |

### Onboarding
Objetivo: detectar sanciones, PEP y riesgo de identidad.

| # | category | query |
|---|----------|-------|
| 1 | `news` | `{name} {country} sanciones lista negra PEP` |
| 2 | `news` | `{name} lavado dinero corrupción` |
| 3 | `auto` | `{name} identidad digital presencia web` |

---

## Parámetros de búsqueda

- `type`: `"auto"` por defecto (excepto queries con `category` explícita)
- `numResults`: 4 por query
- `contents.highlights.maxCharacters`: 1500
- `numSentences` y `highlightsPerUrl`: no usar (deprecados)

---

## Manejo de errores

- Las queries corren en paralelo con `Promise.allSettled`.
- Si una query individual falla (timeout, 429, error de red), se descarta silenciosamente y se continúa con las demás.
- Si todas fallan, `searchSubject` retorna `[]` — el agente razona solo con datos Truora.
- Si `EXA_API_KEY` no está configurada, retorna resultado mock para modo demo (comportamiento actual preservado).

---

## Deduplicación

Después de aplanar todos los resultados:
1. Agrupar por `url`.
2. Mantener el resultado con mayor `score` por URL.
3. Retornar array deduplicado.

---

## Cambios en archivos

| Archivo | Tipo de cambio |
|---------|---------------|
| `lib/exa.ts` | Reescritura completa |
| `package.json` | Agregar dependencia `exa-js` |
| `lib/agent.ts` | Sin cambios |
| `app/api/evaluate/route.ts` | Sin cambios |

---

## Fuera de alcance

- Convertir Exa en herramienta del agente (tool use / function calling).
- Cambiar el modelo LLM o el prompt en `agent.ts`.
- Persistencia de resultados Exa en base de datos.
