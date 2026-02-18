import { usePersonalization } from "../hooks/usePersonalization";
import type { StepItem } from "../types/onboarding";
import type { BaseScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

export function StepsScreen({ screen }: BaseScreenProps) {
  const { amountInputKey } = usePersonalization();
  const items = (screen.items ?? []) as StepItem[];

  return (
    <ScreenShell title={screen.title} subtitle={screen.subtitle}>
      <ol className="ob-points">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="ob-card">
            <strong className="ob-step-item__title">
              {item.icon ? `${item.icon} ` : null}
              {item.title}
            </strong>
            {item.description || item.description_variants ? (
              <p className="ob-step-item__description">
                {item.description_variants?.[amountInputKey] ?? item.description}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </ScreenShell>
  );
}
