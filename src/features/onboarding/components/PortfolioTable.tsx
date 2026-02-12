import type { CSSProperties } from "react";
import type { PortfolioItem } from "../types/onboarding";

interface PortfolioTableProps {
  items: PortfolioItem[];
}

export function PortfolioTable({ items }: PortfolioTableProps) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
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
  color: "#607087",
  borderBottom: "1px solid #dbe5f2",
  padding: "8px 6px",
};

const tdStyle: CSSProperties = {
  fontSize: 14,
  borderBottom: "1px solid #edf2f8",
  padding: "10px 6px",
};
