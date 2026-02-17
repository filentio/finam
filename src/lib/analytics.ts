type AnalyticsProperties = Record<string, unknown>;

/**
 * Centralized analytics dispatcher.
 * Replace console logging with a real SDK in production.
 */
export function trackEvent(event: string, properties?: AnalyticsProperties): void {
  console.info("[Analytics]", event, properties ?? {});
}
