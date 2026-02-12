import type { LessonConfig } from "../types/onboarding";

const LESSON_1: LessonConfig = {
  id: "lesson_1",
  title: "Как работает инвестиционный счёт",
  subtitle: "Базовый блок для старта",
  icon: "spark",
  goal: "Сформировать опорное понимание инвестиционного процесса",
  available_for: ["novice"],
  estimated_duration_sec: 240,
  screens: [
    {
      screen_id: "1_1",
      type: "hero",
      title: "Инвестиции начинаются с плана",
      subtitle: "Разберёмся, как безопасно начать путь инвестора.",
    },
    {
      screen_id: "1_2",
      type: "content",
      title: "Брокерский счёт",
      subtitle: "Это ваш инструмент для покупки ценных бумаг.",
      content_variants: {
        by_amount: {
          starter: {
            text: "На старте важно сосредоточиться на дисциплине и регулярности.",
          },
          premium: {
            text: "С крупным капиталом особенно важны риск-лимиты и ребалансировка.",
          },
          default: {
            text: "Брокерский счёт позволяет покупать ценные бумаги на бирже.",
          },
        },
      },
    },
    {
      screen_id: "1_3",
      type: "steps",
      title: "Первые шаги",
      items: [
        { title: "Определите цель", description: "Срок и ожидаемый результат." },
        { title: "Подберите инструменты", description: "С учётом риска." },
        { title: "Соберите портфель", description: "Не концентрируйтесь в одном активе." },
      ],
    },
    {
      screen_id: "1_4",
      type: "cards",
      title: "Что можно купить",
      subtitle: "Инструменты, которые доступны в приложении.",
    },
    {
      screen_id: "1_5",
      type: "cta",
      title: "Готовы к следующему блоку?",
      cta: [{ label: "Далее", type: "primary", action: "next_lesson" }],
    },
  ],
};

const LESSON_2: LessonConfig = {
  id: "lesson_2",
  title: "Риск и доходность",
  subtitle: "Как управлять ожиданиями",
  icon: "risk",
  goal: "Понять связь риска и потенциальной доходности",
  available_for: ["novice"],
  estimated_duration_sec: 220,
  screens: [
    {
      screen_id: "2_1",
      type: "hero",
      title: "Доходность без риска не бывает",
      subtitle: "Выбираем комфортный для вас уровень волатильности.",
    },
    {
      screen_id: "2_2",
      type: "spectrum",
      title: "Шкала риск-профилей",
      subtitle: "От консервативного до агрессивного.",
    },
    {
      screen_id: "2_3",
      type: "content",
      title: "Психология инвестора",
      subtitle: "Эмоции — главный враг стратегии.",
      content_variants: {
        by_goal: {
          preservation: {
            text: "Для цели сохранения капитала важнее стабильность, чем максимум доходности.",
          },
          growth: {
            text: "Для роста капитала допустима более высокая доля акций и временные просадки.",
          },
          default: {
            text: "Долгосрочная стратегия работает лучше импульсивных решений.",
          },
        },
      },
    },
    {
      screen_id: "2_4",
      type: "cta",
      title: "Продолжим обучение",
      cta: [{ label: "К уроку 3", type: "primary", action: "next_lesson" }],
    },
  ],
};

const LESSON_3: LessonConfig = {
  id: "lesson_3",
  title: "Диверсификация",
  subtitle: "Почему портфель лучше одной бумаги",
  icon: "pie",
  goal: "Показать базовые принципы диверсификации",
  available_for: ["novice", "advanced"],
  estimated_duration_sec: 260,
  variants: {
    short: { screens: ["3_1", "3_3", "3_5"] },
  },
  screens: [
    {
      screen_id: "3_1",
      type: "hero",
      title: "Диверсификация снижает риск",
      subtitle: "Распределяйте капитал между разными типами активов.",
    },
    {
      screen_id: "3_2",
      type: "content",
      title: "Класс активов",
      subtitle: "Акции, облигации, фонды и альтернативные инструменты.",
    },
    {
      screen_id: "3_3",
      type: "portfolio",
      title: "Пример портфеля",
      subtitle: "Собран с учётом вашей суммы инвестиций.",
    },
    {
      screen_id: "3_4",
      type: "calculator",
      title: "Как меняется риск портфеля",
      subtitle: "Смоделируйте доли и посмотрите результат.",
    },
    {
      screen_id: "3_5",
      type: "cta",
      title: "Двигаемся дальше",
      cta: [{ label: "Перейти к анкете риска", type: "primary", action: "start_quiz" }],
    },
  ],
};

