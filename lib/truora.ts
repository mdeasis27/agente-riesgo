// Cliente Truora — validación de identidad y antecedentes para decisiones de riesgo

const TRUORA_BASE = "https://api.truora.com";

export interface TruoraVerification {
  check_id: string;
  identity_confirmed: boolean;
  sanctions_hit: boolean;
  pep_hit: boolean;
  judicial_records: boolean;
}

function getMockVerification(params: {
  name: string;
  country: string;
}): TruoraVerification {
  return {
    check_id: "mock_" + Date.now(),
    identity_confirmed: true,
    sanctions_hit: false,
    pep_hit: false,
    judicial_records: false,
  };
}

export async function runVerification(params: {
  name: string;
  document_id?: string;
  country: string;
}): Promise<TruoraVerification> {
  if (!process.env.TRUORA_API_KEY || process.env.TRUORA_MOCK === "true") {
    return getMockVerification({ name: params.name, country: params.country });
  }

  const res = await fetch(`${TRUORA_BASE}/v1/checks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Truora-API-Key": process.env.TRUORA_API_KEY,
    },
    body: JSON.stringify({ ...params, type: "background_check" }),
  });

  if (!res.ok) throw new Error(`Truora error: ${res.status}`);
  const data = await res.json();

  return {
    check_id: data.check_id,
    identity_confirmed: Boolean(data.identity_confirmed),
    sanctions_hit: Boolean(data.sanctions_hit),
    pep_hit: Boolean(data.pep_hit),
    judicial_records: Boolean(data.judicial_records),
  };
}
