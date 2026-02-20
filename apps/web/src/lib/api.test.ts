import { describe, expect, it, vi, beforeEach } from "vitest";

describe("apiFetch", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://example.test";
  });

  it("parses JSON error {error:{code,message}}", async () => {
    const { apiFetch, ApiError } = await import("./api");
    const mockFetch = vi.fn(async () => {
      return new Response(JSON.stringify({ error: { code: "X", message: "Boom" } }), {
        status: 400,
        headers: { "content-type": "application/json", "X-Request-Id": "rid" },
      });
    });
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    await expect(apiFetch("/api/v1/test")).rejects.toBeInstanceOf(ApiError);
    await expect(apiFetch("/api/v1/test")).rejects.toMatchObject({
      status: 400,
      errorCode: "X",
      message: "Boom",
      requestId: "rid",
    });
  });

  it("parses FastAPI HTTPException detail dict", async () => {
    const { apiFetch } = await import("./api");
    const mockFetch = vi.fn(async () => {
      return new Response(JSON.stringify({ detail: { code: "VALIDATION_ERROR", message: "Nope" } }), {
        status: 409,
        headers: { "content-type": "application/json" },
      });
    });
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    await expect(apiFetch("/api/v1/test")).rejects.toMatchObject({
      status: 409,
      errorCode: "VALIDATION_ERROR",
      message: "Nope",
    });
  });
});

