import { useCallback } from "react";
import type {
  AmountTier,
  AnalyticsEvent,
  Segment,
} from "../types/onboarding";

export const ANALYTICS_EVENTS = {
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_COMPLETED: "onboarding_completed",
  ONBOARDING_PAUSED: "onboarding_paused",
  ONBOARDING_RESUMED: "onboarding_resumed",
  LESSON_STARTED: "lesson_started",
  LESSON_SCREEN_VIEWED: "lesson_screen_viewed",
  LESSON_COMPLETED: "lesson_completed",
  LESSON_SKIPPED: "lesson_skipped",
  CTA_CLICKED: "cta_clicked",
  DEPOSIT_CTA_CLICKED: "deposit_cta_clicked",
  RISK_QUIZ_STARTED: "risk_quiz_started",
  RISK_QUIZ_ANSWER: "risk_quiz_answer",
  RISK_QUIZ_COMPLETED: "risk_quiz_completed",
  FIRST_PURCHASE_SCREEN_VIEWED: "first_purchase_screen_viewed",
  FIRST_PURCHASE_CTA_CLICKED: "first_purchase_cta_clicked",
} as const;

interface AnalyticsBaseContext {
  userId: string;
  segment: Segment;
  amountTier: AmountTier;
}

export function useAnalytics(baseContext?: AnalyticsBaseContext): {
  track: (eventName: string, params?: Record<string, unknown>) => void;
} {
  const track = useCallback(
    (eventName: string, params: Record<string, unknown> = {}) => {
      const event: AnalyticsEvent = {
        event_name: eventName,
        timestamp: new Date().toISOString(),
        params: {
          user_id: baseContext?.userId ?? "anonymous",
          segment: baseContext?.segment ?? "novice",
          amount_tier: baseContext?.amountTier ?? "starter",
          ...params,
        },
      };

      const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
      if (Array.isArray(dataLayer)) {
        dataLayer.push({
          event: event.event_name,
          ...event.params,
        });
      }

      console.info("[onboarding.analytics]", event.event_name, event.params);
    },
    [baseContext?.amountTier, baseContext?.segment, baseContext?.userId],
  );

  return { track };
}
