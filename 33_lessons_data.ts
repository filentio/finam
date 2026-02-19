import type { LessonData, LessonId, LessonScreen } from "./30_lessons_schema";
import { IS_DEV } from "./24_env";
import { validateLessonScreen } from "./31_lessons_validate";
import { getLessonById as getCommonLessonById } from "./10_common_lessons_config";
import { getBranchLessonById as getLegacyBranchLessonById } from "./17_branch_config";

type LegacyBranchLesson = {
  lessonId: string;
  title: string;
  body: string;
  ctaLabel: string | null;
  ctaLink: string | null;
  assets: Array<{ type: "image" | "icon"; src: string; alt: string }>;
};

function splitParagraphs(text: string): string[] {
  const parts = text
    .split(/\n\s*\n/g)
    .map((p) => p.replace(/\s+\n/g, "\n").trim())
    .filter((p) => p.length > 0);
  return parts.length ? parts : [text.trim()];
}

// Branch lessons 1–6, structured (no raw "screen as content").
const BRANCH_1_6_STRUCTURED: Record<
  string,
  LessonData
> = {
  // 1) s02a_start_intro
  s02a_start_intro: {
    lessonId: "s02a_start_intro" as LessonId,
    screens: [
      {
        id: "s02a_start_intro",
        type: "intro",
        title: "УРОК 1",
        payload: {
          subtitle: "С чего начать?",
          description: "Разберемся в основах, пополним счет и сделаем первую покупку.",
        },
        assets: [],
      },
    ],
  },

  // 2) s02_reality
  s02_reality: {
    lessonId: "s02_reality" as LessonId,
    screens: [
      {
        id: "s02_reality",
        type: "cards",
        title: "Инвестиции без опыта — это реально",
        payload: {
          cards: [
            { title: "Доступно каждому", text: "Не нужно быть аналитиком или профессиональным трейдером" },
            { title: "Готовые решения", text: "Умные алгоритмы и стратегии работают за вас" },
            { title: "Простой старт", text: "Подходит даже новичкам с нулевыми знаниями" },
            { title: "Всё в одном приложении", text: "Брокер, сигналы, курсы" },
          ],
        },
        assets: [],
      },
    ],
  },

  // 3) s03_goals
  s03_goals: {
    lessonId: "s03_goals" as LessonId,
    screens: [
      {
        id: "s03_goals",
        type: "cards",
        title: "Истинные цели инвестиций",
        body: "Вложение денег сегодня, чтобы они росли завтра",
        payload: {
          cards: [
            { title: "Обгонять инфляцию", text: "Сохранить ценность денег" },
            { title: "Пассивный доход", text: "Деньги работают на вас" },
            { title: "Подушка безопасности", text: "Финансовая защита" },
            { title: "Финансовые цели", text: "Квартира, авто, образование" },
          ],
        },
        assets: [],
      },
    ],
  },

  // 4) s04_concepts
  s04_concepts: {
    lessonId: "s04_concepts" as LessonId,
    screens: [
      {
        id: "s04_concepts",
        type: "cards",
        title: "Основные понятия инвестирования",
        payload: {
          cards: [
            { title: "Ценная бумага", text: "Документ, подтверждающий ваши права на актив (акция, облигация)." },
            { title: "Доход", text: "Финансовая награда за ваше терпение и дисциплину." },
            { title: "Экономика", text: "Бизнес страны. Состояние экономики влияет на ваши инвестиции." },
            { title: "Биржа", text: "Площадка для торговли ценными бумагами (Московская, СПБ)." },
          ],
        },
        assets: [],
      },
    ],
  },

  // 5) s05_deposit
  s05_deposit: {
    lessonId: "s05_deposit" as LessonId,
    screens: [
      {
        id: "s05_deposit",
        type: "bonus",
        title: "Начинаем инвестировать",
        payload: {
          title: "Бонус от Финам",
          bullets: ["+1 500 бонусов", "При пополнении от 30 000 ₽", "Акция действует для новых клиентов"],
        },
        assets: [{ type: "icon", src: "assets/icons/s05_deposit__gift.svg", alt: "Подарок" }],
      },
    ],
  },

  // 6) s06_first_buy
  s06_first_buy: {
    lessonId: "s06_first_buy" as LessonId,
    screens: [
      {
        id: "s06_first_buy",
        type: "cta",
        title: "Первая покупка",
        body:
          "Ваш счёт пополнен. Теперь самое интересное — станьте совладельцем крупнейших компаний.\n\n" +
          "Выберите актив: найдите акции Газпрома, Сбера или Яндекса в каталоге приложения и нажмите кнопку «Купить».",
        payload: { label: "Выбрать актив и купить", link: "finam://invest/market" },
        assets: [],
      },
    ],
  },
};

