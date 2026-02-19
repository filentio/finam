import React, { useEffect, useMemo, useRef } from "react";
import type { BranchId, Segment, Strategy } from "./01_state_machine";
import { BRANCH_LESSONS, type LessonId } from "./17_branch_config";
import { useTrack } from "./23_analytics_context";
import { IS_DEV } from "./24_env";
import { getLessonData } from "./33_lessons_data";
import { LessonScreenRenderer } from "./32_lesson_renderer";

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
      const data = getLessonData(lessonId as any);
      const screen = data.screens[0];
      if (!screen) throw new Error(`Lesson has no screens: lessonId=${lessonId}`);
      return { ok: true as const, lessonIds, total, index, lessonId, screen };
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

  return (
    <div style={styles.card}>
      <div style={styles.kicker}>Ветка обучения</div>
      <LessonScreenRenderer screen={flowResult.screen} assetBaseUrl={props.assetBaseUrl} />

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

const styles: Record<string, React.CSSProperties> = {
  card: { border: "1px solid #E5E7EB", background: "#FFF", borderRadius: 16, padding: 16 },
  kicker: { fontSize: 12, color: "#666" },
  h2: { margin: 0, marginBottom: 8, fontSize: 20, color: "#333" },
  body: { color: "#333", lineHeight: 1.5 },
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

