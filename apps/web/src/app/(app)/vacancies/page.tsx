"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VacancyListItem } from "@/lib/types";
import { apiFetch, ApiError } from "@/lib/api";
import { useSearchProfiles } from "@/lib/hooks/use-search-profiles";
import { useVacancies } from "@/lib/hooks/use-vacancies";
import { useGenerateCoverLetter, useUpdateCoverLetter } from "@/lib/hooks/use-cover-letters";
import { useCreateApplication, useApproveApplication, useSendApplication } from "@/lib/hooks/use-applications";

type Validation = { is_valid?: boolean } & Record<string, unknown>;

function Salary({ from, to }: { from: number | null; to: number | null }) {
  if (!from && !to) return <span className="text-sm text-muted-foreground">зарплата: —</span>;
  if (from && to) return <span className="text-sm text-muted-foreground">зарплата: {from}–{to}</span>;
  return <span className="text-sm text-muted-foreground">зарплата: {from || to}</span>;
}

function VacancyCard({
  v,
  includeReasons,
  onLetter,
  onApply,
}: {
  v: VacancyListItem;
  includeReasons: boolean;
  onLetter: (v: VacancyListItem) => void;
  onApply: (v: VacancyListItem) => void;
}) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{v.title}</CardTitle>
          <div className="flex items-center gap-2">
            {v.score !== null ? <Badge variant="secondary">score: {Math.round(v.score)}</Badge> : null}
            {v.is_blocked ? <Badge variant="destructive">blocked</Badge> : null}
          </div>
        </div>
        <CardDescription className="flex flex-wrap gap-x-3 gap-y-1">
          <span>{v.employer_name || "—"}</span>
          <span>{v.area_name || "—"}</span>
          <Salary from={v.salary_from} to={v.salary_to} />
          <span>{v.published_at ? new Date(v.published_at).toLocaleDateString() : "—"}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {includeReasons && v.reasons?.length ? (
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Причины (match)</div>
            <ul className="list-disc pl-5 text-sm">
              {v.reasons.map((r, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium">{r.type}</span>: {r.text}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            try {
              const d = await apiFetch<{ hh_url?: string | null }>(`/api/v1/vacancies/${v.id}`);
              const url = d.hh_url || v.external_apply_url;
              if (url) window.open(url, "_blank", "noopener,noreferrer");
              else toast.message("У вакансии нет ссылки");
            } catch {
              toast.error("Не удалось открыть вакансию");
            }
          }}
        >
          Открыть
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onLetter(v)}>
          Письмо
        </Button>
        <Button size="sm" onClick={() => onApply(v)}>
          Откликнуться
        </Button>
      </CardFooter>
    </Card>
  );
}

