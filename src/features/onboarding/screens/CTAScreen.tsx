import { usePersonalization } from "../hooks/usePersonalization";
import { openDeeplink } from "../../../lib/navigation";
import { trackEvent } from "../../../lib/analytics";
import type { CTAConfig } from "../types/onboarding";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";
import type { BaseScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

export function CTAScreen({ screen, onNext, onPrev }: BaseScreenProps) {
  const { getDeeplink } = usePersonalization();
  const ctas = screen.cta ?? [{ label: "Продолжить", type: "primary", action: "next_screen" }];

  const getVisualType = (cta: CTAConfig): "primary" | "secondary" => {
    const normalized = cta.label.toLowerCase();
    if (normalized.includes("купить")) {
      return "primary";
    }
    if (normalized.includes("продолж")) {
      return "secondary";
    }
    return cta.type === "primary" ? "primary" : "secondary";
  };

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
        {ctas.map((cta) =>
          getVisualType(cta) === "primary" ? (
            <PrimaryButton
              key={cta.label}
              onClick={() => handleCTA(cta)}
              className="ob-inline-actions__button"
              aria-label={cta.label}
            >
              {cta.label}
            </PrimaryButton>
          ) : (
            <SecondaryButton
              key={cta.label}
              onClick={() => handleCTA(cta)}
              className="ob-inline-actions__button"
              aria-label={cta.label}
            >
              {cta.label}
            </SecondaryButton>
          ),
        )}
      </div>

      <div className="ob-inline-actions">
        <SecondaryButton type="button" onClick={onPrev} aria-label="Вернуться назад">
          Назад
        </SecondaryButton>
        <PrimaryButton type="button" onClick={onNext} aria-label="Пропустить шаг">
          Пропустить
        </PrimaryButton>
      </div>
    </ScreenShell>
  );
}
