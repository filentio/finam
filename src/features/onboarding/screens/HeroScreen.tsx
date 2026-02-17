import type { BaseScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

export function HeroScreen({ screen, screenCount = 1 }: BaseScreenProps) {
  const estimatedMinutes = Math.max(1, Math.ceil(screenCount * 0.5));

  return (
    <ScreenShell title={screen.title} subtitle={screen.subtitle}>
      <div className="ob-hero-meta" aria-label="Метаданные урока">
        <span>~{estimatedMinutes} мин</span>
        <span>{screenCount} экранов</span>
      </div>
      {screen.visual ? (
        <div className="ob-route-prep__icon" aria-hidden="true">
          {screen.visual}
        </div>
      ) : null}
    </ScreenShell>
  );
}
