"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { Application, ApplicationListOut, ApplicationSendOut } from "@/lib/types";

export const applicationsKey = ["applications"] as const;

export function useApplications(filters?: { status?: string | null }) {
  return useQuery({
    queryKey: [...applicationsKey, { status: filters?.status || null }] as const,
    queryFn: () =>
      apiFetch<ApplicationListOut>("/api/v1/applications", {
        query: { status: filters?.status || undefined, limit: 200 },
      }),
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { vacancy_id: string; resume_id: string; cover_letter_id?: string | null }) =>
      apiFetch<Application>("/api/v1/applications", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: applicationsKey });
    },
  });
}

export function useApproveApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<Application>(`/api/v1/applications/${id}/approve`, { method: "POST" }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: applicationsKey });
    },
  });
}

export function useSendApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; idempotencyKey: string }) =>
      apiFetch<ApplicationSendOut>(`/api/v1/applications/${payload.id}/send`, {
        method: "POST",
        headers: { "Idempotency-Key": payload.idempotencyKey },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: applicationsKey });
    },
  });
}

