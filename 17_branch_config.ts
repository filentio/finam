import type { BranchId, Segment, Strategy } from "./01_state_machine";

export type LessonId =
  | "s02a_start_intro"
  | "s02_reality"
  | "s03_goals"
  | "s04_concepts"
  | "s05_deposit"
  | "s06_first_buy"
  | "s06a_purchase_steps"
  | "s07_rules_updated"
  | "s08_instruments_updated"
  | "s09_choice_updated"
  | "s10_courses"
  | "s11_portfolio_intro"
  | "s12_principles"
  | "s13_structure"
  | "s14_balance"
  | "s14a_portfolio_cta"
  | "s15_risks_intro"
  | "s16_risk_types"
  | "s17_protection"
  | "s18_reliable"
  | "s19_bonds"
  | "s20_capital_protection"
  | "s20a_risks_cta"
  | "s21_tariff_intro"
  | "s22_tariff_long"
  | "s23_tariff_strateg"
  | "s24_tariff_investor"
  | "s25_trust_management"
  | "s25a_tariff_cta"
  | "s26_diversification_intro"
  | "s27_what_is_div"
  | "s28_asset_allocation"
  | "s29_why_works"
  | "s30_example"
  | "s30a_diversification_cta"
  | "s31_cta";

export type LessonAsset = { type: "image" | "icon"; src: string; alt: string };

export type Lesson = {
  lessonId: LessonId;
  title: string;
  body: string;
  ctaLabel: string | null;
  ctaLink: string | null;
  assets: LessonAsset[];
  analyticsMeta: { screenName: string; lessonId: LessonId };
};

export const BRANCH_BY_SEGMENT_STRATEGY: Record<Segment, Record<Strategy, BranchId>> = {
  NOVICE: { conservative: "BR_BEGINNER", balanced: "BR_BEGINNER", aggressive: "BR_BEGINNER" },
  LEARNER: { conservative: "BR_INTERMEDIATE", balanced: "BR_INTERMEDIATE", aggressive: "BR_INTERMEDIATE" },
  EXPERIENCED: { conservative: "BR_INTERMEDIATE", balanced: "BR_INTERMEDIATE", aggressive: "BR_ADVANCED" },
  QUALIFIED: { conservative: "BR_ADVANCED", balanced: "BR_ADVANCED", aggressive: "BR_ADVANCED" },
};

export const BRANCH_LESSONS: Record<BranchId, LessonId[]> = {
  BR_BEGINNER: [
    "s02a_start_intro",
    "s02_reality",
    "s03_goals",
    "s04_concepts",
    "s05_deposit",
    "s06_first_buy",
    "s06a_purchase_steps",
    "s07_rules_updated",
    "s08_instruments_updated",
    "s09_choice_updated",
    "s10_courses",
  ],
  BR_INTERMEDIATE: [
    "s11_portfolio_intro",
    "s12_principles",
    "s13_structure",
    "s14_balance",
    "s14a_portfolio_cta",
    "s15_risks_intro",
    "s16_risk_types",
    "s17_protection",
    "s18_reliable",
    "s19_bonds",
    "s20_capital_protection",
    "s20a_risks_cta",
  ],
  BR_ADVANCED: [
    "s21_tariff_intro",
    "s22_tariff_long",
    "s23_tariff_strateg",
    "s24_tariff_investor",
    "s25_trust_management",
    "s25a_tariff_cta",
    "s26_diversification_intro",
    "s27_what_is_div",
    "s28_asset_allocation",
    "s29_why_works",
    "s30_example",
    "s30a_diversification_cta",
    "s31_cta",
  ],
};

let _LESSON_REGISTRY: Record<LessonId, Lesson> | null = null;

