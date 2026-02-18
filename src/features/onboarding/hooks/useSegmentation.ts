import { useMemo } from "react";
import type {
  AmountTier,
  DOSInput,
  InvestmentAmount,
  Segment,
} from "../types/onboarding";

export function determineSegment(dos: DOSInput): Segment {
  if (dos.qualified_investor === true) {
    return "expert";
  }

  switch (dos.experience) {
    case "none":
    case "less_1y":
      return "novice";
    case "1_3y":
    case "3_5y":
      return "advanced";
    case "more_5y":
      return "expert";
    default:
      return "novice";
  }
}

export function determineAmountTier(amount: InvestmentAmount): AmountTier {
  const map: Record<InvestmentAmount, AmountTier> = {
    up_to_300k: "starter",
    "300k_2m": "base",
    "2m_5m": "extended",
    more_5m: "premium",
  };

  return map[amount];
}

export function normalizeDOSInput(input: Partial<DOSInput>): DOSInput {
  return {
    qualified_investor: input.qualified_investor ?? false,
    experience: input.experience ?? "none",
    investment_amount: input.investment_amount ?? "up_to_300k",
    investment_goal: input.investment_goal ?? "growth",
    instruments: input.instruments ?? [],
  };
}

export function useSegmentation(dosInput: DOSInput): {
  segment: Segment;
  amountTier: AmountTier;
} {
  const segment = useMemo(() => determineSegment(dosInput), [dosInput]);
  const amountTier = useMemo(
    () => determineAmountTier(dosInput.investment_amount),
    [dosInput.investment_amount],
  );

  return { segment, amountTier };
}
