"use client";

import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import { useAuthStatus } from "@/lib/hooks/use-auth-status";
import { useCacheResume, useCachedResume, useHhResumesList } from "@/lib/hooks/use-hh-resumes";
import { useDefaultResume, useSetDefaultResume } from "@/lib/hooks/use-default-resume";

export default function ResumesPage() {
  const auth = useAuthStatus();
  const list = useHhResumesList({ enabled: false });
  const cache = useCacheResume();
  const def = useDefaultResume();
  const setDef = useSetDefaultResume();

  async function loadList() {
    try {
      await list.refetch();
    } catch {
      toast.error("Не удалось загрузить список резюме");
    }
  }

  const connected = !!auth.data?.connected;

  return (
    <div>
      <PageHeader
        title="Резюме (HH)"
        description="Загрузите список резюме, кэшируйте детали и выберите резюме по умолчанию."
        right={
          <Button onClick={loadList} disabled={!connected || list.isFetching}>
            {list.isFetching ? "Загрузка..." : "Загрузить список резюме"}
          </Button>
        }
      />

      {!connected ? (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>HH не подключён</CardTitle>
            <CardDescription>Подключите HH OAuth в настройках, чтобы получать резюме.</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Резюме по умолчанию</CardTitle>
          <CardDescription>Будет использоваться для генерации писем и отклика (если resume_id не указан явно).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          {def.isLoading ? <Skeleton className="h-6 w-40" /> : null}
          {def.data?.resume_id ? <Badge variant="secondary">{def.data.resume_id}</Badge> : <Badge variant="outline">не выбрано</Badge>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список резюме</CardTitle>
          <CardDescription>Кэш нужен, чтобы извлекать `normalized_text` и allowlist чисел для guardrails.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {list.isLoading ? (
            <div className="p-6">
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Cached</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(list.data?.items || []).map((r) => (
                  <ResumeRow
                    key={r.id}
                    id={r.id}
                    title={r.title}
                    updatedAt={r.updated_at}
                    isDefault={def.data?.resume_id === r.id}
                    onCache={async () => {
                      try {
                        await cache.mutateAsync(r.id);
                        toast.success("Детали резюме закэшированы");
                      } catch (e) {
                        if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
                        else toast.error("Не удалось закэшировать");
                      }
                    }}
                    onSetDefault={async () => {
                      try {
                        await setDef.mutateAsync(r.id);
                        toast.success("Резюме по умолчанию установлено");
                      } catch (e) {
                        if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
                        else toast.error("Не удалось установить по умолчанию");
                      }
                    }}
                  />
                ))}

                {!list.data?.items?.length ? (
                  <TableRow>
                    <TableCell colSpan={4} className="p-6 text-sm text-muted-foreground">
                      Нажмите «Загрузить список резюме».
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

function ResumeRow({
  id,
  title,
  updatedAt,
  isDefault,
  onCache,
  onSetDefault,
}: {
  id: string;
  title: string | null;
  updatedAt: string | null;
  isDefault: boolean;
  onCache: () => Promise<void>;
  onSetDefault: () => Promise<void>;
}) {
  const cached = useCachedResume(id, { enabled: true });
  const isCached = !!cached.data?.resume_id;
  const cacheErr = cached.error;

  return (
    <TableRow>
      <TableCell className="font-medium">
        {title || "—"}
        <div className="text-xs text-muted-foreground">{id}</div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{updatedAt ? new Date(updatedAt).toLocaleString() : "—"}</TableCell>
      <TableCell>
        {cached.isLoading ? (
          <Skeleton className="h-6 w-20" />
        ) : isCached ? (
          <Badge>cached</Badge>
        ) : cacheErr ? (
          <Badge variant="outline">no</Badge>
        ) : (
          <Badge variant="outline">no</Badge>
        )}
      </TableCell>
      <TableCell className="text-right space-x-2">
        {isDefault ? <Badge variant="secondary">default</Badge> : null}
        <Button size="sm" variant="secondary" onClick={onCache}>
          Кэшировать
        </Button>
        <Button size="sm" onClick={onSetDefault}>
          Использовать по умолчанию
        </Button>
      </TableCell>
    </TableRow>
  );
}

