import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import type { ReactNode } from "react";

import ResumesPage from "./page";

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe("ResumesPage", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          exists: false,
          updated_at: null,
          source: null,
          parsed: null,
          keywords: [],
          numbers_allowlist: [],
          raw_text: null,
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    }) as unknown as typeof fetch;
  });

  it("renders import tabs", async () => {
    render(wrap(<ResumesPage />));
    expect(await screen.findByText("Резюме")).toBeInTheDocument();
    expect(screen.getByText("Ссылка")).toBeInTheDocument();
    expect(screen.getByText("Файл")).toBeInTheDocument();
  });
});

