import type { CSSProperties } from "react";
import type { PortfolioItem } from "../types/onboarding";

interface PortfolioTableProps {
  items: PortfolioItem[];
}

export function PortfolioTable({ items }: PortfolioTableProps) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>Инструмент</th>
            <th style={thStyle}>Тикер</th>
            <th style={thStyle}>Сумма</th>
            <th style={thStyle}>Доля</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.ticker}-${item.deeplink}`}>
              <td style={tdStyle}>{item.instrument}</td>
              <td style={tdStyle}>{item.ticker}</td>
              <td style={tdStyle}>{item.amount.toLocaleString("ru-RU")} ₽</td>
              <td style={tdStyle}>{item.share_pct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: CSSProperties = {
  textAlign: "left",
  fontSize: 12,
  color: "rgba(255,255,255,0.72)",
  borderBottom: "1px solid rgba(255,255,255,0.22)",
  padding: "8px 6px",
};

const tdStyle: CSSProperties = {
  fontSize: 13,
  color: "rgba(255,255,255,0.9)",
  borderBottom: "1px solid rgba(255,255,255,0.12)",
  padding: "8px 6px",
};