function getStructuredBranch1To6(lessonId: string): LessonData | null {
  return BRANCH_1_6_STRUCTURED[lessonId] ?? null;
}

function legacyBranchToLessonData(lessonId: string): LessonData {
  const legacy = getLegacyBranchLessonById(lessonId as any) as unknown as LegacyBranchLesson;
  const hasCta = Boolean(legacy.ctaLabel && legacy.ctaLink);

  const screen: LessonScreen = hasCta
    ? {
        id: lessonId,
        type: "cta",
        title: legacy.title,
        body: legacy.body,
        payload: { label: legacy.ctaLabel!, link: legacy.ctaLink! },
        assets: legacy.assets ?? [],
      }
    : {
        id: lessonId,
        type: "content",
        title: legacy.title,
        payload: { paragraphs: splitParagraphs(legacy.body) },
        assets: legacy.assets ?? [],
      };

  return { lessonId: lessonId as LessonId, screens: [screen] };
}

function commonLessonToLessonData(lessonId: string): LessonData {
  const l = getCommonLessonById(lessonId as any) as any as { lessonId: string; title: string; body: string; ctaLabel: string; ctaLink: string; assets: any[] };
  const screen: LessonScreen = {
    id: lessonId,
    type: "content",
    title: l.title,
    payload: { paragraphs: splitParagraphs(l.body) },
    assets: l.assets ?? [],
  };
  // If common lesson has a CTA, keep it as part of completion summary (single screen rule).
  // Minimal approach: show it as a secondary link via multi_cta in body (not altering flow).
  if (l.ctaLabel && l.ctaLink) {
    screen.type = "multi_cta";
    (screen as any).payload = { ctas: [{ label: l.ctaLabel, link: l.ctaLink, style: "secondary" }] };
    screen.body = l.body;
  }
  return { lessonId: lessonId as LessonId, screens: [screen] };
}

export function getLessonData(lessonId: LessonId): LessonData {
  // Common lessons IDs are prefixed with "CL_".
  if (String(lessonId).startsWith("CL_")) {
    const data = commonLessonToLessonData(String(lessonId));
    validateLessonData(data);
    return data;
  }

  // Branch lessons 1–6 are fully structured; other branch lessons use legacy-to-structured migration for one release.
  const structured = getStructuredBranch1To6(String(lessonId));
  const data = structured ?? legacyBranchToLessonData(String(lessonId));
  validateLessonData(data);
  return data;
}

export function validateLessonData(data: LessonData): void {
  // Unique screen ids within lesson, and schema validation.
  const seen = new Set<string>();
  for (const s of data.screens) {
    if (seen.has(s.id)) {
      if (IS_DEV) throw new Error(`Duplicate LessonScreen.id in lesson=${String(data.lessonId)} id=${s.id}`);
      return;
    }
    seen.add(s.id);
    const v = validateLessonScreen(s);
    if (!v.ok) {
      if (IS_DEV) throw new Error(`Invalid LessonScreen in lesson=${String(data.lessonId)} id=${s.id}: ${v.reason}`);
      return;
    }
  }
}

// Dev-time sanity check: ensure lessons 1–6 are valid and structured.
if (IS_DEV) {
  for (const k of Object.keys(BRANCH_1_6_STRUCTURED)) {
    validateLessonData(BRANCH_1_6_STRUCTURED[k]);
  }
}

