import { HighlightBadge } from "./HighlightBadge";

interface InstrumentCardProps {
  title: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  highlighted?: boolean;
}

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
    <article className={`ob-instrument-card ob-step-card ${highlighted ? "is-highlighted" : ""}`}>
      <div className="ob-instrument-card__head">
        <h4 className="ob-instrument-card__title">{title}</h4>
        <span className={`ob-instrument-card__risk is-${riskLevel}`}>
          {RISK_LABELS[riskLevel]}
        </span>
      </div>
      <p className="ob-instrument-card__description">{description}</p>
      {highlighted ? <HighlightBadge /> : null}
    </article>
  );
}
