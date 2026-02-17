export function openDeeplink(url: string): void {
  if (!url) {
    return;
  }

  window.location.href = url;
}
