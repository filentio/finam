"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { DefaultResumeOut } from "@/lib/types";

export const defaultResumeKey = ["user", "default-resume"] as const;

export function useDefaultResume() {
  return useQuery({
    queryKey: defaultResumeKey,
    queryFn: () => apiFetch<DefaultResumeOut>("/api/v1/user/default-resume"),
  });
}

export function useSetDefaultResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (resumeId: string | null) =>
      apiFetch<DefaultResumeOut>("/api/v1/user/default-resume", {
        method: "PUT",
        body: JSON.stringify({ resume_id: resumeId }),
      }),
    onSuccess: async (data) => {
      qc.setQueryData(defaultResumeKey, data);
      await qc.invalidateQueries({ queryKey: defaultResumeKey });
    },
  });
}

