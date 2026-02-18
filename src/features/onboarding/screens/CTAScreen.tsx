import { usePersonalization } from "../hooks/usePersonalization";
import { openDeeplink } from "../../../lib/navigation";
import { trackEvent } from "../../../lib/analytics";
import type { CTAConfig } from "../types/onboarding";
import type { BaseScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

export function CTAScreen({ screen, onNext, onPrev }: BaseScreenProps) {
  const { getDeeplink } = usePersonalization();
  const ctas = screen.cta ?? [{ label: "Продолжить", type: "primary", action: "next_screen" }];

  const handleCTA = (cta: CTAConfig) => {
    if (cta.action === "deeplink") {
      const target = getDeeplink(cta.deeplink ?? "", cta.deeplink_variants);
      if (target) {
        trackEvent("deeplink_click", { url: target, screen: screen.screen_id });
        openDeeplink(target);
      }
      return;
    }

    if (cta.action === "complete") {
      trackEvent("cta_clicked", { action: cta.action, label: cta.label, screen: screen.screen_id });
      onNext();
      return;
    }

    trackEvent("cta_clicked", { action: cta.action, label: cta.label, screen: screen.screen_id });
    onNext();
  };

  return (
    <ScreenShell title={screen.title} subtitle={screen.subtitle}>
      <div className="ob-inline-actions ob-inline-actions--stack">
        {ctas.map((cta) => (
          <button
            key={cta.label}
            type="button"
            onClick={() => handleCTA(cta)}
            className={cta.type === "primary" ? "is-primary" : "is-secondary"}
            aria-label={cta.label}
          >
            {cta.label}
          </button>
        ))}
      </div>

      <div className="ob-inline-actions">
        <button className="is-secondary" type="button" onClick={onPrev} aria-label="Вернуться назад">
          Назад
        </button>
        <button className="is-primary" type="button" onClick={onNext} aria-label="Пропустить шаг">
          Пропустить
        </button>
      </div>
    </ScreenShell>
  );
}
