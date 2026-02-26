"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { HhResumeCachedOut, HhResumeCacheOut, HhResumeListOut } from "@/lib/types";

export const hhResumesListKey = ["hh", "resumes"] as const;

export function useHhResumesList(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: hhResumesListKey,
    queryFn: () => apiFetch<HhResumeListOut>("/api/v1/hh/resumes"),
    enabled: opts?.enabled ?? true,
  });
}

export function cachedResumeKey(resumeId: string) {
  return ["hh", "resumes", "cached", resumeId] as const;
}

export function useCachedResume(resumeId: string, opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: cachedResumeKey(resumeId),
    queryFn: () => apiFetch<HhResumeCachedOut>(`/api/v1/hh/resumes/${resumeId}`, { query: { include_raw: false } }),
    enabled: opts?.enabled ?? true,
    retry: false,
  });
}

export function useCacheResume() {
  return useMutation({
    mutationFn: (resumeId: string) => apiFetch<HhResumeCacheOut>(`/api/v1/hh/resumes/${resumeId}/cache`, { method: "POST" }),
  });
}

