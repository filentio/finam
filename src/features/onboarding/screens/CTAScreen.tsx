import type { CSSProperties } from "react";
import { usePersonalization } from "../hooks/usePersonalization";
import type { CTAConfig } from "../types/onboarding";
import type { BaseScreenProps } from "./ScreenProps";

export function CTAScreen({ screen, onNext, onPrev }: BaseScreenProps) {
  const { getDeeplink } = usePersonalization();
  const ctas = screen.cta ?? [{ label: "Продолжить", type: "primary", action: "next_screen" }];

  const handleCTA = (cta: CTAConfig) => {
    if (cta.action === "deeplink") {
      const target = getDeeplink(cta.deeplink ?? "", cta.deeplink_variants);
      if (target) {
        window.location.hash = target;
      }
      return;
    }

    if (cta.action === "complete") {
      onNext();
      return;
    }

    onNext();
  };

  return (
    <section style={containerStyle}>
      <h3 style={{ margin: 0 }}>{screen.title}</h3>
      {screen.subtitle ? <p style={{ margin: 0, color: "#5b6a80" }}>{screen.subtitle}</p> : null}

      <div style={{ display: "grid", gap: 8 }}>
        {ctas.map((cta) => (
          <button
            key={cta.label}
            type="button"
            onClick={() => handleCTA(cta)}
            style={cta.type === "primary" ? primaryButtonStyle : secondaryButtonStyle}
          >
            {cta.label}
          </button>
        ))}
      </div>

      <button type="button" onClick={onPrev} style={ghostButtonStyle}>
        Назад
      </button>
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

const secondaryButtonStyle: CSSProperties = {
  border: "1px solid #bcd0ef",
  borderRadius: 10,
  background: "#f4f8ff",
  color: "#2f4f90",
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
