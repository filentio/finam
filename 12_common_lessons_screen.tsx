import React, { useEffect, useMemo, useRef } from "react";
import type { CommonLessonsState, Segment } from "./01_state_machine";
import { getCommonLessonIdsForSegment, getLessonById } from "./10_common_lessons_config";
import { track } from "./09_analytics";

export type CommonLessonsScreenProps = {
  screenId: "CL_COMMON_LESSONS";
  segment: Segment;
  progress: CommonLessonsState;
  onResetForSegment: (segment: Segment) => void;
  onSetIndex: (index: number) => void;
  onComplete: () => void;
};

export function CommonLessonsScreen(props: CommonLessonsScreenProps) {
  const lessonIds = useMemo(() => getCommonLessonIdsForSegment(props.segment), [props.segment]);
  const total = lessonIds.length;

  useEffect(() => {
    if (props.progress.segment !== props.segment) {
      props.onResetForSegment(props.segment);
    }
  }, [props.progress.segment, props.segment, props.onResetForSegment]);

  const index = Math.min(Math.max(0, props.progress.currentIndex), Math.max(0, total - 1));
  const lessonId = lessonIds[index];
  const lesson = getLessonById(lessonId);

  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    track("onboarding_common_start", { segment: props.segment, totalLessons: total });
  }, [props.segment, total]);

  useEffect(() => {
    track("onboarding_common_view_lesson", { segment: props.segment, lessonId, index: index + 1, totalLessons: total });
  }, [props.segment, lessonId, index, total]);

  const canBack = index > 0;
  const canNext = index < total - 1;
  const isLast = index === total - 1;

  const onBack = () => {
    if (!canBack) return;
    const nextIndex = index - 1;
    track("onboarding_common_back", { lessonId, toIndex: nextIndex + 1 });
    props.onSetIndex(nextIndex);
  };

  const onNext = () => {
    if (!canNext) return;
    const nextIndex = index + 1;
    track("onboarding_common_next", { lessonId, toIndex: nextIndex + 1 });
    props.onSetIndex(nextIndex);
  };

  const onFinish = () => {
    if (!isLast) return;
    track("onboarding_common_complete", { segment: props.segment });
    props.onComplete();
  };

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <div style={styles.kicker}>Общие уроки</div>
        <div style={styles.progress}>{`${index + 1}/${total}`}</div>
      </div>

      <h2 style={styles.h2}>{lesson.title}</h2>
      <div style={styles.body}>
        <MarkdownText text={lesson.body} />
      </div>

      <div style={styles.ctaRow}>
        <a href={lesson.ctaLink} style={styles.ctaLink}>
          {lesson.ctaLabel}
        </a>
      </div>

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
  topRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  kicker: { fontSize: 12, color: "#666" },
  progress: { fontSize: 12, color: "#666" },
  h2: { margin: 0, marginBottom: 8, fontSize: 20, color: "#333" },
  body: { color: "#333", lineHeight: 1.5 },
  p: { margin: "8px 0", color: "#333" },
  ul: { margin: "8px 0", paddingLeft: 18 },
  li: { margin: "6px 0" },
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
};