const LESSON_4: LessonConfig = {
  id: "lesson_4",
  title: "Выбор инструментов",
  subtitle: "От стратегии к практическому подбору",
  icon: "compass",
  goal: "Перевести риск-профиль в конкретные инструменты",
  available_for: ["novice", "advanced"],
  estimated_duration_sec: 240,
  screens: [
    {
      screen_id: "4_1",
      type: "hero",
      title: "Инструменты под вашу цель",
      subtitle: "Подбор зависит от горизонта и риска.",
    },
    {
      screen_id: "4_2",
      type: "cards",
      title: "Подходящие инструменты",
      subtitle: "Часть карточек будет подсвечена по вашим интересам из ДОС.",
    },
    {
      screen_id: "4_3",
      type: "cta",
      title: "Открыть каталог инструментов",
      cta: [
        {
          label: "Открыть каталог",
          type: "primary",
          action: "deeplink",
          deeplink: "finamtrade://market/catalog",
        },
      ],
    },
  ],
};

const LESSON_5: LessonConfig = {
  id: "lesson_5",
  title: "Режимы работы и комиссия",
  subtitle: "Как не переплачивать",
  icon: "calculator",
  goal: "Объяснить влияние частоты сделок на тариф",
  available_for: ["novice"],
  estimated_duration_sec: 180,
  screens: [
    {
      screen_id: "5_1",
      type: "hero",
      title: "Комиссии влияют на результат",
      subtitle: "Сравним тарифы под ваш стиль торговли.",
    },
    {
      screen_id: "5_2",
      type: "tariff",
      title: "Сравнение тарифов",
      subtitle: "Инвестор, Трейдер, Премиум.",
    },
    {
      screen_id: "5_3",
      type: "calculator",
      title: "Калькулятор комиссий",
      subtitle: "Проверьте сценарий с вашей суммой и активностью.",
    },
    {
      screen_id: "5_4",
      type: "cta",
      title: "Подходим к финалу",
      cta: [{ label: "К следующему уроку", type: "primary", action: "next_lesson" }],
    },
  ],
};

const LESSON_6: LessonConfig = {
  id: "lesson_6",
  title: "План первых действий",
  subtitle: "Итоговый маршрут в приложении",
  icon: "flag",
  goal: "Закрепить персональный план и подготовить к первой покупке",
  available_for: ["novice", "advanced", "expert"],
  estimated_duration_sec: 200,
  variants: {
    expert: { screens: ["6_1", "6_3"] },
  },
  screens: [
    {
      screen_id: "6_1",
      type: "hero",
      title: "Ваш персональный маршрут готов",
      subtitle: "Покажем, с чего начать прямо сегодня.",
    },
    {
      screen_id: "6_2",
      type: "content",
      title: "Чеклист первого дня",
      items: [
        { title: "Пополните счёт", description: "Начните с комфортной суммы." },
        { title: "Соберите ядро портфеля", description: "ETF + облигации/акции." },
        { title: "Установите напоминание", description: "Проверка портфеля раз в месяц." },
      ],
    },
    {
      screen_id: "6_3",
      type: "cta",
      title: "Перейти к первой покупке",
      cta: [{ label: "Открыть рекомендации", type: "primary", action: "next_lesson" }],
    },
  ],
};

export const LESSONS: LessonConfig[] = [
  LESSON_1,
  LESSON_2,
  LESSON_3,
  LESSON_4,
  LESSON_5,
  LESSON_6,
];

export const LESSONS_BY_ID: Record<string, LessonConfig> = LESSONS.reduce<
  Record<string, LessonConfig>
>((acc, lesson) => {
  acc[lesson.id] = lesson;
  return acc;
}, {});
