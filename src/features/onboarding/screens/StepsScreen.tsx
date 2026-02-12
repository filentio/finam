import type { CSSProperties } from "react";
import { usePersonalization } from "../hooks/usePersonalization";
import type { StepItem } from "../types/onboarding";
import type { BaseScreenProps } from "./ScreenProps";

export function StepsScreen({ screen, onNext, onPrev }: BaseScreenProps) {
  const { amountInputKey } = usePersonalization();
  const items = (screen.items ?? []) as StepItem[];

  return (
    <section style={containerStyle}>
      <h3 style={{ margin: 0 }}>{screen.title}</h3>
      <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`}>
            <strong>
              {item.icon ? `${item.icon} ` : null}
              {item.title}
            </strong>
            {item.description || item.description_variants ? (
              <p style={{ margin: "4px 0 0", color: "#5b6a80" }}>
                {item.description_variants?.[amountInputKey] ?? item.description}
              </p>
            ) : null}
          </li>
        ))}
      </ol>

      <div style={{ display: "flex", gap: 8 }}>
        <button style={ghostButtonStyle} type="button" onClick={onPrev}>
          Назад
        </button>
        <button style={primaryButtonStyle} type="button" onClick={onNext}>
          Далее
        </button>
      </div>
    </section>
  );
}

const containerStyle: CSSProperties = {
  border: "1px solid #dce5f2",
  borderRadius: 14,
  padding: 16,
  background: "#fff",
  display: "grid",
  gap: 12,
};

const primaryButtonStyle: CSSProperties = {
  border: 0,
  borderRadius: 10,
  background: "#2f5fcc",
  color: "#fff",
  padding: "10px 14px",
  cursor: "pointer",
};

const ghostButtonStyle: CSSProperties = {
  border: "1px solid #c8d4e8",
  borderRadius: 10,
  background: "#fff",
  color: "#3a4a61",
  padding: "10px 14px",
  cursor: "pointer",
};
