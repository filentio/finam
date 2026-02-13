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
            <strong style={{ display: "block", marginBottom: 4 }}>
              {item.icon ? `${item.icon} ` : null}
              {item.title}
            </strong>
            {item.description || item.description_variants ? (
              <p style={{ margin: 0, color: "rgba(255,255,255,0.76)", fontSize: 13 }}>
                {item.description_variants?.[amountInputKey] ?? item.description}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </ScreenShell>
  );
}
