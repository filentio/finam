"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { CandidateProfile } from "@/lib/types";

export const candidateProfileKey = ["candidate-profile"] as const;

export function useCandidateProfile() {
  return useQuery({
    queryKey: candidateProfileKey,
    queryFn: () => apiFetch<CandidateProfile>("/api/v1/candidate-profile"),
  });
}

export function useUpdateCandidateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CandidateProfile>) =>
      apiFetch<CandidateProfile>("/api/v1/candidate-profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      qc.setQueryData(candidateProfileKey, data);
    },
  });
}

