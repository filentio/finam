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

function getSteps(state: SegmentationState): SegmentationStepConfig[] {
  const steps: SegmentationStepConfig[] = [
    {
      id: "qualified",
      title: "Являетесь ли вы квалифицированным инвестором?",
      subtitle: "Этот ответ влияет на глубину вашего персонального маршрута.",
      options: QUALIFIED_OPTIONS,
    },
  ];

  if (state.qualifiedInvestor === false) {
    steps.push({
      id: "experience",
      title: "Какой у вас опыт инвестирования?",
      subtitle: "Оценим комфортную сложность первых шагов.",
      options: EXPERIENCE_OPTIONS,
    });
  }

  steps.push(
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
  );

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
    // For qualified users experience is hidden; keep a normalized value in the payload.
    experience: state.experience ?? "more_5y",
    segment: state.segment,
    amount_tier: state.amountTier,
    investment_goal: state.goal,
    instruments: state.instruments,
  };
}

export function SegmentationForm({ onComplete }: SegmentationFormProps) {
  const [state, setState] = useState<SegmentationState>(INITIAL_STATE);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
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

  const steps = useMemo(() => getSteps(state), [state]);
  const currentStep = steps[currentStepIndex];
  const canContinue = useMemo(() => getCanContinue(state), [state]);

  useEffect(() => {
    setCurrentStepIndex((prev) => Math.min(prev, Math.max(steps.length - 1, 0)));
  }, [steps.length]);

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

  const handleSubmit = () => {
    const payload = buildPayload(state);
    if (!payload) {
      return;
    }

    trackEvent("segmentation_completed", {
      segment: payload.segment,
      amount_tier: payload.amount_tier,
    });
    trackEvent(`segment_${payload.segment}`, { amount_tier: payload.amount_tier });

    if (!onComplete) {
      navigateToOnboarding(payload.segment, payload.amount_tier);
    }

    onComplete?.(payload);
  };

  const handleNext = () => {
    if (!currentStep) {
      return;
    }

    const lastStep = currentStepIndex === steps.length - 1;
    if (lastStep) {
      handleSubmit();
      return;
    }

    setDirection(1);
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const nextDisabled = currentStep ? !isStepAnswered(currentStep.id) : true;

  return (
    <section className="seg-story">
      <div className="seg-story__progress">
        {steps.map((step, index) => (
          <span
            key={step.id}
            className={`seg-story__progress-segment ${
              index < currentStepIndex
                ? "is-done"
                : index === currentStepIndex
                  ? "is-active"
                  : ""
            }`}
          >
            <span
              className="seg-story__progress-fill"
              style={{
                width:
                  index < currentStepIndex ? "100%" : index === currentStepIndex ? "100%" : "0%",
              }}
            />
          </span>
        ))}
      </div>

      <div className="seg-story__meta">
        <span>
          Вопрос {Math.min(currentStepIndex + 1, steps.length)} из {steps.length}
        </span>
        <strong className={`segment-chip ${state.segment ? "segment-chip--active" : ""}`}>
          {state.segment ?? "не определён"}
        </strong>
      </div>

      {currentStep ? (
        <article
          key={currentStep.id}
          className={`seg-story__screen ${
            direction > 0 ? "seg-story__screen--next" : "seg-story__screen--prev"
          }`}
        >
          <header className="seg-story__header">
            <h2>{currentStep.title}</h2>
            <p>{currentStep.subtitle}</p>
          </header>

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
                <span>{option.label}</span>
                {option.hint ? <small>{option.hint}</small> : null}
              </button>
            ))}
          </div>
        </article>
      ) : null}

      <footer className="seg-story__footer">
        <button
          type="button"
          className="seg-story__back"
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
        >
          Назад
        </button>
        <button
          type="button"
          className="seg-story__next"
          disabled={nextDisabled || (!canContinue && currentStepIndex === steps.length - 1)}
          onClick={handleNext}
        >
          {currentStepIndex === steps.length - 1 ? "Подобрать маршрут" : "Далее"}
        </button>
      </footer>
    </section>
  );
}
