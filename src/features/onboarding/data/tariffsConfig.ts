import type {
  Segment,
  TariffCalculatorInput,
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
      "Абонплата 0 ₽/мес. Покупка бесплатно, продажа 0,28%. Идеален для стратегии «купил и держу».",
    best_for: "Покупаю и держу (0-2 сделки/мес)",
  },
  investor: {
    id: "investor",
    name: "Инвестор",
    monthly_fee: 200,
    buy_commission_rate: 0.00035,
    sell_commission_rate: 0.00035,
    min_commission: 0,
    description:
      "Абонплата 200 ₽/мес + комиссия 0,035% на покупку и продажу акций и облигаций.",
    best_for: "Редко торгую (1-5 сделок/мес)",
  },
  strategist: {
    id: "strategist",
    name: "Стратег",
    monthly_fee: 0,
    buy_commission_rate: 0.0005,
    sell_commission_rate: 0.0005,
    min_commission: 50,
    description: "Абонплата 0 ₽/мес. Комиссия 0,05% (мин. 50 ₽ за сделку).",
    best_for: "Регулярно торгую (10+ сделок/мес)",
  },
  "unified-daily": {
    id: "unified-daily",
    name: "Единый дневной",
    monthly_fee: 177,
    buy_commission_rate: 0.000354,
    sell_commission_rate: 0.000354,
    min_commission: 41.3,
    description: "Абонплата 177 ₽/мес. Комиссия 0,0354% (мин. 41,3 ₽ за сделку).",
    best_for: "Активно торгую (каждый день)",
  },
};
