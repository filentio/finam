import { FINAM_TARIFFS, TARIFF_ORDER } from "../data/tariffs";
import type { BaseScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

export function TariffScreen({ screen }: BaseScreenProps) {
  return (
    <ScreenShell title={screen.title} subtitle={screen.subtitle}>
      <div className="ob-tariff-grid">
        {TARIFF_ORDER.map((tariffId) => {
          const tariff = FINAM_TARIFFS[tariffId];
          return (
            <article key={tariff.id} className="ob-card ob-tariff-card">
              <h4 className="ob-tariff-card__title">{tariff.name}</h4>
              <p className="ob-tariff-card__meta">
                Абонплата: {tariff.monthly_fee} ₽/мес
              </p>
              <p className="ob-tariff-card__meta">
                Покупка: {(tariff.buy_commission_rate * 100).toFixed(3)}% • Продажа:{" "}
                {(tariff.sell_commission_rate * 100).toFixed(3)}%
                {tariff.min_commission > 0 ? ` • Мин: ${tariff.min_commission} ₽` : ""}
              </p>
              <p className="ob-tariff-card__description">{tariff.description}</p>
            </article>
          );
        })}
      </div>
    </ScreenShell>
  );
}
