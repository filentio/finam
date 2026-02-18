import { HighlightBadge } from "./HighlightBadge";

interface InstrumentCardProps {
  title: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  highlighted?: boolean;
}

const RISK_COLORS: Record<InstrumentCardProps["riskLevel"], string> = {
  low: "var(--ob-risk-low)",
  medium: "var(--ob-risk-medium)",
  high: "var(--ob-risk-high)",
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
    <article className={`ob-instrument-card ${highlighted ? "is-highlighted" : ""}`}>
      <div className="ob-instrument-card__head">
        <h4 className="ob-instrument-card__title">{title}</h4>
        <span
          className="ob-instrument-card__risk"
          style={{ color: RISK_COLORS[riskLevel] }}
        >
          {RISK_LABELS[riskLevel]}
        </span>
      </div>
      <p className="ob-instrument-card__description">{description}</p>
      {highlighted ? <HighlightBadge /> : null}
    </article>
  );
}
