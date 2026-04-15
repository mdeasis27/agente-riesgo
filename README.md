# Agente de Riesgo

Motor de decisión con IA para evaluar solicitudes de crédito, contratación y onboarding. El agente recopila evidencia web, verifica identidad y razona sobre el caso para tomar una decisión automatizada — o escalar a revisión humana cuando la confianza es baja.

---

## Cómo funciona

```
Usuario
  │
  ▼
POST /api/evaluate
  │
  ├── Truora API ──────────────── Verificación de identidad
  │   └── ¿Sanciones? ¿PEP? ¿Antecedentes judiciales?
  │
  ├── Exa.ai ──────────────────── Búsqueda semántica web
  │   └── 3 queries por contexto (crédito / contratación / onboarding)
  │       deduplicadas por URL, ordenadas por score
  │
  └── LLM (OpenRouter) ─────────── Razonamiento final
      └── Analiza Truora + Exa → JSON estructurado
          { decision, confidence, reasoning, red_flags, positive_signals }
              │
              ├── confidence ≥ 0.65 → approve / reject
              └── confidence < 0.65 → escalate (revisión humana)
```

El agente usa un **sistema de fallback dinámico** para los LLMs: consulta la lista de modelos gratuitos disponibles en OpenRouter en tiempo real, los ordena por preferencia y rota automáticamente si uno está rate-limitado o no disponible.

---

## Tech stack

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 |
| LLM routing | OpenRouter (modelos gratuitos con fallback automático) |
| Búsqueda web | Exa.ai — búsqueda semántica con `exa-js` SDK |
| Verificación de identidad | Truora API |
| AI SDK | Vercel AI SDK (`generateText`) |
| Deploy | Vercel |

---

## Contextos de evaluación

| Contexto | Qué evalúa | Señales clave |
|----------|-----------|---------------|
| **Crédito** | Riesgo crediticio y fraude financiero | Deudas, embargos, insolvencia |
| **Contratación** | Trayectoria laboral y litigios | Demandas laborales, historial profesional |
| **Onboarding KYC/AML** | Identidad y cumplimiento regulatorio | Sanciones OFAC, PEP, listas negras |

---

## Correr localmente

### Requisitos

- Node.js 20+
- Una cuenta en [OpenRouter](https://openrouter.ai) (gratis, sin tarjeta de crédito)

### Setup

```bash
git clone https://github.com/mdeasis27/agente-riesgo
cd agente-riesgo
npm install
cp .env.example .env.local
```

Edita `.env.local` y agrega tu `OPENROUTER_API_KEY`. Las demás claves son opcionales — el agente funciona en modo mock sin ellas.

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Sin API keys

Los tres casos demo (**María**, **Carlos**, **Ana**) funcionan completamente sin API keys — usan respuestas pre-computadas. El formulario de evaluación libre requiere al menos `OPENROUTER_API_KEY`.

---

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `OPENROUTER_API_KEY` | Para formulario | LLM routing — modelos gratuitos disponibles |
| `EXA_API_KEY` | Opcional | Búsqueda semántica web. Sin ella, el agente opera sin evidencia web |
| `TRUORA_API_KEY` | Opcional | Verificación de identidad real. Sin ella, usa mock |
| `TRUORA_MOCK` | — | `true` activa datos simulados (útil en desarrollo) |
| `INTERNAL_API_KEY` | Opcional | Protege `/api/evaluate` en producción |

Ver `.env.example` para la configuración completa.

---

## Arquitectura de archivos

```
app/
├── page.tsx              # Landing page
├── app/
│   └── page.tsx          # App de evaluación (demo cases + formulario)
└── api/
    ├── evaluate/
    │   └── route.ts      # POST /api/evaluate — orquesta Truora + Exa + LLM
    └── escalate/
        └── route.ts      # POST /api/escalate — notificación de escalamiento

lib/
├── agent.ts              # Motor del agente — LLM + fallback dinámico de modelos
├── exa.ts                # Cliente Exa.ai con estrategias de búsqueda por contexto
├── truora.ts             # Cliente Truora con modo mock para desarrollo
├── confidence.ts         # Algoritmo de confianza y umbral de escalamiento
└── demo-cases.ts         # Casos demo pre-computados (sin API)

components/
├── EvaluationTimeline.tsx # Timeline animado del proceso de evaluación
└── DecisionBadge.tsx      # Badge de decisión (approve / reject / escalate)
```

---

## Decisiones de diseño

**¿Por qué fallback dinámico de modelos?**
Los modelos gratuitos de OpenRouter tienen rate limits compartidos y cambian con frecuencia. En lugar de hardcodear una lista que se vuelve obsoleta, el agente consulta `/api/v1/models` en tiempo real, filtra los disponibles y los ordena por preferencia. El resultado se cachea 10 minutos para no agregar latencia.

**¿Por qué casos demo pre-computados?**
Permiten que cualquier persona explore el agente sin configurar API keys — ideal para portafolio y demos en entrevistas. El timeline del frontend simula el proceso mientras el backend trabaja en paralelo.

**¿Por qué escalar en lugar de forzar una decisión?**
Un sistema de riesgo real no debe tomar decisiones de alto impacto con poca confianza. El umbral del 65% fuerza revisión humana cuando hay señales ambiguas o conflictivas — comportamiento correcto en contextos financieros y de compliance.

**Truora en modo mock**
La integración con Truora está completa pero requiere una API key de pago. En modo demo/desarrollo (`TRUORA_MOCK=true`), se usa un mock que retorna perfil limpio para que la decisión recaiga en la evidencia web de Exa.ai y el razonamiento del LLM.

---

## Autor

Manuel de Asis · [LinkedIn](https://linkedin.com/in/mdeasis27) · [GitHub](https://github.com/mdeasis27)
