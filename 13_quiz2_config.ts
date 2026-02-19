import type { Quiz2Answers } from "./01_state_machine";

export type Quiz2QuestionId =
  | "QZ2_Q1_HORIZON"
  | "QZ2_Q2_DRAWDOWN_REACTION"
  | "QZ2_Q3_MONTHLY_SHARE"
  | "QZ2_Q4_PREFERENCE";

export type Quiz2AnswerId =
  | "QZ2_Q1_LT_1Y"
  | "QZ2_Q1_1_3Y"
  | "QZ2_Q1_3_5Y"
  | "QZ2_Q1_GT_5Y"
  | "QZ2_Q2_SELL"
  | "QZ2_Q2_WAIT"
  | "QZ2_Q2_BUY_MORE"
  | "QZ2_Q3_LT_5"
  | "QZ2_Q3_5_15"
  | "QZ2_Q3_GT_15"
  | "QZ2_Q4_PRESERVE"
  | "QZ2_Q4_BALANCE"
  | "QZ2_Q4_GROWTH";

export type Quiz2Option = {
  answerId: Quiz2AnswerId;
  label: string;
};

export type Quiz2Question = {
  questionId: Quiz2QuestionId;
  type: "single";
  required: true;
  title: string;
  helperText: string | null;
  options: readonly Quiz2Option[];
};

export const QUIZ2_VALIDATION_ERROR_TEXT = "Заполните все вопросы анкеты";

export const QUIZ2_QUESTIONS: readonly Quiz2Question[] = [
  {
    questionId: "QZ2_Q1_HORIZON",
    type: "single",
    required: true,
    title: "На какой срок вы планируете инвестировать?",
    helperText: null,
    options: [
      { answerId: "QZ2_Q1_LT_1Y", label: "До 1 года" },
      { answerId: "QZ2_Q1_1_3Y", label: "1–3 года" },
      { answerId: "QZ2_Q1_3_5Y", label: "3–5 лет" },
      { answerId: "QZ2_Q1_GT_5Y", label: "Более 5 лет" },
    ],
  },
  {
    questionId: "QZ2_Q2_DRAWDOWN_REACTION",
    type: "single",
    required: true,
    title: "Если портфель временно снизится на 20%, что вы сделаете?",
    helperText: null,
    options: [
      { answerId: "QZ2_Q2_SELL", label: "Продам, чтобы ограничить потери" },
      { answerId: "QZ2_Q2_WAIT", label: "Подожду, пока восстановится" },
      { answerId: "QZ2_Q2_BUY_MORE", label: "Докуплю, чтобы снизить среднюю цену" },
    ],
  },
  {
    questionId: "QZ2_Q3_MONTHLY_SHARE",
    type: "single",
    required: true,
    title: "Какую долю ежемесячного дохода вы готовы направлять на инвестиции?",
    helperText: null,
    options: [
      { answerId: "QZ2_Q3_LT_5", label: "До 5%" },
      { answerId: "QZ2_Q3_5_15", label: "5–15%" },
      { answerId: "QZ2_Q3_GT_15", label: "Более 15%" },
    ],
  },
  {
    questionId: "QZ2_Q4_PREFERENCE",
    type: "single",
    required: true,
    title: "Что для вас важнее всего в стратегии?",
    helperText: null,
    options: [
      { answerId: "QZ2_Q4_PRESERVE", label: "Сохранение капитала" },
      { answerId: "QZ2_Q4_BALANCE", label: "Баланс риска и доходности" },
      { answerId: "QZ2_Q4_GROWTH", label: "Максимальный рост, риск допустим" },
    ],
  },
];

export function getQuiz2AnswerByQuestionId(answers: Quiz2Answers, questionId: Quiz2QuestionId): Quiz2AnswerId | null {
  switch (questionId) {
    case "QZ2_Q1_HORIZON":
      return answers.q1Horizon;
    case "QZ2_Q2_DRAWDOWN_REACTION":
      return answers.q2DrawdownReaction;
    case "QZ2_Q3_MONTHLY_SHARE":
      return answers.q3MonthlyShare;
    case "QZ2_Q4_PREFERENCE":
      return answers.q4Preference;
  }
}

