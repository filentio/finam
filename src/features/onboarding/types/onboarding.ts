export type QualifiedInvestor = boolean;

export type Experience = "none" | "less_1y" | "1_3y" | "3_5y" | "more_5y";

export type InvestmentAmount = "up_to_300k" | "300k_2m" | "2m_5m" | "more_5m";

export type InvestmentGoal =
  | "purchase"
  | "passive_income"
  | "growth"
  | "preservation";

export type Instrument =
  | "etf"
  | "stocks"
  | "trust_management"
  | "bonds"
  | "ipo"
  | "currency"
  | "structured"
  | "derivatives";

export interface DOSInput {
  qualified_investor: QualifiedInvestor;
  experience: Experience;
  investment_amount: InvestmentAmount;
  investment_goal: InvestmentGoal;
  instruments: Instrument[];
}

export type Segment = "novice" | "advanced" | "expert";

export type AmountTier = "starter" | "base" | "extended" | "premium";

export type RiskProfile =
  | "conservative"
  | "moderate"
  | "aggressive"
  | "ultra_aggressive";

export type SelfAssessment = 1 | 2 | 3 | 4;

export interface RiskQuizAnswer {
  question_id: string;
  selected_option: string;
  score: number;
}

export interface Allocation {
  stocks_pct: number;
  bonds_pct: number;
  alternatives_pct: number;
  cash_pct: number;
}

export interface RiskQuizResult {
  answers: RiskQuizAnswer[];
  total_score: number;
  raw_profile: RiskProfile;
  self_assessment_cap: RiskProfile;
  final_profile: RiskProfile;
  allocation: Allocation;
}

export type StepType =
  | "lesson"
  | "risk_quiz"
  | "risk_result"
  | "first_purchase"
  | "personal_recommendations";

export interface TrackStep {
  type: StepType;
  lesson_id?: string;
  variant?: "full" | "short" | "expert";
}

export type OnboardingStatus =
  | "not_started"
  | "in_progress"
  | "paused"
  | "completed"
  | "skipped";

export type ScreenType =
  | "quiz_intro"
  | "hero"
  | "content"
  | "steps"
  | "cards"
  | "quiz"
  | "cta"
  | "portfolio"
  | "spectrum"
  | "tariff"
  | "calculator"
  | "result";

export interface ContentVariant {
  text: string;
  highlight?: string;
  tip?: string;
}

export type ContentVariants = Record<string, ContentVariant>;

export interface CTAConfig {
  label: string;
  type: "primary" | "secondary" | "ghost";
  action: "next_screen" | "next_lesson" | "deeplink" | "start_quiz" | "complete";
  deeplink?: string;
  deeplink_variants?: Record<string, string>;
}

export interface StepItem {
  icon?: string;
  title: string;
  description?: string;
  description_variants?: Record<string, string>;
}

export interface CardItem {
  id: string;
  title: string;
  description: string;
  risk_level?: "low" | "medium" | "high";
  instrument_id?: Instrument;
  highlight_if_in_dos_instruments?: boolean;
}

export interface ScreenConfig {
  screen_id: string;
  type: ScreenType;
  title: string;
  subtitle?: string;
  image?: string;
  content?: string;
  key_points?: string[];
  visual?: string;
  content_variants?: {
    by_amount?: ContentVariants;
    by_goal?: ContentVariants;
    by_risk_profile?: ContentVariants;
    by_segment?: ContentVariants;
  };
  description_variants?: Record<string, string>;
  items?: StepItem[] | CardItem[];
  cta?: CTAConfig[];
  show_for?: Segment[];
  analytics_event?: string;
}

export interface LessonConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  goal: string;
  available_for: Segment[];
  screens: ScreenConfig[];
  variants?: {
    short?: { screens: string[] };
    expert?: { screens: string[] };
  };
  estimated_duration_sec: number;
}

export interface AnalyticsEvent {
  event_name: string;
  timestamp: string;
  params: {
    user_id: string;
    segment: Segment;
    amount_tier: AmountTier;
    lesson_id?: string;
    screen_id?: string;
    [key: string]: unknown;
  };
}

export interface ProgressInfo {
  totalSteps: number;
  completedSteps: number;
  currentStepIndex: number;
  currentStepProgress: number;
  overallProgress: number;
  currentStepLabel: string;
}

export interface InstrumentCardConfig {
  instrument_id: Instrument;
  label: string;
  description: string;
  risk_level: "low" | "medium" | "high";
  icon: string;
}

export interface PortfolioItem {
  instrument: string;
  ticker: string;
  amount: number;
  share_pct: number;
  type: "etf" | "bond" | "stock" | "commodity" | "trust_management";
  deeplink: string;
}

export interface PortfolioExample {
  tier_id: AmountTier;
  total_amount: number;
  total_amount_label: string;
  items: PortfolioItem[];
  summary: string;
}

export interface GoalOverlayConfig {
  icon: string;
  title: string;
  text: string;
}

export interface TariffCalculatorInput {
  portfolio_amount: number;
  trades_per_month: number;
  avg_trade_amount: number;
}

export type TariffId =
  | "long-term"
  | "investor"
  | "strategist"
  | "unified-daily";

export interface TariffTotals {
  monthly_fee: number;
  commission_total: number;
  total: number;
}

export interface TariffCalculatorOutput {
  tariffs: Record<TariffId, TariffTotals>;
  recommended: TariffId;
}

export interface TariffRate {
  id: TariffId;
  name: string;
  monthly_fee: number;
  buy_commission_rate: number;
  sell_commission_rate: number;
  min_commission: number;
  description: string;
  best_for: string;
}

export interface OnboardingState {
  user_id: string;
  started_at: string;
  dos_input: DOSInput;
  segment: Segment;
  amount_tier: AmountTier;
  track: TrackStep[];
  status: OnboardingStatus;
  current_step_index: number;
  current_screen_index: number;
  completed_steps: string[];
  completed_lessons: string[];
  risk_quiz_result: RiskQuizResult | null;
  total_time_sec: number;
  last_active_at: string;
}

export type OnboardingAction =
  | { type: "START"; payload: { dos: DOSInput; userId: string } }
  | { type: "NEXT_SCREEN" }
  | { type: "PREV_SCREEN" }
  | { type: "NEXT_STEP" }
  | { type: "GO_TO_STEP"; payload: { stepIndex: number; screenIndex?: number } }
  | { type: "SKIP_LESSON" }
  | { type: "SUBMIT_RISK_ANSWER"; payload: RiskQuizAnswer }
  | { type: "COMPLETE_RISK_QUIZ" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "COMPLETE" }
  | { type: "RESET" }
  | { type: "TICK_TIME"; payload: { deltaSec: number } };

export interface PersonalizationContext {
  segment: Segment;
  amountTier: AmountTier;
  goal: InvestmentGoal;
  instruments: Instrument[];
  riskProfile: RiskProfile | null;
}
