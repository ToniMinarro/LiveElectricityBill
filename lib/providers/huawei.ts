import type { DailyEnergyRecord } from "../types";

type HuaweiEnergyData = {
  month: string;
  daily: DailyEnergyRecord[];
};

export async function fetchHuaweiMonthlyData(
  month: string
): Promise<HuaweiEnergyData> {
  const days = Array.from({ length: 10 }).map((_, index) => {
    const day = String(index + 1).padStart(2, "0");
    return {
      date: `${month}-${day}`,
      gridImportKwh: 7.5 + index * 0.25,
      gridExportKwh: 3.2 + index * 0.18,
      pvProductionKwh: 13 + index * 0.45,
      loadConsumptionKwh: 9.8 + index * 0.35
    };
  });

  return {
    month,
    daily: days
  };
}
