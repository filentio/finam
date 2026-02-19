import React, { useEffect, useMemo, useRef } from "react";
import type { BranchId, Segment, Strategy } from "./01_state_machine";
import { BRANCH_LESSONS, getBranchLessonById, type LessonId, type LessonAsset } from "./17_branch_config";
import { useTrack } from "./23_analytics_context";
import { IS_DEV } from "./24_env";

export type BranchLessonsScreenProps = {
  screenId: "BR_BRANCH_LESSONS";
  branchId: BranchId;
  segment: Segment;
  strategy: Strategy;
  currentIndex: number;
  isCompleted: boolean;
  assetBaseUrl?: string;
  onSetIndex: (index: number) => void;
  onResetAll: () => void;
  onComplete: () => void;
};

export function BranchLessonsScreen(props: BranchLessonsScreenProps) {
  const track = useTrack();
  const flowResult = useMemo(() => {
    try {
      const lessonIds = BRANCH_LESSONS[props.branchId];
      if (!lessonIds || !lessonIds.length) {
        throw new Error(`Branch lesson list is missing or empty: branchId=${props.branchId}`);
      }
      const total = lessonIds.length;
      const index = Math.min(Math.max(0, props.currentIndex), Math.max(0, total - 1));
      const lessonId = lessonIds[index] as LessonId;
      const lesson = getBranchLessonById(lessonId);
      const screen = toBranchLessonScreen(lesson);
      validateBranchLessonScreen(screen);
      return { ok: true as const, lessonIds, total, index, lessonId, lesson, screen };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, [props.branchId, props.currentIndex]);

  const startedRef = useRef(false);
  useEffect(() => {
    if (!flowResult.ok) return;
    if (startedRef.current) return;
    startedRef.current = true;
    track("onboarding_branch_start", {
      branchId: props.branchId,
      segment: props.segment,
      strategy: props.strategy,
      totalLessons: flowResult.total,
    });
  }, [props.branchId, props.segment, props.strategy, flowResult.ok, flowResult.total]);

  useEffect(() => {
    if (!flowResult.ok) return;
    track("onboarding_branch_view_lesson", {
      branchId: props.branchId,
      lessonId: flowResult.lessonId,
      index: flowResult.index + 1,
      totalLessons: flowResult.total,
    });
  }, [props.branchId, flowResult.ok, flowResult.lessonId, flowResult.index, flowResult.total]);

  const canNext = flowResult.ok ? flowResult.index < flowResult.total - 1 : false;
  const isLast = flowResult.ok ? flowResult.index === flowResult.total - 1 : false;

  const onNext = () => {
    if (!flowResult.ok) return;
    if (!canNext) return;
    const nextIndex = flowResult.index + 1;
    track("onboarding_branch_next", { branchId: props.branchId, lessonId: flowResult.lessonId, toIndex: nextIndex + 1 });
    props.onSetIndex(nextIndex);
  };

  const onFinish = () => {
    if (!flowResult.ok) return;
    if (!isLast) return;
    track("onboarding_branch_complete", { branchId: props.branchId, segment: props.segment, strategy: props.strategy });
    props.onComplete();
  };

  if (!flowResult.ok) {
    if (IS_DEV) {
      throw flowResult.error;
    }
    return (
      <div style={styles.card}>
        <div style={styles.kicker}>Ветка обучения</div>
        <h2 style={styles.h2}>Произошла ошибка</h2>
        <div style={styles.body}>Мы не смогли загрузить экран урока. Начните обучение заново.</div>
        <div style={styles.actionsSingle}>
          <button type="button" style={styles.primaryBtn} onClick={props.onResetAll}>
            Начать заново
          </button>
        </div>
      </div>
    );
  }

  const screen = flowResult.screen;
  const payload = screen.payload;

  return (
    <div style={styles.card}>
      <div style={styles.kicker}>Ветка обучения</div>

      <h2 style={styles.h2}>{payload.title}</h2>
      <div style={styles.body}>
        <PlainTextWithLineBreaks text={payload.body} />
      </div>

      {payload.assets.length ? (
        <div style={styles.assets}>
          {payload.assets.map((a, i) => (
            <img key={i} src={resolveAssetUrl(a.src, props.assetBaseUrl)} alt={a.alt} style={styles.assetImg} loading="lazy" />
          ))}
        </div>
      ) : null}

      {payload.ctaLabel && payload.ctaLink ? (
        <div style={styles.ctaRow}>
          <a href={payload.ctaLink} style={styles.ctaLink}>
            {payload.ctaLabel}
          </a>
        </div>
      ) : null}

      <div style={styles.actionsSingle}>
        {canNext ? (
          <button type="button" style={styles.primaryBtn} onClick={onNext}>
            Далее
          </button>
        ) : (
          <button type="button" style={styles.primaryBtn} onClick={onFinish}>
            Завершить
          </button>
        )}
      </div>
    </div>
  );
}

function resolveAssetUrl(src: string, assetBaseUrl?: string): string {
  if (!assetBaseUrl) return src;
  if (!src.startsWith("assets/")) return src;
  const base = assetBaseUrl.endsWith("/") ? assetBaseUrl : `${assetBaseUrl}/`;
  return `${base}${src}`;
}

type BranchLessonScreen = {
  type: "TEXT_IMAGE_V1";
  payload: {
    title: string;
    body: string;
    assets: LessonAsset[];
    ctaLabel: string | null;
    ctaLink: string | null;
  };
};

function toBranchLessonScreen(lesson: { title: string; body: string; assets: LessonAsset[]; ctaLabel: string | null; ctaLink: string | null }): BranchLessonScreen {
  return {
    type: "TEXT_IMAGE_V1",
    payload: {
      title: lesson.title,
      body: lesson.body,
      assets: lesson.assets,
      ctaLabel: lesson.ctaLabel,
      ctaLink: lesson.ctaLink,
    },
  };
}

function validateBranchLessonScreen(screen: BranchLessonScreen): void {
  if (screen.type !== "TEXT_IMAGE_V1") {
    throw new Error(`Unknown branch lesson screen type: ${String((screen as any)?.type)}`);
  }
  const p = screen.payload as any;
  if (!p || typeof p !== "object") throw new Error("Branch lesson screen payload is missing.");
  if (typeof p.title !== "string" || p.title.trim() === "") throw new Error("Branch lesson payload.title is invalid.");
  if (typeof p.body !== "string" || p.body.trim() === "") throw new Error("Branch lesson payload.body is invalid.");
  if (!Array.isArray(p.assets)) throw new Error("Branch lesson payload.assets must be an array.");
  for (const a of p.assets) {
    if (!a || typeof a !== "object") throw new Error("Branch lesson asset is invalid.");
    if (a.type !== "image" && a.type !== "icon") throw new Error(`Branch lesson asset.type is invalid: ${String(a.type)}`);
    if (typeof a.src !== "string" || a.src.trim() === "") throw new Error("Branch lesson asset.src is invalid.");
    if (typeof a.alt !== "string") throw new Error("Branch lesson asset.alt is invalid.");
  }
  if (p.ctaLabel != null && typeof p.ctaLabel !== "string") throw new Error("Branch lesson payload.ctaLabel is invalid.");
  if (p.ctaLink != null && typeof p.ctaLink !== "string") throw new Error("Branch lesson payload.ctaLink is invalid.");
  if ((p.ctaLabel && !p.ctaLink) || (!p.ctaLabel && p.ctaLink)) {
    throw new Error("Branch lesson CTA must have both ctaLabel and ctaLink, or neither.");
  }
}

function PlainTextWithLineBreaks(props: { text: string }) {
  const parts = props.text.split("\n");
  return (
    <div>
      {parts.map((p, i) => (
        <div key={i} style={styles.line}>
          {p}
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { border: "1px solid #E5E7EB", background: "#FFF", borderRadius: 16, padding: 16 },
  kicker: { fontSize: 12, color: "#666" },
  h2: { margin: 0, marginBottom: 8, fontSize: 20, color: "#333" },
  body: { color: "#333", lineHeight: 1.5 },
  line: { margin: "6px 0" },
  assets: { marginTop: 12, display: "flex", flexDirection: "column", gap: 8 },
  assetImg: { width: "100%", maxWidth: 640, borderRadius: 12, border: "1px solid #E5E7EB" },
  ctaRow: { marginTop: 12 },
  ctaLink: { color: "#1E5AA8", textDecoration: "none", fontWeight: 600 },
  actionsSingle: { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 },
  primaryBtn: {
    height: 44,
    borderRadius: 12,
    border: "none",
    padding: "0 16px",
    background: "#F5A623",
    color: "#FFF",
    fontWeight: 600,
    cursor: "pointer",
  },
};

