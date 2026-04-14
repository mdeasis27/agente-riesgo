import { NextRequest, NextResponse } from "next/server";

// Recibe un case_id y lo marca para revisión humana
export async function POST(req: NextRequest) {
  try {
    const { case_id, reason } = await req.json();

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
