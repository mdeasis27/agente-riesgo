import type { Heading } from "@/design-system/demo/project-story";

type NodeCopy = { name: string; sub: string; analogy: string };

export interface RiesgoStory {
  name: string;
  oneLiner: string;
  chips: string[];
  analogy: { heading: Heading; paragraphs: string[]; dictionaryLabel: string; dictionary: { term: string; means: string }[] };
  why: { title: string; text: string };
  tryIt: { heading: Heading; lead: string; question: (threshold: number) => string; yes: string; no: string; thresholdLabel: string; thresholdHint: string; note: string; simulate: string; cancel: string; reset: string; error: string; idle: string };
  compare: { heading: Heading; lead: string; withCheck: string; withoutCheck: string; slipped: string; sentence: (withCheck: number, withoutCheck: number) => string };
  fit: { heading: Heading; worthLabel: string; worth: string; notLabel: string; not: string };
  proves: { heading: Heading; text: string };
  engineers: { summary: string; points: string[]; repoLabel: string };
  scene: { title: string; caption: string; statusLabels: { active: string; success: string }; tapeLabel: string; nodes: { cases: NodeCopy; evidence: NodeCopy; lists: NodeCopy; decision: NodeCopy }; tape: { served: string; rerouted: string; lost: string }; throughOf: (n: number) => string };
}

