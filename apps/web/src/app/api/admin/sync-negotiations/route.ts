import { NextResponse, type NextRequest } from "next/server";

function makeRequestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export async function POST(req: NextRequest) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const adminToken = process.env.ADMIN_SYNC_TOKEN;

  if (!apiBase) {
    return NextResponse.json({ message: "NEXT_PUBLIC_API_BASE_URL is not configured." }, { status: 500 });
  }
  if (!adminToken) {
    return NextResponse.json({ message: "ADMIN_SYNC_TOKEN is not configured (server-side)." }, { status: 500 });
  }

  const requestId = makeRequestId();
  const bodyText = await req.text();

  const upstream = await fetch(new URL("/api/v1/admin/sync/negotiations", apiBase), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": adminToken,
      "X-Request-Id": requestId,
    },
    body: bodyText || "{}",
    cache: "no-store",
  });

  const ct = upstream.headers.get("content-type") || "";
  const payload = ct.includes("application/json") ? await upstream.json().catch(() => null) : await upstream.text();

  return NextResponse.json(payload, {
    status: upstream.status,
    headers: {
      "X-Request-Id": upstream.headers.get("X-Request-Id") || requestId,
    },
  });
}

