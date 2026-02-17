type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;
import { trackEvent as emitAnalyticsEvent } from "../lib/analytics";

export function trackEvent(eventName: string, payload?: AnalyticsPayload): void {
  emitAnalyticsEvent(eventName, payload);
}
