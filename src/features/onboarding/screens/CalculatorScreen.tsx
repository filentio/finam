import type { CalculatorScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

export function CalculatorScreen({
  screen,
  calculatorOutput,
}: CalculatorScreenProps) {
  return (
    <ScreenShell title={screen.title} subtitle={screen.subtitle}>
      <div style={{ display: "grid", gap: 8 }}>
        {Object.entries(calculatorOutput.tariffs).map(([name, values]) => (
          <article
            key={name}
            style={{
              borderRadius: 12,
              border:
                calculatorOutput.recommended === name
                  ? "2px solid rgba(255,255,255,0.75)"
                  : "1px solid rgba(255,255,255,0.24)",
              background:
                calculatorOutput.recommended === name
                  ? "rgba(255,255,255,0.22)"
                  : "rgba(255,255,255,0.1)",
              padding: 10,
            }}
          >
            <h4 style={{ margin: 0, textTransform: "capitalize" }}>{name}</h4>
            <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.82)", fontSize: 13 }}>
              Абонплата: {values.monthly_fee} ₽ • Комиссия: {values.commission_total} ₽ • Итого:{" "}
              {values.total} ₽
            </p>
          </article>
        ))}
      </div>
    </ScreenShell>
  );
}
