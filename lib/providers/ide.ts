import type { DailyEnergyRecord } from "../types";

type IdeMonthlyData = {
  month: string;
  ideImportKwh: number;
  daily: DailyEnergyRecord[];
};

export async function fetchIdeMonthlyData(month: string): Promise<IdeMonthlyData> {
  const days = Array.from({ length: 10 }).map((_, index) => {
    const day = String(index + 1).padStart(2, "0");
    return {
      date: `${month}-${day}`,
      gridImportKwh: 8 + index * 0.3,
      gridExportKwh: 3 + index * 0.2,
      pvProductionKwh: 12 + index * 0.5,
      loadConsumptionKwh: 10 + index * 0.4
    };
  });

  const ideImportKwh = days.reduce((total, record) => total + record.gridImportKwh, 0);

  return {
    month,
    ideImportKwh: Number(ideImportKwh.toFixed(2)),
    daily: days
  };
}
