const COPY: Record<string, { en: string; es: string }> = {
  "batch.1": { en: "cases 1 to 3 decided", es: "casos 1 a 3 decididos" },
  "batch.2": { en: "cases 4 to 6 decided", es: "casos 4 a 6 decididos" },
  "batch.3": { en: "cases 7 to 9 decided", es: "casos 7 a 9 decididos" },
  "batch.4": { en: "cases 10 to 12 decided", es: "casos 10 a 12 decididos" },
};
export function traceCopy(locale: "en" | "es", key: string) { return COPY[key]?.[locale] ?? key; }
