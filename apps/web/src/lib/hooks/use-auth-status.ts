"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { AuthStatus } from "@/lib/types";

export const authStatusKey = ["auth", "hh", "status"] as const;

export function useAuthStatus() {
  return useQuery({
    queryKey: authStatusKey,
    queryFn: () => apiFetch<AuthStatus>("/api/v1/auth/hh/status"),
    staleTime: 15_000,
  });
}

