import { useMemo } from "react";
import { DEEPLINKS } from "../data/deeplinks";
import { GOAL_OVERLAYS, PORTFOLIOS } from "../data/portfolios";
import { useOnboardingContext } from "../OnboardingContext";
import type {
  ContentVariants,
  GoalOverlayConfig,
  PortfolioExample,
  RiskProfile,
} from "../types/onboarding";

type Axis = "amount" | "goal" | "risk" | "segment";

function mapAmountTierToInputKey(amountTier: "starter" | "base" | "extended" | "premium"): string {
  if (amountTier === "starter") {
    return "up_to_300k";
  }
  if (amountTier === "base") {
    return "300k_2m";
  }
  if (amountTier === "extended") {
    return "2m_5m";
  }
  return "more_5m";
}

export function usePersonalization(): {
  segment: "novice" | "advanced" | "expert";
  amountTier: "starter" | "base" | "extended" | "premium";
  goal: "purchase" | "passive_income" | "growth" | "preservation";
  instruments: string[];
  riskProfile: RiskProfile | null;
  getContentVariant: (variants: ContentVariants, axis: Axis) => string;
  isInstrumentHighlighted: (instrumentId: string) => boolean;
  getPortfolio: () => PortfolioExample;
  getGoalOverlay: () => GoalOverlayConfig;
  getDeeplink: (base: string, variants?: Record<string, string>) => string;
} {
  const { state } = useOnboardingContext();

  const context = useMemo(
    () => ({
      segment: state.segment,
      amountTier: state.amount_tier,
      goal: state.dos_input.investment_goal,
      instruments: state.dos_input.instruments,
      riskProfile: state.risk_quiz_result?.final_profile ?? null,
    }),
    [state],
  );

  const getContentVariant = (variants: ContentVariants, axis: Axis): string => {
    const keyMap: Record<Axis, string> = {
      amount: mapAmountTierToInputKey(context.amountTier),
      goal: context.goal,
      risk: context.riskProfile ?? "moderate",
      segment: context.segment,
    };

    const key = keyMap[axis];
    return (
      variants[key]?.text ??
      variants.default?.text ??
      Object.values(variants)[0]?.text ??
      ""
    );
  };

  const isInstrumentHighlighted = (instrumentId: string): boolean => {
    return context.instruments.includes(instrumentId as (typeof context.instruments)[number]);
  };

  const getPortfolio = (): PortfolioExample => {
    return PORTFOLIOS[context.amountTier];
  };

  const getGoalOverlay = (): GoalOverlayConfig => {
    return GOAL_OVERLAYS[context.goal];
  };

  const getDeeplink = (base: string, variants?: Record<string, string>): string => {
    if (!variants) {
      return base;
    }

    if (context.riskProfile && variants[context.riskProfile]) {
      return variants[context.riskProfile];
    }

    if (variants[context.amountTier]) {
      return variants[context.amountTier];
    }

    return base;
  };

  return {
    ...context,
    instruments: context.instruments,
    getContentVariant,
    isInstrumentHighlighted,
    getPortfolio,
    getGoalOverlay,
    getDeeplink,
  };
}

export { DEEPLINKS };
