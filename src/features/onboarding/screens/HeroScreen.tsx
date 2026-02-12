import type { CSSProperties } from "react";
import type { BaseScreenProps } from "./ScreenProps";

export function HeroScreen({ screen, onNext }: BaseScreenProps) {
  return (
    <section style={containerStyle}>
      <h2 style={{ margin: 0, fontSize: 28 }}>{screen.title}</h2>
      {screen.subtitle ? <p style={subtitleStyle}>{screen.subtitle}</p> : null}
      <button style={primaryButtonStyle} type="button" onClick={onNext}>
        Продолжить
      </button>
    </section>
  );
}

const containerStyle: CSSProperties = {
  border: "1px solid #dce5f2",
  borderRadius: 14,
  padding: 20,
  background: "#fff",
  display: "grid",
  gap: 12,
};

const subtitleStyle: CSSProperties = {
  margin: 0,
  color: "#56657b",
  fontSize: 15,
};

const primaryButtonStyle: CSSProperties = {
  border: 0,
  borderRadius: 10,
  background: "#2f5fcc",
  color: "#fff",
  padding: "11px 14px",
  fontWeight: 600,
  justifySelf: "start",
  cursor: "pointer",
};