export const STORY: Record<"en" | "es", RiesgoStory> = {
  en: {
    name: "Risk triage",
    oneLiner: "Decides which credit cases go straight through, which ones a person reviews, and which ones stop.",
    chips: ["Credit risk", "2 min", "Live demo"],
    analogy: {
      heading: { before: "The", accent: "analogy" },
      paragraphs: [
        "Think of airport security. Most people walk through, a few get their bag opened, and the one whose name is on a list doesn't board.",
        "Risk triage does that with credit cases. It reads the evidence on each one, sends the doubtful ones to a person and stops any case that shows up on a sanctions list, whatever the rest of its evidence says.",
      ],
      dictionaryLabel: "In the diagram below",
      dictionary: [
        { term: "a passenger", means: "a credit case" },
        { term: "opening the bag", means: "review by a person" },
        { term: "the no-fly list", means: "the sanctions check" },
        { term: "how picky the scanner is", means: "the review threshold" },
      ],
    },
    why: { title: "Why I built it", text: "" },
    tryIt: {
      heading: { before: "Try", accent: "it" },
      lead: "Twelve credit cases arrive with more or less evidence. Two are missing an identity check and one shows up on a sanctions list.",
      question: (t) => `Before you run it, place a bet: with the review threshold at ${t}, do more than half of the 12 cases go straight through?`,
      yes: "Yes, more than 6",
      no: "No, 6 or fewer",
      thresholdLabel: "Review threshold",
      thresholdHint: "Lower means stricter: more cases go to a person.",
      note: "Each square is one case. Blue went to a person. Red was stopped because it is on a sanctions list.",
      simulate: "Run it",
      cancel: "Cancel",
      reset: "Start over",
      error: "The cases could not be checked.",
      idle: "Place your bet and press Run it.",
    },
    compare: {
      heading: { before: "With the list check", accent: "or without it" },
      lead: "Same 12 cases and the same threshold. The only change is whether the sanctions list is checked.",
      withCheck: "With the list check",
      withoutCheck: "Without it",
      slipped: "listed cases that went straight through",
      sentence: (withCheck, withoutCheck) => {
        if (withoutCheck > withCheck) return "With the list check, the listed case stopped. Without it, it would have gone straight through.";
        if (withCheck === 0 && withoutCheck === 0) return "At this threshold the listed case goes to a person anyway, so this time the list check didn't change the result.";
        return `Listed cases that went straight through: ${withCheck} with the check, ${withoutCheck} without it.`;
      },
    },
    fit: {
      heading: { before: "Where it", accent: "fits" },
      worthLabel: "Worth it",
      worth: "When a credit team gets more cases than it can read one by one, and wants a person looking only at the doubtful ones.",
      notLabel: "Not needed",
      not: "When there are ten applications a week and an analyst reads every one anyway.",
    },
    proves: {
      heading: { before: "What it", accent: "proves" },
      text: "I split the decision in two: a threshold the business can tune, and a stop that no threshold can override. Moving the slider changes the workload. It never lets a listed case through.",
    },
    engineers: {
      summary: "For engineers",
      points: [
        "The 12 cases are a fixed fictional batch. Each one goes through the same policy function the API uses.",
        "Review score = 55 if the identity check is missing, plus half of the missing evidence coverage. A case goes to review when the score reaches the threshold. A sanctions hit stops the case before the score is computed.",
        "Tests pin the counts at thresholds 25 and 30, and sweep the slider to prove the bet can go either way.",
        "Stack: Next.js 16, TypeScript, node:test.",
      ],
      repoLabel: "Source code",
    },
    scene: {
      title: "Where each case ended up",
      caption: "Watch the cases arrive three at a time and see which ones go to a person.",
      statusLabels: { active: "tuned by you", success: "stopped a listed case" },
      tapeLabel: "Twelve cases, in the order they arrived",
      nodes: {
        cases: { name: "Credit cases", sub: "12 applications", analogy: "the passengers" },
        evidence: { name: "Evidence review", sub: "review threshold", analogy: "the scanner" },
        lists: { name: "Sanctions check", sub: "lists", analogy: "the no-fly list" },
        decision: { name: "Decision", sub: "through, review or stop", analogy: "the gate" },
      },
      tape: { served: "went straight through", rerouted: "sent to a person", lost: "stopped at the check" },
      throughOf: (n) => (n === 1 ? "1 of 12 went straight through" : `${n} of 12 went straight through`),
    },
  },
  es: {
    name: "Agente de Riesgo",
    oneLiner: "Decide qué casos de crédito pasan directo, cuáles revisa una persona y cuáles se detienen.",
    chips: ["Riesgo de crédito", "2 min", "Demo en vivo"],
    analogy: {
      heading: { before: "La", accent: "analogía" },
      paragraphs: [
        "Piensa en el control del aeropuerto. Casi todos pasan, a algunos les abren la maleta y el que aparece en una lista no sube al avión.",
        "El Agente de Riesgo hace eso con casos de crédito. Lee la evidencia de cada uno, manda los dudosos a una persona y detiene cualquier caso que aparezca en una lista de sanciones, diga lo que diga el resto de su evidencia.",
      ],
      dictionaryLabel: "En el diagrama de abajo",
      dictionary: [
        { term: "un pasajero", means: "un caso de crédito" },
        { term: "abrir la maleta", means: "la revisión por una persona" },
        { term: "la lista de no abordar", means: "el chequeo de sanciones" },
        { term: "qué tan exigente es el escáner", means: "el umbral de revisión" },
      ],
    },
    why: { title: "Por qué lo hice", text: "" },
    tryIt: {
      heading: { accent: "Pruébalo" },
      lead: "Llegan doce casos de crédito con más o menos evidencia. A dos les falta la verificación de identidad y uno aparece en una lista de sanciones.",
      question: (t) => `Antes de correrlo, apuesta: con el umbral de revisión en ${t}, ¿más de la mitad de los 12 casos pasa directo?`,
      yes: "Sí, más de 6",
      no: "No, 6 o menos",
      thresholdLabel: "Umbral de revisión",
      thresholdHint: "Más bajo es más estricto: más casos van a una persona.",
      note: "Cada cuadrito es un caso. Los azules fueron a una persona. El rojo se detuvo porque está en una lista de sanciones.",
      simulate: "Correr",
      cancel: "Cancelar",
      reset: "Empezar de nuevo",
      error: "No se pudieron revisar los casos.",
      idle: "Haz tu apuesta y presiona Correr.",
    },
    compare: {
      heading: { before: "Con el chequeo de listas", accent: "o sin él" },
      lead: "Los mismos 12 casos y el mismo umbral. Solo cambia si se revisa la lista de sanciones.",
      withCheck: "Con el chequeo",
      withoutCheck: "Sin el chequeo",
      slipped: "casos en lista que pasaron directo",
      sentence: (withCheck, withoutCheck) => {
        if (withoutCheck > withCheck) return "Con el chequeo de listas, el caso que estaba en una lista se detuvo. Sin él, habría pasado directo.";
        if (withCheck === 0 && withoutCheck === 0) return "Con este umbral el caso de la lista va a una persona de todos modos, así que esta vez el chequeo no cambió el resultado.";
        return `Casos en lista que pasaron directo: ${withCheck} con el chequeo, ${withoutCheck} sin él.`;
      },
    },
    fit: {
      heading: { before: "¿Dónde", accent: "sirve?" },
      worthLabel: "Vale la pena",
      worth: "Cuando un equipo de crédito recibe más casos de los que puede leer uno por uno y quiere que una persona vea solo los dudosos.",
      notLabel: "No hace falta",
      not: "Cuando llegan diez solicitudes a la semana y un analista las lee todas de cualquier forma.",
    },
    proves: {
      heading: { before: "Lo que", accent: "demuestra" },
      text: "Separé la decisión en dos: un umbral que el negocio puede ajustar y un alto que ningún umbral puede saltarse. Mover el slider cambia la carga de trabajo. Nunca deja pasar un caso que está en una lista.",
    },
    engineers: {
      summary: "Para ingenieros",
      points: [
        "Los 12 casos son un lote ficticio fijo. Cada uno pasa por la misma función de política que usa la API.",
        "Puntaje de revisión = 55 si falta la verificación de identidad, más la mitad de la cobertura de evidencia que falta. Un caso va a revisión cuando el puntaje llega al umbral. Una coincidencia en sanciones detiene el caso antes de calcular el puntaje.",
        "Los tests fijan los conteos con umbral 25 y 30, y recorren el slider para comprobar que la apuesta puede salir para los dos lados.",
        "Stack: Next.js 16, TypeScript, node:test.",
      ],
      repoLabel: "Código fuente",
    },
    scene: {
      title: "Dónde terminó cada caso",
      caption: "Mira cómo llegan los casos de tres en tres y cuáles van a una persona.",
      statusLabels: { active: "ajustado por ti", success: "detuvo un caso en lista" },
      tapeLabel: "Doce casos, en el orden en que llegaron",
      nodes: {
        cases: { name: "Casos", sub: "12 solicitudes", analogy: "los pasajeros" },
        evidence: { name: "Evidencia", sub: "umbral de revisión", analogy: "el escáner" },
        lists: { name: "Listas", sub: "sanciones", analogy: "la lista de no abordar" },
        decision: { name: "Decisión", sub: "pasa, revisa o alto", analogy: "la puerta" },
      },
      tape: { served: "pasó directo", rerouted: "fue a una persona", lost: "se detuvo en el chequeo" },
      throughOf: (n) => (n === 1 ? "Pasó directo 1 de 12" : `Pasaron directo ${n} de 12`),
    },
  },
};
