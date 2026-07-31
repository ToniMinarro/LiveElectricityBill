import { buildDemoEnergyData } from "../demo-data";
import type { DailyEnergyRecord } from "../types";

type HuaweiEnergyData = {
  month: string;
  daily: DailyEnergyRecord[];
};

export async function fetchHuaweiMonthlyData(month: string): Promise<HuaweiEnergyData> {
  return {
    month,
    daily: buildDemoEnergyData(month)
  };
}
