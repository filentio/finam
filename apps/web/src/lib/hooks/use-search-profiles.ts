"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { SearchProfile } from "@/lib/types";

export const searchProfilesKey = ["search-profiles"] as const;

type SearchProfilesListOut = { items: SearchProfile[] };
type RunOut = { run_id: string; status: string };
type SearchProfileCreateIn = {
  name: string;
  filters: Record<string, unknown>;
  stoplist: Record<string, unknown>;
  is_active?: boolean;
};

export function useSearchProfiles() {
  return useQuery({
    queryKey: searchProfilesKey,
    queryFn: () => apiFetch<SearchProfilesListOut>("/api/v1/search-profiles"),
  });
}

export function useCreateSearchProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SearchProfileCreateIn) =>
      apiFetch<SearchProfile>("/api/v1/search-profiles", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: searchProfilesKey });
    },
  });
}

export function useUpdateSearchProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; patch: Partial<SearchProfile> }) =>
      apiFetch<SearchProfile>(`/api/v1/search-profiles/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: payload.patch.name,
          filters: payload.patch.filters,
          stoplist: payload.patch.stoplist,
          is_active: payload.patch.is_active,
        }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: searchProfilesKey });
    },
  });
}

export function useDeleteSearchProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/v1/search-profiles/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: searchProfilesKey });
    },
  });
}

export function useRunSearchProfile() {
  return useMutation({
    mutationFn: (id: string) => apiFetch<RunOut>(`/api/v1/search-profiles/${id}/run`, { method: "POST" }),
  });
}

