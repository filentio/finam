import { useEffect, useMemo, useRef, useState } from "react";
import { OnboardingProvider, useOnboardingContext } from "./OnboardingContext";
import { calculateTariffCosts, CALCULATOR_DEFAULTS } from "./data/tariffs";
import { RISK_QUIZ_QUESTIONS } from "./data/riskQuiz";
import { calculateRiskProfile } from "./hooks/useRiskScoring";
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
import { QuizIntroScreen } from "./screens/QuizIntroScreen";
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

const OWN_CTA_SCREEN_TYPES = new Set<ScreenConfig["type"]>(["cta"]);
const QUIZ_TOTAL_SEGMENTS = 6;
const QUIZ_GRADIENT = "var(--finam-bg-primary)";
const TAP_HINT_STORAGE_KEY = "finam_onboarding_tip_shown";

const LESSON_BACKGROUNDS: Record<string, string> = {
  lesson_1: "var(--finam-bg-primary)",
  lesson_2: "var(--finam-bg-primary)",
  lesson_3: "var(--finam-bg-primary)",
  lesson_4: "var(--finam-bg-primary)",
  lesson_5: "var(--finam-bg-primary)",
  lesson_6: "var(--finam-bg-primary)",
};

const STEP_BACKGROUNDS: Record<StepType, string> = {
  lesson: "var(--finam-bg-primary)",
  risk_quiz: QUIZ_GRADIENT,
  risk_result: QUIZ_GRADIENT,
  first_purchase: "var(--finam-bg-primary)",
  personal_recommendations: "var(--finam-bg-primary)",
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
  if (!routePreparationDone || progress.totalSteps === 0) {
    return progress;
  }
  return progress;
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
  const [routePreparationDone, setRoutePreparationDone] = useState(true);
  const [tipShown, setTipShown] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(TAP_HINT_STORAGE_KEY) === "1";
  });
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
    if (state.status !== "not_started" && state.user_id === userId) {
      return;
    }
    startOnboarding(userId, normalizeDOSInput(dosInput));
  }, [dosInput, startOnboarding, state.status, state.user_id, userId]);

  useEffect(() => {
    if (tipShown || state.current_screen_index <= 0) {
      return;
    }
    setTipShown(true);
    window.localStorage.setItem(TAP_HINT_STORAGE_KEY, "1");
  }, [state.current_screen_index, tipShown]);

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
      setRoutePreparationDone(true);
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

    const isRiskQuizStep = currentStep?.type === "risk_quiz";
    const isRiskResultStep = currentStep?.type === "risk_result";

    if (isRiskQuizStep && state.current_screen_index === 0) {
      track(ANALYTICS_EVENTS.RISK_QUIZ_STARTED, {
        screen_number: 1,
      });
      return;
    }

    if (isRiskQuizStep && state.current_screen_index > 0) {
      const question = RISK_QUIZ_QUESTIONS[state.current_screen_index - 1];
      if (question) {
        track(ANALYTICS_EVENTS.RISK_QUIZ_QUESTION_VIEWED, {
          question_id: question.id,
          screen_number: state.current_screen_index + 1,
        });
      }
      return;
    }

    if (isRiskResultStep && state.risk_quiz_result) {
      track(ANALYTICS_EVENTS.RISK_QUIZ_RESULT_VIEWED, {
        final_profile: state.risk_quiz_result.final_profile,
        allocation: state.risk_quiz_result.allocation,
      });
      return;
    }

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
    state.current_screen_index,
    state.risk_quiz_result,
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

  const isRiskQuizStep = currentStep?.type === "risk_quiz";
  const isRiskResultStep = currentStep?.type === "risk_result";
  const quizSegmentIndex = isRiskQuizStep
    ? state.current_screen_index
    : isRiskResultStep
      ? QUIZ_TOTAL_SEGMENTS - 1
      : -1;
  const currentQuizQuestion =
    isRiskQuizStep && state.current_screen_index > 0
      ? RISK_QUIZ_QUESTIONS[state.current_screen_index - 1] ?? null
      : null;
  const selectedQuizAnswer = currentQuizQuestion
    ? state.risk_quiz_result?.answers.find(
        (answer) => answer.question_id === currentQuizQuestion.id,
      )
    : undefined;

  const handleNext = () => {
    if (!currentStep) {
      nextScreen();
      return;
    }

    if (currentStep.type === "risk_quiz") {
      if (state.current_screen_index === 0) {
        track(ANALYTICS_EVENTS.RISK_QUIZ_INTRO_COMPLETED);
        nextScreen();
        return;
      }

      const question = RISK_QUIZ_QUESTIONS[state.current_screen_index - 1];
      if (!question) {
        return;
      }
      const selectedAnswer = state.risk_quiz_result?.answers.find(
        (answer) => answer.question_id === question.id,
      );
      if (!selectedAnswer) {
        return;
      }

      track(ANALYTICS_EVENTS.RISK_QUIZ_ANSWER_SUBMITTED, {
        question_id: question.id,
        selected_option: selectedAnswer.selected_option,
        score: selectedAnswer.score,
      });

      const isLastQuestion = state.current_screen_index === RISK_QUIZ_QUESTIONS.length;
      if (isLastQuestion) {
        const answers = state.risk_quiz_result?.answers ?? [];
        const result = calculateRiskProfile(state.dos_input, answers);
        dispatch({ type: "COMPLETE_RISK_QUIZ" });
        track(ANALYTICS_EVENTS.RISK_QUIZ_COMPLETED, {
          total_score: result.total_score,
          raw_profile: result.raw_profile,
          final_profile: result.final_profile,
          total_time_sec: state.total_time_sec,
        });
      }

      nextScreen();
      return;
    }

    if (currentStep.type === "risk_result") {
      track(ANALYTICS_EVENTS.RISK_QUIZ_CONTINUE_CLICKED, {
        final_profile: state.risk_quiz_result?.final_profile ?? "conservative",
      });
      nextScreen();
      return;
    }

    nextScreen();
  };

  const handlePrev = () => {
    if (isRiskQuizStep && state.current_screen_index === 0) {
      return;
    }
    prevScreen();
  };

  const renderScreen = (screen: ScreenConfig) => {
    const commonProps = {
      screen,
      onNext: handleNext,
      onPrev: handlePrev,
    };

    switch (screen.type) {
      case "quiz_intro":
        return <QuizIntroScreen />;
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
        if (!currentQuizQuestion) {
          return <ContentScreen {...commonProps} />;
        }
        return (
          <QuizScreen
            {...commonProps}
            question={currentQuizQuestion}
            selectedOptionId={selectedQuizAnswer?.selected_option}
            onSelectOption={(answer) => {
              dispatch({ type: "SUBMIT_RISK_ANSWER", payload: answer });
              track(ANALYTICS_EVENTS.RISK_QUIZ_ANSWER_SELECTED, {
                question_id: answer.question_id,
                selected_option: answer.selected_option,
                score: answer.score,
              });
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
              <button type="button" className="btn-primary" onClick={() => dispatch({ type: "RESUME" })}>
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
              <div className="ob-complete-check" aria-hidden="true">
                ✓
              </div>
              <h2>Маршрут завершён</h2>
              <p>Вы прошли онбординг. Можно перейти к первому действию в приложении.</p>
            </section>
          </div>
        </section>
      </div>
    );
  }

  const canRenderMainScreen = Boolean(currentScreen && routePreparationDone);
  const isRiskQuizFlow = isRiskQuizStep || isRiskResultStep;
  const quizQuestionScreenActive = isRiskQuizStep && state.current_screen_index > 0;
  const quizNextDisabled = quizQuestionScreenActive && !selectedQuizAnswer;
  const layoutProgress: ProgressInfo =
    !isRiskQuizFlow || quizSegmentIndex < 0
      ? displayProgress
      : {
          ...displayProgress,
          totalSteps: QUIZ_TOTAL_SEGMENTS,
          completedSteps: Math.max(0, Math.min(quizSegmentIndex, QUIZ_TOTAL_SEGMENTS - 1)),
          currentStepIndex: Math.max(0, Math.min(quizSegmentIndex, QUIZ_TOTAL_SEGMENTS - 1)),
          currentStepProgress: 1,
          overallProgress:
            (Math.max(0, Math.min(quizSegmentIndex, QUIZ_TOTAL_SEGMENTS - 1)) + 1) /
            QUIZ_TOTAL_SEGMENTS,
          currentStepLabel: `${Math.max(0, Math.min(quizSegmentIndex, QUIZ_TOTAL_SEGMENTS - 1)) + 1}/${QUIZ_TOTAL_SEGMENTS}`,
        };
  const layoutStepLabel =
    isRiskQuizFlow && quizSegmentIndex >= 0
      ? `${quizSegmentIndex + 1}/${QUIZ_TOTAL_SEGMENTS}`
      : displayProgress.currentStepLabel;
  const screenHasOwnCTA = currentScreen ? OWN_CTA_SCREEN_TYPES.has(currentScreen.type) : false;
  const showFooter = canRenderMainScreen && !screenHasOwnCTA;
  const enableTapNavigation = canRenderMainScreen && !screenHasOwnCTA && !isRiskQuizFlow;
  const isLastScreenInStep = screens.length > 0 && state.current_screen_index >= screens.length - 1;
  const isLastStep = state.current_step_index >= state.track.length - 1;
  const nextLabel = isRiskQuizStep
    ? state.current_screen_index === 0
      ? "Начать анкету →"
      : "Далее →"
    : isRiskResultStep
      ? "Продолжить обучение →"
      : isLastStep && isLastScreenInStep
        ? "Завершить маршрут"
        : isLastScreenInStep
          ? "Завершить шаг"
          : "Далее";
  const emphasizeNext = currentStep?.type === "first_purchase";
  const nextDisabled = !canRenderMainScreen || quizNextDisabled;

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
        showTapHint={false}
        quizMode={false}
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

  if (routePreparationDone && !currentScreen) {
    return (
      <OnboardingLayout
        progress={layoutProgress}
        stepLabel={layoutStepLabel}
        background={stepBackground}
        transitionPreset={transition.preset}
        direction={transition.direction}
        transitionKey={`${transition.key}:fallback`}
        onClose={pauseOnboarding}
        onPrev={handlePrev}
        onNext={() => dispatch({ type: "NEXT_STEP" })}
        nextLabel="Продолжить"
        nextDisabled={false}
        showFooter
        enableTapNavigation={false}
        emphasizeNext={false}
        showTapHint={false}
        quizMode={isRiskQuizFlow}
      >
        <section className="ob-route-prep">
          <div className="ob-route-prep__icon">⚠️</div>
          <h2>Экран временно недоступен</h2>
          <p>Перейдём к следующему шагу маршрута.</p>
        </section>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      progress={layoutProgress}
      stepLabel={layoutStepLabel}
      background={stepBackground}
      transitionPreset={transition.preset}
      direction={transition.direction}
      transitionKey={`${transition.key}:${state.current_step_index}:${state.current_screen_index}`}
      onClose={pauseOnboarding}
      onPrev={handlePrev}
      onNext={handleNext}
      nextLabel={nextLabel}
      nextDisabled={nextDisabled}
      showFooter={showFooter}
      enableTapNavigation={enableTapNavigation}
      emphasizeNext={emphasizeNext}
      showTapHint={enableTapNavigation && !isRiskQuizFlow && !tipShown}
      quizMode={isRiskQuizFlow}
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
