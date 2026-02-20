"use client";

import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { CoverLetterGenerateOut, CoverLetterOut } from "@/lib/types";

export function useGenerateCoverLetter() {
  return useMutation({
    mutationFn: (payload: { vacancyId: string; resume_id: string; tone?: string | null }) =>
      apiFetch<CoverLetterGenerateOut>(`/api/v1/vacancies/${payload.vacancyId}/cover-letter/generate`, {
        method: "POST",
        body: JSON.stringify({ resume_id: payload.resume_id, tone: payload.tone || null }),
      }),
  });
}

export function useUpdateCoverLetter() {
  return useMutation({
    mutationFn: (payload: { coverLetterId: string; text: string }) =>
      apiFetch<CoverLetterOut>(`/api/v1/cover-letters/${payload.coverLetterId}`, {
        method: "PUT",
        body: JSON.stringify({ text: payload.text }),
      }),
  });
}

