"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { useAuthStatus } from "@/lib/hooks/use-auth-status";
import { useSearchProfiles, useRunSearchProfile } from "@/lib/hooks/use-search-profiles";
import { useSyncNegotiations } from "@/lib/hooks/use-sync-negotiations";

export default function DashboardPage() {
  const auth = useAuthStatus();
  const profiles = useSearchProfiles();
  const run = useRunSearchProfile();
  const sync = useSyncNegotiations();

  const [profileId, setProfileId] = React.useState<string>("");

  React.useEffect(() => {
    const first = profiles.data?.items?.[0]?.id;
    if (!profileId && first) setProfileId(first);
  }, [profiles.data, profileId]);

  async function onRun() {
    try {
      const out = await run.mutateAsync(profileId);
      toast.success(`Поиск запущен: ${out.status}`);
    } catch (e) {
      const err = e as unknown;
      if (err instanceof ApiError) toast.error(`${err.message}${err.errorCode ? ` (${err.errorCode})` : ""}`);
      else toast.error("Не удалось запустить поиск");
    }
  }

  async function onSync() {
    try {
      const out = await sync.mutateAsync({ mode: "by_ids" });
      toast.success(`Sync: updated=${out.updated_count}, errors=${out.errors_count}`);
    } catch {
      toast.error("Не удалось синхронизировать статусы");
    }
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Быстрые действия для MVP: run профиля поиска и sync статусов откликов."
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/search-profiles">Профили поиска</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/applications">Отклики</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>HH статус</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {auth.isLoading ? <Skeleton className="h-6 w-40" /> : null}
            {auth.data ? (
              <>
                <div className="flex items-center gap-2">
                  {auth.data.connected ? <Badge>connected</Badge> : <Badge variant="secondary">not connected</Badge>}
                  {auth.data.account_status === "reauth_required" ? (
                    <Badge variant="destructive">reauth_required</Badge>
                  ) : null}
                </div>
                <div className="text-sm text-muted-foreground">
                  expires_at: {auth.data.expires_at ? new Date(auth.data.expires_at).toLocaleString() : "—"}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Run профиля поиска</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profiles.isLoading ? <Skeleton className="h-10 w-full" /> : null}
            {profiles.data?.items?.length ? (
              <>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                >
                  {profiles.data.items.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <Button onClick={onRun} disabled={!profileId || run.isPending}>
                    {run.isPending ? "Запуск..." : "Запустить поиск"}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={profileId ? `/vacancies?profile_id=${profileId}` : "/vacancies"}>Открыть вакансии</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Нет профилей. Создайте в <Link className="underline" href="/search-profiles">Поиск вакансий</Link>.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sync статусов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Синхронизация переговоров (admin endpoint) вызывается через server-side proxy в Next.js, токен не попадает в client bundle.
            </div>
            <Button onClick={onSync} disabled={sync.isPending}>
              {sync.isPending ? "Sync..." : "Sync статусов откликов"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

