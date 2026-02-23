"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, FileText, Send, User, Settings, IdCard } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStatus } from "@/lib/hooks/use-auth-status";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search-profiles", label: "Поиск вакансий", icon: Search },
  { href: "/resumes", label: "Резюме", icon: IdCard },
  { href: "/letters", label: "Письма", icon: FileText },
  { href: "/applications", label: "Отклики", icon: Send },
  { href: "/profile", label: "Профиль", icon: User },
  { href: "/settings/hh", label: "Настройки", icon: Settings },
] as const;

function StatusBadge({
  connected,
  accountStatus,
}: {
  connected: boolean;
  accountStatus: string | null | undefined;
}) {
  if (!accountStatus && !connected) {
    return <Badge variant="secondary">HH: не подключён</Badge>;
  }
  if (accountStatus === "reauth_required") {
    return <Badge variant="destructive">HH: нужно переподключить</Badge>;
  }
  if (connected) {
    return <Badge variant="default">HH: подключён</Badge>;
  }
  return <Badge variant="secondary">HH: {accountStatus || "unknown"}</Badge>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: auth } = useAuthStatus();

  const needReconnect = auth?.account_status === "reauth_required";
  const canConnect = !auth?.connected || needReconnect;

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-6xl">
        <aside className="hidden w-64 shrink-0 border-r md:block">
          <div className="p-4">
            <div className="text-sm font-semibold">
              {process.env.NEXT_PUBLIC_APP_NAME || "HH Apply MVP"}
            </div>
            <div className="mt-2">
              <StatusBadge connected={!!auth?.connected} accountStatus={auth?.account_status} />
            </div>
          </div>
          <Separator />
          <nav className="p-2">
            {NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted",
                    active && "bg-muted font-medium"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2 md:hidden">
                <StatusBadge connected={!!auth?.connected} accountStatus={auth?.account_status} />
              </div>
              <div className="hidden md:flex items-center gap-2">
                <StatusBadge connected={!!auth?.connected} accountStatus={auth?.account_status} />
                {auth?.expires_at ? (
                  <span className="text-xs text-muted-foreground">
                    expires: {new Date(auth.expires_at).toLocaleString()}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                {canConnect ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      // Use same-origin /api/v1 proxy (Next rewrites).
                      const url = new URL("/api/v1/auth/hh/start", window.location.origin);
                      if (needReconnect) url.searchParams.set("force_login", "true");
                      window.location.href = url.toString();
                    }}
                  >
                    {needReconnect ? "Переподключить HH" : "Подключить HH"}
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/settings/hh">Настройки HH</Link>
                  </Button>
                )}
              </div>
            </div>
          </header>

          <div className="px-4 py-6 pb-24 md:pb-6">{children}</div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-6">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

