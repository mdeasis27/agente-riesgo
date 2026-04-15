import type { AgentDecision } from "@/lib/agent";

export interface DemoCase {
  input: {
    name: string;
    country: string;
    context: string;
    document_id?: string;
  };
  result: AgentDecision & {
    case_id: string;
    subject: string;
    country: string;
    context: string;
  };
  /** Métricas que el EvaluationTimeline mostrará en los pasos 1 y 2 */
  timeline: {
    truora: {
      identity_confirmed: boolean;
      sanctions_hit: boolean;
      pep_hit: boolean;
      judicial_records: boolean;
    };
    exa: {
      sources_found: number;
      sources_relevant: number;
    };
  };
}

export const DEMO_CASES: DemoCase[] = [
  {
    input: {
      name: "María Fernández López",
      country: "México",
      context: "credito",
    },
    result: {
      case_id: "demo-001",
      subject: "María Fernández López",
      country: "México",
      context: "credito",
      decision: "approve",
      confidence: 0.87,
      reasoning:
        "La sujeto presenta identidad confirmada sin sanciones ni antecedentes. La búsqueda de evidencia muestra un historial financiero sólido y referencias laborales positivas. No se detectaron señales de alerta significativas. La confianza es alta para proceder con la aprobación del crédito.",
      red_flags: [],
      positive_signals: [
        "Identidad verificada sin inconsistencias",
        "Sin sanciones ni listas negras",
        "Historial crediticio limpio en fuentes públicas",
        "Empleo estable documentado en fuentes web",
      ],
      escalation_reason: undefined,
      evidence_sources: [
        "https://buro.credito.mx/consulta/fernandez-lopez-maria",
        "https://linkedin.com/in/maria-fernandez-lopez-mx",
      ],
    },
    timeline: {
      truora: {
        identity_confirmed: true,
        sanctions_hit: false,
        pep_hit: false,
        judicial_records: false,
      },
      exa: { sources_found: 8, sources_relevant: 5 },
    },
  },
  {
    input: {
      name: "Carlos Mendoza Ríos",
      country: "Colombia",
      context: "onboarding",
      document_id: "CC-1023456789",
    },
    result: {
      case_id: "demo-002",
      subject: "Carlos Mendoza Ríos",
      country: "Colombia",
      context: "onboarding",
      decision: "reject",
      confidence: 0.91,
      reasoning:
        "El sujeto presenta múltiples señales críticas de riesgo: aparece en listas de sanciones internacionales y tiene antecedentes judiciales activos. Además, la evidencia web confirma vinculación con actividades irregulares documentadas en medios. La confianza para rechazar es muy alta.",
      red_flags: [
        "Aparece en lista OFAC de sanciones",
        "Antecedentes judiciales activos en Colombia",
        "Vinculado a investigaciones por lavado de activos según medios",
        "Documento con historial de inconsistencias",
      ],
      positive_signals: [],
      escalation_reason: undefined,
      evidence_sources: [
        "https://ofac.treasury.gov/recent-actions/20240815",
        "https://fiscalia.gov.co/casos/mendoza-rios",
        "https://semana.com/judicial/articulo/investigados-lavado-activos-2024",
      ],
    },
    timeline: {
      truora: {
        identity_confirmed: true,
        sanctions_hit: true,
        pep_hit: false,
        judicial_records: true,
      },
      exa: { sources_found: 11, sources_relevant: 7 },
    },
  },
  {
    input: {
      name: "Ana Torres Vega",
      country: "Argentina",
      context: "contratacion",
    },
    result: {
      case_id: "demo-003",
      subject: "Ana Torres Vega",
      country: "Argentina",
      context: "contratacion",
      decision: "escalate",
      confidence: 0.58,
      reasoning:
        "El perfil presenta señales mixtas que no permiten una decisión automatizada con suficiente confianza. La identidad está confirmada y el historial laboral parece sólido, pero se detectó un litigio laboral reciente sin resolución y una discrepancia menor en fechas de empleo declaradas. Se requiere revisión humana para evaluar el contexto completo.",
      red_flags: [
        "Litigio laboral activo sin sentencia (2023–presente)",
        "Discrepancia de 4 meses en historial de empleo declarado",
      ],
      positive_signals: [
        "Identidad confirmada sin sanciones",
        "Trayectoria profesional verificable en fuentes públicas",
        "Sin antecedentes penales",
      ],
      escalation_reason:
        "Señales mixtas con confianza insuficiente (58%). Litigio laboral activo requiere evaluación de contexto por analista humano.",
      evidence_sources: [
        "https://pjn.gov.ar/expedientes/torres-vega-ana-2023",
        "https://linkedin.com/in/ana-torres-vega-ar",
      ],
    },
    timeline: {
      truora: {
        identity_confirmed: true,
        sanctions_hit: false,
        pep_hit: false,
        judicial_records: true,
      },
      exa: { sources_found: 6, sources_relevant: 3 },
    },
  },
];
