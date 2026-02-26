"use client";

import * as React from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { applicationsKey, useApplications } from "@/lib/hooks/use-applications";
import { useSyncNegotiations } from "@/lib/hooks/use-sync-negotiations";

const STATUSES = ["draft", "approved", "queued", "sent", "failed"] as const;
const RESP = ["pending", "viewed", "invited", "rejected", "closed", "unknown"] as const;

function StatusBadge({ v }: { v: string | null | undefined }) {
  if (!v) return <Badge variant="secondary">—</Badge>;
  if (v === "failed") return <Badge variant="destructive">{v}</Badge>;
  if (v === "sent") return <Badge>{v}</Badge>;
  if (v === "queued") return <Badge variant="secondary">{v}</Badge>;
  return <Badge variant="outline">{v}</Badge>;
}

export default function ApplicationsPage() {
  const qc = useQueryClient();
  const sync = useSyncNegotiations();
  const [status, setStatus] = React.useState<string>("");
  const [responseStatus, setResponseStatus] = React.useState<string>("");

  const q = useApplications({ status: status || null });

  const items = (q.data?.items || []).filter((a) => (responseStatus ? a.response_status === responseStatus : true));

  async function onSync() {
    try {
      const out = await sync.mutateAsync({ mode: "by_ids" });
      toast.success(`Sync: updated=${out.updated_count}, errors=${out.errors_count}`);
      await qc.invalidateQueries({ queryKey: applicationsKey });
    } catch {
      toast.error("Sync failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Отклики"
        description="Список applications + response_status (после sync переговоров)."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">status: all</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={responseStatus}
              onChange={(e) => setResponseStatus(e.target.value)}
            >
              <option value="">response_status: all</option>
              {RESP.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Button onClick={onSync} disabled={sync.isPending}>
              {sync.isPending ? "Sync..." : "Sync статусов"}
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          {q.isLoading ? (
            <div className="p-6">
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>status</TableHead>
                  <TableHead>response_status</TableHead>
                  <TableHead>hh_negotiation_id</TableHead>
                  <TableHead>vacancy_id</TableHead>
                  <TableHead>resume_id</TableHead>
                  <TableHead>updated</TableHead>
                  <TableHead>error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <StatusBadge v={a.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge v={a.response_status} />
                    </TableCell>
                    <TableCell className="text-xs">{a.hh_negotiation_id || "—"}</TableCell>
                    <TableCell className="text-xs">{a.vacancy_id.slice(0, 8)}…</TableCell>
                    <TableCell className="text-xs">{a.resume_id}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {a.response_updated_at ? new Date(a.response_updated_at).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {a.error_code ? (
                        <span className="text-destructive">
                          {a.error_code}
                          {a.error_message ? `: ${a.error_message}` : ""}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!items.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="p-6 text-sm text-muted-foreground">
                      Пока нет откликов. Откройте вакансии и нажмите «Откликнуться».
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

