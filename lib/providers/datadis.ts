import { buildDemoDatadisImport, buildDemoEnergyData } from "../demo-data";
import type { DailyEnergyRecord } from "../types";

type DatadisMonthlyData = {
  month: string;
  datadisImportKwh: number;
  daily: DailyEnergyRecord[];
};

export async function fetchDatadisMonthlyData(month: string): Promise<DatadisMonthlyData> {
  const daily = buildDemoEnergyData(month);

  return {
    month,
    datadisImportKwh: buildDemoDatadisImport(daily),
    daily
  };
}
