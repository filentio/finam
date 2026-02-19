import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Quiz2Answers, Segment } from "./01_state_machine";
import {
  QUIZ2_QUESTIONS,
  QUIZ2_VALIDATION_ERROR_TEXT,
  getQuiz2AnswerByQuestionId,
  type Quiz2AnswerId,
  type Quiz2Question,
  type Quiz2QuestionId,
} from "./13_quiz2_config";
import { getPrefilledQuiz2QuestionIds, prefillQuiz2AnswersFromQuiz1, QUIZ2_PREFILL_EDITABILITY } from "./14_quiz2_prefill";
import { validateQuiz2Answers } from "./15_quiz2_rules";
import { useTrack } from "./23_analytics_context";
import type { Quiz1Answers } from "./01_state_machine";

export type Quiz2ScreenProps = {
  screenId: "QZ2_INVEST_PROFILE";
  segment: Segment;
  quiz1Answers: Quiz1Answers;
  answers: Quiz2Answers;
  onChangeAnswers: (answers: Quiz2Answers) => void;
  onSubmitValid: () => void;
  externalError?: string | null;
  onInteract?: () => void;
};

const QUESTION_IDS: Quiz2QuestionId[] = ["QZ2_Q1_HORIZON", "QZ2_Q2_DRAWDOWN_REACTION", "QZ2_Q3_MONTHLY_SHARE", "QZ2_Q4_PREFERENCE"];

