import { NextRequest, NextResponse } from "next/server";
import { runVerification } from "@/lib/truora";
import { searchSubject } from "@/lib/exa";
import { evaluateCase } from "@/lib/agent";
import { rateLimit } from "@/ai-kit/rate-limit";
import type { UserApiKey } from "@/ai-kit/types";

const VALID_CONTEXTS = ["credito", "contratacion", "onboarding"] as const;

function sanitize(value: unknown, maxLength = 200): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n\t\x00-\x1F\x7F]/g, " ").slice(0, maxLength).trim();
}

function parseByokHeader(header: string | null): UserApiKey | null {
  if (!header) return null;
  try {
    const parsed = JSON.parse(header) as unknown;
    if (typeof parsed === "object" && parsed !== null && "provider" in parsed && "key" in parsed) {
      return parsed as UserApiKey;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.INTERNAL_API_KEY;
  if (apiKey && req.headers.get("x-api-key") !== apiKey) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed } = rateLimit(ip, { maxRequests: 10, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Vuelve en una hora." }, { status: 429 });
  }

  try {
    const body = await req.json();

    const name = sanitize(body.name);
    const country = sanitize(body.country);
    const document_id = body.document_id ? sanitize(body.document_id, 100) : undefined;
    const context = sanitize(body.context, 50) || "credito";

    if (!name || !country) {
      return NextResponse.json({ error: "name y country son requeridos" }, { status: 400 });
    }

    if (!VALID_CONTEXTS.includes(context as (typeof VALID_CONTEXTS)[number])) {
      return NextResponse.json(
        { error: "context debe ser uno de: credito, contratacion, onboarding" },
        { status: 400 }
      );
    }

    const userApiKey = parseByokHeader(req.headers.get("x-user-api-key"));

    const [truora, exaResults] = await Promise.all([
      runVerification({ name, document_id, country }),
      searchSubject({ name, context, country }),
    ]);

    const decision = await evaluateCase({ name, context, truora, exaResults, userApiKey: userApiKey ?? undefined });
    const case_id = crypto.randomUUID();

    return NextResponse.json({
      case_id,
      decision,
      subject: name,
      country,
      context,
    });
  } catch (err) {
    console.error("[/api/evaluate]", err);
    return NextResponse.json({ error: "Error al evaluar el caso" }, { status: 500 });
  }
}
