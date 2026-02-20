export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export type ApiErrorPayload = {
  error?: { code?: string; message?: string; details?: unknown };
  detail?: unknown;
};

export class ApiError extends Error {
  status: number;
  errorCode?: string;
  requestId?: string;
  payload?: unknown;

  constructor(opts: { status: number; message: string; errorCode?: string; requestId?: string; payload?: unknown }) {
    super(opts.message);
    this.name = "ApiError";
    this.status = opts.status;
    this.errorCode = opts.errorCode;
    this.requestId = opts.requestId;
    this.payload = opts.payload;
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseBackendError(payload: unknown): { message: string; errorCode?: string } {
  if (!isRecord(payload)) return { message: "Request failed." };

  // our JSONResponse helper uses { error: { code, message } }
  const error = payload.error;
  if (isRecord(error)) {
    const message = typeof error.message === "string" ? error.message : "Request failed.";
    const errorCode = typeof error.code === "string" ? error.code : undefined;
    return { message, errorCode };
  }

  // FastAPI HTTPException often returns {"detail": "..."} or {"detail": {"code","message"}}
  const detail = payload.detail;
  if (typeof detail === "string") return { message: detail };
  if (isRecord(detail)) {
    const message = typeof detail.message === "string" ? detail.message : "Request failed.";
    const errorCode =
      typeof detail.code === "string"
        ? detail.code
        : typeof (detail as Record<string, unknown>).error_code === "string"
          ? ((detail as Record<string, unknown>).error_code as string)
          : undefined;
    return { message, errorCode };
  }

  return { message: "Request failed." };
}

function makeRequestId() {
  try {
    // Browser + Node 18+ have crypto.randomUUID()
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit & { query?: Record<string, string | number | boolean | undefined | null> } = {}
): Promise<T> {
  if (!apiBaseUrl) {
    throw new ApiError({ status: 0, message: "NEXT_PUBLIC_API_BASE_URL is not configured." });
  }

  const url = new URL(path, apiBaseUrl);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }

  const requestId = makeRequestId();
  const headers = new Headers(opts.headers || {});
  headers.set("X-Request-Id", requestId);
  if (opts.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(url.toString(), {
    ...opts,
    headers,
    cache: "no-store",
  });

  const responseRequestId = res.headers.get("X-Request-Id") || undefined;

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);

  if (!res.ok) {
    const parsed = parseBackendError(payload);
    throw new ApiError({
      status: res.status,
      message: parsed.message,
      errorCode: parsed.errorCode,
      requestId: responseRequestId || requestId,
      payload,
    });
  }

  return payload as T;
}

