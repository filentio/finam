import type { CSSProperties } from "react";
import { usePersonalization } from "../hooks/usePersonalization";
import type { BaseScreenProps } from "./ScreenProps";

export function ContentScreen({ screen, onNext, onPrev }: BaseScreenProps) {
  const { getContentVariantObject } = usePersonalization();

  const amountVariant = screen.content_variants?.by_amount
    ? getContentVariantObject(screen.content_variants.by_amount, "amount")
    : null;
  const goalVariant = screen.content_variants?.by_goal
    ? getContentVariantObject(screen.content_variants.by_goal, "goal")
    : null;
  const segmentVariant = screen.content_variants?.by_segment
    ? getContentVariantObject(screen.content_variants.by_segment, "segment")
    : null;
  const riskVariant = screen.content_variants?.by_risk_profile
    ? getContentVariantObject(screen.content_variants.by_risk_profile, "risk")
    : null;

  const activeVariant = amountVariant ?? goalVariant ?? segmentVariant ?? riskVariant;
  const text = activeVariant?.text ?? screen.content;

  return (
    <section style={containerStyle}>
      <h3 style={{ margin: 0 }}>{screen.title}</h3>
      {screen.subtitle ? <p style={subtitleStyle}>{screen.subtitle}</p> : null}
      {text ? <p style={textStyle}>{text}</p> : null}
      {activeVariant?.highlight ? <p style={highlightStyle}>{activeVariant.highlight}</p> : null}
      {activeVariant?.tip ? <p style={tipStyle}>💡 {activeVariant.tip}</p> : null}
      {screen.key_points?.length ? (
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4 }}>
          {screen.key_points.map((point) => (
            <li key={point} style={{ color: "#47566c", fontSize: 14 }}>
              {point}
            </li>
          ))}
        </ul>
      ) : null}

      <div style={{ display: "flex", gap: 8 }}>
        <button style={ghostButtonStyle} type="button" onClick={onPrev}>
          Назад
        </button>
        <button style={primaryButtonStyle} type="button" onClick={onNext}>
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
  gap: 10,
};

const subtitleStyle: CSSProperties = {
  margin: 0,
  color: "#5b6a80",
};

const textStyle: CSSProperties = {
  margin: 0,
  color: "#2a3445",
  fontSize: 15,
};

const highlightStyle: CSSProperties = {
  margin: 0,
  borderRadius: 10,
  background: "#eef4ff",
  border: "1px solid #ccdaf6",
  color: "#244ca5",
  padding: "8px 10px",
  fontWeight: 600,
  fontSize: 14,
};

const tipStyle: CSSProperties = {
  margin: 0,
  borderRadius: 10,
  background: "#f7fafc",
  border: "1px solid #dbe6f4",
  color: "#4d5e76",
  padding: "8px 10px",
  fontSize: 14,
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
