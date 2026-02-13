import type {
  GoalOverlayConfig,
  PortfolioExample,
  RiskQuizAnswer,
  RiskQuizResult,
  ScreenConfig,
  TariffCalculatorOutput,
} from "../types/onboarding";
import type { RiskQuizQuestion } from "../data/riskQuiz";

export interface BaseScreenProps {
  screen: ScreenConfig;
  onNext: () => void;
  onPrev: () => void;
}

export interface CardsScreenProps extends BaseScreenProps {
  highlightedInstruments: string[];
}

export interface QuizScreenProps extends BaseScreenProps {
  question: RiskQuizQuestion;
  selectedOptionId?: string;
  onSelectOption: (answer: RiskQuizAnswer) => void;
}

export interface PortfolioScreenProps extends BaseScreenProps {
  portfolio: PortfolioExample;
  overlay: GoalOverlayConfig;
}

export interface CalculatorScreenProps extends BaseScreenProps {
  calculatorOutput: TariffCalculatorOutput;
}

export interface ResultScreenProps extends BaseScreenProps {
  riskResult: RiskQuizResult | null;
}
