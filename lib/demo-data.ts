import type { DailyEnergyRecord } from "./types";

const SOLAR_BASE_KWH = [7.2, 9.4, 12.4, 15, 17.2, 18.4, 18, 16.2, 13.4, 10.5, 7.8, 6.8];
const LOAD_BASE_KWH = [18.2, 17, 15.8, 15, 15.5, 18, 20.2, 20.8, 17.4, 15.2, 16.3, 18];

const round = (value: number) => Number(value.toFixed(2));

function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function parseMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);

  if (!year || !monthNumber || monthNumber < 1 || monthNumber > 12) {
    throw new Error(`Mes no válido: ${month}`);
  }

  return {
    year,
    monthNumber,
    days: new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  };
}

export function buildDemoEnergyData(month: string): DailyEnergyRecord[] {
  const { year, monthNumber, days } = parseMonth(month);
  const solarBase = SOLAR_BASE_KWH[monthNumber - 1];
  const loadBase = LOAD_BASE_KWH[monthNumber - 1];

  return Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const seed = year * 10000 + monthNumber * 100 + day;
    const weatherNoise = pseudoRandom(seed);
    const demandNoise = pseudoRandom(seed + 17);
    const eventNoise = pseudoRandom(seed + 41);
    const date = new Date(Date.UTC(year, monthNumber - 1, day));
    const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;

    let cloudFactor = 0.86 + weatherNoise * 0.22;
    if (demandNoise < 0.12) {
      cloudFactor *= 0.62 + eventNoise * 0.15;
    }

    const summerExtra = [6, 7, 8, 9].includes(monthNumber) && eventNoise > 0.66
      ? 2.8 + demandNoise * 3.5
      : 0;
    const winterExtra = [12, 1, 2].includes(monthNumber) && demandNoise > 0.65
      ? 2.5 + eventNoise * 2
      : 0;

    const pvProductionKwh = round(solarBase * cloudFactor);
    const loadConsumptionKwh = round(
      loadBase +
      (isWeekend ? 1.4 : 0) +
      (demandNoise - 0.5) * 3.4 +
      summerExtra +
      winterExtra
    );
    const daytimeDemandKwh = 4.4 + loadConsumptionKwh * 0.28 + (isWeekend ? 0.5 : 0) + weatherNoise * 1.2;
    const selfConsumedKwh = round(Math.min(pvProductionKwh, daytimeDemandKwh));

    return {
      date: `${month}-${String(day).padStart(2, "0")}`,
      gridImportKwh: round(Math.max(0, loadConsumptionKwh - selfConsumedKwh)),
      gridExportKwh: round(Math.max(0, pvProductionKwh - selfConsumedKwh)),
      pvProductionKwh,
      loadConsumptionKwh
    };
  });
}

export function buildDemoDatadisImport(daily: DailyEnergyRecord[]): number {
  const inverterImport = daily.reduce((total, record) => total + record.gridImportKwh, 0);
  return round(inverterImport * 1.0065);
}
