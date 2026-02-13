import { useEffect, useMemo, useRef, useState } from "react";
import { OnboardingProvider, useOnboardingContext } from "./OnboardingContext";
import { calculateTariffCosts, CALCULATOR_DEFAULTS } from "./data/tariffs";
import { RISK_QUIZ_QUESTIONS } from "./data/riskQuiz";
import { useAnalytics, ANALYTICS_EVENTS } from "./hooks/useAnalytics";
import { getVisibleScreens } from "./hooks/useOnboardingState";
import { usePersonalization } from "./hooks/usePersonalization";
import { normalizeDOSInput } from "./hooks/useSegmentation";
import { OnboardingLayout, type TransitionPreset } from "./components/OnboardingLayout";
import { HeroScreen } from "./screens/HeroScreen";
import { ContentScreen } from "./screens/ContentScreen";
import { StepsScreen } from "./screens/StepsScreen";
import { CardsScreen } from "./screens/CardsScreen";
import { QuizScreen } from "./screens/QuizScreen";
import { CTAScreen } from "./screens/CTAScreen";
import { PortfolioScreen } from "./screens/PortfolioScreen";
import { SpectrumScreen } from "./screens/SpectrumScreen";
import { TariffScreen } from "./screens/TariffScreen";
import { CalculatorScreen } from "./screens/CalculatorScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { RoutePreparationScreen } from "./screens/RoutePreparationScreen";
import type {
  DOSInput,
  ProgressInfo,
  ScreenConfig,
  StepType,
  TrackStep,
} from "./types/onboarding";
import "./onboarding.css";

interface OnboardingProps {
  userId: string;
  dosInput: Partial<DOSInput>;
  onComplete?: () => void;
}

const OWN_CTA_SCREEN_TYPES = new Set<ScreenConfig["type"]>(["quiz", "cta"]);

const LESSON_BACKGROUNDS: Record<string, string> = {
  lesson_1: "linear-gradient(180deg, rgba(217, 119, 6, 0.9) 0%, #1a1a1a 100%)",
  lesson_2: "linear-gradient(180deg, rgba(220, 38, 38, 0.9) 0%, #1a1a1a 100%)",
  lesson_3: "linear-gradient(180deg, rgba(79, 70, 229, 0.9) 0%, #1a1a1a 100%)",
  lesson_4: "linear-gradient(180deg, rgba(20, 184, 166, 0.9) 0%, #1a1a1a 100%)",
  lesson_5: "linear-gradient(180deg, rgba(30, 64, 175, 0.9) 0%, #1a1a1a 100%)",
  lesson_6: "linear-gradient(180deg, rgba(124, 58, 237, 0.9) 0%, #1a1a1a 100%)",
};

const STEP_BACKGROUNDS: Record<StepType, string> = {
  lesson: "linear-gradient(180deg, rgba(26, 86, 219, 0.9) 0%, #1a1a1a 100%)",
  risk_quiz: "linear-gradient(180deg, rgba(185, 28, 28, 0.9) 0%, #1a1a1a 100%)",
  risk_result: "linear-gradient(180deg, rgba(5, 150, 105, 0.9) 0%, #1a1a1a 100%)",
  first_purchase: "linear-gradient(180deg, rgba(8, 145, 178, 0.9) 0%, #1a1a1a 100%)",
  personal_recommendations:
    "linear-gradient(180deg, rgba(124, 58, 237, 0.9) 0%, #1a1a1a 100%)",
};

function getStepBackground(step: TrackStep | undefined): string {
  if (!step) {
    return STEP_BACKGROUNDS.lesson;
  }

  if (step.type === "lesson" && step.lesson_id) {
    return LESSON_BACKGROUNDS[step.lesson_id] ?? STEP_BACKGROUNDS.lesson;
  }

  return STEP_BACKGROUNDS[step.type];
}

function getDisplayProgress(progress: ProgressInfo, routePreparationDone: boolean): ProgressInfo {
  if (progress.totalSteps === 0) {
    return progress;
  }

  const totalSteps = progress.totalSteps + 1;

  if (!routePreparationDone) {
    return {
      ...progress,
      totalSteps,
      completedSteps: 0,
      currentStepIndex: 0,
      currentStepProgress: 0,
      overallProgress: 0,
      currentStepLabel: "Подготовка маршрута",
    };
  }

  const overallProgress = (progress.currentStepIndex + 1 + progress.currentStepProgress) / totalSteps;

  return {
    ...progress,
    totalSteps,
    completedSteps: Math.min(totalSteps, progress.completedSteps + 1),
    currentStepIndex: progress.currentStepIndex + 1,
    currentStepProgress: progress.currentStepProgress,
    overallProgress,
  };
}

