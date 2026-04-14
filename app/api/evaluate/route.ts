import { NextRequest, NextResponse } from "next/server";
import { runVerification } from "@/lib/truora";
import { searchSubject } from "@/lib/exa";
import { evaluateCase } from "@/lib/agent";

export async function POST(req: NextRequest) {
  try {
    const { name, document_id, country, context } = await req.json();

    if (!name || !country) {
      return NextResponse.json(
        { error: "name y country son requeridos" },
        { status: 400 }
      );
    }

    const [truora, exaResults] = await Promise.all([
      runVerification({ name, document_id, country }),
      searchSubject({ name, context, country }),
    ]);

    const decision = await evaluateCase({ name, context, truora, exaResults });

    const case_id = "case_" + Date.now();

    return NextResponse.json({
      case_id,
      decision,
      subject: name,
      country,
      context,
    });
  } catch (err) {
    console.error("[/api/evaluate]", err);
    return NextResponse.json(
      { error: "Error al evaluar el caso" },
      { status: 500 }
    );
  }
}
