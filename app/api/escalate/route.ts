import { NextRequest, NextResponse } from "next/server";

function sanitize(value: unknown, maxLength = 200): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n\t\x00-\x1F\x7F]/g, " ").slice(0, maxLength).trim();
}

// Recibe un case_id y lo marca para revisión humana
export async function POST(req: NextRequest) {
  const apiKey = process.env.INTERNAL_API_KEY;
  if (apiKey && req.headers.get("x-api-key") !== apiKey) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const case_id = sanitize(body.case_id, 100);
    const reason = sanitize(body.reason, 500);

    if (!case_id) {
      return NextResponse.json({ error: "case_id es requerido" }, { status: 400 });
    }

    // TODO: persistir en DB (Supabase / Postgres)
    // TODO: notificar al revisor humano (email, Slack)
    console.log(`[ESCALATE] case=${case_id} reason=${reason}`);

    return NextResponse.json({ case_id, status: "escalated", reason });
  } catch (err) {
    console.error("[/api/escalate]", err);
    return NextResponse.json({ error: "Error al escalar el caso" }, { status: 500 });
  }
}
