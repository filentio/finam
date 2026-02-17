import { usePersonalization } from "../hooks/usePersonalization";
import type { BaseScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

export function ContentScreen({ screen }: BaseScreenProps) {
  const { getContentVariantObject } = usePersonalization();

  const amountVariant = screen.content_variants?.by_amount
    ? getContentVariantObject(screen.content_variants.by_amount, "amount")
    : null;
  const goalVariant = screen.content_variants?.by_goal
    ? getContentVariantObject(screen.content_variants.by_goal, "goal")
    : null;
  const segmentVariant = screen.content_variants?.by_segment
    ? getContentVariantObject(screen.content_variants.by_segment, "segment")
    : null;
  const riskVariant = screen.content_variants?.by_risk_profile
    ? getContentVariantObject(screen.content_variants.by_risk_profile, "risk")
    : null;

  const activeVariant = amountVariant ?? goalVariant ?? segmentVariant ?? riskVariant;
  const text = activeVariant?.text ?? screen.content;
  const hasYieldNumbers = [text, activeVariant?.highlight, ...((screen.key_points ?? []) as string[])].some(
    (entry) => Boolean(entry && /(\d+[.,]?\d*\s*%|доходност|годов)/i.test(entry)),
  );

  return (
    <ScreenShell title={screen.title} subtitle={screen.subtitle}>
      {text ? <p className="ob-screen__subtitle">{text}</p> : null}
      {activeVariant?.highlight ? <p className="ob-card">{activeVariant.highlight}</p> : null}
      {activeVariant?.tip ? <p className="ob-screen__subtitle">💡 {activeVariant.tip}</p> : null}
      {screen.key_points?.length ? (
        <ul className="ob-points">
          {screen.key_points.slice(0, 4).map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}
      {hasYieldNumbers ? (
        <p className="ob-screen__disclaimer">
          * Прошлая доходность не гарантирует будущую. Данные носят информационный характер.
        </p>
      ) : null}
    </ScreenShell>
  );
}
