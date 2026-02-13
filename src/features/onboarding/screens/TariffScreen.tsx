import { TARIFF_RATES } from "../data/tariffs";
import type { BaseScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

export function TariffScreen({ screen }: BaseScreenProps) {
  return (
    <ScreenShell title={screen.title} subtitle={screen.subtitle}>
      <div style={{ display: "grid", gap: 8 }}>
        {Object.entries(TARIFF_RATES).map(([name, rate]) => (
          <article
            key={name}
            style={{
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 12,
              background: "rgba(255,255,255,0.12)",
              padding: 10,
            }}
          >
            <h4 style={{ margin: 0, textTransform: "capitalize" }}>{name}</h4>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
              Абонплата: {rate.monthly_fee} ₽ • Комиссия: {(rate.commission_rate * 100).toFixed(3)}
              %
            </p>
          </article>
        ))}
      </div>
    </ScreenShell>
  );
}