function ensureLessonRegistry(): Record<LessonId, Lesson> {
  if (_LESSON_REGISTRY) return _LESSON_REGISTRY;
  _LESSON_REGISTRY = {
  s02a_start_intro: {
    lessonId: "s02a_start_intro",
    title: "УРОК 1",
    body: `УРОК 1
С чего
начать?
Разберемся в основах, пополним счет и сделаем первую покупку.`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s02a_start_intro.png", alt: "УРОК 1" }],
    analyticsMeta: { screenName: "s02a_start_intro", lessonId: "s02a_start_intro" },
  },
  s02_reality: {
    lessonId: "s02_reality",
    title: "Инвестиции без опыта — это реально",
    body: `Инвестиции без опыта — это реально
Доступно каждому
Не нужно быть аналитиком или профессиональным трейдером
Готовые решения
Умные алгоритмы и стратегии работают за вас
Простой старт
Подходит даже новичкам с нулевыми знаниями
Всё в одном приложении:
брокер, сигналы, курсы`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s02_reality.png", alt: "Инвестиции без опыта — это реально" }],
    analyticsMeta: { screenName: "s02_reality", lessonId: "s02_reality" },
  },
  s03_goals: {
    lessonId: "s03_goals",
    title: "Истинные цели инвестиций",
    body: `Истинные цели инвестиций
Вложение денег сегодня, чтобы они росли завтра
Обгонять инфляцию
Сохранить ценность денег
Пассивный доход
Деньги работают на вас
Подушка безопасности
Финансовая защита
Финансовые цели
Квартира, авто, образование
Важно: Инвестиции помогают достичь целей быстрее, чем простое накопление.`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s03_goals.png", alt: "Истинные цели инвестиций" }],
    analyticsMeta: { screenName: "s03_goals", lessonId: "s03_goals" },
  },
  s04_concepts: {
    lessonId: "s04_concepts",
    title: "Основные понятия инвестирования",
    body: `Основные понятия инвестирования
Ценная бумага
Документ, подтверждающий ваши права на актив (акция, облигация).
Доход
Финансовая награда за ваше терпение и дисциплину.
Экономика
Бизнес страны. Состояние экономики влияет на ваши инвестиции.
Биржа
Площадка для торговли ценными бумагами (Московская, СПБ).
Изучить глоссарий`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s04_concepts.png", alt: "Основные понятия инвестирования" }],
    analyticsMeta: { screenName: "s04_concepts", lessonId: "s04_concepts" },
  },
  s05_deposit: {
    lessonId: "s05_deposit",
    title: "Начинаем",
    body: `Начинаем
инвестировать
Сделайте первое пополнение счёта, чтобы иметь возможность быстро купить интересующие инструменты.
Бонус от Финам
+1 500
бонусов
При пополнении от 30 000 ₽
Пополнить счёт и получить бонус
Счёт уже пополнен? К покупкам
Акция действует для новых клиентов`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s05_deposit.png", alt: "Начинаем" }],
    analyticsMeta: { screenName: "s05_deposit", lessonId: "s05_deposit" },
  },
  s06_first_buy: {
    lessonId: "s06_first_buy",
    title: "Первая покупка",
    body: `Первая покупка
Ваш счёт пополнен. Теперь самое интересное — станьте совладельцем крупнейших компаний.
Выберите актив
Найдите акции Газпрома, Сбера или Яндекса в каталоге и нажмите кнопку «Купить».
Выбрать актив и купить`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s06_first_buy.png", alt: "Первая покупка" }],
    analyticsMeta: { screenName: "s06_first_buy", lessonId: "s06_first_buy" },
  },
  s06a_purchase_steps: {
    lessonId: "s06a_purchase_steps",
    title: "Делаем первую покупку",
    body: `Делаем первую покупку
1
Выберите инструмент
Найдите акцию или фонд в каталоге приложения
2
Укажите сумму
Введите количество лотов или сумму покупки
3
Подтвердите
Нажмите кнопку «Купить» и подтвердите операцию
Готово!
Отслеживайте рост актива в вашем портфеле`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s06a_purchase_steps.png", alt: "Делаем первую покупку" }],
    analyticsMeta: { screenName: "s06a_purchase_steps", lessonId: "s06a_purchase_steps" },
  },
  s07_rules_updated: {
    lessonId: "s07_rules_updated",
    title: "Правила",
    body: `Правила
инвестирования
Начинайте с малого
Начинайте с небольших вложений — учитесь на практике без стресса.
Диверсифицируйте
Несколько разных инструментов снижают общий риск портфеля.
Следите за рисками
Не гонитесь за сверхдоходностью, оценивайте возможные потери.
Будьте консервативны
На старте выбирайте надежные инструменты: облигации и ETF.`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s07_rules_updated.png", alt: "Правила" }],
    analyticsMeta: { screenName: "s07_rules_updated", lessonId: "s07_rules_updated" },
  },
  s08_instruments_updated: {
    lessonId: "s08_instruments_updated",
    title: "Выберите инструмент",
    body: `Выберите инструмент
Акции
Доля в бизнесе компании
Потенциально высокий доход
Выше риск колебаний цены
Облигации
Даём в долг под проценты
Стабильный, предсказуемый доход
Низкий риск (особенно ОФЗ)
ETF и ПИФ
Готовая корзина активов
Автоматическая диверсификация
Идеально подходит новичкам`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s08_instruments_updated.png", alt: "Выберите инструмент" }],
    analyticsMeta: { screenName: "s08_instruments_updated", lessonId: "s08_instruments_updated" },
  },
  s09_choice_updated: {
    lessonId: "s09_choice_updated",
    title: "Как выбрать первый инструмент?",
    body: `Как выбрать первый инструмент?
Низкий порог входа
Начать можно с минимальной суммы — от 1 000 ₽.
Прозрачная история
Выбирайте ликвидные активы, которые легко купить и продать.
Для старта подойдут
Надежные инструменты с понятной доходностью.
Рекомендуем:
ОФЗ
Сбер
Газпром
ETF MOEX
Перейти в магазин продуктов`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s09_choice_updated.png", alt: "Как выбрать первый инструмент?" }],
    analyticsMeta: { screenName: "s09_choice_updated", lessonId: "s09_choice_updated" },
  },
  s10_courses: {
    lessonId: "s10_courses",
    title: "Готовы узнать больше?",
    body: `Готовы узнать больше?
Чтобы начать безопасный путь в инвестициях, команда Финам подготовила для вас специальные обучающие курсы.
Быстрый старт
Основы инвестирования
Как торговать акциями?
Работа с акциями
Как торговать облигациями?
Стабильный доход`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s10_courses.png", alt: "Готовы узнать больше?" }],
    analyticsMeta: { screenName: "s10_courses", lessonId: "s10_courses" },
  },
  s11_portfolio_intro: {
    lessonId: "s11_portfolio_intro",
    title: "Раздел 3",
    body: `Раздел 3
Как собрать первый портфель
Создайте сбалансированный набор инвестиций для ваших целей`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s11_portfolio_intro.png", alt: "Раздел 3" }],
    analyticsMeta: { screenName: "s11_portfolio_intro", lessonId: "s11_portfolio_intro" },
  },
  s12_principles: {
    lessonId: "s12_principles",
    title: "Принципы формирования портфеля",
    body: `Принципы формирования портфеля
1
Цель и риск
Определите, чего хотите достичь, срок инвестирования и готовность к риску.
2
Выбор инструментов
Подберите активы под свой профиль: консервативный или агрессивный.
3
Распределение
Разделите капитал между акциями, облигациями и фондами.
4
Ребалансировка
Регулярно восстанавливайте исходные пропорции портфеля.`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s12_principles.png", alt: "Принципы формирования портфеля" }],
    analyticsMeta: { screenName: "s12_principles", lessonId: "s12_principles" },
  },
  s13_structure: {
    lessonId: "s13_structure",
    title: "Образцовая структура портфеля",
    body: `Образцовая структура портфеля
Баланс
50/50
Сердце — Рост
40–50%
Глобальные ETF
Акции лидеров рынка
Потенциал роста капитала
Мозг — Защита
50–60%
ОФЗ (Гособлигации)
Корпоративные облигации
Денежный резерв`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s13_structure.png", alt: "Образцовая структура портфеля" }],
    analyticsMeta: { screenName: "s13_structure", lessonId: "s13_structure" },
  },
  s14_balance: {
    lessonId: "s14_balance",
    title: "Баланс риска и доходности",
    body: `Баланс риска и доходности
Активное
Попытка обогнать рынок за счет частого выбора бумаг.
Потенциально высокая доходность
Требует много времени и знаний
Высокий риск ошибок
VS
Пассивное
Следование за рынком (купил и держи).
Среднерыночная доходность
Минимум времени (1 час в год)
Низкие комиссии и стресс
Совет новичку
Начните с пассивного подхода. Это надежнее и проще для старта.`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s14_balance.png", alt: "Баланс риска и доходности" }],
    analyticsMeta: { screenName: "s14_balance", lessonId: "s14_balance" },
  },
  s14a_portfolio_cta: {
    lessonId: "s14a_portfolio_cta",
    title: "ИТОГИ УРОКА 2",
    body: `ИТОГИ УРОКА 2
Ваш следующий шаг
Вы узнали принципы создания сбалансированного портфеля. Теперь пора применить знания на практике.
💼
Собрать портфель
Перейти в конструктор
Пройти углубленный курс
"Портфельное инвестирование"
Вернуться к выбору темы`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s14a_portfolio_cta.png", alt: "ИТОГИ УРОКА 2" }],
    analyticsMeta: { screenName: "s14a_portfolio_cta", lessonId: "s14a_portfolio_cta" },
  },
  s15_risks_intro: {
    lessonId: "s15_risks_intro",
    title: "Раздел 4",
    body: `Раздел 4
Как избежать рисков
Узнайте, как защитить свои вложения от потерь`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s15_risks_intro.png", alt: "Раздел 4" }],
    analyticsMeta: { screenName: "s15_risks_intro", lessonId: "s15_risks_intro" },
  },
  s16_risk_types: {
    lessonId: "s16_risk_types",
    title: "Возможные риски",
    body: `Возможные риски
Рыночный риск
Стоимость активов может снизиться из-за новостей или кризиса.
Риск ликвидности
Сложности с быстрой продажей актива по выгодной цене.
Кредитный риск
Банкротство компании-эмитента (невозможность вернуть долги).`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s16_risk_types.png", alt: "Возможные риски" }],
    analyticsMeta: { screenName: "s16_risk_types", lessonId: "s16_risk_types" },
  },
  s17_protection: {
    lessonId: "s17_protection",
    title: "Защита от потерь",
    body: `Защита от потерь
Диверсификация
Не кладите все яйца в одну корзину. Распределяйте средства между разными активами.
Ликвидные активы
Держите часть средств в инструментах, которые можно быстро продать без потери стоимости.
Защитные инструменты
Используйте облигации и золото для стабилизации портфеля в периоды турбулентности.`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s17_protection.png", alt: "Защита от потерь" }],
    analyticsMeta: { screenName: "s17_protection", lessonId: "s17_protection" },
  },
  s18_reliable: {
    lessonId: "s18_reliable",
    title: "Надежные инструменты",
    body: `Надежные инструменты
Для новичка надежность важнее высокой доходности. На что смотреть при выборе?
Низкая волатильность
Цена актива меняется плавно, без резких скачков вверх или вниз.
Высокая ликвидность
Возможность быстро продать актив по рыночной цене в любой момент.
Прозрачность
Понятный эмитент (государство или крупная компания) и предсказуемый доход.`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s18_reliable.png", alt: "Надежные инструменты" }],
    analyticsMeta: { screenName: "s18_reliable", lessonId: "s18_reliable" },
  },
  s19_bonds: {
    lessonId: "s19_bonds",
    title: "Гос. и корпоративные облигации",
    body: `Гос. и корпоративные облигации
Государственные
ОФЗ
Эмитент: Минфин РФ
Надежность: Максимальная (гарантия государства)
Доходность: Умеренная, чуть выше инфляции
Корпоративные
Облигации компаний
Эмитент: Газпром, МТС, Сбер и др.
Надежность: Зависит от компании (выбирайте лидеров)
Доходность: Выше, чем у ОФЗ`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s19_bonds.png", alt: "Гос. и корпоративные облигации" }],
    analyticsMeta: { screenName: "s19_bonds", lessonId: "s19_bonds" },
  },
  s20_capital_protection: {
    lessonId: "s20_capital_protection",
    title: "Инструменты с защитой капитала",
    body: `Инструменты с защитой капитала
Потенциальный
доход
100% Защита
капитала
Гарантия возврата
В конце срока вы получаете обратно 100% вложенных средств, даже если рынок упал.
Участие в росте
Если выбранный актив (например, золото или акции) вырастет, вы получите доход.
Структурные продукты: Это готовые решения от Финам, сочетающие надежность депозита и доходность рынка акций.`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s20_capital_protection.png", alt: "Инструменты с защитой капитала" }],
    analyticsMeta: { screenName: "s20_capital_protection", lessonId: "s20_capital_protection" },
  },
  s20a_risks_cta: {
    lessonId: "s20a_risks_cta",
    title: "ИТОГИ УРОКА 3",
    body: `ИТОГИ УРОКА 3
Защитите свои вложения
Самый надежный способ начать инвестировать без стресса — выбрать государственные облигации.
🛡️
ОФЗ
Купить ОФЗ
Самый низкий риск
Изучить управление рисками
Перейти к курсу
Вернуться к выбору темы`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s20a_risks_cta.png", alt: "ИТОГИ УРОКА 3" }],
    analyticsMeta: { screenName: "s20a_risks_cta", lessonId: "s20a_risks_cta" },
  },
  s21_tariff_intro: {
    lessonId: "s21_tariff_intro",
    title: "Раздел 5",
    body: `Раздел 5
Какой тариф выбрать
Подберите оптимальные условия для вашей стратегии`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s21_tariff_intro.png", alt: "Раздел 5" }],
    analyticsMeta: { screenName: "s21_tariff_intro", lessonId: "s21_tariff_intro" },
  },
  s22_tariff_long: {
    lessonId: "s22_tariff_long",
    title: "Тариф «Долгосрочный портфель»",
    body: `Тариф «Долгосрочный портфель»
Выбор новичков
0 ₽
абонентская плата
Бесплатное обслуживание
Платите только комиссию за сделки
Идеально для «Купил и держи»
Выгодно для редких сделок
Отсутствие скрытых платежей
Всё прозрачно и понятно
Оптимальный выбор для старта инвестиций с небольшими суммами.`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s22_tariff_long.png", alt: "Тариф «Долгосрочный портфель»" }],
    analyticsMeta: { screenName: "s22_tariff_long", lessonId: "s22_tariff_long" },
  },
  s23_tariff_strateg: {
    lessonId: "s23_tariff_strateg",
    title: "Тариф «Стратег»",
    body: `Тариф «Стратег»
Идеальный выбор для активной торговли
Стратег
Низкая комиссия
от 0.035% за сделку
Профессиональные терминалы
Quik, Transaq — бесплатно
Выгодное маржинальное кредитование
Рекомендуется при обороте от 500 000 ₽ в месяц`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s23_tariff_strateg.png", alt: "Тариф «Стратег»" }],
    analyticsMeta: { screenName: "s23_tariff_strateg", lessonId: "s23_tariff_strateg" },
  },
  s24_tariff_investor: {
    lessonId: "s24_tariff_investor",
    title: "Тариф «Инвестор»",
    body: `Тариф «Инвестор»
Максимальная простота и удобство
Единая комиссия
Прозрачные условия без сложных расчетов и скрытых списаний.
Удобное приложение
Finam Trade — всё для торговли и анализа в вашем смартфоне.
Доступ ко всем рынкам
Акции, облигации, валюта и фонды на одной платформе.
Отличный старт для тех, кто хочет попробовать всё.`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s24_tariff_investor.png", alt: "Тариф «Инвестор»" }],
    analyticsMeta: { screenName: "s24_tariff_investor", lessonId: "s24_tariff_investor" },
  },
  s25_trust_management: {
    lessonId: "s25_trust_management",
    title: "Не хотите долго разбираться?",
    body: `Не хотите долго разбираться?
Если нет времени на анализ рынка, доверьте управление профессионалам.
Автоследование
Сервис Comon.ru позволяет автоматически копировать сделки успешных трейдеров на вашем счете.
Выбор из 1000+ стратегий
Доверительное управление
Индивидуальные стратегии для крупных капиталов. Управляющий принимает решения за вас.
Полная делегация`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s25_trust_management.png", alt: "Не хотите долго разбираться?" }],
    analyticsMeta: { screenName: "s25_trust_management", lessonId: "s25_trust_management" },
  },
  s25a_tariff_cta: {
    lessonId: "s25a_tariff_cta",
    title: "ИТОГИ УРОКА 4",
    body: `ИТОГИ УРОКА 4
Выберите тариф
Подключите тариф, который подходит под ваш стиль.
Инвестор
Для начинающих
Выбрать
Стратег
Для активных
Выбрать
Долгосрочный
Без абонплаты
Выбрать
Доверительное
Управление
Выбрать
Вернуться к выбору темы`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s25a_tariff_cta.png", alt: "ИТОГИ УРОКА 4" }],
    analyticsMeta: { screenName: "s25a_tariff_cta", lessonId: "s25a_tariff_cta" },
  },
  s26_diversification_intro: {
    lessonId: "s26_diversification_intro",
    title: "Раздел 6",
    body: `Раздел 6
Диверсификация
Золотое правило инвестора: не кладите все яйца в одну корзину`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s26_diversification_intro.png", alt: "Раздел 6" }],
    analyticsMeta: { screenName: "s26_diversification_intro", lessonId: "s26_diversification_intro" },
  },
  s27_what_is_div: {
    lessonId: "s27_what_is_div",
    title: "Что такое диверсификация?",
    body: `Что такое диверсификация?
Это распределение капитала между разными активами для снижения рисков.
«Не кладите все яйца в одну корзину»
Без диверсификации
Купили акции одной компании. Если она обанкротится — вы потеряете всё.
С диверсификацией
Купили акции 5 компаний. Одна упала, но остальные выросли — вы в плюсе.`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s27_what_is_div.png", alt: "Что такое диверсификация?" }],
    analyticsMeta: { screenName: "s27_what_is_div", lessonId: "s27_what_is_div" },
  },
  s28_asset_allocation: {
    lessonId: "s28_asset_allocation",
    title: "Как распределить активы?",
    body: `Как распределить активы?
Двигатель
Акции
Обеспечивают основной рост капитала и обгоняют инфляцию на длинной дистанции.
Подушка
Облигации
Гасят колебания портфеля и приносят стабильный, предсказуемый доход.
Баланс
ETF и ПИФ
Помогают дешево и быстро диверсифицировать портфель по странам и отраслям.`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s28_asset_allocation.png", alt: "Как распределить активы?" }],
    analyticsMeta: { screenName: "s28_asset_allocation", lessonId: "s28_asset_allocation" },
  },
  s29_why_works: {
    lessonId: "s29_why_works",
    title: "Почему это работает?",
    body: `Почему это работает?
Акции упали
Кризис на рынке
+
Золото выросло
Защитный актив
=
Портфель стабилен
Убытки компенсированы
Разная реакция
Разные активы по-разному реагируют на одни и те же события. Когда одни падают, другие часто растут, сохраняя ваши деньги.`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s29_why_works.png", alt: "Почему это работает?" }],
    analyticsMeta: { screenName: "s29_why_works", lessonId: "s29_why_works" },
  },
  s30_example: {
    lessonId: "s30_example",
    title: "Пример портфеля",
    body: `Пример портфеля
Баланс
Акции РФ
50%
Потенциал роста
Сбер
Лукойл
Яндекс
Облигации
40%
Защитная часть
ОФЗ 26238
МТС
Золото / Фонды
10%
Страховка от кризиса
GLDRUB
Фонды`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s30_example.png", alt: "Пример портфеля" }],
    analyticsMeta: { screenName: "s30_example", lessonId: "s30_example" },
  },
  s30a_diversification_cta: {
    lessonId: "s30a_diversification_cta",
    title: "ИТОГИ УРОКА 5",
    body: `ИТОГИ УРОКА 5
Соберите идеальный портфель
Используйте принцип диверсификации, чтобы снизить риски и повысить доходность.
🧩
Собрать портфель
Использовать конструктор
Нужна помощь эксперта?
Получить консультацию
Завершить обучение`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s30a_diversification_cta.png", alt: "ИТОГИ УРОКА 5" }],
    analyticsMeta: { screenName: "s30a_diversification_cta", lessonId: "s30a_diversification_cta" },
  },
  s31_cta: {
    lessonId: "s31_cta",
    title: "Finam",
    body: `Finam
Время действовать!
Инвестиции — это проще, чем кажется. Сделайте первый шаг уже сегодня.
Начать обучение
Открыть брокерский счёт`,
    ctaLabel: null,
    ctaLink: null,
    assets: [{ type: "image", src: "assets/images/s31_cta.png", alt: "Finam" }],
    analyticsMeta: { screenName: "s31_cta", lessonId: "s31_cta" },
  },
  } as Record<LessonId, Lesson>;
  return _LESSON_REGISTRY;
}

