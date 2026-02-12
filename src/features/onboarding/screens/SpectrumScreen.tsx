import type { CSSProperties } from "react";
import { RiskCard } from "../components/RiskCard";
import { usePersonalization } from "../hooks/usePersonalization";
import { useOnboardingContext } from "../OnboardingContext";
import type { BaseScreenProps } from "./ScreenProps";

const DESCRIPTIONS: Record<string, string> = {
  conservative: "Фокус на сохранении капитала и низкой волатильности.",
  moderate: "Баланс стабильности и роста.",
  aggressive: "Допускает заметные колебания ради доходности.",
  ultra_aggressive: "Максимальный риск ради потенциального роста.",
};

export function SpectrumScreen({ screen, onNext, onPrev }: BaseScreenProps) {
  const { getContentVariantObject } = usePersonalization();
  const {
    state: { risk_quiz_result },
  } = useOnboardingContext();
  const segmentVariant = screen.content_variants?.by_segment
    ? getContentVariantObject(screen.content_variants.by_segment, "segment")
    : null;
  const leadText = segmentVariant?.text ?? screen.content ?? screen.subtitle;

  return (
    <section style={containerStyle}>
      <h3 style={{ margin: 0 }}>{screen.title}</h3>
      {leadText ? <p style={{ margin: 0, color: "#5b6a80" }}>{leadText}</p> : null}

      <div style={{ display: "grid", gap: 8 }}>
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

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={onPrev} style={ghostButtonStyle}>
          Назад
        </button>
        <button type="button" onClick={onNext} style={primaryButtonStyle}>
          Далее
        </button>
      </div>
    </section>
  );
}

const containerStyle: CSSProperties = {
  border: "1px solid #dce5f2",
  borderRadius: 14,
  padding: 16,
  background: "#fff",
  display: "grid",
  gap: 12,
};

const primaryButtonStyle: CSSProperties = {
  border: 0,
  borderRadius: 10,
  background: "#2f5fcc",
  color: "#fff",
  padding: "10px 14px",
  cursor: "pointer",
};

const ghostButtonStyle: CSSProperties = {
  border: "1px solid #c8d4e8",
  borderRadius: 10,
  background: "#fff",
  color: "#3a4a61",
  padding: "10px 14px",
  cursor: "pointer",
};
