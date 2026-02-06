import type { DailyEnergyRecord, MonthlySummary, TariffConfig } from "../types";

const round = (value: number) => Number(value.toFixed(2));

export function calculateMonthlySummary(
  month: string,
  daily: DailyEnergyRecord[],
  tariff: TariffConfig,
  datadisImportKwh: number
): MonthlySummary {
  const totals = daily.reduce(
    (acc, record) => {
      acc.gridImportKwh += record.gridImportKwh;
      acc.gridExportKwh += record.gridExportKwh;
      acc.pvProductionKwh += record.pvProductionKwh;
      acc.loadConsumptionKwh += record.loadConsumptionKwh;
      return acc;
    },
    {
      gridImportKwh: 0,
      gridExportKwh: 0,
      pvProductionKwh: 0,
      loadConsumptionKwh: 0
    }
  );

  const energyCost = totals.gridImportKwh * tariff.energyPriceEurPerKwh;
  const rawExportCredit = totals.gridExportKwh * tariff.exportCompensationEurPerKwh;
  const exportCredit = tariff.limitExportCompensation
    ? Math.min(rawExportCredit, energyCost)
    : rawExportCredit;
  const fixedCharges = daily.length * tariff.fixedDailyEur;
  const subtotal = energyCost - exportCredit + fixedCharges;
  const electricTax = subtotal * tariff.electricTaxRate;
  const vat = (subtotal + electricTax) * tariff.vatRate;
  const total = subtotal + electricTax + vat;

  const discrepancyPercent = datadisImportKwh === 0
    ? 0
    : ((datadisImportKwh - totals.gridImportKwh) / datadisImportKwh) * 100;

  return {
    month,
    totals: {
      gridImportKwh: round(totals.gridImportKwh),
      gridExportKwh: round(totals.gridExportKwh),
      pvProductionKwh: round(totals.pvProductionKwh),
      loadConsumptionKwh: round(totals.loadConsumptionKwh)
    },
    costs: {
      energyCost: round(energyCost),
      exportCredit: round(exportCredit),
      fixedCharges: round(fixedCharges),
      electricTax: round(electricTax),
      vat: round(vat),
      total: round(total)
    },
    discrepancyPercent: round(discrepancyPercent),
    daily
  };
}
