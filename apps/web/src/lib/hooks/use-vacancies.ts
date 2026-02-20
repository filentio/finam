"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { VacancyListOut } from "@/lib/types";

export function vacanciesKey(opts: { searchProfileId?: string; sort?: string; includeReasons?: boolean }) {
  return ["vacancies", opts.searchProfileId || null, opts.sort || "score", !!opts.includeReasons] as const;
}

export function useVacancies(opts: { searchProfileId?: string; sort?: "score" | "date"; includeReasons?: boolean }) {
  return useQuery({
    queryKey: vacanciesKey(opts),
    queryFn: () =>
      apiFetch<VacancyListOut>("/api/v1/vacancies", {
        query: {
          search_profile_id: opts.searchProfileId || undefined,
          sort: opts.sort || "score",
          include_reasons: !!opts.includeReasons,
        },
      }),
    enabled: !!opts.searchProfileId,
  });
}

