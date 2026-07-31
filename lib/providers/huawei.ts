import type { DailyEnergyRecord } from "../types";
import { buildDemoEnergyMonth } from "./demo-data";

type HuaweiEnergyData = {
  month: string;
  daily: DailyEnergyRecord[];
};

export async function fetchHuaweiMonthlyData(month: string): Promise<HuaweiEnergyData> {
  return {
    month,
    daily: buildDemoEnergyMonth(month)
  };
}
