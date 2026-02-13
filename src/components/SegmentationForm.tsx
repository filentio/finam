import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "../analytics/trackEvent";
import { calculateSegment } from "../engine/calculateSegment";
import { navigateToOnboarding } from "../navigation/navigateToOnboarding";
import type {
  AmountTier,
  InvestmentGoal,
  Instrument,
  SegmentationPayload,
  SegmentationState,
} from "../types/segmentation";

interface SegmentationFormProps {
  onComplete?: (payload: SegmentationPayload) => void;
}

const INITIAL_STATE: SegmentationState = {
  qualifiedInvestor: null,
  experience: null,
  amountTier: null,
  goal: null,
  instruments: [],
  segment: null,
};

let segmentationStartedTracked = false;

type SegmentationStepId = "qualified" | "experience" | "amount" | "goal" | "instruments";

interface SegmentationOption {
  value: string;
  label: string;
  hint?: string;
}

interface SegmentationStepConfig {
  id: SegmentationStepId;
  title: string;
  subtitle: string;
  options: SegmentationOption[];
  multiple?: boolean;
}

const QUALIFIED_OPTIONS: SegmentationOption[] = [
  { value: "true", label: "Да, являюсь квалифицированным инвестором" },
  { value: "false", label: "Нет, не являюсь квалифицированным инвестором" },
];

const EXPERIENCE_OPTIONS: SegmentationOption[] = [
  { value: "none", label: "Нет опыта" },
  { value: "less_1y", label: "Менее 1 года" },
  { value: "1_3y", label: "1–3 года" },
  { value: "3_5y", label: "3–5 лет" },
  { value: "more_5y", label: "Более 5 лет" },
];

const AMOUNT_OPTIONS: SegmentationOption[] = [
  { value: "up_to_300k", label: "До 300 000 ₽" },
  { value: "300k_2m", label: "300 000 – 2 млн ₽" },
  { value: "2m_5m", label: "2 – 5 млн ₽" },
  { value: "more_5m", label: "Более 5 млн ₽" },
];

const GOAL_OPTIONS: SegmentationOption[] = [
  { value: "purchase", label: "Накопление" },
  { value: "passive_income", label: "Пассивный доход" },
  { value: "growth", label: "Рост капитала" },
  { value: "preservation", label: "Сохранение" },
];

const INSTRUMENT_OPTIONS: SegmentationOption[] = [
  { value: "etf", label: "ETF" },
  { value: "stocks", label: "Акции" },
  { value: "bonds", label: "Облигации" },
  { value: "trust_management", label: "Доверительное управление" },
  { value: "ipo", label: "IPO" },
  { value: "currency", label: "Валюта" },
];

const PROGRESS_SEGMENTS_TOTAL = 7;

const STEP_PROGRESS_INDEX: Record<SegmentationStepId, number> = {
  qualified: 1,
  experience: 2,
  amount: 3,
  goal: 4,
  instruments: 5,
};

const STEP_BLOCK_TITLE: Record<SegmentationStepId, string> = {
  qualified: "Статус инвестора",
  experience: "Опыт инвестирования",
  amount: "Инвестиционный капитал",
  goal: "Цель инвестирования",
  instruments: "Интересующие инструменты",
};

const SEGMENT_PRESENTATION: Record<
  SegmentationPayload["segment"],
  {
    emoji: string;
    title: string;
    track: string[];
  }
> = {
  novice: {
    emoji: "🌱",
    title: "Новичок",
    track: ["6 уроков", "Анкета риска", "Первая покупка"],
  },
  advanced: {
    emoji: "🚀",
    title: "Обучающийся",
    track: ["3 урока", "Анкета риска", "Первая покупка"],
  },
  expert: {
    emoji: "⚡",
    title: "Квалифицированный инвестор",
    track: ["Анкета риска", "Персональные рекомендации", "Первая покупка"],
  },
};

function getSteps(): SegmentationStepConfig[] {
  const steps: SegmentationStepConfig[] = [
    {
      id: "qualified",
      title: "Являетесь ли вы квалифицированным инвестором?",
      subtitle: "Этот ответ влияет на глубину вашего персонального маршрута.",
      options: QUALIFIED_OPTIONS,
    },
      id: "experience",
      title: "Какой у вас опыт инвестирования?",
      subtitle: "Оценим комфортную сложность первых шагов.",
      options: EXPERIENCE_OPTIONS,
    {
      id: "amount",
      title: "Какую сумму вы планируете инвестировать?",
      subtitle: "Подберём подходящий формат обучения и примеры портфелей.",
      options: AMOUNT_OPTIONS,
    },
    {
      id: "goal",
      title: "Ваша главная инвестиционная цель",
      subtitle: "Контент будет адаптирован под выбранный приоритет.",
      options: GOAL_OPTIONS,
    },
    {
      id: "instruments",
      title: "Какие инструменты вам интересны?",
      subtitle: "Можно выбрать несколько вариантов.",
      options: INSTRUMENT_OPTIONS,
      multiple: true,
    },
  ];

  return steps;
}

