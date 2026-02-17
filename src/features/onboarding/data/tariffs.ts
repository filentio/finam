import type {
  Segment,
  TariffCalculatorInput,
  TariffCalculatorOutput,
  TariffId,
  TariffRate,
} from "../types/onboarding";

export const CALCULATOR_DEFAULTS: Record<Segment, Partial<TariffCalculatorInput>> = {
  novice: { trades_per_month: 2 },
  advanced: { trades_per_month: 8 },
  expert: { trades_per_month: 20 },
};

export const TARIFF_ORDER: TariffId[] = [
  "long-term",
  "investor",
  "strategist",
  "unified-daily",
];

export const FINAM_TARIFFS: Record<TariffId, TariffRate> = {
  "long-term": {
    id: "long-term",
    name: "Долгосрочный портфель",
    monthly_fee: 0,
    buy_commission_rate: 0,
    sell_commission_rate: 0.0028,
    min_commission: 0,
    description:
      "Покупка бесплатно, продажа 0,28%. Идеален для стратегии «купил и держу».",
    best_for: "Покупаю и держу (0-2 сделки/мес)",
  },
  investor: {
    id: "investor",
    name: "Инвестор",
    monthly_fee: 200,
    buy_commission_rate: 0.00035,
    sell_commission_rate: 0.00035,
    min_commission: 0,
    description: "200 ₽/мес. Комиссия 0,035% на акции и облигации.",
    best_for: "Редко торгую (1-5 сделок/мес)",
  },
  strategist: {
    id: "strategist",
    name: "Стратег",
    monthly_fee: 0,
    buy_commission_rate: 0.0005,
    sell_commission_rate: 0.0005,
    min_commission: 50,
    description: "0 ₽/мес. Комиссия 0,05% (мин. 50 ₽ за сделку).",
    best_for: "Регулярно торгую (10+ сделок/мес)",
  },
  "unified-daily": {
    id: "unified-daily",
    name: "Единый дневной",
    monthly_fee: 177,
    buy_commission_rate: 0.000354,
    sell_commission_rate: 0.000354,
    min_commission: 41.3,
    description: "177 ₽/мес. Комиссия 0,0354% (мин. 41,3 ₽).",
    best_for: "Активно торгую (каждый день)",
  },
};

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
  const yearlyTotals: TariffCalculatorOutput["tariffs"] = {
    "long-term": {
      monthly_fee: 0,
      commission_total: 0,
      total: 0,
    },
    investor: {
      monthly_fee: 0,
      commission_total: 0,
      total: 0,
    },
    strategist: {
      monthly_fee: 0,
      commission_total: 0,
      total: 0,
    },
    "unified-daily": {
      monthly_fee: 0,
      commission_total: 0,
      total: 0,
    },
  };

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
