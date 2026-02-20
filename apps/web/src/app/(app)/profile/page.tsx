"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/app/tag-input";
import { ApiError } from "@/lib/api";
import { useCandidateProfile, useUpdateCandidateProfile } from "@/lib/hooks/use-candidate-profile";

const linkSchema = z.object({
  type: z.string().min(1, "type обязателен"),
  url: z.string().url("url должен быть валидным"),
});

const formSchema = z.object({
  full_name: z.string().max(200).optional().nullable(),
  desired_role: z.string().max(200).optional().nullable(),
  summary: z.string().max(5000).optional().nullable(),
  skills_json: z.array(z.string().min(1)).default([]),
  achievements_json: z.array(z.string().min(1)).default([]),
  links_json: z.array(linkSchema).default([]),
  facts_numbers_json: z.array(z.string().min(1)).default([]),
});

type FormValues = z.input<typeof formSchema>;

export default function ProfilePage() {
  const q = useCandidateProfile();
  const save = useUpdateCandidateProfile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      desired_role: "",
      summary: "",
      skills_json: [],
      achievements_json: [],
      links_json: [],
      facts_numbers_json: [],
    },
  });

  React.useEffect(() => {
    if (!q.data) return;
    form.reset({
      full_name: q.data.full_name || "",
      desired_role: q.data.desired_role || "",
      summary: q.data.summary || "",
      skills_json: q.data.skills_json || [],
      achievements_json: q.data.achievements_json || [],
      links_json: q.data.links_json || [],
      facts_numbers_json: q.data.facts_numbers_json || [],
    });
  }, [q.data, form]);

  async function onSubmit(v: FormValues) {
    try {
      await save.mutateAsync({
        full_name: v.full_name || null,
        desired_role: v.desired_role || null,
        summary: v.summary || null,
        skills_json: v.skills_json,
        achievements_json: v.achievements_json,
        links_json: v.links_json,
        facts_numbers_json: v.facts_numbers_json,
      });
      toast.success("Профиль сохранён");
    } catch (e) {
      const err = e as unknown;
      if (err instanceof ApiError) {
        toast.error(`${err.message}${err.errorCode ? ` (${err.errorCode})` : ""}`);
      } else {
        toast.error("Не удалось сохранить профиль");
      }
    }
  }

  const links = form.watch("links_json") || [];

  return (
    <div>
      <PageHeader
        title="Профиль кандидата"
        description="Эти данные используются при генерации сопроводительных писем. Важно: любые числа, которые могут появиться в письмах, добавьте в allowlist."
        right={
          <Button onClick={form.handleSubmit(onSubmit)} disabled={save.isPending}>
            {save.isPending ? "Сохранение..." : "Сохранить"}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Основное</CardTitle>
          <CardDescription>Минимальный набор для MVP.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>ФИО</Label>
              <Input {...form.register("full_name")} placeholder="Иван Иванов" />
            </div>
            <div className="space-y-2">
              <Label>Желаемая роль</Label>
              <Input {...form.register("desired_role")} placeholder="Backend Engineer" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Короткое summary</Label>
            <Textarea {...form.register("summary")} placeholder="3–6 предложений: опыт, домены, сильные стороны." />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Skills</Label>
            <TagInput
              value={form.watch("skills_json") || []}
              onChange={(v) => form.setValue("skills_json", v, { shouldDirty: true })}
              placeholder="Python, FastAPI, SQL..."
            />
          </div>

          <div className="space-y-2">
            <Label>Achievements (по строкам)</Label>
            <Textarea
              value={(form.watch("achievements_json") || []).join("\n")}
              onChange={(e) =>
                form.setValue(
                  "achievements_json",
                  e.target.value
                    .split("\n")
                    .map((x) => x.trim())
                    .filter(Boolean),
                  { shouldDirty: true }
                )
              }
              placeholder={"Например:\n- Снизил latency на 30%\n- Внедрил CI/CD"}
            />
          </div>

          <div className="space-y-2">
            <Label>Links</Label>
            <div className="space-y-2">
              {links.map((l, idx) => (
                <div key={idx} className="grid gap-2 md:grid-cols-[160px_1fr_auto]">
                  <Input
                    value={l.type}
                    onChange={(e) => {
                      const next = [...links];
                      next[idx] = { ...next[idx], type: e.target.value };
                      form.setValue("links_json", next, { shouldDirty: true });
                    }}
                    placeholder="type (github, tg...)"
                  />
                  <Input
                    value={l.url}
                    onChange={(e) => {
                      const next = [...links];
                      next[idx] = { ...next[idx], url: e.target.value };
                      form.setValue("links_json", next, { shouldDirty: true });
                    }}
                    placeholder="https://..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const next = links.filter((_, i) => i !== idx);
                      form.setValue("links_json", next, { shouldDirty: true });
                    }}
                  >
                    Удалить
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() => form.setValue("links_json", [...links, { type: "link", url: "" }], { shouldDirty: true })}
              >
                Добавить ссылку
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Allowlist чисел для писем</Label>
            <TagInput
              value={form.watch("facts_numbers_json") || []}
              onChange={(v) => form.setValue("facts_numbers_json", v, { shouldDirty: true })}
              placeholder="2020, 5 лет, 30%..."
            />
            <div className="text-xs text-muted-foreground">
              Любые числа, которые могут появиться в письме, должны быть тут — иначе валидация письма отметит риск.
            </div>
          </div>

          {q.isLoading ? <div className="text-sm text-muted-foreground">Загрузка...</div> : null}
          {q.error ? <div className="text-sm text-destructive">Не удалось загрузить профиль (можно всё равно сохранить).</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}

