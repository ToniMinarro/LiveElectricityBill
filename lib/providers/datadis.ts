import type { DailyEnergyRecord } from "../types";
import { buildDemoEnergyMonth } from "./demo-data";

type DatadisMonthlyData = {
  month: string;
  datadisImportKwh: number;
  daily: DailyEnergyRecord[];
};

const round = (value: number) => Number(value.toFixed(2));

export async function fetchDatadisMonthlyData(month: string): Promise<DatadisMonthlyData> {
  const inverterDaily = buildDemoEnergyMonth(month);
  const daily = inverterDaily.map((record, index) => {
    const meterAdjustment = 1.008 + ((index % 5) - 2) * 0.0015;
    return {
      ...record,
      gridImportKwh: round(record.gridImportKwh * meterAdjustment)
    };
  });

  return {
    month,
    datadisImportKwh: round(daily.reduce((total, record) => total + record.gridImportKwh, 0)),
    daily
  };
}
