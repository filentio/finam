/**
 * Opens deeplink or URL with WebView-safe behavior.
 * Deeplinks always use location.href so mobile containers can intercept.
 */
export function openDeeplink(url: string): void {
  if (!url) {
    return;
  }

  const isDeeplink =
    url.startsWith("deeplink://") ||
    url.startsWith("finam://") ||
    url.startsWith("finamtrade://");

  if (isDeeplink) {
    window.location.href = url;
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
