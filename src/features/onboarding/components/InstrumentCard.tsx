import { HighlightBadge } from "./HighlightBadge";

interface InstrumentCardProps {
  title: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  highlighted?: boolean;
}

const RISK_COLORS: Record<InstrumentCardProps["riskLevel"], string> = {
  low: "#2d8b57",
  medium: "#b87e14",
  high: "#c13f3f",
};

export function InstrumentCard({
  title,
  description,
  riskLevel,
  highlighted = false,
}: InstrumentCardProps) {
  return (
    <article
      style={{
        borderRadius: 12,
        border: `1px solid ${highlighted ? "#5f82d8" : "#d9e2ef"}`,
        background: highlighted ? "#f2f6ff" : "#fff",
        padding: 14,
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <h4 style={{ margin: 0, fontSize: 16 }}>{title}</h4>
        <span
          style={{
            color: RISK_COLORS[riskLevel],
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Риск: {riskLevel}
        </span>
      </div>
      <p style={{ margin: 0, color: "#49576b", fontSize: 14 }}>{description}</p>
      {highlighted ? <HighlightBadge /> : null}
    </article>
  );
}
