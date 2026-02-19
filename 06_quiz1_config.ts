import type { Quiz1Answers } from "./01_state_machine";

export type Quiz1QuestionId =
  | "QZ1_Q1_QUALIFIED_STATUS"
  | "QZ1_Q2_EXPERIENCE"
  | "QZ1_Q3_PLANNED_AMOUNT"
  | "QZ1_Q4_MAIN_GOAL"
  | "QZ1_Q5_INTERESTS";

export type Quiz1AnswerId =
  | "QZ1_Q1_YES"
  | "QZ1_Q1_NO"
  | "QZ1_Q2_NO_EXPERIENCE"
  | "QZ1_Q2_LT_1Y"
  | "QZ1_Q2_1_3Y"
  | "QZ1_Q2_3_5Y"
  | "QZ1_Q2_GT_5Y"
  | "QZ1_Q3_LT_300K"
  | "QZ1_Q3_300K_2M"
  | "QZ1_Q3_2_5M"
  | "QZ1_Q3_GT_5M"
  | "QZ1_Q4_PURCHASE"
  | "QZ1_Q4_PASSIVE_INCOME"
  | "QZ1_Q4_GROWTH"
  | "QZ1_Q4_PRESERVE"
  | "QZ1_Q5_FUNDS"
  | "QZ1_Q5_STOCKS"
  | "QZ1_Q5_TRUST"
  | "QZ1_Q5_BONDS"
  | "QZ1_Q5_IPO"
  | "QZ1_Q5_CURRENCY"
  | "QZ1_Q5_STRUCTURED"
  | "QZ1_Q5_DERIVATIVES"
  | "QZ1_Q5_NONE";

export type Quiz1Option = {
  answerId: Quiz1AnswerId;
  label: string;
};

export type Quiz1Question = {
  questionId: Quiz1QuestionId;
  type: "single" | "multi";
  required: true;
  title: string;
  helperText: string | null;
  minSelected?: number; // used for multi-select questions
  options: readonly Quiz1Option[];
};

export const QUIZ1_VALIDATION_ERROR_TEXT = "Заполните все вопросы анкеты";

export const QUIZ1_QUESTIONS: readonly Quiz1Question[] = [
  {
    questionId: "QZ1_Q1_QUALIFIED_STATUS",
    type: "single",
    required: true,
    title: "Есть ли у вас статус квалифицированного инвестора?",
    helperText: null,
    options: [
      { answerId: "QZ1_Q1_YES", label: "Да" },
      { answerId: "QZ1_Q1_NO", label: "Нет" },
    ],
  },
  {
    questionId: "QZ1_Q2_EXPERIENCE",
    type: "single",
    required: true,
    title: "Какой у вас опыт в инвестициях?",
    helperText: null,
    options: [
      { answerId: "QZ1_Q2_NO_EXPERIENCE", label: "Еще нет опыта" },
      { answerId: "QZ1_Q2_LT_1Y", label: "Менее 1 года" },
      { answerId: "QZ1_Q2_1_3Y", label: "От 1 до 3 лет" },
      { answerId: "QZ1_Q2_3_5Y", label: "От 3 до 5 лет" },
      { answerId: "QZ1_Q2_GT_5Y", label: "Более 5 лет" },
    ],
  },
  {
    questionId: "QZ1_Q3_PLANNED_AMOUNT",
    type: "single",
    required: true,
    title: "С какой суммы вы планируете инвестировать?",
    helperText: null,
    options: [
      { answerId: "QZ1_Q3_LT_300K", label: "До 300 тыс" },
      { answerId: "QZ1_Q3_300K_2M", label: "300 тыс - 2 млн" },
      { answerId: "QZ1_Q3_2_5M", label: "2 - 5 млн" },
      { answerId: "QZ1_Q3_GT_5M", label: "Более 5 млн" },
    ],
  },
  {
    questionId: "QZ1_Q4_MAIN_GOAL",
    type: "single",
    required: true,
    title: "Ваша главная цель инвестиций?",
    helperText: null,
    options: [
      { answerId: "QZ1_Q4_PURCHASE", label: "Накопление на крупную покупку" },
      { answerId: "QZ1_Q4_PASSIVE_INCOME", label: "Получение пассивного дохода" },
      { answerId: "QZ1_Q4_GROWTH", label: "Рост капитала" },
      { answerId: "QZ1_Q4_PRESERVE", label: "Сохранение и наследие" },
    ],
  },
  {
    questionId: "QZ1_Q5_INTERESTS",
    type: "multi",
    required: true,
    title: "Какие продукты/инструменты вам наиболее интересны?",
    helperText: "Выберите один или несколько вариантов",
    minSelected: 1,
    options: [
      { answerId: "QZ1_Q5_FUNDS", label: "Фонды (ETF, ПИФ)" },
      { answerId: "QZ1_Q5_STOCKS", label: "Акции" },
      { answerId: "QZ1_Q5_TRUST", label: "Доверительное управление / готовые портфели" },
      { answerId: "QZ1_Q5_BONDS", label: "Облигации" },
      { answerId: "QZ1_Q5_IPO", label: "IPO" },
      { answerId: "QZ1_Q5_CURRENCY", label: "Валюта" },
      { answerId: "QZ1_Q5_STRUCTURED", label: "Структурные продукты" },
      { answerId: "QZ1_Q5_DERIVATIVES", label: "Производные (фьючерсы, опционы)" },
      { answerId: "QZ1_Q5_NONE", label: "Ничего из перечисленного" },
    ],
  },
];

export const QUIZ1_QUESTION_ORDER: readonly Quiz1QuestionId[] = QUIZ1_QUESTIONS.map((q) => q.questionId);

export function getQuiz1AnswerByQuestionId(
  answers: Quiz1Answers,
  questionId: Quiz1QuestionId
): Quiz1AnswerId | Quiz1AnswerId[] | null {
  switch (questionId) {
    case "QZ1_Q1_QUALIFIED_STATUS":
      return answers.q1QualifiedStatus;
    case "QZ1_Q2_EXPERIENCE":
      return answers.q2Experience;
    case "QZ1_Q3_PLANNED_AMOUNT":
      return answers.q3PlannedAmount;
    case "QZ1_Q4_MAIN_GOAL":
      return answers.q4MainGoal;
    case "QZ1_Q5_INTERESTS":
      return answers.q5Interests;
  }
}