function LetterDialog({
  open,
  onOpenChange,
  vacancy,
  resumeId,
  setResumeId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  vacancy: VacancyListItem | null;
  resumeId: string;
  setResumeId: (v: string) => void;
}) {
  const gen = useGenerateCoverLetter();
  const upd = useUpdateCoverLetter();
  const [coverLetterId, setCoverLetterId] = React.useState<string | null>(null);
  const [text, setText] = React.useState("");
  const [validation, setValidation] = React.useState<Validation | null>(null);
  const [factsUsed, setFactsUsed] = React.useState<string[]>([]);
  const [numbersUsed, setNumbersUsed] = React.useState<string[]>([]);
  const [riskFlags, setRiskFlags] = React.useState<string[]>([]);
  const [status, setStatus] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) return;
    setCoverLetterId(null);
    setText("");
    setValidation(null);
    setFactsUsed([]);
    setNumbersUsed([]);
    setRiskFlags([]);
    setStatus("");
  }, [open, vacancy?.id]);

  async function generate() {
    if (!vacancy) return;
    if (!resumeId.trim()) return toast.error("resume_id обязателен");
    try {
      const out = await gen.mutateAsync({ vacancyId: vacancy.id, resume_id: resumeId.trim(), tone: null });
      setCoverLetterId(out.cover_letter_id);
      setText(out.letter_text);
      setValidation(out.validation);
      setFactsUsed(out.facts_used);
      setNumbersUsed(out.numbers_used);
      setRiskFlags(out.risk_flags);
      setStatus(out.status);
      toast.success("Письмо сгенерировано");
    } catch (e) {
      if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
      else toast.error("Не удалось сгенерировать письмо");
    }
  }

  async function save() {
    if (!coverLetterId) return toast.error("Сначала сгенерируйте письмо");
    try {
      const out = await upd.mutateAsync({ coverLetterId, text });
      setValidation(out.validation);
      setStatus(out.status);
      toast.success("Сохранено");
    } catch (e) {
      if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
      else toast.error("Не удалось сохранить");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Письмо по вакансии</DialogTitle>
          <DialogDescription>{vacancy ? `${vacancy.title} — ${vacancy.employer_name || "—"}` : ""}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>resume_id</Label>
            <Input value={resumeId} onChange={(e) => setResumeId(e.target.value)} placeholder="resume_id из HH" />
          </div>
          <div className="space-y-2">
            <Label>status</Label>
            <div className="flex h-10 items-center">
              {status ? <Badge variant={validation?.is_valid ? "default" : "destructive"}>{status}</Badge> : <span className="text-sm text-muted-foreground">—</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={generate} disabled={gen.isPending || !vacancy}>
            {gen.isPending ? "Генерация..." : "Сгенерировать"}
          </Button>
          <Button variant="outline" onClick={save} disabled={upd.isPending || !coverLetterId}>
            {upd.isPending ? "Сохранение..." : "Сохранить"}
          </Button>
          {coverLetterId ? <Badge variant="secondary">id: {coverLetterId.slice(0, 8)}…</Badge> : null}
        </div>

        <Tabs defaultValue="text">
          <TabsList>
            <TabsTrigger value="text">Текст</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="facts">Facts/Numbers</TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="space-y-2">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Сгенерируйте письмо..." className="min-h-[260px]" />
          </TabsContent>
          <TabsContent value="validation" className="space-y-2">
            {validation ? (
              <pre className="max-h-[260px] overflow-auto rounded-md border bg-muted/30 p-3 text-xs">
                {JSON.stringify(validation, null, 2)}
              </pre>
            ) : (
              <div className="text-sm text-muted-foreground">Сначала сгенерируйте письмо.</div>
            )}
          </TabsContent>
          <TabsContent value="facts" className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <div className="text-xs font-medium text-muted-foreground">facts_used</div>
                <div className="mt-1 text-sm">{factsUsed?.length ? factsUsed.join(", ") : "—"}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">numbers_used</div>
                <div className="mt-1 text-sm">{numbersUsed?.length ? numbersUsed.join(", ") : "—"}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">risk_flags</div>
                <div className="mt-1 text-sm">{riskFlags?.length ? riskFlags.join(", ") : "—"}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApplyDialog({
  open,
  onOpenChange,
  vacancy,
  resumeId,
  setResumeId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  vacancy: VacancyListItem | null;
  resumeId: string;
  setResumeId: (v: string) => void;
}) {
  const gen = useGenerateCoverLetter();
  const upd = useUpdateCoverLetter();
  const createApp = useCreateApplication();
  const approve = useApproveApplication();
  const send = useSendApplication();

  const [coverLetterId, setCoverLetterId] = React.useState<string | null>(null);
  const [text, setText] = React.useState("");
  const [validation, setValidation] = React.useState<Validation | null>(null);
  const [applicationId, setApplicationId] = React.useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) return;
    setCoverLetterId(null);
    setText("");
    setValidation(null);
    setApplicationId(null);
    setIdempotencyKey(crypto.randomUUID());
  }, [open, vacancy?.id]);

  async function stepGenerate() {
    if (!vacancy) return;
    if (!resumeId.trim()) return toast.error("resume_id обязателен");
    try {
      const out = await gen.mutateAsync({ vacancyId: vacancy.id, resume_id: resumeId.trim(), tone: null });
      setCoverLetterId(out.cover_letter_id);
      setText(out.letter_text);
      setValidation(out.validation);
      toast.success("Письмо сгенерировано");
    } catch (e) {
      if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
      else toast.error("Не удалось сгенерировать письмо");
    }
  }

  async function stepSaveLetter() {
    if (!coverLetterId) return;
    try {
      const out = await upd.mutateAsync({ coverLetterId, text });
      setValidation(out.validation);
      toast.success("Письмо сохранено");
    } catch (e) {
      if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
      else toast.error("Не удалось сохранить письмо");
    }
  }

  async function stepCreateApplication() {
    if (!vacancy) return;
    try {
      const out = await createApp.mutateAsync({
        vacancy_id: vacancy.id,
        resume_id: resumeId.trim(),
        cover_letter_id: coverLetterId,
      });
      setApplicationId(out.id);
      toast.success("Draft отклика создан");
    } catch (e) {
      if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
      else toast.error("Не удалось создать отклик");
    }
  }

  async function stepApprove() {
    if (!applicationId) return;
    try {
      await approve.mutateAsync(applicationId);
      toast.success("Отклик одобрен");
    } catch (e) {
      if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
      else toast.error("Не удалось одобрить");
    }
  }

  async function stepSend() {
    if (!applicationId) return;
    try {
      await send.mutateAsync({ id: applicationId, idempotencyKey });
      toast.success("Отправка поставлена в очередь");
    } catch (e) {
      if (e instanceof ApiError) toast.error(`${e.message}${e.errorCode ? ` (${e.errorCode})` : ""}`);
      else toast.error("Не удалось отправить");
    }
  }

  const isValid = !!validation?.is_valid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Откликнуться</DialogTitle>
          <DialogDescription>
            Flow: письмо → draft → approve → send (Idempotency-Key). Для MVP `resume_id` вводится вручную.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>resume_id</Label>
            <Input value={resumeId} onChange={(e) => setResumeId(e.target.value)} placeholder="resume_id из HH" />
          </div>
          <div className="space-y-2">
            <Label>Idempotency-Key</Label>
            <Input value={idempotencyKey} onChange={(e) => setIdempotencyKey(e.target.value)} />
            <div className="text-xs text-muted-foreground">Сохраняйте ключ для ретраев send.</div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={stepGenerate} disabled={gen.isPending || !vacancy}>
                {gen.isPending ? "Генерация..." : "1) Генерировать письмо"}
              </Button>
              {coverLetterId ? <Badge variant={isValid ? "default" : "destructive"}>{isValid ? "валидно" : "нужно править"}</Badge> : null}
              {coverLetterId ? <Badge variant="secondary">cover_letter_id: {coverLetterId.slice(0, 8)}…</Badge> : null}
            </div>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[180px]" placeholder="Сначала сгенерируйте письмо..." />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={stepSaveLetter} disabled={!coverLetterId || upd.isPending}>
                1b) Save (re-validate)
              </Button>
              {validation ? (
                <span className="text-xs text-muted-foreground">
                  validation: {validation.is_valid ? "ok" : "invalid"}
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-md border p-3">
              <div className="text-sm font-medium">2) Draft application</div>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  onClick={stepCreateApplication}
                  disabled={createApp.isPending || !resumeId.trim()}
                >
                  Create draft
                </Button>
                {applicationId ? <Badge variant="secondary">id: {applicationId.slice(0, 8)}…</Badge> : null}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                В backend есть анти-дубликаты (409 DUPLICATE_APPLICATION).
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="text-sm font-medium">3) Approve</div>
              <div className="mt-2">
                <Button onClick={stepApprove} disabled={!applicationId || approve.isPending}>
                  Approve
                </Button>
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="text-sm font-medium">4) Send</div>
              <div className="mt-2 flex items-center gap-2">
                <Button onClick={stepSend} disabled={!applicationId || send.isPending}>
                  Send
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/applications">Открыть отклики</Link>
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Если письмо невалидно, backend вернёт 422 `COVER_LETTER_INVALID`.
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VacanciesInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const profiles = useSearchProfiles();

  const [sort, setSort] = React.useState<"score" | "date">("score");
  const [includeReasons, setIncludeReasons] = React.useState(false);

  const profileFromUrl = searchParams.get("profile_id") || "";
  const [profileId, setProfileId] = React.useState(profileFromUrl);

  React.useEffect(() => setProfileId(profileFromUrl), [profileFromUrl]);

  const vacancies = useVacancies({ searchProfileId: profileId || undefined, sort, includeReasons });

  const [letterOpen, setLetterOpen] = React.useState(false);
  const [applyOpen, setApplyOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<VacancyListItem | null>(null);
  const [resumeId, setResumeId] = React.useState("");

  return (
    <div>
      <PageHeader
        title="Вакансии"
        description="Список вакансий по профилю поиска. По умолчанию сортировка по score."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={profileId}
              onChange={(e) => {
                const id = e.target.value;
                setProfileId(id);
                router.push(id ? `/vacancies?profile_id=${id}` : "/vacancies");
              }}
            >
              <option value="">Выберите профиль</option>
              {(profiles.data?.items || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value === "date" ? "date" : "score")}
            >
              <option value="score">score</option>
              <option value="date">date</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={includeReasons} onChange={(e) => setIncludeReasons(e.target.checked)} />
              причины
            </label>
          </div>
        }
      />

      {!profileId ? (
        <Card>
          <CardHeader>
            <CardTitle>Нужен профиль поиска</CardTitle>
            <CardDescription>Выберите профиль сверху или создайте новый.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/search-profiles">Открыть профили поиска</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {vacancies.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : null}

      {vacancies.error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
          Не удалось загрузить вакансии.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {(vacancies.data?.items || []).map((v) => (
          <VacancyCard
            key={v.id}
            v={v}
            includeReasons={includeReasons}
            onLetter={(vv) => {
              setSelected(vv);
              setLetterOpen(true);
            }}
            onApply={(vv) => {
              setSelected(vv);
              setApplyOpen(true);
            }}
          />
        ))}
      </div>

      {!vacancies.isLoading && !vacancies.data?.items?.length ? (
        <div className="mt-6 text-sm text-muted-foreground">Пока нет вакансий. Запустите run профиля поиска.</div>
      ) : null}

      <LetterDialog open={letterOpen} onOpenChange={setLetterOpen} vacancy={selected} resumeId={resumeId} setResumeId={setResumeId} />
      <ApplyDialog open={applyOpen} onOpenChange={setApplyOpen} vacancy={selected} resumeId={resumeId} setResumeId={setResumeId} />
    </div>
  );
}

export default function VacanciesPage() {
  return (
    <React.Suspense fallback={<div className="text-sm text-muted-foreground">Загрузка...</div>}>
      <VacanciesInner />
    </React.Suspense>
  );
}

