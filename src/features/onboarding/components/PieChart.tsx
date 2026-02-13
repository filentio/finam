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
    <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
      <div
        aria-label="pie-chart"
        style={{
          width: 156,
          height: 156,
          borderRadius: "50%",
          background: gradient,
          border: "1px solid rgba(255,255,255,0.34)",
        }}
      />
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.82)", textAlign: "center" }}>
        Акции {stocks_pct}% • Облигации {bonds_pct}% • Альтернативы {alternatives_pct}% •
        Кэш {cash_pct}%
      </div>
    </div>
  );
}
