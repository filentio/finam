import type { PortfolioItem } from "../types/onboarding";

interface PortfolioTableProps {
  items: PortfolioItem[];
}

export function PortfolioTable({ items }: PortfolioTableProps) {
  return (
    <div className="ob-portfolio-table-wrap">
      <table className="ob-portfolio-table">
        <thead>
          <tr>
            <th className="ob-portfolio-table__th">Инструмент</th>
            <th className="ob-portfolio-table__th">Тикер</th>
            <th className="ob-portfolio-table__th">Сумма</th>
            <th className="ob-portfolio-table__th">Доля</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.ticker}-${item.deeplink}`}>
              <td className="ob-portfolio-table__td">{item.instrument}</td>
              <td className="ob-portfolio-table__td">{item.ticker}</td>
              <td className="ob-portfolio-table__td">{item.amount.toLocaleString("ru-RU")} ₽</td>
              <td className="ob-portfolio-table__td">{item.share_pct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
