export type DailyEnergyRecord = {
  date: string;
  gridImportKwh: number;
  gridExportKwh: number;
  pvProductionKwh: number;
  loadConsumptionKwh: number;
};

export type TariffConfig = {
  energyPriceEurPerKwh: number;
  exportCompensationEurPerKwh: number;
  fixedDailyEur: number;
  electricTaxRate: number;
  vatRate: number;
  limitExportCompensation: boolean;
};

export type MonthlySummary = {
  month: string;
  totals: {
    gridImportKwh: number;
    gridExportKwh: number;
    pvProductionKwh: number;
    loadConsumptionKwh: number;
  };
  costs: {
    energyCost: number;
    exportCredit: number;
    fixedCharges: number;
    electricTax: number;
    vat: number;
    total: number;
  };
  discrepancyPercent: number;
  daily: DailyEnergyRecord[];
};

export type SummarySources = {
  datadisImportKwh: number;
  datadisDays: number;
  huaweiDays: number;
  mode: "demo";
};

export type EnergySummary = MonthlySummary & {
  sources: SummarySources;
};
