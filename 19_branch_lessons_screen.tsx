import React, { useEffect, useMemo, useRef } from "react";
import type { BranchId, Segment, Strategy } from "./01_state_machine";
import { BRANCH_LESSONS, getBranchLessonById, type LessonId } from "./17_branch_config";
import { useTrack } from "./23_analytics_context";

export type BranchLessonsScreenProps = {
  screenId: "BR_BRANCH_LESSONS";
  branchId: BranchId;
  segment: Segment;
  strategy: Strategy;
  currentIndex: number;
  isCompleted: boolean;
  onSetIndex: (index: number) => void;
  onComplete: () => void;
};

export function BranchLessonsScreen(props: BranchLessonsScreenProps) {
  const track = useTrack();
  const lessonIds = useMemo(() => BRANCH_LESSONS[props.branchId], [props.branchId]);
  const total = lessonIds.length;
  const index = Math.min(Math.max(0, props.currentIndex), Math.max(0, total - 1));
  const lessonId = lessonIds[index] as LessonId;
  const lesson = getBranchLessonById(lessonId);

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    track("onboarding_branch_start", {
      branchId: props.branchId,
      segment: props.segment,
      strategy: props.strategy,
      totalLessons: total,
    });
  }, [props.branchId, props.segment, props.strategy, total]);

  useEffect(() => {
    track("onboarding_branch_view_lesson", {
      branchId: props.branchId,
      lessonId,
      index: index + 1,
      totalLessons: total,
    });
  }, [props.branchId, lessonId, index, total]);

  const canBack = index > 0;
  const canNext = index < total - 1;
  const isLast = index === total - 1;

  const onBack = () => {
    if (!canBack) return;
    const nextIndex = index - 1;
    track("onboarding_branch_back", { branchId: props.branchId, lessonId, toIndex: nextIndex + 1 });
    props.onSetIndex(nextIndex);
  };

  const onNext = () => {
    if (!canNext) return;
    const nextIndex = index + 1;
    track("onboarding_branch_next", { branchId: props.branchId, lessonId, toIndex: nextIndex + 1 });
    props.onSetIndex(nextIndex);
  };

  const onFinish = () => {
    if (!isLast) return;
    track("onboarding_branch_complete", { branchId: props.branchId, segment: props.segment, strategy: props.strategy });
    props.onComplete();
  };

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <div style={styles.kicker}>Ветка обучения</div>
        <div style={styles.progress}>{`${index + 1}/${total}`}</div>
      </div>

      <h2 style={styles.h2}>{lesson.title}</h2>
      <div style={styles.body}>
        <PlainTextWithLineBreaks text={lesson.body} />
      </div>

      {lesson.assets.length ? (
        <div style={styles.assets}>
          {lesson.assets.map((a, i) => (
            <img key={i} src={a.src} alt={a.alt} style={styles.assetImg} />
          ))}
        </div>
      ) : null}

      {lesson.ctaLabel && lesson.ctaLink ? (
        <div style={styles.ctaRow}>
          <a href={lesson.ctaLink} style={styles.ctaLink}>
            {lesson.ctaLabel}
          </a>
        </div>
      ) : null}

      <div style={styles.actions}>
        <button type="button" style={{ ...styles.secondaryBtn, ...(canBack ? null : styles.btnDisabled) }} onClick={onBack}>
          Назад
        </button>
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

      {props.isCompleted ? <div style={styles.completedHint}>Ветка завершена.</div> : null}
    </div>
  );
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
  topRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  kicker: { fontSize: 12, color: "#666" },
  progress: { fontSize: 12, color: "#666" },
  h2: { margin: 0, marginBottom: 8, fontSize: 20, color: "#333" },
  body: { color: "#333", lineHeight: 1.5 },
  line: { margin: "6px 0" },
  assets: { marginTop: 12, display: "flex", flexDirection: "column", gap: 8 },
  assetImg: { width: "100%", maxWidth: 640, borderRadius: 12, border: "1px solid #E5E7EB" },
  ctaRow: { marginTop: 12 },
  ctaLink: { color: "#1E5AA8", textDecoration: "none", fontWeight: 600 },
  actions: { display: "flex", justifyContent: "space-between", gap: 12, marginTop: 16 },
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
  secondaryBtn: {
    height: 44,
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    padding: "0 16px",
    background: "#FFF",
    color: "#333",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  completedHint: { marginTop: 12, fontSize: 12, color: "#666" },
};

