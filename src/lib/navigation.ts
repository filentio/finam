export function openDeeplink(url: string): void {
  if (!url) {
    return;
  }

  if (
    url.startsWith("deeplink://") ||
    url.startsWith("finam://") ||
    url.startsWith("finamtrade://")
  ) {
    window.location.href = url;
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
