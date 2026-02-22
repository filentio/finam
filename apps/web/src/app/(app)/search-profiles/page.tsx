"use client";

import * as React from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TagInput } from "@/components/app/tag-input";
import type { SearchProfile } from "@/lib/types";
import { ApiError } from "@/lib/api";
import {
  useCreateSearchProfile,
  useDeleteSearchProfile,
  useRunSearchProfile,
  useSearchProfiles,
  useUpdateSearchProfile,
} from "@/lib/hooks/use-search-profiles";

const filtersSchema = z.object({
  text: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  salary_min: z
    .preprocess((v) => {
      if (v === "" || v === null || v === undefined) return undefined;
      if (typeof v === "number" && Number.isNaN(v)) return undefined;
      if (typeof v === "string") {
        const trimmed = v.trim();
        if (!trimmed) return undefined;
        const n = Number(trimmed);
        return Number.isNaN(n) ? v : n;
      }
      return v;
    }, z.number().int().positive())
    .optional(),
  employment: z.string().optional().nullable(),
  schedule: z.string().optional().nullable(),
});

const stoplistSchema = z.object({
  companies: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

const formSchema = z.object({
  name: z.string().min(1).max(200),
  is_active: z.boolean().default(true),
  filters: filtersSchema,
  stoplist: stoplistSchema,
});

type FormValues = z.input<typeof formSchema>;

function toPayload(v: FormValues) {
  const filters: Record<string, unknown> = {
    text: v.filters.text || undefined,
    area: v.filters.area || undefined,
    experience: v.filters.experience || undefined,
    employment: v.filters.employment || undefined,
    schedule: v.filters.schedule || undefined,
  };
  if (typeof v.filters.salary_min === "number" && Number.isFinite(v.filters.salary_min) && v.filters.salary_min > 0) {
    filters.salary = v.filters.salary_min;
  }
  const stoplist: Record<string, unknown> = {
    companies: v.stoplist.companies || [],
    keywords: v.stoplist.keywords || [],
  };
  return { name: v.name, is_active: v.is_active, filters, stoplist };
}

function fromProfile(p: SearchProfile): FormValues {
  const f = (p.filters || {}) as Record<string, unknown>;
  const s = (p.stoplist || {}) as Record<string, unknown>;
  const getStr = (k: string) => {
    const v = f[k];
    return typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
  };
  const getNum = (k: string) => {
    const v = f[k];
    return typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : null;
  };
  const getArr = (obj: Record<string, unknown>, k: string) => {
    const v = obj[k];
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  };
  return {
    name: p.name,
    is_active: !!p.is_active,
    filters: {
      text: getStr("text") || getStr("query"),
      area: getStr("area") || getStr("area_id"),
      experience: getStr("experience"),
      salary_min: getNum("salary") ?? getNum("salary_from"),
      employment: getStr("employment"),
      schedule: getStr("schedule"),
    },
    stoplist: {
      companies: getArr(s, "companies"),
      keywords: getArr(s, "keywords"),
    },
  };
}

function EditorDialog({
  open,
  onOpenChange,
  initial,
  mode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: SearchProfile | null;
  mode: "create" | "edit";
}) {
  const create = useCreateSearchProfile();
  const update = useUpdateSearchProfile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial ? fromProfile(initial) : { name: "", is_active: true, filters: {}, stoplist: { companies: [], keywords: [] } },
  });

  React.useEffect(() => {
    form.reset(initial ? fromProfile(initial) : { name: "", is_active: true, filters: {}, stoplist: { companies: [], keywords: [] } });
  }, [initial, form, open]);

  async function onSubmit(v: FormValues) {
    try {
      if (mode === "create") {
        await create.mutateAsync(toPayload(v));
        toast.success("Профиль создан");
      } else if (initial) {
        const p = toPayload(v);
        await update.mutateAsync({
          id: initial.id,
          patch: { name: p.name, is_active: p.is_active, filters: p.filters, stoplist: p.stoplist },
        });
        toast.success("Профиль обновлён");
      }
      onOpenChange(false);
    } catch (e) {
      if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
      else if (e instanceof Error && e.message) toast.error(e.message);
      else toast.error("Ошибка сохранения");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Новый профиль поиска" : "Редактирование профиля"}</DialogTitle>
          <DialogDescription>Минимальные поля для маппинга на HH /vacancies.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Название</Label>
            <Input {...form.register("name")} placeholder="Напр. Backend Python (Moscow)" />
          </div>

          <div className="space-y-2">
            <Label>Text (query)</Label>
            <Input {...form.register("filters.text")} placeholder="python fastapi" />
          </div>
          <div className="space-y-2">
            <Label>Area (id)</Label>
            <Input {...form.register("filters.area")} placeholder="1 (Москва)" />
          </div>
          <div className="space-y-2">
            <Label>Experience</Label>
            <Input {...form.register("filters.experience")} placeholder="noExperience / between1And3 ..." />
          </div>
          <div className="space-y-2">
            <Label>Salary min</Label>
            <Input
              type="number"
              {...form.register("filters.salary_min", {
                setValueAs: (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
              })}
              placeholder="150000"
            />
          </div>
          <div className="space-y-2">
            <Label>Employment</Label>
            <Input {...form.register("filters.employment")} placeholder="full / part ..." />
          </div>
          <div className="space-y-2">
            <Label>Schedule</Label>
            <Input {...form.register("filters.schedule")} placeholder="fullDay / remote ..." />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Stoplist companies</Label>
            <TagInput
              value={form.watch("stoplist.companies") || []}
              onChange={(v) => form.setValue("stoplist.companies", v, { shouldDirty: true })}
              placeholder="ООО Рога и Копыта"
            />
          </div>
          <div className="space-y-2">
            <Label>Stoplist keywords</Label>
            <TagInput
              value={form.watch("stoplist.keywords") || []}
              onChange={(v) => form.setValue("stoplist.keywords", v, { shouldDirty: true })}
              placeholder="outsourcing, gambling..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={create.isPending || update.isPending}>
            {create.isPending || update.isPending ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SearchProfilesPage() {
  const q = useSearchProfiles();
  const run = useRunSearchProfile();
  const del = useDeleteSearchProfile();

  const [open, setOpen] = React.useState(false);
  const [edit, setEdit] = React.useState<SearchProfile | null>(null);

  async function onRun(id: string) {
    try {
      const out = await run.mutateAsync(id);
      toast.success(`Run: ${out.status}`);
    } catch (e) {
      if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
      else toast.error("Не удалось запустить");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Удалить профиль?")) return;
    try {
      await del.mutateAsync(id);
      toast.success("Удалено");
    } catch (e) {
      if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
      else toast.error("Не удалось удалить");
    }
  }

  return (
    <div>
      <PageHeader
        title="Профили поиска"
        description="Создайте профиль, затем запустите run и откройте вакансии."
        right={
          <Button
            onClick={() => {
              setEdit(null);
              setOpen(true);
            }}
          >
            Новый профиль
          </Button>
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
                  <TableHead>Название</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(q.data?.items || []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.is_active ? <Badge>yes</Badge> : <Badge variant="secondary">no</Badge>}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(p.updated_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEdit(p);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" onClick={() => onRun(p.id)} disabled={run.isPending}>
                        Run
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/vacancies?profile_id=${p.id}`}>Vacancies</Link>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(p.id)} disabled={del.isPending}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!q.data?.items?.length ? (
                  <TableRow>
                    <TableCell colSpan={4} className="p-6 text-sm text-muted-foreground">
                      Пока нет профилей. Нажмите «Новый профиль».
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EditorDialog open={open} onOpenChange={setOpen} initial={edit} mode={edit ? "edit" : "create"} />
    </div>
  );
}

