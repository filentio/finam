import type {
  TariffCalculatorInput,
  TariffCalculatorOutput,
  TariffId,
  TariffRate,
} from "../types/onboarding";
import {
  CALCULATOR_DEFAULTS,
  FINAM_TARIFFS,
  TARIFF_ORDER,
} from "./tariffsConfig";

export { CALCULATOR_DEFAULTS, FINAM_TARIFFS, TARIFF_ORDER };

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function recommendTariff(
  tradesPerMonth: number,
  avgTradeAmount: number,
): TariffId {
  if (tradesPerMonth <= 2) {
    return "long-term";
  }
  if (tradesPerMonth <= 5) {
    return "investor";
  }
  if (tradesPerMonth <= 15) {
    return "strategist";
  }
  // For daily activity, monthly fee is offset by lower per-trade cost.
  if (avgTradeAmount > 0) {
    return "unified-daily";
  }
  return "strategist";
}

function calcYearlyCost(
  tariff: TariffRate,
  tradesPerMonth: number,
  avgAmount: number,
): { monthlyFee: number; yearlyCommission: number; total: number } {
  const monthlyFee = tariff.monthly_fee * 12;
  const commissionPerTrade = Math.max(
    avgAmount * tariff.buy_commission_rate,
    tariff.min_commission,
  );
  const yearlyCommission = commissionPerTrade * tradesPerMonth * 12;
  return {
    monthlyFee: roundMoney(monthlyFee),
    yearlyCommission: roundMoney(yearlyCommission),
    total: roundMoney(monthlyFee + yearlyCommission),
  };
}

export function calculateTariffCosts(
  input: TariffCalculatorInput,
): TariffCalculatorOutput {
  const yearlyTotals = TARIFF_ORDER.reduce<TariffCalculatorOutput["tariffs"]>(
    (acc, tariffId) => {
      acc[tariffId] = {
        monthly_fee: 0,
        commission_total: 0,
        total: 0,
      };
      return acc;
    },
    {} as TariffCalculatorOutput["tariffs"],
  );

  TARIFF_ORDER.forEach((tariffId) => {
    const totals = calcYearlyCost(
      FINAM_TARIFFS[tariffId],
      input.trades_per_month,
      input.avg_trade_amount,
    );
    yearlyTotals[tariffId] = {
      monthly_fee: totals.monthlyFee,
      commission_total: totals.yearlyCommission,
      total: totals.total,
    };
  });

  const recommendationByTradeCount = recommendTariff(
    input.trades_per_month,
    input.avg_trade_amount,
  );
  let recommended = recommendationByTradeCount;
  let recommendedCost = yearlyTotals[recommended].total;

  // If another tariff is objectively cheaper for same scenario, prefer it.
  TARIFF_ORDER.forEach((tariffId) => {
    if (yearlyTotals[tariffId].total < recommendedCost) {
      recommended = tariffId;
      recommendedCost = yearlyTotals[tariffId].total;
    }
  });

  if (input.portfolio_amount <= 0 || input.avg_trade_amount <= 0) {
    recommended = recommendationByTradeCount;
  }

  return {
    tariffs: yearlyTotals,
    recommended,
  };
}
