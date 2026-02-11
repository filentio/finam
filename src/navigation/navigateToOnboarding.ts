import type { AmountTier, Segment } from "../types/segmentation";

const ONBOARDING_ROUTE_BY_SEGMENT: Record<Segment, string> = {
  novice: "/onboarding/full-course",
  advanced: "/onboarding/short-course",
  expert: "/onboarding/minimal-risk-form",
};

export function navigateToOnboarding(segment: Segment, amountTier: AmountTier): string {
  const route = ONBOARDING_ROUTE_BY_SEGMENT[segment];
  const target = `${route}?amountTier=${amountTier}`;

  if (typeof window !== "undefined") {
    window.location.hash = target;
  }

  return target;
}
