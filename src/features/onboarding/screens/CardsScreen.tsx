import type { CSSProperties } from "react";
import { InstrumentCard } from "../components/InstrumentCard";
import type { InstrumentCardConfig } from "../types/onboarding";
import type { CardsScreenProps } from "./ScreenProps";

const CARDS: InstrumentCardConfig[] = [
  {
    instrument_id: "stocks",
    label: "Акции",
    description: "Доли в компаниях. Потенциал роста и дивиденды.",
    risk_level: "high",
    icon: "chart_line_up",
  },
  {
    instrument_id: "bonds",
    label: "Облигации",
    description: "Более предсказуемый доход и меньшая волатильность.",
    risk_level: "low",
    icon: "shield",
  },
  {
    instrument_id: "etf",
    label: "ETF",
    description: "Диверсификация через один инструмент.",
    risk_level: "medium",
    icon: "pie",
  },
  {
    instrument_id: "currency",
    label: "Валюта",
    description: "Инструмент для хеджирования валютного риска.",
    risk_level: "medium",
    icon: "currency",
  },
];

export function CardsScreen({
  screen,
  highlightedInstruments,
  onNext,
  onPrev,
}: CardsScreenProps) {
  return (
    <section style={containerStyle}>
      <h3 style={{ margin: 0 }}>{screen.title}</h3>
      {screen.subtitle ? <p style={{ margin: 0, color: "#5b6a80" }}>{screen.subtitle}</p> : null}
      <div style={{ display: "grid", gap: 10 }}>
        {CARDS.map((card) => (
          <InstrumentCard
            key={card.instrument_id}
            title={card.label}
            description={card.description}
            riskLevel={card.risk_level}
            highlighted={highlightedInstruments.includes(card.instrument_id)}
          />
        ))}
      </div>

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
