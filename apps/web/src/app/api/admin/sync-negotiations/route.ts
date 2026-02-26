import { NextResponse, type NextRequest } from "next/server";

function makeRequestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function pickBases(): string[] {
  const primaryRaw = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  let primary = "http://localhost:8000";
  try {
    primary = new URL(primaryRaw).toString().replace(/\/$/, "");
  } catch {
    primary = "http://localhost:8000";
  }
  const bases = [primary];

  const host = new URL(primary).hostname;
  if (host === "api") bases.push("http://localhost:8000");
  if (host === "localhost" || host === "127.0.0.1") bases.push("http://api:8000");

  return Array.from(new Set(bases));
}

export async function POST(req: NextRequest) {
  const adminToken = process.env.ADMIN_SYNC_TOKEN;

  if (!adminToken) {
    return NextResponse.json({ message: "ADMIN_SYNC_TOKEN is not configured (server-side)." }, { status: 500 });
  }

  const requestId = makeRequestId();
  const bodyText = await req.text();

  let lastErr: unknown = null;
  let upstream: Response | null = null;
  for (const base of pickBases()) {
    try {
      upstream = await fetch(new URL("/api/v1/admin/sync/negotiations", base), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken,
          "X-Request-Id": requestId,
        },
        body: bodyText || "{}",
        cache: "no-store",
        redirect: "manual",
      });
      break;
    } catch (e) {
      lastErr = e;
      upstream = null;
    }
  }

  if (!upstream) {
    return NextResponse.json(
      {
        error: {
          code: "UPSTREAM_UNREACHABLE",
          message: "Не удалось связаться с backend API для admin sync.",
          details: { last_error: lastErr instanceof Error ? lastErr.message : String(lastErr) },
        },
      },
      { status: 502, headers: { "X-Request-Id": requestId } }
    );
  }

  const ct = upstream.headers.get("content-type") || "";
  const payload = ct.includes("application/json") ? await upstream.json().catch(() => null) : await upstream.text();

  return NextResponse.json(payload, {
    status: upstream.status,
    headers: {
      "X-Request-Id": upstream.headers.get("X-Request-Id") || requestId,
    },
  });
}

