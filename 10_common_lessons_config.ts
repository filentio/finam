import type { Segment } from "./01_state_machine";

export type LessonId =
  | "CL_INTRO_ACCOUNTS"
  | "CL_ORDER_TYPES"
  | "CL_RISK_RETURN"
  | "CL_DIVERSIFICATION"
  | "CL_FEES_TAXES"
  | "CL_REBALANCING"
  | "CL_DISCIPLINE_PLAN"
  | "CL_ADVANCED_PRODUCTS";

export type LessonAsset = { type: "image" | "icon"; src: string; alt: string };

export type Lesson = {
  lessonId: LessonId;
  title: string;
  body: string; // markdown allowed
  ctaLabel: string;
  ctaLink: string;
  assets: LessonAsset[];
  analyticsMeta: { screenName: string; lessonId: LessonId };
};

export const LESSON_REGISTRY: Record<LessonId, Lesson> = {
  CL_INTRO_ACCOUNTS: {
    lessonId: "CL_INTRO_ACCOUNTS",
    title: "С чего начинается инвестирование: счёт, ИИС и деньги",
    body:
      "Инвестирование начинается с понятной базы: где хранятся активы и как вы вносите деньги.\n\n" +
      "- **Брокерский счёт** — основной счёт для покупки ценных бумаг.\n" +
      "- **ИИС** — счёт с налоговыми льготами, но с ограничениями по условиям использования.\n" +
      "- **Внесение средств**: сначала пополнение счёта, затем размещение заявки.\n\n" +
      "Правило урока: сначала разберитесь, какой тип счёта вам подходит, и только затем планируйте покупки.",
    ctaLabel: "Открыть глоссарий",
    ctaLink: "finam://invest/glossary",
    assets: [],
    analyticsMeta: { screenName: "onboarding_common_intro_accounts", lessonId: "CL_INTRO_ACCOUNTS" },
  },
  CL_ORDER_TYPES: {
    lessonId: "CL_ORDER_TYPES",
    title: "Как покупать и продавать: рыночные и лимитные заявки",
    body:
      "Заявка — это инструкция бирже. От типа заявки зависит цена исполнения.\n\n" +
      "- **Рыночная заявка**: исполняется сразу по лучшей доступной цене.\n" +
      "- **Лимитная заявка**: исполняется только по указанной цене или лучше.\n\n" +
      "Практическое правило: если вам важна цена — используйте лимитную заявку; если важна скорость — рыночную.",
    ctaLabel: "Открыть глоссарий",
    ctaLink: "finam://invest/glossary",
    assets: [],
    analyticsMeta: { screenName: "onboarding_common_order_types", lessonId: "CL_ORDER_TYPES" },
  },
  CL_RISK_RETURN: {
    lessonId: "CL_RISK_RETURN",
    title: "Риск и доходность: базовый баланс",
    body:
      "Доходность и риск связаны: потенциально более высокая доходность почти всегда означает более высокую волатильность.\n\n" +
      "- **Волатильность** — насколько сильно меняется цена.\n" +
      "- **Просадка** — падение стоимости портфеля от максимума.\n" +
      "- **Диверсификация** снижает риск, но не отменяет его.\n\n" +
      "Правило урока: выбирайте риск под горизонт и цели, а не под эмоции момента.",
    ctaLabel: "Открыть глоссарий",
    ctaLink: "finam://invest/glossary",
    assets: [],
    analyticsMeta: { screenName: "onboarding_common_risk_return", lessonId: "CL_RISK_RETURN" },
  },
  CL_DIVERSIFICATION: {
    lessonId: "CL_DIVERSIFICATION",
    title: "Диверсификация: не ставить всё на один актив",
    body:
      "Диверсификация — распределение капитала между разными активами, секторами и валютами.\n\n" +
      "- Один актив может резко просесть, но портфель из разных активов обычно устойчивее.\n" +
      "- Смешение классов активов (акции/облигации/фонды) помогает сгладить колебания.\n\n" +
      "Правило урока: портфель строится вокруг цели, а не вокруг одной идеи.",
    ctaLabel: "Открыть глоссарий",
    ctaLink: "finam://invest/glossary",
    assets: [],
    analyticsMeta: { screenName: "onboarding_common_diversification", lessonId: "CL_DIVERSIFICATION" },
  },
  CL_FEES_TAXES: {
    lessonId: "CL_FEES_TAXES",
    title: "Комиссии и налоги: что влияет на итоговый результат",
    body:
      "Итоговая доходность зависит не только от рынка, но и от издержек.\n\n" +
      "- **Комиссии брокера**: за сделки и обслуживание (в зависимости от тарифа).\n" +
      "- **Налоги**: на прибыль и дивиденды по правилам вашей юрисдикции.\n\n" +
      "Правило урока: сравнивайте стратегии по результату *после* комиссий и налогов.",
    ctaLabel: "Открыть глоссарий",
    ctaLink: "finam://invest/glossary",
    assets: [],
    analyticsMeta: { screenName: "onboarding_common_fees_taxes", lessonId: "CL_FEES_TAXES" },
  },
  CL_REBALANCING: {
    lessonId: "CL_REBALANCING",
    title: "Ребалансировка: поддерживать структуру портфеля",
    body:
      "Со временем доли активов в портфеле меняются из‑за разной динамики цен.\n\n" +
      "- **Ребалансировка** — возврат к целевым долям.\n" +
      "- Делается по правилу (например, раз в квартал) или по отклонению долей.\n\n" +
      "Правило урока: заранее выберите правило ребалансировки и придерживайтесь его.",
    ctaLabel: "Открыть глоссарий",
    ctaLink: "finam://invest/glossary",
    assets: [],
    analyticsMeta: { screenName: "onboarding_common_rebalancing", lessonId: "CL_REBALANCING" },
  },
  CL_DISCIPLINE_PLAN: {
    lessonId: "CL_DISCIPLINE_PLAN",
    title: "План и дисциплина: как не сорвать стратегию",
    body:
      "План инвестирования — это набор правил, которые помогают пережить рыночные колебания.\n\n" +
      "- Определите цель и горизонт.\n" +
      "- Выберите допустимую просадку.\n" +
      "- Заранее решите, как действовать при падении рынка.\n\n" +
      "Правило урока: решение «что делать в просадку» принимается до просадки.",
    ctaLabel: "Открыть глоссарий",
    ctaLink: "finam://invest/glossary",
    assets: [],
    analyticsMeta: { screenName: "onboarding_common_discipline_plan", lessonId: "CL_DISCIPLINE_PLAN" },
  },
  CL_ADVANCED_PRODUCTS: {
    lessonId: "CL_ADVANCED_PRODUCTS",
    title: "Сложные инструменты: использовать только при понимании рисков",
    body:
      "Сложные инструменты могут усиливать как прибыль, так и убытки.\n\n" +
      "- **Маржинальная торговля** увеличивает риск из‑за плеча.\n" +
      "- **Производные** (фьючерсы/опционы) требуют понимания механики и гарантийного обеспечения.\n" +
      "- **Структурные продукты** имеют условия, влияющие на результат при разных сценариях рынка.\n\n" +
      "Правило урока: используйте сложные инструменты только в рамках заранее определённого риска.",
    ctaLabel: "Открыть глоссарий",
    ctaLink: "finam://invest/glossary",
    assets: [],
    analyticsMeta: { screenName: "onboarding_common_advanced_products", lessonId: "CL_ADVANCED_PRODUCTS" },
  },
};

export const COMMON_LESSONS_BY_SEGMENT: Record<Segment, LessonId[]> = {
  NOVICE: [
    "CL_INTRO_ACCOUNTS",
    "CL_ORDER_TYPES",
    "CL_RISK_RETURN",
    "CL_DIVERSIFICATION",
    "CL_FEES_TAXES",
    "CL_DISCIPLINE_PLAN",
  ],
  LEARNER: ["CL_ORDER_TYPES", "CL_RISK_RETURN", "CL_DIVERSIFICATION", "CL_FEES_TAXES", "CL_REBALANCING"],
  EXPERIENCED: ["CL_RISK_RETURN", "CL_DIVERSIFICATION", "CL_REBALANCING", "CL_FEES_TAXES", "CL_DISCIPLINE_PLAN"],
  QUALIFIED: ["CL_ADVANCED_PRODUCTS", "CL_REBALANCING", "CL_FEES_TAXES"],
};

export function getCommonLessonIdsForSegment(segment: Segment): LessonId[] {
  return COMMON_LESSONS_BY_SEGMENT[segment];
}

export function getLessonById(lessonId: LessonId): Lesson {
  return LESSON_REGISTRY[lessonId];
}

