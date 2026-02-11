type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(eventName: string, payload?: AnalyticsPayload): void {
  // Stub for analytics integration (Amplitude/GA/Segment/etc.).
  console.info("[analytics]", eventName, payload ?? {});
}
