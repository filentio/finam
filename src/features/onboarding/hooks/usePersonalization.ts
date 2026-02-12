import { useMemo } from "react";
import { DEEPLINKS } from "../data/deeplinks";
import { GOAL_OVERLAYS, PORTFOLIOS } from "../data/portfolios";
import { useOnboardingContext } from "../OnboardingContext";
import type {
  ContentVariant,
  ContentVariants,
  GoalOverlayConfig,
  InvestmentAmount,
  PortfolioExample,
  RiskProfile,
} from "../types/onboarding";

type Axis = "amount" | "goal" | "risk" | "segment";

export function mapAmountTierToInputKey(
  amountTier: "starter" | "base" | "extended" | "premium",
): InvestmentAmount {
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
  amountInputKey: InvestmentAmount;
  getContentVariantObject: (
    variants: ContentVariants,
    axis: Axis,
  ) => ContentVariant | null;
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

  const getContentVariantObject = (
    variants: ContentVariants,
    axis: Axis,
  ): ContentVariant | null => {
    const amountInputKey = mapAmountTierToInputKey(context.amountTier);
    const keyMap: Record<Axis, string> = {
      amount: amountInputKey,
      goal: context.goal,
      risk: context.riskProfile ?? "moderate",
      segment: context.segment,
    };

    const key = keyMap[axis];
    return variants[key] ?? variants.default ?? Object.values(variants)[0] ?? null;
  };

  const getContentVariant = (variants: ContentVariants, axis: Axis): string => {
    return getContentVariantObject(variants, axis)?.text ?? "";
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

    const byRisk = context.riskProfile ? variants[context.riskProfile] : undefined;
    if (byRisk) {
      return byRisk;
    }

    const byAmount = variants[context.amountTier];
    if (byAmount) {
      return byAmount;
    }

    return base;
  };

  return {
    ...context,
    amountInputKey: mapAmountTierToInputKey(context.amountTier),
    instruments: context.instruments,
    getContentVariantObject,
    getContentVariant,
    isInstrumentHighlighted,
    getPortfolio,
    getGoalOverlay,
    getDeeplink,
  };
}

export { DEEPLINKS };
