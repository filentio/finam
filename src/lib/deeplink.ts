/**
 * Opens deeplink or URL with WebView-safe behavior.
 * WebView-safe: always uses location.href.
 */
export function openDeeplink(url: string): void {
  if (!url) {
    return;
  }
  window.location.href = url;
}
