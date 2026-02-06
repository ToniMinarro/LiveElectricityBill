import type { DailyEnergyRecord } from "../types";

type DatadisMonthlyData = {
  month: string;
  datadisImportKwh: number;
  daily: DailyEnergyRecord[];
};

type DatadisAuthResponse = {
  access_token?: string;
  token?: string;
};

type DatadisConsumptionRecord = {
  dateTime?: string;
  datetime?: string;
  date?: string;
  day?: string;
  value?: number;
  energy?: number;
  consumption?: number;
  consumptionKwh?: number;
  importKwh?: number;
};

const DEFAULT_AUTH_TIMEOUT_MS = 10000;
const DEFAULT_DATADIS_BASE_URL = "https://api.datadis.es/api/v1";
const DEFAULT_DATADIS_DATE_SEPARATOR = "/";

function formatDatadisDate(date: Date, separator = DEFAULT_DATADIS_DATE_SEPARATOR) {
  const year = date.getUTCFullYear();
  const monthValue = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dayValue = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${separator}${monthValue}${separator}${dayValue}`;
}

function getMonthRange(month: string) {
  const [year, monthValue] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthValue - 1, 1));
  const end = new Date(Date.UTC(year, monthValue, 0));
  const separator = process.env.DATADIS_DATE_SEPARATOR ?? DEFAULT_DATADIS_DATE_SEPARATOR;
  const toDatadis = (date: Date) => formatDatadisDate(date, separator);
  return {
    startDate: toDatadis(start),
    endDate: toDatadis(end)
  };
}

function buildMockDaily(month: string): DailyEnergyRecord[] {
  return Array.from({ length: 10 }).map((_, index) => {
    const day = String(index + 1).padStart(2, "0");
    return {
      date: `${month}-${day}`,
      gridImportKwh: 8 + index * 0.3,
      gridExportKwh: 3 + index * 0.2,
      pvProductionKwh: 12 + index * 0.5,
      loadConsumptionKwh: 10 + index * 0.4
    };
  });
}

function buildMockMonthlyData(month: string): DatadisMonthlyData {
  const daily = buildMockDaily(month);
  const datadisImportKwh = daily.reduce((total, record) => total + record.gridImportKwh, 0);

  return {
    month,
    datadisImportKwh: Number(datadisImportKwh.toFixed(2)),
    daily
  };
}

function normalizeDatadisDaily(records: DatadisConsumptionRecord[], month: string): DailyEnergyRecord[] {
  if (records.length === 0) {
    return buildMockDaily(month);
  }

  const dailyTotals = new Map<string, number>();
  const fallbackPrefix = `${month}-`;

  records.forEach((record, index) => {
    const rawDate =
      record.dateTime ??
      record.datetime ??
      record.date ??
      record.day ??
      `${fallbackPrefix}${String(index + 1).padStart(2, "0")}`;

    const normalizedDate = rawDate
      .slice(0, 10)
      .replaceAll("/", "-")
      .replace(/\s.*/, "");

    const gridImportKwh =
      record.value ??
      record.energy ??
      record.consumption ??
      record.consumptionKwh ??
      record.importKwh ??
      0;

    const previous = dailyTotals.get(normalizedDate) ?? 0;
    dailyTotals.set(normalizedDate, previous + gridImportKwh);
  });

  if (dailyTotals.size === 0) {
    return buildMockDaily(month);
  }

  return Array.from(dailyTotals.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, gridImportKwh]) => ({
      date,
      gridImportKwh,
      gridExportKwh: 0,
      pvProductionKwh: 0,
      loadConsumptionKwh: gridImportKwh
    }));
}

async function fetchDatadisToken(): Promise<string> {
  const authUrl =
    process.env.DATADIS_AUTH_URL ??
    new URL("authorize", `${process.env.DATADIS_BASE_URL ?? DEFAULT_DATADIS_BASE_URL}/`).toString();
  const username = process.env.DATADIS_USERNAME;
  const password = process.env.DATADIS_PASSWORD;

  if (!authUrl || !username || !password) {
    throw new Error("Faltan DATADIS_AUTH_URL, DATADIS_USERNAME o DATADIS_PASSWORD.");
  }

  const response = await fetch(authUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
    signal: AbortSignal.timeout(DEFAULT_AUTH_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`Datadis auth error: ${response.status}`);
  }

  const payload = (await response.json()) as DatadisAuthResponse;
  const token = payload.access_token ?? payload.token;

  if (!token) {
    throw new Error("La respuesta de Datadis no incluye token.");
  }

  return token;
}

function buildDatadisUrl(month: string): string {
  const baseUrl =
    process.env.DATADIS_CONSUMPTION_URL ??
    new URL("consumption", `${process.env.DATADIS_BASE_URL ?? DEFAULT_DATADIS_BASE_URL}/`).toString();
  const cups = process.env.DATADIS_CUPS;
  const distributor = process.env.DATADIS_DISTRIBUTOR;

  if (!baseUrl || !cups) {
    throw new Error("Faltan DATADIS_CONSUMPTION_URL/DATADIS_BASE_URL o DATADIS_CUPS.");
  }

  if (!distributor && !process.env.DATADIS_CONSUMPTION_URL) {
    throw new Error("Falta DATADIS_DISTRIBUTOR para la API oficial de Datadis.");
  }

  const { startDate, endDate } = getMonthRange(month);
  const url = new URL(baseUrl);
  url.searchParams.set("cups", cups);
  url.searchParams.set("startDate", startDate);
  url.searchParams.set("endDate", endDate);
  if (distributor) {
    url.searchParams.set("distributor", distributor);
  }

  const measurementType = process.env.DATADIS_MEASUREMENT_TYPE;
  const pointType = process.env.DATADIS_POINT_TYPE;
  const granularity = process.env.DATADIS_GRANULARITY;
  if (measurementType) {
    url.searchParams.set("measurementType", measurementType);
  }
  if (pointType) {
    url.searchParams.set("pointType", pointType);
  }
  if (granularity) {
    url.searchParams.set("granularity", granularity);
  }

  return url.toString();
}

function resolveRecords(payload: unknown): DatadisConsumptionRecord[] {
  if (Array.isArray(payload)) {
    return payload as DatadisConsumptionRecord[];
  }

  if (payload && typeof payload === "object") {
    const recordPayload = payload as { data?: unknown; records?: unknown };
    if (Array.isArray(recordPayload.data)) {
      return recordPayload.data as DatadisConsumptionRecord[];
    }
    if (Array.isArray(recordPayload.records)) {
      return recordPayload.records as DatadisConsumptionRecord[];
    }
  }

  return [];
}

export async function fetchDatadisMonthlyData(month: string): Promise<DatadisMonthlyData> {
  const token = process.env.DATADIS_TOKEN;
  const hasEnv =
    (process.env.DATADIS_CUPS &&
      (process.env.DATADIS_CONSUMPTION_URL || process.env.DATADIS_BASE_URL) &&
      (process.env.DATADIS_CONSUMPTION_URL || process.env.DATADIS_DISTRIBUTOR)) &&
    (token || (process.env.DATADIS_USERNAME && process.env.DATADIS_PASSWORD));

  if (!hasEnv) {
    return buildMockMonthlyData(month);
  }

  try {
    const authToken = token ?? (await fetchDatadisToken());
    const consumptionUrl = buildDatadisUrl(month);
    const response = await fetch(consumptionUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      cache: "no-store",
      signal: AbortSignal.timeout(DEFAULT_AUTH_TIMEOUT_MS)
    });

    if (!response.ok) {
      throw new Error(`Datadis consumption error: ${response.status}`);
    }

    const payload = await response.json();
    const records = resolveRecords(payload);
    const daily = normalizeDatadisDaily(records, month);
    const datadisImportKwh = daily.reduce((total, record) => total + record.gridImportKwh, 0);

    return {
      month,
      datadisImportKwh: Number(datadisImportKwh.toFixed(2)),
      daily
    };
  } catch (error) {
    console.error("Datadis provider failed, using mock data.", error);
    return buildMockMonthlyData(month);
  }
}
