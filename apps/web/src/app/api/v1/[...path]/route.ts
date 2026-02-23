import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizeBase(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  // Ensure valid URL and remove trailing slash.
  try {
    const u = new URL(trimmed);
    return u.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function pickBases(): string[] {
  const primaryRaw = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const primary = normalizeBase(primaryRaw) || "http://localhost:8000";
  const bases = [primary];

  // Add common local/dev fallbacks (covers "api" host from docker-compose and "localhost" host from local runs).
  const host = (() => {
    try {
      return new URL(primary).hostname;
    } catch {
      return "";
    }
  })();

  if (host === "api") bases.push("http://localhost:8000");
  if (host === "localhost" || host === "127.0.0.1") bases.push("http://api:8000");

  // De-dup while preserving order.
  return Array.from(new Set(bases.filter(Boolean)));
}

function makeRequestId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number): Promise<Response> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: ac.signal });
  } finally {
    clearTimeout(t);
  }
}

async function proxy(req: NextRequest): Promise<NextResponse> {
  const requestId = req.headers.get("X-Request-Id") || makeRequestId();
  const bases = pickBases();

  // Forward most headers, but strip ones that must be controlled by fetch/runtime.
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.set("X-Request-Id", requestId);

  const method = req.method.toUpperCase();
  const hasBody = !(method === "GET" || method === "HEAD");

  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers,
    body: hasBody ? req.body : undefined,
    redirect: "manual",
    cache: "no-store",
    // Node fetch requires duplex for streaming bodies.
    duplex: hasBody ? "half" : undefined,
  };

  let lastError: unknown = null;
  for (const base of bases) {
    const upstreamUrl = new URL(req.nextUrl.pathname + req.nextUrl.search, base);
    try {
      const upstream = await fetchWithTimeout(upstreamUrl, init, 15_000);

      const outHeaders = new Headers(upstream.headers);
      // Avoid mismatched headers when the runtime transparently decodes upstream bodies.
      outHeaders.delete("content-encoding");
      outHeaders.delete("content-length");
      outHeaders.set("X-Request-Id", upstream.headers.get("X-Request-Id") || requestId);

      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: outHeaders,
      });
    } catch (e) {
      lastError = e;
      continue;
    }
  }

  const message =
    "Не удалось связаться с backend API. Проверьте, что backend запущен и доступен (обычно http://localhost:8000), " +
    "или что API_BASE_URL/NEXT_PUBLIC_API_BASE_URL указывает на правильный адрес.";

  return NextResponse.json(
    {
      error: {
        code: "UPSTREAM_UNREACHABLE",
        message,
        details: {
          bases_tried: bases,
          last_error: lastError instanceof Error ? lastError.message : String(lastError),
        },
      },
    },
    { status: 502, headers: { "X-Request-Id": requestId } }
  );
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;

