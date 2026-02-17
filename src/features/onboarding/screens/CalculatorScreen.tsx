import { FINAM_TARIFFS, TARIFF_ORDER } from "../data/tariffs";
import type { CalculatorScreenProps } from "./ScreenProps";
import { ScreenShell } from "./ScreenShell";

export function CalculatorScreen({
  screen,
  calculatorOutput,
}: CalculatorScreenProps) {
  return (
    <ScreenShell title={screen.title} subtitle={screen.subtitle}>
      <div className="ob-tariff-grid">
        {TARIFF_ORDER.map((tariffId) => {
          const values = calculatorOutput.tariffs[tariffId];
          const isRecommended = calculatorOutput.recommended === tariffId;
          return (
            <article
              key={tariffId}
              className={`ob-card ob-calculator-card ${isRecommended ? "is-recommended" : ""}`}
            >
              <h4 className="ob-tariff-card__title">{FINAM_TARIFFS[tariffId].name}</h4>
              <p className="ob-tariff-card__meta">
                Годовая абонплата: {values.monthly_fee.toLocaleString("ru-RU")} ₽
              </p>
              <p className="ob-tariff-card__meta">
                Комиссии за год: {values.commission_total.toLocaleString("ru-RU")} ₽
              </p>
              <p className="ob-tariff-card__total">
                Итого за год: {values.total.toLocaleString("ru-RU")} ₽
              </p>
            </article>
          );
        })}
      </div>
      <p className="ob-screen__subtitle">
        Рекомендуемый тариф: {FINAM_TARIFFS[calculatorOutput.recommended].name}
      </p>
    </ScreenShell>
  );
}
