# Diseño: Agente de Riesgo v2 — Portfolio Edition

**Fecha:** 2026-04-14
**Estado:** Aprobado
**Objetivo:** Convertir la app en un portafolio impresionante para empleadores de startups y fintech — con landing page, modo demo y visualización del proceso IA en tiempo real.

---

## Contexto

La app actual funciona correctamente pero llega al portafolio como una herramienta sin narrativa: no explica qué hace, no tiene casos de ejemplo listos y el proceso de evaluación es una caja negra (solo se ve un spinner). El objetivo es que un empleador que llegue a la URL entienda el valor en 10 segundos y pueda ver el agente en acción sin necesidad de escribir nada.

---

## Arquitectura de rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page — nueva, explica el producto |
| `/app` | App de evaluación — existente, movida y mejorada |

La landing vive en `app/page.tsx` (actual). La app se mueve a `app/app/page.tsx`. El componente `EvaluationTimeline` reemplaza el spinner actual durante la evaluación.

---

## 1 — Landing Page (`/`)

### Hero

- **Eyebrow:** "Motor de decisión con IA · Portafolio 2026"
- **Título:** "Decisiones de riesgo en segundos, no días"
- **Subtítulo:** descripción del agente en 2 líneas
- **CTAs:** "Ver demo en vivo →" (va a `/app`) + "Ver en GitHub" (link al repo)
- **Tech stack badges:** Next.js 16 · LLM API · API de búsqueda web · API de verificación de identidad · TypeScript · Tailwind v4
- **Fondo:** gradiente radial violeta sutil desde arriba (`radial-gradient` en el hero)

### Cómo funciona (3 pasos)

Grid de 3 columnas con conectores entre pasos:

| Paso | Título | Fuente |
|------|--------|--------|
| 1 | Recopila evidencia | API de búsqueda web · búsqueda semántica |
| 2 | Verifica identidad | API de verificación de identidad · background check |
| 3 | Razona y decide | LLM API · LLM |

Cada paso tiene: número con color propio (violeta / amber / verde), título, descripción de 2 líneas y label de la tecnología usada.

### Contextos disponibles

3 cards con gradiente de fondo sutil:
- **Crédito** — violet — detecta fraude, deudas y riesgo crediticio
- **Contratación** — amber — valida trayectoria y litigios laborales
- **Onboarding** — emerald — verifica identidad y detecta PEP/sanciones

### CTA final

Sección con gradiente radial desde abajo, título corto y botón "Abrir la app →".

---

## 2 — App de Evaluación (`/app`)

Layout de 2 columnas (340px izquierda + resto derecha) con header que incluye link "← Volver al inicio".

### Columna izquierda — Casos demo + Formulario

**Sección demo (arriba):**
- Label "Casos de ejemplo · clic para cargar"
- 3 tarjetas con borde izquierdo de color según decisión:
  - **María Fernández López** · Crédito · México → Aprobado (verde)
  - **Carlos Mendoza Ríos** · Onboarding · Colombia → Rechazado (rojo)
  - **Ana Torres Vega** · Contratación · Argentina → Revisión humana (amber)
- Al hacer clic, el formulario se rellena automáticamente y se dispara la evaluación

**Formulario (abajo, separado por divider):**
- Label "O ingresa un caso nuevo"
- Campos: Nombre, País, Documento (opcional), Contexto (select)
- Botón "Evaluar solicitud" en violeta

### Columna derecha — Timeline + Resultado

**Componente `EvaluationTimeline`:**

Reemplaza el spinner durante la evaluación. Muestra 4 pasos en secuencia:

| Paso | Estado | Resultado visible |
|------|--------|-------------------|
| Verificación de identidad (API de verificación de identidad) | ✓ done | "Identidad confirmada · Sin sanciones · Sin PEP" |
| Búsqueda de evidencia (API de búsqueda web) | ✓ done | "N fuentes encontradas · M relevantes tras deduplicar" |
| Razonando decisión (LLM) | ⟳ activo | spinner animado con glow |
| Resultado final | ○ pendiente | gris hasta que completa |

Cada paso tiene: ícono circular con color y estado, label, descripción y pill de resultado (aparece cuando el paso completa).

**Implementación sin streaming:** Los pasos 1 y 2 muestran resultados reales de la API (que ya retorna todos los datos juntos). El timeline simula la secuencia con `setTimeout` en el frontend mientras la API trabaja en paralelo en el backend. Al completar, el paso 3 se marca done y el paso 4 aparece con animación.

**Panel de resultado:**
- Aparece desenfocado (`blur + opacity: 0.45`) mientras el timeline no completa
- Al completar: transición `blur(0) opacity(1)` con `transition-all duration-700`
- Contenido: badge de decisión + barra de confianza animada + razonamiento + señales + fuentes

---

## 3 — Datos de demo

Los 3 casos demo son respuestas JSON pre-computadas almacenadas en `lib/demo-cases.ts`. Al hacer clic en un caso demo, la app salta directo al resultado (sin llamar a la API) mostrando el timeline con delays simulados y el resultado pre-cargado.

```typescript
// lib/demo-cases.ts
export interface DemoCase {
  input: { name: string; country: string; context: string; document_id?: string; }
  result: AgentDecision & { case_id: string; subject: string; country: string; context: string; }
}

export const DEMO_CASES: DemoCase[] = [
  // María → approve, Carlos → reject, Ana → escalate
]
```

Esto garantiza que el demo funcione **sin API keys configuradas** — ideal para portafolio público.

---

## Cambios en archivos

| Archivo | Cambio |
|---------|--------|
| `app/page.tsx` | Reemplazar por la landing page |
| `app/app/page.tsx` | Crear — mover la app actual aquí |
| `components/EvaluationTimeline.tsx` | Crear — visualización del proceso IA |
| `lib/demo-cases.ts` | Crear — datos de los 3 casos de demo |
| `components/DecisionBadge.tsx` | Sin cambios |
| `lib/agent.ts` | Sin cambios |
| `app/api/evaluate/route.ts` | Sin cambios |
| `app/api/escalate/route.ts` | Sin cambios |

---

## Fuera de alcance

- Historial persistente entre sesiones (localStorage o DB)
- Autenticación o multi-usuario
- Analytics o métricas de uso
- Streaming real del backend (SSE / WebSockets)
- Internacionalización
