import { RiskCard } from "../components/RiskCard";
import { usePersonalization } from "../hooks/usePersonalization";
import { useOnboardingContext } from "../OnboardingContext";
import type { BaseScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

const DESCRIPTIONS: Record<string, string> = {
  conservative: "Фокус на сохранении капитала и низкой волатильности.",
  moderate: "Баланс стабильности и роста.",
  aggressive: "Допускает заметные колебания ради доходности.",
  ultra_aggressive: "Максимальный риск ради потенциального роста.",
};

export function SpectrumScreen({ screen }: BaseScreenProps) {
  const { getContentVariantObject } = usePersonalization();
  const {
    state: { risk_quiz_result },
  } = useOnboardingContext();
  const segmentVariant = screen.content_variants?.by_segment
    ? getContentVariantObject(screen.content_variants.by_segment, "segment")
    : null;
  const leadText = segmentVariant?.text ?? screen.content ?? screen.subtitle;

  return (
    <ScreenShell title={screen.title} subtitle={leadText ?? screen.subtitle}>
      <div className="ob-risk-cards">
        {Object.entries(DESCRIPTIONS).map(([profile, description]) => (
          <RiskCard
            key={profile}
            profile={
              profile as "conservative" | "moderate" | "aggressive" | "ultra_aggressive"
            }
            description={description}
            active={risk_quiz_result?.final_profile === profile}
          />
        ))}
      </div>
    </ScreenShell>
  );
}
