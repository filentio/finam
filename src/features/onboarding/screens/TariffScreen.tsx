import type { CSSProperties } from "react";
import { TARIFF_RATES } from "../data/tariffs";
import type { BaseScreenProps } from "./ScreenProps";

export function TariffScreen({ screen, onNext, onPrev }: BaseScreenProps) {
  return (
    <section style={containerStyle}>
      <h3 style={{ margin: 0 }}>{screen.title}</h3>
      {screen.subtitle ? <p style={{ margin: 0, color: "#5b6a80" }}>{screen.subtitle}</p> : null}

      <div style={{ display: "grid", gap: 8 }}>
        {Object.entries(TARIFF_RATES).map(([name, rate]) => (
          <article
            key={name}
            style={{
              border: "1px solid #d9e2ef",
              borderRadius: 12,
              background: "#fff",
              padding: 12,
            }}
          >
            <h4 style={{ margin: 0, textTransform: "capitalize" }}>{name}</h4>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#5c6a80" }}>
              Абонплата: {rate.monthly_fee} ₽ • Комиссия: {(rate.commission_rate * 100).toFixed(3)}
              %
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