function getCanContinue(state: SegmentationState): boolean {
  if (state.qualifiedInvestor === null) {
    return false;
  }

  if (state.amountTier === null || state.goal === null) {
    return false;
  }

  if (state.instruments.length === 0) {
    return false;
  }

  if (state.qualifiedInvestor === false && state.experience === null) {
    return false;
  }

  return state.segment !== null;
}

function buildPayload(state: SegmentationState): SegmentationPayload | null {
  if (!getCanContinue(state) || state.segment === null || state.amountTier === null || state.goal === null) {
    return null;
  }

  return {
    qualified_investor: state.qualifiedInvestor as boolean,
    // Keep payload normalized: qualified users are always sent as expert-level experience.
    experience: state.qualifiedInvestor ? "more_5y" : (state.experience ?? "more_5y"),
    segment: state.segment,
    amount_tier: state.amountTier,
    investment_goal: state.goal,
    instruments: state.instruments,
  };
}

export function SegmentationForm({ onComplete }: SegmentationFormProps) {
  const [state, setState] = useState<SegmentationState>(INITIAL_STATE);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [resultPayload, setResultPayload] = useState<SegmentationPayload | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const startedSentRef = useRef(false);

  useEffect(() => {
    if (startedSentRef.current || segmentationStartedTracked) {
      return;
    }
    startedSentRef.current = true;
    segmentationStartedTracked = true;
    trackEvent("segmentation_started");
  }, []);

  const steps = useMemo(() => getSteps(), []);
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (resultPayload) {
      return;
    }
    setCurrentStepIndex((prev) => {
      const bounded = Math.min(prev, Math.max(steps.length - 1, -1));
      return Math.max(-1, bounded);
    });
  }, [resultPayload, steps.length]);

  const updateState = (patch: Partial<SegmentationState>) => {
    setState((previous) => {
      const next: SegmentationState = {
        ...previous,
        ...patch,
      };
      next.segment = calculateSegment(next.qualifiedInvestor, next.experience);
      return next;
    });
  };

  const handleStepValueChange = (stepId: SegmentationStepId, rawValue: string) => {
    if (stepId === "qualified") {
      const value = rawValue === "true";
      updateState({ qualifiedInvestor: value, experience: value ? null : state.experience });
      return;
    }

    if (stepId === "experience") {
      updateState({ experience: rawValue as SegmentationState["experience"] });
      return;
    }

    if (stepId === "amount") {
      const value = rawValue as AmountTier;
      trackEvent("amount_selected", { amount_tier: value });
      updateState({ amountTier: value });
      return;
    }

    if (stepId === "goal") {
      const value = rawValue as InvestmentGoal;
      trackEvent("goal_selected", { goal: value });
      updateState({ goal: value });
      return;
    }

    if (stepId === "instruments") {
      const instrument = rawValue as Instrument;
      setState((previous) => {
        const exists = previous.instruments.includes(instrument);
        const nextInstruments = exists
          ? previous.instruments.filter((item) => item !== instrument)
          : [...previous.instruments, instrument];

        const next: SegmentationState = {
          ...previous,
          instruments: nextInstruments,
        };
        next.segment = calculateSegment(next.qualifiedInvestor, next.experience);
        return next;
      });
    }
  };

  const isStepAnswered = (stepId: SegmentationStepId): boolean => {
    if (stepId === "qualified") {
      return state.qualifiedInvestor !== null;
    }
    if (stepId === "experience") {
      return state.experience !== null;
    }
    if (stepId === "amount") {
      return state.amountTier !== null;
    }
    if (stepId === "goal") {
      return state.goal !== null;
    }
    return state.instruments.length > 0;
  };

  const isOptionSelected = (stepId: SegmentationStepId, optionValue: string): boolean => {
    if (stepId === "qualified") {
      return String(state.qualifiedInvestor) === optionValue;
    }
    if (stepId === "experience") {
      return state.experience === optionValue;
    }
    if (stepId === "amount") {
      return state.amountTier === optionValue;
    }
    if (stepId === "goal") {
      return state.goal === optionValue;
    }
    return state.instruments.includes(optionValue as Instrument);
  };

  const handleOpenResult = () => {
    const payload = buildPayload(state);
    if (!payload) {
      return;
    }

    trackEvent("segmentation_completed", {
      segment: payload.segment,
      amount_tier: payload.amount_tier,
    });
    trackEvent(`segment_${payload.segment}`, { amount_tier: payload.amount_tier });

    setDirection(1);
    setResultPayload(payload);
  };

  const handleStartOnboarding = () => {
    if (!resultPayload) {
      return;
    }
    if (!onComplete) {
      navigateToOnboarding(resultPayload.segment, resultPayload.amount_tier);
    }

    onComplete?.(resultPayload);
  };

  const handleNext = () => {
    if (currentStepIndex === -1) {
      setDirection(1);
      setCurrentStepIndex(0);
      return;
    }

    if (!currentStep) {
      return;
    }

    const lastStep = currentStepIndex === steps.length - 1;
    if (lastStep) {
      handleOpenResult();
      return;
    }

    setDirection(1);
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleReset = () => {
    setState(INITIAL_STATE);
    setResultPayload(null);
    setDirection(-1);
    setCurrentStepIndex(-1);
  };

  const showIntro = currentStepIndex === -1 && !resultPayload;
  const showResult = Boolean(resultPayload);
  const showQuestion = Boolean(currentStep) && !showIntro && !showResult;
  const nextDisabled = currentStep ? !isStepAnswered(currentStep.id) : true;
  const progressIndex = showResult
    ? PROGRESS_SEGMENTS_TOTAL - 1
    : showIntro
      ? 0
      : currentStep
        ? STEP_PROGRESS_INDEX[currentStep.id]
        : 0;
  const progressLabel = `${progressIndex + 1}/${PROGRESS_SEGMENTS_TOTAL}`;
  const segmentView = resultPayload ? SEGMENT_PRESENTATION[resultPayload.segment] : null;
  const questionScreenKey = currentStep ? `question-${currentStep.id}` : "question-empty";

  return (
    <section className="seg-story">
      <div className="seg-story__frame">
        <header className="seg-story__top">
          <button
            type="button"
            className="seg-story__close"
            onClick={handleReset}
            aria-label="Сбросить анкету"
          >
            ×
          </button>
          <span className="seg-story__counter">{progressLabel}</span>
        </header>

        <div className="seg-story__progress">
          {Array.from({ length: PROGRESS_SEGMENTS_TOTAL }).map((_, index) => (
            <span
              key={index}
              className={`seg-story__progress-segment ${
                index <= progressIndex ? "is-done" : ""
              }`}
            />
          ))}
        </div>

        {showIntro ? (
          <article
            key="intro"
            className={`seg-story__screen ${
              direction > 0 ? "seg-story__screen--next" : "seg-story__screen--prev"
            } seg-story__screen--intro`}
          >
            <div className="seg-story__intro-emoji">👋</div>
            <h1 className="seg-story__intro-title">Добро пожаловать!</h1>
            <p className="seg-story__intro-subtitle">
              Ответьте на 5 вопросов, чтобы мы подобрали для вас подходящий путь обучения
            </p>
            <section className="seg-story__intro-card">
              <ul className="seg-story__intro-benefits">
                <li>
                  <span>✓</span>
                  <span>Определим ваш опыт</span>
                </li>
                <li>
                  <span>✓</span>
                  <span>Подберём уроки</span>
                </li>
                <li>
                  <span>✓</span>
                  <span>Порекомендуем инструменты</span>
                </li>
              </ul>
            </section>
            <p className="seg-story__intro-time">Это займёт 2 минуты</p>
            <button type="button" className="seg-story__ghost-btn" onClick={handleNext}>
              Начать →
            </button>
          </article>
        ) : null}

        {showQuestion && currentStep ? (
          <article
            key={questionScreenKey}
            className={`seg-story__screen ${
              direction > 0 ? "seg-story__screen--next" : "seg-story__screen--prev"
            }`}
          >
            <div className="seg-story__question-content">
              <p className="seg-story__block-title">{STEP_BLOCK_TITLE[currentStep.id]}</p>
              <h2 className="seg-story__question-title">{currentStep.title}</h2>
              {currentStep.multiple ? (
                <p className="seg-story__question-subtitle">{currentStep.subtitle}</p>
              ) : null}

              <div className="seg-story__options">
                {currentStep.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`seg-story__option ${
                      isOptionSelected(currentStep.id, option.value) ? "is-selected" : ""
                    }`}
                    onClick={() => handleStepValueChange(currentStep.id, option.value)}
                  >
                    {currentStep.multiple ? (
                      <span className="seg-story__multi-mark">
                        {isOptionSelected(currentStep.id, option.value) ? "✓" : "☐"}
                      </span>
                    ) : null}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <footer className="seg-story__footer">
              <button
                type="button"
                className="seg-story__ghost-btn"
                disabled={nextDisabled}
                onClick={handleNext}
              >
                Далее →
              </button>
            </footer>
          </article>
        ) : null}

        {showResult && resultPayload && segmentView ? (
          <article
            key="result"
            className={`seg-story__screen ${
              direction > 0 ? "seg-story__screen--next" : "seg-story__screen--prev"
            } seg-story__screen--result`}
          >
            <div className="seg-story__result-emoji">🎉</div>
            <h1 className="seg-story__result-title">Ваш путь определён</h1>
            <section className="seg-story__result-card">
              <div className="seg-story__result-badge">
                <span>{segmentView.emoji}</span>
                <span>{segmentView.title}</span>
              </div>
              <p className="seg-story__result-description">
                Мы подготовили для вас пошаговую программу обучения
              </p>
              <div className="seg-story__result-track">
                <h3>Что вас ждёт:</h3>
                {segmentView.track.map((item, index) => (
                  <div key={item} className="seg-story__result-track-item">
                    <span>{index === 0 ? "📚" : index === 1 ? "🎯" : "💼"}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
            <button
              type="button"
              className="seg-story__ghost-btn"
              onClick={handleStartOnboarding}
            >
              Начать обучение →
            </button>
          </article>
        ) : null}
      </div>
    </section>
  );
}
