"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { VacancyListOut } from "@/lib/types";

export function vacanciesKey(opts: { searchProfileId?: string; sort?: string; days?: number | null; includeReasons?: boolean }) {
  return ["vacancies", opts.searchProfileId || null, opts.sort || "score", opts.days || null, !!opts.includeReasons] as const;
}

export function useVacancies(opts: {
  searchProfileId?: string;
  sort?: "score" | "date";
  days?: number | null;
  includeReasons?: boolean;
}) {
  return useQuery({
    queryKey: vacanciesKey(opts),
    queryFn: () =>
      apiFetch<VacancyListOut>("/api/v1/vacancies", {
        query: {
          search_profile_id: opts.searchProfileId || undefined,
          sort: opts.sort || "score",
          days: opts.days ?? undefined,
          include_reasons: !!opts.includeReasons,
        },
      }),
    enabled: !!opts.searchProfileId,
  });
}