export function getBranchLessonById(lessonId: LessonId): Lesson {
  const v = ensureLessonRegistry()[lessonId];
  if (!v) {
    throw new Error(`Missing branch lesson registry entry: ${lessonId}`);
  }
  return v;
}

export function assertBranchConfigIntegrity(): void {
  for (const branchId of Object.keys(BRANCH_LESSONS) as BranchId[]) {
    const list = BRANCH_LESSONS[branchId];
    if (!list.length) throw new Error(`Branch lesson list is empty: ${branchId}`);
  }

  for (const s of Object.keys(BRANCH_BY_SEGMENT_STRATEGY) as Segment[]) {
    for (const st of Object.keys(BRANCH_BY_SEGMENT_STRATEGY[s]) as Strategy[]) {
      const v = BRANCH_BY_SEGMENT_STRATEGY[s][st];
      if (!v) throw new Error(`Missing mapping for segment=${s} strategy=${st}`);
    }
  }
}

export function assertBranchLessonRegistryIntegrity(): void {
  const reg = ensureLessonRegistry();
  for (const branchId of Object.keys(BRANCH_LESSONS) as BranchId[]) {
    for (const lessonId of BRANCH_LESSONS[branchId]) {
      if (!reg[lessonId]) throw new Error(`Branch ${branchId} references missing lessonId: ${lessonId}`);
    }
  }
}

