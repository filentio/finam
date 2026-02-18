import {
  CALCULATOR_DEFAULTS,
  calculateTariffCosts,
  FINAM_TARIFFS,
  TARIFF_ORDER,
} from "../data/tariffs";
import { usePersonalization } from "../hooks/usePersonalization";
import type { BaseScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

export function TariffScreen({ screen }: BaseScreenProps) {
  const { segment, amountTier } = usePersonalization();

  const portfolioAmountMap = {
    starter: 30_000,
    base: 500_000,
    extended: 2_000_000,
    premium: 5_000_000,
  } as const;
  const portfolioAmount = portfolioAmountMap[amountTier];
  const tradesPerMonth = CALCULATOR_DEFAULTS[segment].trades_per_month ?? 2;
  const recommendedTariff = calculateTariffCosts({
    portfolio_amount: portfolioAmount,
    trades_per_month: tradesPerMonth,
    avg_trade_amount: portfolioAmount / 10,
  }).recommended;

  return (
    <ScreenShell title={screen.title} subtitle={screen.subtitle}>
      <div className="ob-tariff-grid">
        {TARIFF_ORDER.map((tariffId) => {
          const tariff = FINAM_TARIFFS[tariffId];
          const isRecommended = tariffId === recommendedTariff;
          return (
            <article key={tariff.id} className="ob-card ob-tariff-card">
              <h4 className="ob-tariff-card__title">
                {tariff.name}
                {isRecommended ? <span className="ob-tariff-card__badge">⭐ Рекомендуем</span> : null}
              </h4>
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
