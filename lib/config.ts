import type { TariffConfig } from "./types";

export const defaultTariff: TariffConfig = {
  energyPriceEurPerKwh: 0.18,
  exportCompensationEurPerKwh: 0.08,
  fixedDailyEur: 0.45,
  electricTaxRate: 0.05113,
  vatRate: 0.21,
  limitExportCompensation: true
};
