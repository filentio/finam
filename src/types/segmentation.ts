export type Segment = "novice" | "advanced" | "expert";

export type Experience =
  | "none"
  | "less_1y"
  | "1_3y"
  | "3_5y"
  | "more_5y";

export type AmountTier = "up_to_300k" | "300k_2m" | "2m_5m" | "more_5m";

export type InvestmentGoal =
  | "purchase"
  | "passive_income"
  | "growth"
  | "preservation";

export type Instrument =
  | "etf"
  | "stocks"
  | "bonds"
  | "trust_management"
  | "ipo"
  | "currency";

export interface SegmentationState {
  qualifiedInvestor: boolean | null;
  experience: Experience | null;
  amountTier: AmountTier | null;
  goal: InvestmentGoal | null;
  instruments: Instrument[];
  segment: Segment | null;
}

export interface SegmentationPayload {
  qualified_investor: boolean;
  experience: Experience;
  segment: Segment;
  amount_tier: AmountTier;
  investment_goal: InvestmentGoal;
  instruments: Instrument[];
}
