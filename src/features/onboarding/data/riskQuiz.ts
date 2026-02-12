import type { ScreenType } from "../types/onboarding";

export interface RiskQuizOption {
  id: string;
  text: string;
  score: number;
}

export interface RiskQuizQuestion {
  id: "Q5" | "Q6" | "Q7" | "Q8";
  block: "A" | "B" | "D";
  block_title: string;
  question: string;
  options: RiskQuizOption[];
  screen_config: {
    type: ScreenType;
    layout: "single_select_vertical" | "single_select_horizontal";
    progress_label: string;
    is_critical?: boolean;
  };
}

export const RISK_QUIZ_QUESTIONS: RiskQuizQuestion[] = [
  {
    id: "Q5",
    block: "A",
    block_title: "Финансовое положение",
    question:
      "Есть ли у вас финансовая подушка безопасности (резерв на 3–6 месяцев)?",
    options: [
      { id: "a", text: "Нет, резерва нет", score: 1 },
      { id: "b", text: "Да, на 1–3 месяца", score: 2 },
      { id: "c", text: "Да, на 3–6 месяцев", score: 3 },
      { id: "d", text: "Да, более чем на 6 месяцев", score: 4 },
    ],
    screen_config: {
      type: "quiz",
      layout: "single_select_vertical",
      progress_label: "Вопрос 1 из 4",
    },
  },
  {
    id: "Q6",
    block: "B",
    block_title: "Горизонт",
    question: "На какой срок вы планируете инвестировать?",
    options: [
      { id: "a", text: "Менее 1 года", score: 1 },
      { id: "b", text: "1–3 года", score: 2 },
      { id: "c", text: "3–5 лет", score: 3 },
      { id: "d", text: "Более 5 лет", score: 4 },
    ],
    screen_config: {
      type: "quiz",
      layout: "single_select_horizontal",
      progress_label: "Вопрос 2 из 4",
    },
  },
  {
    id: "Q7",
    block: "D",
    block_title: "Отношение к риску",
    question: "Как вы оцениваете своё отношение к риску?",
    options: [
      {
        id: "a",
        text: "Риски должны быть минимальными, я не готов(а) к потерям.",
        score: 1,
      },
      {
        id: "b",
        text: "Готов(а) к небольшим колебаниям ради умеренного дохода.",
        score: 2,
      },
      {
        id: "c",
        text: "Принимаю значительные колебания ради хорошей доходности.",
        score: 3,
      },
      {
        id: "d",
        text: "Готов(а) к существенным потерям ради максимальной доходности.",
        score: 4,
      },
    ],
    screen_config: {
      type: "quiz",
      layout: "single_select_vertical",
      progress_label: "Вопрос 3 из 4",
      is_critical: true,
    },
  },
  {
    id: "Q8",
    block: "D",
    block_title: "Поведение",
    question:
      "Представьте: за 3 месяца ваши инвестиции упали на 20%. Что вы сделаете?",
    options: [
      { id: "a", text: "Продам всё и переведу на вклад.", score: 1 },
      {
        id: "b",
        text: "Продам часть и переложу в более надёжные инструменты.",
        score: 2,
      },
      { id: "c", text: "Подожду восстановления, ничего не буду делать.", score: 3 },
      { id: "d", text: "Докуплю подешевевшие активы.", score: 4 },
    ],
    screen_config: {
      type: "quiz",
      layout: "single_select_vertical",
      progress_label: "Вопрос 4 из 4",
    },
  },
];
