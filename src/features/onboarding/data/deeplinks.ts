import type { AmountTier, RiskProfile, TariffId } from "../types/onboarding";

export const DEEPLINKS = {
  deposit: "finamtrade://deposit",
  first_purchase: {
    conservative: "finamtrade://market/bonds/SU26238RMFS4",
    moderate: "finamtrade://market/etf/TMOS",
    aggressive: "finamtrade://market/stocks/SBER",
    ultra_aggressive: "finamtrade://market/etf/TMOS",
  } satisfies Record<RiskProfile, string>,
  tariff: {
    "long-term": "finamtrade://settings/tariff/long-term",
    investor: "finamtrade://settings/tariff/investor",
    strategist: "finamtrade://settings/tariff/strategist",
    "unified-daily": "finamtrade://settings/tariff/unified-daily",
  } satisfies Record<TariffId, string>,
  tariff_by_amount: {
    starter: "finamtrade://settings/tariff/long-term",
    base: "finamtrade://settings/tariff/investor",
    extended: "finamtrade://settings/tariff/strategist",
    premium: "finamtrade://settings/tariff/unified-daily",
  } satisfies Record<AmountTier, string>,
  instrument_catalog: "finamtrade://market/catalog",
  training: "finamtrade://education",
};
