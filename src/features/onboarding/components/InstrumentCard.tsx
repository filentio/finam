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

const RISK_LABELS: Record<InstrumentCardProps["riskLevel"], string> = {
  low: "Низкий риск",
  medium: "Средний риск",
  high: "Высокий риск",
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
        border: `1px solid ${highlighted ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.22)"}`,
        background: highlighted ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
        padding: 10,
        display: "grid",
        gap: 6,
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
          {RISK_LABELS[riskLevel]}
        </span>
      </div>
      <p style={{ margin: 0, color: "rgba(255,255,255,0.82)", fontSize: 13 }}>{description}</p>
      {highlighted ? <HighlightBadge /> : null}
    </article>
  );
}
