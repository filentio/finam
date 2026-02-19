import type { Quiz1Answers, Quiz2Answers } from "./01_state_machine";
import type { Quiz2QuestionId } from "./13_quiz2_config";

export type Quiz2PrefillEditability = Record<
  Quiz2QuestionId,
  { isPrefilledFromQuiz1: boolean; isEditable: boolean; note: string }
>;

// Prefill policy for this stage:
// - Prefill is a deterministic suggestion based on Quiz1.
// - Prefilled values are editable by the user (not read-only).
export const QUIZ2_PREFILL_EDITABILITY: Quiz2PrefillEditability = {
  QZ2_Q1_HORIZON: {
    isPrefilledFromQuiz1: true,
    isEditable: true,
    note: "Предзаполнение — рекомендация на основе цели из Quiz1. Пользователь может изменить.",
  },
  QZ2_Q2_DRAWDOWN_REACTION: {
    isPrefilledFromQuiz1: false,
    isEditable: true,
    note: "Не предзаполняется.",
  },
  QZ2_Q3_MONTHLY_SHARE: {
    isPrefilledFromQuiz1: false,
    isEditable: true,
    note: "Не предзаполняется.",
  },
  QZ2_Q4_PREFERENCE: {
    isPrefilledFromQuiz1: true,
    isEditable: true,
    note: "Предзаполнение — рекомендация на основе опыта/статуса из Quiz1. Пользователь может изменить.",
  },
};

export function prefillQuiz2AnswersFromQuiz1(quiz1Answers: Quiz1Answers): Partial<Quiz2Answers> {
  const prefilled: Partial<Quiz2Answers> = {};

  // QZ2_Q1_HORIZON (investment horizon) based on main goal from Quiz1.
  // Deterministic mapping (source of truth for prefill).
  switch (quiz1Answers.q4MainGoal) {
    case "QZ1_Q4_PURCHASE":
      prefilled.q1Horizon = "QZ2_Q1_1_3Y";
      break;
    case "QZ1_Q4_PASSIVE_INCOME":
      prefilled.q1Horizon = "QZ2_Q1_GT_5Y";
      break;
    case "QZ1_Q4_GROWTH":
      prefilled.q1Horizon = "QZ2_Q1_3_5Y";
      break;
    case "QZ1_Q4_PRESERVE":
      prefilled.q1Horizon = "QZ2_Q1_GT_5Y";
      break;
    case null:
      break;
  }

  // QZ2_Q4_PREFERENCE (preserve/balance/growth) based on qualified status and experience.
  if (quiz1Answers.q1QualifiedStatus === "QZ1_Q1_YES") {
    prefilled.q4Preference = "QZ2_Q4_GROWTH";
  } else if (quiz1Answers.q1QualifiedStatus === "QZ1_Q1_NO") {
    switch (quiz1Answers.q2Experience) {
      case "QZ1_Q2_NO_EXPERIENCE":
      case "QZ1_Q2_LT_1Y":
        prefilled.q4Preference = "QZ2_Q4_PRESERVE";
        break;
      case "QZ1_Q2_1_3Y":
        prefilled.q4Preference = "QZ2_Q4_BALANCE";
        break;
      case "QZ1_Q2_3_5Y":
      case "QZ1_Q2_GT_5Y":
        prefilled.q4Preference = "QZ2_Q4_GROWTH";
        break;
      case null:
        break;
    }
  }

  return prefilled;
}

export function getPrefilledQuiz2QuestionIds(prefilled: Partial<Quiz2Answers>): Quiz2QuestionId[] {
  const ids: Quiz2QuestionId[] = [];
  if (prefilled.q1Horizon) ids.push("QZ2_Q1_HORIZON");
  if (prefilled.q4Preference) ids.push("QZ2_Q4_PREFERENCE");
  return ids;
}

