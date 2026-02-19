import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Quiz1Answers } from "./01_state_machine";
import {
  QUIZ1_QUESTIONS,
  QUIZ1_VALIDATION_ERROR_TEXT,
  type Quiz1AnswerId,
  type Quiz1Question,
  type Quiz1QuestionId,
  getQuiz1AnswerByQuestionId,
} from "./06_quiz1_config";
import { validateQuiz1Answers } from "./07_quiz1_rules";
import { useTrack } from "./23_analytics_context";

export type Quiz1ScreenProps = {
  screenId: "QZ1_EXPERIENCE_GOALS";
  answers: Quiz1Answers;
  onChangeAnswers: (answers: Quiz1Answers) => void;
  onSubmitValid: () => void;
  externalError?: string | null;
  onInteract?: () => void;
};

const QUESTION_IDS: Quiz1QuestionId[] = [
  "QZ1_Q1_QUALIFIED_STATUS",
  "QZ1_Q2_EXPERIENCE",
  "QZ1_Q3_PLANNED_AMOUNT",
  "QZ1_Q4_MAIN_GOAL",
  "QZ1_Q5_PRIMARY_INTEREST",
];

export function Quiz1Screen(props: Quiz1ScreenProps) {
  const track = useTrack();
  const [showValidation, setShowValidation] = useState(false);
  const fieldRefs = useRef<Record<Quiz1QuestionId, HTMLDivElement | null>>({
    QZ1_Q1_QUALIFIED_STATUS: null,
    QZ1_Q2_EXPERIENCE: null,
    QZ1_Q3_PLANNED_AMOUNT: null,
    QZ1_Q4_MAIN_GOAL: null,
    QZ1_Q5_PRIMARY_INTEREST: null,
  });

  useEffect(() => {
    track("onboarding_quiz1_start", { screenId: props.screenId });
  }, [props.screenId]);

  const validation = useMemo(() => validateQuiz1Answers(props.answers), [props.answers]);
  const isValid = validation.ok;

  const missingSet = useMemo(() => {
    if (validation.ok) return new Set<string>();
    return new Set(validation.missingQuestionIds);
  }, [validation]);

  const onSelect = (question: Quiz1Question, answerId: Quiz1AnswerId) => {
    const next: Quiz1Answers = { ...props.answers };
    switch (question.questionId) {
      case "QZ1_Q1_QUALIFIED_STATUS":
        next.q1QualifiedStatus = answerId as Quiz1Answers["q1QualifiedStatus"];
        break;
      case "QZ1_Q2_EXPERIENCE":
        next.q2Experience = answerId as Quiz1Answers["q2Experience"];
        break;
      case "QZ1_Q3_PLANNED_AMOUNT":
        next.q3PlannedAmount = answerId as Quiz1Answers["q3PlannedAmount"];
        break;
      case "QZ1_Q4_MAIN_GOAL":
        next.q4MainGoal = answerId as Quiz1Answers["q4MainGoal"];
        break;
      case "QZ1_Q5_PRIMARY_INTEREST":
        next.q5PrimaryInterest = answerId as Quiz1Answers["q5PrimaryInterest"];
        break;
    }

    props.onInteract?.();
    props.onChangeAnswers(next);
    track("onboarding_quiz1_answer", { questionId: question.questionId, answerId });
  };

  const onSubmit = () => {
    const v = validateQuiz1Answers(props.answers);
    if (!v.ok) {
      setShowValidation(true);
      track("onboarding_quiz1_error", { errorType: "VALIDATION_MISSING_ANSWERS", missingQuestionIds: v.missingQuestionIds });

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
      <h2 style={styles.h2}>Анкета №1</h2>
      <p style={styles.p}>Ответы сохраняются автоматически при выборе.</p>

      {QUIZ1_QUESTIONS.map((q) => (
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
          <div style={styles.options}>
            {q.options.map((opt) => (
              <button
                key={opt.answerId}
                type="button"
                style={{
                  ...styles.optionBtn,
                  ...(getQuiz1AnswerByQuestionId(props.answers, q.questionId) === opt.answerId ? styles.optionBtnSelected : null),
                }}
                onClick={() => onSelect(q, opt.answerId)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {showValidation && !isValid ? <div style={styles.errorBox}>{QUIZ1_VALIDATION_ERROR_TEXT}</div> : null}
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

