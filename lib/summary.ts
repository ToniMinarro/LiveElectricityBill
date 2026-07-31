import { calculateMonthlySummary } from "./billing/calc";
import { defaultTariff } from "./config";
import { fetchDatadisMonthlyData } from "./providers/datadis";
import { fetchHuaweiMonthlyData } from "./providers/huawei";
import type { EnergySummary } from "./types";

export async function getMonthlySummary(month: string): Promise<EnergySummary> {
  const [datadisData, huaweiData] = await Promise.all([
    fetchDatadisMonthlyData(month),
    fetchHuaweiMonthlyData(month)
  ]);

  const summary = calculateMonthlySummary(
    month,
    huaweiData.daily,
    defaultTariff,
    datadisData.datadisImportKwh
  );

  return {
    ...summary,
    sources: {
      datadisImportKwh: datadisData.datadisImportKwh,
      datadisDays: datadisData.daily.length,
      huaweiDays: huaweiData.daily.length,
      mode: "demo"
    }
  };
}
