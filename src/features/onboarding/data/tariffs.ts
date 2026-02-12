import type {
  Segment,
  TariffCalculatorInput,
  TariffCalculatorOutput,
  TariffRate,
} from "../types/onboarding";

export const CALCULATOR_DEFAULTS: Record<Segment, Partial<TariffCalculatorInput>> = {
  novice: { trades_per_month: 2 },
  advanced: { trades_per_month: 10 },
  expert: { trades_per_month: 50 },
};

export const TARIFF_RATES: Record<"investor" | "trader" | "premium", TariffRate> = {
  investor: {
    monthly_fee: 0,
    commission_rate: 0.00354,
    min_commission: 0,
  },
  trader: {
    monthly_fee: 200,
    commission_rate: 0.00177,
    min_commission: 0,
  },
  premium: {
    monthly_fee: 0,
    commission_rate: 0.000472,
    min_commission: 0,
    min_portfolio: 3_000_000,
  },
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateTariffCosts(
  input: TariffCalculatorInput,
): TariffCalculatorOutput {
  const tradeVolumePerMonth = input.trades_per_month * input.avg_trade_amount;

  const totals = {
    investor: TARIFF_RATES.investor,
    trader: TARIFF_RATES.trader,
    premium:
      input.portfolio_amount >= (TARIFF_RATES.premium.min_portfolio ?? Number.MAX_SAFE_INTEGER)
        ? TARIFF_RATES.premium
        : TARIFF_RATES.trader,
  };

  const investorCommission = tradeVolumePerMonth * totals.investor.commission_rate;
  const traderCommission = tradeVolumePerMonth * totals.trader.commission_rate;
  const premiumCommission = tradeVolumePerMonth * totals.premium.commission_rate;

  const investorTotal = totals.investor.monthly_fee + investorCommission;
  const traderTotal = totals.trader.monthly_fee + traderCommission;
  const premiumTotal = totals.premium.monthly_fee + premiumCommission;

  let recommended: TariffCalculatorOutput["recommended"] = "investor";
  if (traderTotal < investorTotal && traderTotal <= premiumTotal) {
    recommended = "trader";
  } else if (premiumTotal < investorTotal && premiumTotal < traderTotal) {
    recommended = "premium";
  }

  return {
    tariffs: {
      investor: {
        monthly_fee: roundMoney(totals.investor.monthly_fee),
        commission_total: roundMoney(investorCommission),
        total: roundMoney(investorTotal),
      },
      trader: {
        monthly_fee: roundMoney(totals.trader.monthly_fee),
        commission_total: roundMoney(traderCommission),
        total: roundMoney(traderTotal),
      },
      premium: {
        monthly_fee: roundMoney(totals.premium.monthly_fee),
        commission_total: roundMoney(premiumCommission),
        total: roundMoney(premiumTotal),
      },
    },
    recommended,
  };
}
