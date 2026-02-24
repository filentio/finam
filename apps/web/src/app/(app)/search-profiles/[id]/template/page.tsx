"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/app/tag-input";
import { ApiError } from "@/lib/api";
import { useGenerateTemplateFromResume, useRunSearchProfile, useSearchProfile, useUpdateSearchTemplate } from "@/lib/hooks/use-search-profiles";

type Template = {
  target_role?: string | null;
  query?: string | null;
  must_have?: string[];
  nice_to_have?: string[];
  exclude_keywords?: string[];
  locations?: string[];
  salary_min?: number | null;
};

function asTemplate(v: unknown): Template {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  return v as Template;
}

export default function SearchTemplatePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const sp = useSearchProfile(id);
  const gen = useGenerateTemplateFromResume();
  const save = useUpdateSearchTemplate();
  const run = useRunSearchProfile();

  const tpl = asTemplate(sp.data?.template_json);

  const [targetRole, setTargetRole] = React.useState<string>(tpl.target_role || "");
  const [query, setQuery] = React.useState<string>(tpl.query || "");
  const [mustHave, setMustHave] = React.useState<string[]>(tpl.must_have || []);
  const [niceToHave, setNiceToHave] = React.useState<string[]>(tpl.nice_to_have || []);
  const [exclude, setExclude] = React.useState<string[]>(tpl.exclude_keywords || []);
  const [locations, setLocations] = React.useState<string[]>(tpl.locations || []);
  const [salaryMin, setSalaryMin] = React.useState<string>(tpl.salary_min ? String(tpl.salary_min) : "");

  const [days, setDays] = React.useState<string>(sp.data?.date_filter_days ? String(sp.data.date_filter_days) : "");
  const [sortMode, setSortMode] = React.useState<"relevance" | "date">(
    sp.data?.sort_mode === "date" ? "date" : "relevance"
  );

  React.useEffect(() => {
    const t = asTemplate(sp.data?.template_json);
    setTargetRole(t.target_role || "");
    setQuery(t.query || "");
    setMustHave(t.must_have || []);
    setNiceToHave(t.nice_to_have || []);
    setExclude(t.exclude_keywords || []);
    setLocations(t.locations || []);
    setSalaryMin(t.salary_min ? String(t.salary_min) : "");
    setDays(sp.data?.date_filter_days ? String(sp.data.date_filter_days) : "");
    setSortMode(sp.data?.sort_mode === "date" ? "date" : "relevance");
  }, [sp.data?.template_json, sp.data?.date_filter_days, sp.data?.sort_mode]);

  const canSave = !!id;

  function buildPayload(): { template_json: Record<string, unknown>; date_filter_days: number | null; sort_mode: "relevance" | "date" } {
    const salary = salaryMin.trim() ? Number(salaryMin.trim()) : null;
    return {
      template_json: {
        target_role: targetRole.trim() || null,
        query: query.trim() || null,
        must_have: mustHave,
        nice_to_have: niceToHave,
        exclude_keywords: exclude,
        locations,
        salary_min: Number.isFinite(salary as number) && (salary as number) > 0 ? (salary as number) : null,
      },
      date_filter_days: days.trim() ? Number(days.trim()) : null,
      sort_mode: sortMode,
    };
  }

  return (
    <div>
      <PageHeader
        title="Шаблон поиска"
        description={sp.data ? `Профиль: ${sp.data.name}` : "Настройте template_json и запустите поиск."}
        right={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={async () => {
                if (!id) return;
                try {
                  await gen.mutateAsync(id);
                  toast.success("Сформировано из резюме");
                } catch (e) {
                  if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
                  else toast.error("Не удалось сформировать");
                }
              }}
              disabled={!id || gen.isPending}
            >
              {gen.isPending ? "Генерация..." : "Сформировать из резюме"}
            </Button>
            <Button
              onClick={async () => {
                if (!id) return;
                try {
                  const p = buildPayload();
                  await save.mutateAsync({ id, ...p });
                  toast.success("Сохранено");
                } catch (e) {
                  if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
                  else toast.error("Не удалось сохранить");
                }
              }}
              disabled={!canSave || save.isPending}
            >
              {save.isPending ? "Сохранение..." : "Сохранить"}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                if (!id) return;
                try {
                  await run.mutateAsync(id);
                  toast.success("Поиск запущен");
                } catch (e) {
                  if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
                  else toast.error("Не удалось запустить");
                }
              }}
              disabled={!id || run.isPending}
            >
              {run.isPending ? "Запуск..." : "Запустить поиск"}
            </Button>
            <Button variant="outline" asChild>
              <Link href={id ? `/vacancies?profile_id=${id}` : "/vacancies"}>Вакансии</Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Параметры шаблона</CardTitle>
          <CardDescription>Это MVP-структура; можно править вручную для лучшей релевантности.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Target role</Label>
              <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="CPO / Head of Product" />
            </div>
            <div className="space-y-2">
              <Label>Query</Label>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="head of product cpo product lead ..." />
            </div>
            <div className="space-y-2">
              <Label>Salary min</Label>
              <Input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="300000" />
            </div>
            <div className="space-y-2">
              <Label>Фильтр по дате</Label>
              <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={days} onChange={(e) => setDays(e.target.value)}>
                <option value="">Все</option>
                <option value="1">за 1 день</option>
                <option value="3">за 3 дня</option>
                <option value="7">за 7 дней</option>
                <option value="14">за 14 дней</option>
                <option value="30">за 30 дней</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Сортировка</Label>
              <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={sortMode} onChange={(e) => setSortMode(e.target.value === "date" ? "date" : "relevance")}>
                <option value="relevance">по релевантности</option>
                <option value="date">по дате</option>
              </select>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Must have</Label>
              <TagInput value={mustHave} onChange={setMustHave} placeholder="sql, analytics, a/b..." />
            </div>
            <div className="space-y-2">
              <Label>Nice to have</Label>
              <TagInput value={niceToHave} onChange={setNiceToHave} placeholder="fintech, b2b..." />
            </div>
            <div className="space-y-2">
              <Label>Exclude keywords</Label>
              <TagInput value={exclude} onChange={setExclude} placeholder="sales, support..." />
            </div>
            <div className="space-y-2">
              <Label>Locations (best-effort)</Label>
              <TagInput value={locations} onChange={setLocations} placeholder="Москва, Удаленно..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {sp.error ? (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
          Не удалось загрузить профиль.
        </div>
      ) : null}
    </div>
  );
}