function OnboardingFlow({ userId, dosInput, onComplete }: OnboardingProps) {
  const {
    state,
    progress,
    dispatch,
    startOnboarding,
    nextScreen,
    prevScreen,
    pauseOnboarding,
  } = useOnboardingContext();
  const { track } = useAnalytics(
    state.user_id
      ? {
          userId: state.user_id,
          segment: state.segment,
          amountTier: state.amount_tier,
        }
      : undefined,
  );
  const { getPortfolio, getGoalOverlay } = usePersonalization();
  const startedTrackedRef = useRef(false);
  const completedTrackedRef = useRef(false);
  const lastViewedScreenRef = useRef<string | null>(null);
  const [routePreparationDone, setRoutePreparationDone] = useState(false);
  const [transition, setTransition] = useState<{
    preset: TransitionPreset;
    direction: 1 | -1;
    key: number;
  }>({
    preset: "screen_to_screen",
    direction: 1,
    key: 0,
  });
  const previousPositionRef = useRef<{
    stepIndex: number;
    screenIndex: number;
    stepType: StepType | null;
  }>({
    stepIndex: -1,
    screenIndex: -1,
    stepType: null,
  });

  useEffect(() => {
    if (state.status !== "not_started") {
      return;
    }
    startOnboarding(userId, normalizeDOSInput(dosInput));
  }, [dosInput, startOnboarding, state.status, userId]);

  useEffect(() => {
    if (state.status === "in_progress" && state.user_id && !startedTrackedRef.current) {
      startedTrackedRef.current = true;
      track(ANALYTICS_EVENTS.ONBOARDING_STARTED, {
        goal: state.dos_input.investment_goal,
        instruments: state.dos_input.instruments,
      });
    }
  }, [
    state.dos_input.instruments,
    state.dos_input.investment_goal,
    state.status,
    state.user_id,
    track,
  ]);

  useEffect(() => {
    if (state.status === "completed" && !completedTrackedRef.current) {
      completedTrackedRef.current = true;
      track(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
        completed_lessons: state.completed_lessons,
        total_time_sec: state.total_time_sec,
      });
      onComplete?.();
    }
  }, [onComplete, state, track]);

  const currentStep = state.track[state.current_step_index];
  const screens = useMemo(
    () => (currentStep ? getVisibleScreens(currentStep, state) : []),
    [currentStep, state],
  );
  const currentScreen = screens[state.current_screen_index] ?? null;
  const displayProgress = useMemo(
    () => getDisplayProgress(progress, routePreparationDone),
    [progress, routePreparationDone],
  );
  const stepBackground = getStepBackground(currentStep);

  useEffect(() => {
    if (state.status === "not_started") {
      setRoutePreparationDone(false);
      previousPositionRef.current = { stepIndex: -1, screenIndex: -1, stepType: null };
      lastViewedScreenRef.current = null;
    }
  }, [state.status]);

  useEffect(() => {
    if (!routePreparationDone || state.status !== "in_progress") {
      return;
    }

    const nextStepType = state.track[state.current_step_index]?.type ?? null;
    const previous = previousPositionRef.current;
    if (
      previous.stepIndex === -1 &&
      previous.screenIndex === -1 &&
      previous.stepType === null
    ) {
      previousPositionRef.current = {
        stepIndex: state.current_step_index,
        screenIndex: state.current_screen_index,
        stepType: nextStepType,
      };
      return;
    }

    if (
      previous.stepIndex === state.current_step_index &&
      previous.screenIndex === state.current_screen_index
    ) {
      return;
    }

    const movedForward =
      state.current_step_index > previous.stepIndex ||
      (state.current_step_index === previous.stepIndex &&
        state.current_screen_index > previous.screenIndex);
    const direction: 1 | -1 = movedForward ? 1 : -1;

    let preset: TransitionPreset = "screen_to_screen";
    if (state.current_step_index !== previous.stepIndex) {
      if (nextStepType === "risk_quiz") {
        preset = "quiz_enter";
      } else if (nextStepType === "risk_result") {
        preset = "result_enter";
      } else {
        preset = "lesson_to_lesson";
      }
    }

    setTransition((prevTransition) => ({
      preset,
      direction,
      key: prevTransition.key + 1,
    }));

    previousPositionRef.current = {
      stepIndex: state.current_step_index,
      screenIndex: state.current_screen_index,
      stepType: nextStepType,
    };
  }, [
    routePreparationDone,
    state.current_screen_index,
    state.current_step_index,
    state.status,
    state.track,
  ]);

  useEffect(() => {
    if (!routePreparationDone || !currentScreen || state.status !== "in_progress") {
      return;
    }

    const viewKey = `${state.current_step_index}:${currentScreen.screen_id}`;
    if (lastViewedScreenRef.current === viewKey) {
      return;
    }
    lastViewedScreenRef.current = viewKey;

    track(ANALYTICS_EVENTS.LESSON_SCREEN_VIEWED, {
      step_type: currentStep?.type,
      lesson_id: currentStep?.lesson_id,
      screen_id: currentScreen.screen_id,
    });
  }, [
    currentScreen,
    currentStep?.lesson_id,
    currentStep?.type,
    routePreparationDone,
    state.current_step_index,
    state.status,
    track,
  ]);

  useEffect(() => {
    if (
      state.status !== "in_progress" ||
      !routePreparationDone ||
      !currentStep ||
      screens.length > 0
    ) {
      return;
    }

    dispatch({ type: "NEXT_STEP" });
  }, [currentStep, dispatch, routePreparationDone, screens.length, state.status]);

  const calculatorOutput = useMemo(() => {
    const defaults = CALCULATOR_DEFAULTS[state.segment];
    const portfolioAmountMap = {
      starter: 30_000,
      base: 500_000,
      extended: 2_000_000,
      premium: 5_000_000,
    } as const;

    const portfolioAmount = portfolioAmountMap[state.amount_tier];
    const tradesPerMonth = defaults.trades_per_month ?? 2;

    return calculateTariffCosts({
      portfolio_amount: portfolioAmount,
      trades_per_month: tradesPerMonth,
      avg_trade_amount: portfolioAmount / 10,
    });
  }, [state.amount_tier, state.segment]);

  const handleNext = () => nextScreen();
  const handlePrev = () => prevScreen();

  const renderScreen = (screen: ScreenConfig) => {
    const commonProps = {
      screen,
      onNext: handleNext,
      onPrev: handlePrev,
    };

    switch (screen.type) {
      case "hero":
        return <HeroScreen {...commonProps} />;
      case "content":
        return <ContentScreen {...commonProps} />;
      case "steps":
        return <StepsScreen {...commonProps} />;
      case "cards":
        return (
          <CardsScreen
            {...commonProps}
            highlightedInstruments={state.dos_input.instruments}
          />
        );
      case "quiz": {
        const question = RISK_QUIZ_QUESTIONS[state.current_screen_index];
        if (!question) {
          return <ContentScreen {...commonProps} />;
        }
        const isLastQuestion = state.current_screen_index === RISK_QUIZ_QUESTIONS.length - 1;
        return (
          <QuizScreen
            {...commonProps}
            question={question}
            onAnswer={(answer) => {
              dispatch({ type: "SUBMIT_RISK_ANSWER", payload: answer });
            }}
            onNext={() => {
              if (isLastQuestion) {
                dispatch({ type: "COMPLETE_RISK_QUIZ" });
              }
              handleNext();
            }}
          />
        );
      }
      case "cta":
        return <CTAScreen {...commonProps} />;
      case "portfolio":
        return (
          <PortfolioScreen
            {...commonProps}
            portfolio={getPortfolio()}
            overlay={getGoalOverlay()}
          />
        );
      case "spectrum":
        return <SpectrumScreen {...commonProps} />;
      case "tariff":
        return <TariffScreen {...commonProps} />;
      case "calculator":
        return <CalculatorScreen {...commonProps} calculatorOutput={calculatorOutput} />;
      case "result":
        return <ResultScreen {...commonProps} riskResult={state.risk_quiz_result} />;
      default:
        return <ContentScreen {...commonProps} />;
    }
  };

  if (state.status === "not_started") {
    return (
      <div className="ob-layout-root">
        <section className="ob-layout-frame">
          <div className="ob-layout-safe">
            <p className="ob-screen__subtitle">Подготовка персонального онбординга...</p>
          </div>
        </section>
      </div>
    );
  }

  if (state.status === "paused") {
    return (
      <div className="ob-layout-root">
        <section className="ob-layout-frame">
          <div className="ob-layout-safe">
            <section className="ob-route-prep">
              <div className="ob-route-prep__icon">⏸️</div>
              <h2>Обучение на паузе</h2>
              <p>Продолжим с того же места, где вы остановились.</p>
              <button type="button" onClick={() => dispatch({ type: "RESUME" })}>
                Продолжить
              </button>
            </section>
          </div>
        </section>
      </div>
    );
  }

  if (state.status === "completed") {
    return (
      <div className="ob-layout-root">
        <section className="ob-layout-frame" style={{ background: STEP_BACKGROUNDS.first_purchase }}>
          <div className="ob-layout-safe">
            <section className="ob-route-prep">
              <div className="ob-route-prep__icon">✅</div>
              <h2>Маршрут завершён</h2>
              <p>Вы прошли онбординг. Можно перейти к первому действию в приложении.</p>
            </section>
          </div>
        </section>
      </div>
    );
  }

  const canRenderMainScreen = Boolean(currentScreen && routePreparationDone);
  const screenHasOwnCTA = currentScreen ? OWN_CTA_SCREEN_TYPES.has(currentScreen.type) : false;
  const showFooter = canRenderMainScreen && !screenHasOwnCTA;
  const enableTapNavigation = canRenderMainScreen && !screenHasOwnCTA;
  const isLastScreenInStep = screens.length > 0 && state.current_screen_index >= screens.length - 1;
  const isLastStep = state.current_step_index >= state.track.length - 1;
  const nextLabel =
    isLastStep && isLastScreenInStep
      ? "Завершить маршрут"
      : isLastScreenInStep
        ? "Завершить шаг"
        : "Далее";
  const emphasizeNext = currentStep?.type === "first_purchase";

  if (!routePreparationDone) {
    return (
      <OnboardingLayout
        progress={displayProgress}
        stepLabel="Подготовка маршрута"
        background={stepBackground}
        transitionPreset="lesson_to_lesson"
        direction={1}
        transitionKey={`route-prep-${transition.key}`}
        onClose={pauseOnboarding}
        onPrev={() => undefined}
        onNext={() => {
          setTransition((prevTransition) => ({
            preset: "lesson_to_lesson",
            direction: 1,
            key: prevTransition.key + 1,
          }));
          previousPositionRef.current = {
            stepIndex: state.current_step_index,
            screenIndex: state.current_screen_index,
            stepType: currentStep?.type ?? null,
          };
          setRoutePreparationDone(true);
        }}
        showFooter={false}
        enableTapNavigation={false}
      >
        <RoutePreparationScreen
          segment={state.segment}
          onStart={() => {
            setTransition((prevTransition) => ({
              preset: "lesson_to_lesson",
              direction: 1,
              key: prevTransition.key + 1,
            }));
            previousPositionRef.current = {
              stepIndex: state.current_step_index,
              screenIndex: state.current_screen_index,
              stepType: currentStep?.type ?? null,
            };
            setRoutePreparationDone(true);
          }}
        />
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      progress={displayProgress}
      stepLabel={displayProgress.currentStepLabel}
      background={stepBackground}
      transitionPreset={transition.preset}
      direction={transition.direction}
      transitionKey={`${transition.key}:${state.current_step_index}:${state.current_screen_index}`}
      onClose={pauseOnboarding}
      onPrev={handlePrev}
      onNext={handleNext}
      nextLabel={nextLabel}
      nextDisabled={!canRenderMainScreen}
      showFooter={showFooter}
      enableTapNavigation={enableTapNavigation}
      emphasizeNext={emphasizeNext}
    >
      {currentScreen ? renderScreen(currentScreen) : null}
    </OnboardingLayout>
  );
}

export function Onboarding(props: OnboardingProps) {
  return (
    <OnboardingProvider>
      <OnboardingFlow {...props} />
    </OnboardingProvider>
  );
}
