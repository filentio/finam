import type { Allocation } from "../types/onboarding";

interface PieChartProps {
  allocation: Allocation;
}

export function PieChart({ allocation }: PieChartProps) {
  const { stocks_pct, bonds_pct, alternatives_pct, cash_pct } = allocation;

  const gradient = `conic-gradient(
    #365fca 0 ${stocks_pct}%,
    #3b9f74 ${stocks_pct}% ${stocks_pct + bonds_pct}%,
    #d29a2a ${stocks_pct + bonds_pct}% ${stocks_pct + bonds_pct + alternatives_pct}%,
    #7e8da7 ${stocks_pct + bonds_pct + alternatives_pct}% ${stocks_pct + bonds_pct + alternatives_pct + cash_pct}%
  )`;

  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
      <div
        aria-label="pie-chart"
        style={{
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: gradient,
          border: "1px solid #d7e1ef",
        }}
      />
      <div style={{ fontSize: 13, color: "#4f6077", textAlign: "center" }}>
        Акции {stocks_pct}% • Облигации {bonds_pct}% • Альтернативы {alternatives_pct}% •
        Кэш {cash_pct}%
      </div>
    </div>
  );
}
