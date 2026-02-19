import React, { useEffect, useMemo, useRef } from "react";
import type { CommonLessonsState, Segment } from "./01_state_machine";
import { getCommonLessonIdsForSegment, getLessonById } from "./10_common_lessons_config";
import { useTrack } from "./23_analytics_context";
import { IS_DEV } from "./24_env";

export type CommonLessonsScreenProps = {
  screenId: "CL_COMMON_LESSONS";
  segment: Segment;
  progress: CommonLessonsState;
  onResetForSegment: (segment: Segment) => void;
  onSetIndex: (index: number) => void;
  onResetAll: () => void;
  onComplete: () => void;
};

export function CommonLessonsScreen(props: CommonLessonsScreenProps) {
  const track = useTrack();

  useEffect(() => {
    if (props.progress.segment !== props.segment) {
      props.onResetForSegment(props.segment);
    }
  }, [props.progress.segment, props.segment, props.onResetForSegment]);

  const flowResult = useMemo(() => {
    try {
      const lessonIds = getCommonLessonIdsForSegment(props.segment);
      const total = lessonIds.length;
      const index = Math.min(Math.max(0, props.progress.currentIndex), Math.max(0, total - 1));
      const lessonId = lessonIds[index];
      const lesson = getLessonById(lessonId);
      return { ok: true as const, lessonIds, total, index, lessonId, lesson };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, [props.segment, props.progress.currentIndex]);

  const startedRef = useRef(false);
  useEffect(() => {
    if (!flowResult.ok) return;
    if (startedRef.current) return;
    startedRef.current = true;
    track("onboarding_common_start", { segment: props.segment, totalLessons: flowResult.total });
  }, [props.segment, flowResult.ok, flowResult.total]);

  useEffect(() => {
    if (!flowResult.ok) return;
    track("onboarding_common_view_lesson", {
      segment: props.segment,
      lessonId: flowResult.lessonId,
      index: flowResult.index + 1,
      totalLessons: flowResult.total,
    });
  }, [props.segment, flowResult.ok, flowResult.lessonId, flowResult.index, flowResult.total]);

  const canNext = flowResult.ok ? flowResult.index < flowResult.total - 1 : false;
  const isLast = flowResult.ok ? flowResult.index === flowResult.total - 1 : false;

  const onNext = () => {
    if (!flowResult.ok) return;
    if (!canNext) return;
    const nextIndex = flowResult.index + 1;
    track("onboarding_common_next", { lessonId: flowResult.lessonId, toIndex: nextIndex + 1 });
    props.onSetIndex(nextIndex);
  };

  const onFinish = () => {
    if (!flowResult.ok) return;
    if (!isLast) return;
    track("onboarding_common_complete", { segment: props.segment });
    props.onComplete();
  };

  if (!flowResult.ok) {
    if (IS_DEV) {
      throw flowResult.error;
    }
    return (
      <div style={styles.card}>
        <div style={styles.kicker}>Общие уроки</div>
        <h2 style={styles.h2}>Произошла ошибка</h2>
        <div style={styles.body}>
          Мы не смогли загрузить экран урока. Начните обучение заново.
        </div>
        <div style={styles.actionsSingle}>
          <button type="button" style={styles.primaryBtn} onClick={props.onResetAll}>
            Начать заново
          </button>
        </div>
      </div>
    );
  }

  const lesson = flowResult.lesson;

  return (
    <div style={styles.card}>
      <div style={styles.kicker}>Общие уроки</div>

      <h2 style={styles.h2}>{lesson.title}</h2>
      <div style={styles.body}>
        <MarkdownText text={lesson.body} />
      </div>

      <div style={styles.ctaRow}>
        <a href={lesson.ctaLink} style={styles.ctaLink}>
          {lesson.ctaLabel}
        </a>
      </div>

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

function MarkdownText(props: { text: string }) {
  // Minimal markdown-like rendering for this stage:
  // - empty lines -> paragraph breaks
  // - lines starting with "- " -> bullets
  const lines = props.text.split("\n");
  const blocks: Array<{ type: "p" | "ul"; lines: string[] }> = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trimEnd();
    if (line.trim() === "") {
      i += 1;
      continue;
    }
    if (line.trim().startsWith("- ")) {
      const ul: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        ul.push(lines[i].trim().slice(2));
        i += 1;
      }
      blocks.push({ type: "ul", lines: ul });
      continue;
    }
    const p: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].trim().startsWith("- ")) {
      p.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: "p", lines: [p.join("\n")] });
  }

  return (
    <div>
      {blocks.map((b, idx) => {
        if (b.type === "ul") {
          return (
            <ul key={idx} style={styles.ul}>
              {b.lines.map((t, j) => (
                <li key={j} style={styles.li}>
                  {t}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={idx} style={styles.p}>
            {b.lines[0]}
          </p>
        );
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { border: "1px solid #E5E7EB", background: "#FFF", borderRadius: 16, padding: 16 },
  kicker: { fontSize: 12, color: "#666" },
  h2: { margin: 0, marginBottom: 8, fontSize: 20, color: "#333" },
  body: { color: "#333", lineHeight: 1.5 },
  p: { margin: "8px 0", color: "#333" },
  ul: { margin: "8px 0", paddingLeft: 18 },
  li: { margin: "6px 0" },
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

