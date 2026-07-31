import type { DailyEnergyRecord } from "../types";

const round = (value: number) => Number(value.toFixed(2));

function seededNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function buildDemoEnergyMonth(month: string): DailyEnergyRecord[] {
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const seasonalSolar = [0.72, 0.82, 1.02, 1.18, 1.34, 1.45, 1.5, 1.38, 1.17, 0.94, 0.74, 0.64][monthNumber - 1] ?? 1;
  const seasonalDemand = [1.18, 1.12, 0.98, 0.88, 0.82, 0.86, 1.08, 1.12, 0.88, 0.92, 1.04, 1.16][monthNumber - 1] ?? 1;

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = new Date(Date.UTC(year, monthNumber - 1, day));
    const weekendFactor = [0, 6].includes(date.getUTCDay()) ? 1.12 : 1;
    const cloudFactor = 0.55 + seededNoise(year * 10000 + monthNumber * 100 + day) * 0.55;
    const production = 13.4 * seasonalSolar * cloudFactor;
    const load = (9.1 * seasonalDemand * weekendFactor) + seededNoise(day * 31 + monthNumber) * 3.4;
    const directSelfConsumption = Math.min(production * (0.3 + seededNoise(day * 19) * 0.18), load * 0.72);
    const gridImport = Math.max(1.15, load - directSelfConsumption);
    const gridExport = Math.max(0, production - directSelfConsumption);

    return {
      date: `${month}-${String(day).padStart(2, "0")}`,
      gridImportKwh: round(gridImport),
      gridExportKwh: round(gridExport),
      pvProductionKwh: round(production),
      loadConsumptionKwh: round(load)
    };
  });
}
