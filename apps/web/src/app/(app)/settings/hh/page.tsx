"use client";

import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStatus, authStatusKey } from "@/lib/hooks/use-auth-status";
import { useQueryClient } from "@tanstack/react-query";

export default function HHSettingsPage() {
  const qc = useQueryClient();
  const { data: auth, isLoading } = useAuthStatus();

  async function disconnect() {
    try {
      await apiFetch<{ connected: boolean }>("/api/v1/auth/hh/disconnect", { method: "POST" });
      toast.success("HH отключён");
      await qc.invalidateQueries({ queryKey: authStatusKey });
    } catch (e) {
      if (e instanceof ApiError) {
        toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
      } else {
        toast.error("Не удалось отключить HH");
      }
    }
  }

  const needReconnect = auth?.account_status === "reauth_required";

  return (
    <div>
      <PageHeader title="Настройки HH" description="Подключение/отключение HH аккаунта (OAuth)." />
      <Card>
        <CardHeader>
          <CardTitle>HH OAuth</CardTitle>
          <CardDescription>
            Подключение происходит через редирект на backend. После успешного callback можно вернуться в UI и обновить страницу.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {auth?.connected ? <Badge>connected</Badge> : <Badge variant="secondary">not connected</Badge>}
            {needReconnect ? <Badge variant="destructive">reauth_required</Badge> : null}
            {auth?.expires_at ? (
              <span className="text-sm text-muted-foreground">expires_at: {new Date(auth.expires_at).toLocaleString()}</span>
            ) : null}
          </div>

          <Separator />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={() => {
                window.location.href = new URL("/api/v1/auth/hh/start", window.location.origin).toString();
              }}
            >
              Подключить HH
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const url = new URL("/api/v1/auth/hh/start", window.location.origin);
                url.searchParams.set("force_login", "true");
                window.location.href = url.toString();
              }}
            >
              Подключить другой аккаунт
            </Button>
            <Button variant="outline" onClick={disconnect} disabled={isLoading}>
              Отключить
            </Button>
          </div>

          {needReconnect ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              HH пометил токен как устаревший. Нажмите «Подключить другой аккаунт» или «Переподключить» и пройдите OAuth заново.
            </div>
          ) : null}

          {isLoading ? <div className="text-sm text-muted-foreground">Загрузка...</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}

