import { useEffect, useMemo } from "react";
import type { CSSProperties } from "react";
import { OnboardingProvider, useOnboardingContext } from "./OnboardingContext";
import { calculateTariffCosts, CALCULATOR_DEFAULTS } from "./data/tariffs";
import { RISK_QUIZ_QUESTIONS } from "./data/riskQuiz";
import { useAnalytics, ANALYTICS_EVENTS } from "./hooks/useAnalytics";
import { getVisibleScreens } from "./hooks/useOnboardingState";
import { usePersonalization } from "./hooks/usePersonalization";
import { normalizeDOSInput } from "./hooks/useSegmentation";
import { ProgressBar } from "./components/ProgressBar";
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
import type { DOSInput, ScreenConfig } from "./types/onboarding";

interface OnboardingProps {
  userId: string;
  dosInput: Partial<DOSInput>;
  onComplete?: () => void;
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

  useEffect(() => {
    if (state.status !== "not_started") {
      return;
    }
    startOnboarding(userId, normalizeDOSInput(dosInput));
  }, [dosInput, startOnboarding, state.status, userId]);

  useEffect(() => {
    if (state.status === "in_progress" && state.user_id) {
      track(ANALYTICS_EVENTS.ONBOARDING_STARTED, {
        goal: state.dos_input.investment_goal,
        instruments: state.dos_input.instruments,
      });
    }
  }, [state, track]);

  useEffect(() => {
    if (state.status === "completed") {
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

  const renderScreen = (screen: ScreenConfig) => {
    const commonProps = {
      screen,
      onNext: nextScreen,
      onPrev: prevScreen,
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
              nextScreen();
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
      <section style={wrapperStyle}>
        <p style={{ margin: 0, color: "#56657a" }}>Подготовка персонального онбординга...</p>
      </section>
    );
  }

  if (state.status === "paused") {
    return (
      <section style={wrapperStyle}>
        <h2 style={{ margin: 0 }}>Обучение на паузе</h2>
        <button style={primaryButtonStyle} type="button" onClick={() => dispatch({ type: "RESUME" })}>
          Продолжить
        </button>
      </section>
    );
  }

  return (
    <section style={wrapperStyle}>
      <header style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Онбординг Finam Trade</h1>
          <button type="button" style={ghostButtonStyle} onClick={pauseOnboarding}>
            ×
          </button>
        </div>
        <ProgressBar progress={progress} />
      </header>

      {currentScreen ? renderScreen(currentScreen) : null}
    </section>
  );
}

export function Onboarding(props: OnboardingProps) {
  return (
    <OnboardingProvider>
      <OnboardingFlow {...props} />
    </OnboardingProvider>
  );
}

const wrapperStyle: CSSProperties = {
  display: "grid",
  gap: 16,
  maxWidth: 760,
  margin: "0 auto",
  padding: "16px 12px 28px",
};

const primaryButtonStyle: CSSProperties = {
  border: 0,
  borderRadius: 10,
  background: "#2f5fcc",
  color: "#fff",
  padding: "10px 14px",
  cursor: "pointer",
};

const ghostButtonStyle: CSSProperties = {
  border: "1px solid #c8d4e8",
  borderRadius: 10,
  background: "#fff",
  color: "#3a4a61",
  width: 34,
  height: 34,
  lineHeight: "30px",
  fontSize: 20,
  cursor: "pointer",
};
