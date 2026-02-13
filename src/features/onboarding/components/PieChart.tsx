import type { Allocation } from "../types/onboarding";

interface PieChartProps {
  allocation: Allocation;
}

export function PieChart({ allocation }: PieChartProps) {
  const { stocks_pct, bonds_pct, alternatives_pct, cash_pct } = allocation;

  const gradient = `conic-gradient(
    #60a5fa 0 ${stocks_pct}%,
    #34d399 ${stocks_pct}% ${stocks_pct + bonds_pct}%,
    #fbbf24 ${stocks_pct + bonds_pct}% ${stocks_pct + bonds_pct + alternatives_pct}%,
    #c4b5fd ${stocks_pct + bonds_pct + alternatives_pct}% ${stocks_pct + bonds_pct + alternatives_pct + cash_pct}%
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
