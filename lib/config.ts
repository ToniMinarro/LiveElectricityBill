import type { TariffConfig } from "./types";

export const defaultTariff: TariffConfig = {
  energyPriceEurPerKwh: 0.141,
  exportCompensationEurPerKwh: 0.06,
  fixedDailyEur: 0.5,
  electricTaxRate: 0.05113,
  vatRate: 0.21,
  limitExportCompensation: true
};
