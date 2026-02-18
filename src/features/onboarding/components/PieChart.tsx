import type { Allocation } from "../types/onboarding";

interface PieChartProps {
  allocation: Allocation;
}

export function PieChart({ allocation }: PieChartProps) {
  const { stocks_pct, bonds_pct, alternatives_pct, cash_pct } = allocation;

  const gradient = `conic-gradient(
    #2F5BCC 0 ${stocks_pct}%,
    #3BB273 ${stocks_pct}% ${stocks_pct + bonds_pct}%,
    #95A8DB ${stocks_pct + bonds_pct}% ${stocks_pct + bonds_pct + alternatives_pct}%,
    #C9D3EE ${stocks_pct + bonds_pct + alternatives_pct}% ${stocks_pct + bonds_pct + alternatives_pct + cash_pct}%
  )`;

  return (
    <div className="ob-pie-chart">
      <div
        className="ob-pie-chart__circle"
        data-testid="allocation-pie-chart"
        style={{ background: gradient }}
      />
      <div className="ob-pie-chart__summary">
        Акции {stocks_pct}% • Облигации {bonds_pct}% • Альтернативы {alternatives_pct}% •
        Кэш {cash_pct}%
      </div>
    </div>
  );
}
