"use client";

import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ApiError } from "@/lib/api";
import { useImportResumeFromUrl, useResume, useUploadResume } from "@/lib/hooks/use-resume";
import type { ResumeExperienceItem, ResumeParsed } from "@/lib/types";

export default function ResumesPage() {
  const [url, setUrl] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [showRaw, setShowRaw] = React.useState(false);

  const resume = useResume({ includeRaw: showRaw });
  const fromUrl = useImportResumeFromUrl();
  const upload = useUploadResume();

  return (
    <div>
      <PageHeader
        title="Резюме"
        description="Импортируйте резюме по публичной ссылке или загрузите файл (pdf/docx/txt). Мы извлечём текст и разберём его в структуру."
      />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Текущее резюме</CardTitle>
          <CardDescription>Одно активное резюме на пользователя (последний импорт перезаписывает текущее).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          {resume.isLoading ? <Skeleton className="h-6 w-40" /> : null}
          {!resume.isLoading && !resume.data?.exists ? <Badge variant="outline">ещё не импортировано</Badge> : null}
          {resume.data?.exists && resume.data.updated_at ? (
            <Badge variant="secondary">updated: {new Date(resume.data.updated_at).toLocaleString()}</Badge>
          ) : null}
          {resume.data?.source?.source_type ? <Badge variant="outline">source: {resume.data.source.source_type}</Badge> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Импорт</CardTitle>
          <CardDescription>Поддерживаются: публичная ссылка (http/https) или файл до 10MB (pdf/docx/txt).</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="url">
            <TabsList>
              <TabsTrigger value="url">Ссылка</TabsTrigger>
              <TabsTrigger value="file">Файл</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="mt-4 space-y-3">
              <div className="space-y-2">
                <Label>Публичная ссылка на резюме</Label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={async () => {
                    try {
                      const out = await fromUrl.mutateAsync(url.trim());
                      toast.success(`Импортировано: ${out.stats.words} слов`);
                    } catch (e) {
                      if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
                      else if (e instanceof Error && e.message) toast.error(e.message);
                      else toast.error("Не удалось импортировать");
                    }
                  }}
                  disabled={!url.trim() || fromUrl.isPending}
                >
                  {fromUrl.isPending ? "Загрузка..." : "Проверить и загрузить"}
                </Button>
                <Button variant="outline" onClick={() => setUrl("")} disabled={fromUrl.isPending}>
                  Очистить
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="file" className="mt-4 space-y-3">
              <div className="space-y-2">
                <Label>Файл резюме</Label>
                <Input
                  type="file"
                  accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file ? <div className="text-xs text-muted-foreground">{file.name} ({Math.round(file.size / 1024)} KB)</div> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={async () => {
                    if (!file) return;
                    try {
                      const out = await upload.mutateAsync(file);
                      toast.success(`Импортировано: ${out.stats.words} слов`);
                    } catch (e) {
                      if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
                      else if (e instanceof Error && e.message) toast.error(e.message);
                      else toast.error("Не удалось импортировать");
                    }
                  }}
                  disabled={!file || upload.isPending}
                >
                  {upload.isPending ? "Загрузка..." : "Загрузить"}
                </Button>
                <Button variant="outline" onClick={() => setFile(null)} disabled={upload.isPending}>
                  Сбросить файл
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <ParsedBlock parsed={resume.data?.parsed || null} keywords={resume.data?.keywords || []} numbers={resume.data?.numbers_allowlist || []} />

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Сырой текст резюме</CardTitle>
          <CardDescription>Храним текст, чтобы позже использовать его для GPT писем.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setShowRaw((v) => !v)}>
              {showRaw ? "Скрыть" : "Показать"}
            </Button>
            {showRaw && resume.isFetching ? <span className="text-xs text-muted-foreground">загрузка…</span> : null}
          </div>
          {showRaw ? (
            <Textarea
              readOnly
              className="min-h-[240px]"
              value={resume.data?.raw_text || (resume.data?.exists ? "" : "Резюме ещё не импортировано.")}
            />
          ) : null}
        </CardContent>
      </Card>

      <div className="mt-4">
        <Button variant="outline" onClick={() => toast.message("Дальше: можно создать профиль поиска (пока без автозаполнения).")}>
          Сформировать шаблон поиска
        </Button>
      </div>
    </div>
  );
}

function ParsedBlock({
  parsed,
  keywords,
  numbers,
}: {
  parsed: ResumeParsed | null;
  keywords: string[];
  numbers: string[];
}) {
  if (!parsed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Результат разбора</CardTitle>
          <CardDescription>Здесь появятся profession/skills/experience/keywords после импорта.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Пока нет данных.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Результат разбора</CardTitle>
        <CardDescription>Эвристический разбор (MVP) — можно улучшать правила по мере накопления примеров.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Profession</div>
          {parsed.profession ? <Badge variant="secondary">{parsed.profession}</Badge> : <Badge variant="outline">не найдено</Badge>}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Skills</div>
          <div className="flex flex-wrap gap-2">
            {(parsed.skills || []).length ? (
              parsed.skills.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">не найдены</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Experience</div>
          {(parsed.experience || []).length ? (
            <div className="space-y-2">
              {parsed.experience.map((e, idx) => (
                <ExperienceCard key={idx} item={e} />
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">не найден</span>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Keywords</div>
          <div className="flex flex-wrap gap-2">
            {(keywords || []).length ? (
              keywords.map((k) => (
                <Badge key={k} variant="secondary">
                  {k}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Numbers allowlist</div>
          <div className="flex flex-wrap gap-2">
            {(numbers || []).length ? (
              numbers.map((n) => (
                <Badge key={n} variant="outline">
                  {n}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ExperienceCard({ item }: { item: ResumeExperienceItem }) {
  const header = [item.company, item.role].filter(Boolean).join(" — ");
  const period = [item.from, item.to].filter(Boolean).join(" — ");
  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base">{header || "Опыт"}</CardTitle>
        {period ? <CardDescription>{period}</CardDescription> : null}
      </CardHeader>
      {item.description ? <CardContent className="pt-0 text-sm whitespace-pre-wrap">{item.description}</CardContent> : null}
    </Card>
  );
}

