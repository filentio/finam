export type AnalyticsEventName =
  | "onboarding_quiz1_start"
  | "onboarding_quiz1_answer"
  | "onboarding_quiz1_complete"
  | "onboarding_quiz1_error";

export type AnalyticsPayload = Record<string, unknown>;

export function track(eventName: AnalyticsEventName, payload: AnalyticsPayload = {}): void {
  // No external SDK integration on this stage.
  // This function is the single entry point for analytics events.
  // eslint-disable-next-line no-console
  console.log("[track]", eventName, payload);
}

