"use client";

import { useMutation } from "@tanstack/react-query";

import type { SyncNegotiationsOut } from "@/lib/types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function useSyncNegotiations() {
  return useMutation({
    mutationFn: async (payload?: { user_id?: string | null; mode?: string | null }) => {
      const res = await fetch("/api/admin/sync-negotiations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {}),
      });
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : await res.text();
      if (!res.ok) {
        const msg = isRecord(data) && typeof data.message === "string" ? data.message : "Sync failed.";
        throw new Error(msg);
      }
      return data as SyncNegotiationsOut;
    },
  });
}

