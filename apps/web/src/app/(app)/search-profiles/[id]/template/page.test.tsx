import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import SearchTemplatePage from "./page";

vi.mock("next/navigation", async () => {
  const actual = (await vi.importActual("next/navigation")) as Record<string, unknown>;
  return {
    ...actual,
    useParams: () => ({ id: "sp1" }),
  };
});

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe("SearchTemplatePage", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/api/v1/search-profiles/sp1")) {
        return new Response(
          JSON.stringify({
            id: "sp1",
            name: "Test",
            is_active: true,
            filters: {},
            stoplist: {},
            generated_from_resume: false,
            template_json: { query: "python", must_have: ["python"], nice_to_have: [], exclude_keywords: [], locations: [], salary_min: null },
            date_filter_days: null,
            sort_mode: "relevance",
            updated_at: new Date().toISOString(),
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }
      return new Response("not found", { status: 404 });
    }) as unknown as typeof fetch;
  });

  it("renders", async () => {
    render(wrap(<SearchTemplatePage />));
    expect(await screen.findByText("Шаблон поиска")).toBeInTheDocument();
    expect(screen.getByText("Сформировать из резюме")).toBeInTheDocument();
  });
});

