import type { CSSProperties } from "react";
import { GoalOverlay } from "../components/GoalOverlay";
import { PieChart } from "../components/PieChart";
import { PortfolioTable } from "../components/PortfolioTable";
import { usePersonalization } from "../hooks/usePersonalization";
import type { PortfolioScreenProps } from "./ScreenProps";

export function PortfolioScreen({
  screen,
  portfolio,
  overlay,
  onNext,
  onPrev,
}: PortfolioScreenProps) {
  const { segment } = usePersonalization();
  const total = portfolio.items.reduce((sum, item) => sum + item.amount, 0);
  const stocks = portfolio.items
    .filter((item) => item.type === "stock" || item.type === "etf")
    .reduce((sum, item) => sum + item.share_pct, 0);
  const bonds = portfolio.items
    .filter((item) => item.type === "bond")
    .reduce((sum, item) => sum + item.share_pct, 0);
  const alternatives = Math.max(0, 100 - stocks - bonds);

  return (
    <section style={containerStyle}>
      <h3 style={{ margin: 0 }}>{screen.title}</h3>
      <p style={{ margin: 0, color: "#5b6a80" }}>
        {(screen.description_variants?.[segment] ?? `Пример на ${portfolio.total_amount_label}.`)}{" "}
        Текущая раскладка: {total.toLocaleString("ru-RU")} ₽
      </p>

      <PieChart
        allocation={{
          stocks_pct: stocks,
          bonds_pct: bonds,
          alternatives_pct: alternatives,
          cash_pct: 0,
        }}
      />
      <GoalOverlay overlay={overlay} />
      <PortfolioTable items={portfolio.items} />

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
