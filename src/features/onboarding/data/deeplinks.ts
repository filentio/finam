import type { AmountTier, RiskProfile } from "../types/onboarding";

export const DEEPLINKS = {
  deposit: "finamtrade://deposit",
  first_purchase: {
    conservative: "finamtrade://market/bonds/SU26238RMFS4",
    moderate: "finamtrade://market/etf/TMOS",
    aggressive: "finamtrade://market/stocks/SBER",
    ultra_aggressive: "finamtrade://market/etf/TMOS",
  } satisfies Record<RiskProfile, string>,
  tariff: {
    investor: "finamtrade://settings/tariff/investor",
    trader: "finamtrade://settings/tariff/trader",
    premium: "finamtrade://settings/tariff/premium",
  },
  tariff_by_amount: {
    starter: "finamtrade://settings/tariff/investor",
    base: "finamtrade://settings/tariff/investor",
    extended: "finamtrade://settings/tariff/trader",
    premium: "finamtrade://settings/tariff/premium",
  } satisfies Record<AmountTier, string>,
  instrument_catalog: "finamtrade://market/catalog",
  training: "finamtrade://education",
};
