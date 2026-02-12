import type { CSSProperties } from "react";
import type { CalculatorScreenProps } from "./ScreenProps";

export function CalculatorScreen({
  screen,
  calculatorOutput,
  onNext,
  onPrev,
}: CalculatorScreenProps) {
  return (
    <section style={containerStyle}>
      <h3 style={{ margin: 0 }}>{screen.title}</h3>
      {screen.subtitle ? <p style={{ margin: 0, color: "#5b6a80" }}>{screen.subtitle}</p> : null}

      <div style={{ display: "grid", gap: 8 }}>
        {Object.entries(calculatorOutput.tariffs).map(([name, values]) => (
          <article
            key={name}
            style={{
              borderRadius: 12,
              border:
                calculatorOutput.recommended === name ? "2px solid #4f73cd" : "1px solid #d9e2ef",
              background: calculatorOutput.recommended === name ? "#eff4ff" : "#fff",
              padding: 12,
            }}
          >
            <h4 style={{ margin: 0, textTransform: "capitalize" }}>{name}</h4>
            <p style={{ margin: "6px 0 0", color: "#5b6a80", fontSize: 14 }}>
              Абонплата: {values.monthly_fee} ₽ • Комиссия: {values.commission_total} ₽ • Итого:{" "}
              {values.total} ₽
            </p>
          </article>
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