export function Quiz2Screen(props: Quiz2ScreenProps) {
  const track = useTrack();
  const [showValidation, setShowValidation] = useState(false);
  const fieldRefs = useRef<Record<Quiz2QuestionId, HTMLDivElement | null>>({
    QZ2_Q1_HORIZON: null,
    QZ2_Q2_DRAWDOWN_REACTION: null,
    QZ2_Q3_MONTHLY_SHARE: null,
    QZ2_Q4_PREFERENCE: null,
  });

  useEffect(() => {
    track("onboarding_quiz2_start", { screenId: props.screenId, segment: props.segment });
  }, [props.screenId, props.segment]);

  const prefillSuggestion = useMemo(() => prefillQuiz2AnswersFromQuiz1(props.quiz1Answers), [props.quiz1Answers]);
  const prefilledQuestionIds = useMemo(() => getPrefilledQuiz2QuestionIds(prefillSuggestion), [prefillSuggestion]);

  const validation = useMemo(() => validateQuiz2Answers(props.answers), [props.answers]);
  const isValid = validation.ok;

  const missingSet = useMemo(() => {
    if (validation.ok) return new Set<string>();
    return new Set(validation.missingQuestionIds);
  }, [validation]);

  const onSelect = (question: Quiz2Question, answerId: Quiz2AnswerId) => {
    props.onInteract?.();

    const next: Quiz2Answers = { ...props.answers };
    switch (question.questionId) {
      case "QZ2_Q1_HORIZON":
        next.q1Horizon = answerId as Quiz2Answers["q1Horizon"];
        break;
      case "QZ2_Q2_DRAWDOWN_REACTION":
        next.q2DrawdownReaction = answerId as Quiz2Answers["q2DrawdownReaction"];
        break;
      case "QZ2_Q3_MONTHLY_SHARE":
        next.q3MonthlyShare = answerId as Quiz2Answers["q3MonthlyShare"];
        break;
      case "QZ2_Q4_PREFERENCE":
        next.q4Preference = answerId as Quiz2Answers["q4Preference"];
        break;
    }

    props.onChangeAnswers(next);

    const wasPrefilled = prefilledQuestionIds.includes(question.questionId);
    track("onboarding_quiz2_answer", {
      questionId: question.questionId,
      answerId,
      wasPrefilled,
      segment: props.segment,
    });
  };

  const onSubmit = () => {
    const v = validateQuiz2Answers(props.answers);
    if (!v.ok) {
      setShowValidation(true);
      track("onboarding_quiz2_error", { errorType: "VALIDATION_MISSING_ANSWERS", missingQuestionIds: v.missingQuestionIds });

      const firstMissing = QUESTION_IDS.find((id) => v.missingQuestionIds.includes(id));
      if (firstMissing) {
        fieldRefs.current[firstMissing]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    props.onSubmitValid();
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.h2}>Анкета №2</h2>
      <p style={styles.p}>Ответы сохраняются автоматически при выборе.</p>

      {QUIZ2_QUESTIONS.map((q) => {
        const policy = QUIZ2_PREFILL_EDITABILITY[q.questionId];
        const suggested = (() => {
          switch (q.questionId) {
            case "QZ2_Q1_HORIZON":
              return prefillSuggestion.q1Horizon ?? null;
            case "QZ2_Q2_DRAWDOWN_REACTION":
              return prefillSuggestion.q2DrawdownReaction ?? null;
            case "QZ2_Q3_MONTHLY_SHARE":
              return prefillSuggestion.q3MonthlyShare ?? null;
            case "QZ2_Q4_PREFERENCE":
              return prefillSuggestion.q4Preference ?? null;
          }
        })();
        const isPrefilled = prefilledQuestionIds.includes(q.questionId);
        return (
          <div
            key={q.questionId}
            ref={(el) => {
              fieldRefs.current[q.questionId] = el;
            }}
            style={{
              ...styles.fieldset,
              ...(showValidation && missingSet.has(q.questionId) ? styles.fieldsetError : null),
            }}
          >
            <div style={styles.fieldsetTitle}>{q.title}</div>
            {q.helperText ? <div style={styles.helperText}>{q.helperText}</div> : null}
            {isPrefilled ? <div style={styles.prefillNote}>{policy.note}</div> : null}

            <div style={styles.options}>
              {q.options.map((opt) => {
                const selected = getQuiz2AnswerByQuestionId(props.answers, q.questionId) === opt.answerId;
                const isSuggested = suggested === opt.answerId;
                const isEditable = policy.isEditable;
                return (
                  <button
                    key={opt.answerId}
                    type="button"
                    aria-disabled={!isEditable}
                    style={{
                      ...styles.optionBtn,
                      ...(selected ? styles.optionBtnSelected : null),
                      ...(!selected && isSuggested ? styles.optionBtnSuggested : null),
                      ...(!isEditable ? styles.optionBtnDisabled : null),
                    }}
                    onClick={() => {
                      if (!isEditable) return;
                      onSelect(q, opt.answerId);
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {showValidation && !isValid ? <div style={styles.errorBox}>{QUIZ2_VALIDATION_ERROR_TEXT}</div> : null}
      {props.externalError ? <div style={styles.errorBox}>{props.externalError}</div> : null}

      <button
        type="button"
        aria-disabled={!isValid}
        style={{ ...styles.primaryBtn, ...(isValid ? null : styles.primaryBtnDisabled) }}
        onClick={onSubmit}
      >
        Далее
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { border: "1px solid #E5E7EB", background: "#FFF", borderRadius: 16, padding: 16 },
  h2: { margin: 0, marginBottom: 8, fontSize: 20, color: "#333" },
  p: { margin: 0, marginBottom: 12, color: "#555", lineHeight: 1.4 },
  fieldset: { borderTop: "1px solid #F0F2F5", paddingTop: 12, marginTop: 12 },
  fieldsetError: { borderTop: "1px solid #D32F2F" },
  fieldsetTitle: { fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 4 },
  helperText: { fontSize: 12, color: "#666", marginBottom: 8 },
  prefillNote: { fontSize: 12, color: "#1E5AA8", marginBottom: 8 },
  options: { display: "flex", flexWrap: "wrap", gap: 8 },
  optionBtn: {
    height: 36,
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    padding: "0 12px",
    background: "#FFF",
    color: "#333",
    cursor: "pointer",
  },
  optionBtnSelected: { background: "#F5A623", border: "1px solid #F5A623", color: "#333" },
  optionBtnSuggested: { border: "1px dashed #1E5AA8" },
  optionBtnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  errorBox: { marginTop: 12, padding: 12, borderRadius: 12, background: "#FFEBEE", color: "#333" },
  primaryBtn: {
    marginTop: 16,
    height: 44,
    borderRadius: 12,
    border: "none",
    padding: "0 16px",
    background: "#F5A623",
    color: "#FFF",
    fontWeight: 600,
    cursor: "pointer",
  },
  primaryBtnDisabled: { background: "#E5E7EB", color: "#999", cursor: "not-allowed" },
};

