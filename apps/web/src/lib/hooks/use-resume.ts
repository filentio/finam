"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { ResumeGetOut, ResumeImportOut } from "@/lib/types";

export const resumeKey = ["resume"] as const;

export function useResume(opts?: { includeRaw?: boolean }) {
  const includeRaw = !!opts?.includeRaw;
  return useQuery({
    queryKey: [...resumeKey, { includeRaw }] as const,
    queryFn: () => apiFetch<ResumeGetOut>(`/api/v1/resume${includeRaw ? "?include_raw=true" : ""}`),
    staleTime: 10_000,
  });
}

export function useImportResumeFromUrl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) =>
      apiFetch<ResumeImportOut>("/api/v1/resume/from-url", { method: "POST", body: JSON.stringify({ url }) }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: resumeKey });
    },
  });
}

export function useUploadResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.set("file", file);
      return await apiFetch<ResumeImportOut>("/api/v1/resume/upload", { method: "POST", body: fd });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: resumeKey });
    },
  });
}

