import type { CSSProperties } from "react";
import { usePersonalization } from "../hooks/usePersonalization";
import type { BaseScreenProps } from "./ScreenProps";

export function ContentScreen({ screen, onNext, onPrev }: BaseScreenProps) {
  const { getContentVariant } = usePersonalization();

  const personalizedText =
    screen.content_variants?.by_goal
      ? getContentVariant(screen.content_variants.by_goal, "goal")
      : undefined;

  return (
    <section style={containerStyle}>
      <h3 style={{ margin: 0 }}>{screen.title}</h3>
      {screen.subtitle ? <p style={subtitleStyle}>{screen.subtitle}</p> : null}
      {personalizedText ? <p style={textStyle}>{personalizedText}</p> : null}

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
