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
  date?: string;
  day?: string;
  value?: number;
  energy?: number;
  consumption?: number;
  importKwh?: number;
};

const DEFAULT_AUTH_TIMEOUT_MS = 10000;

function getMonthRange(month: string) {
  const [year, monthValue] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthValue - 1, 1));
  const end = new Date(Date.UTC(year, monthValue, 0));
  const toIso = (date: Date) => date.toISOString().slice(0, 10);
  return {
    startDate: toIso(start),
    endDate: toIso(end)
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

function normalizeDatadisDaily(records: DatadisConsumptionRecord[], month: string): DailyEnergyRecord[] {
  if (records.length === 0) {
    return buildMockDaily(month);
  }

  return records.map((record, index) => {
    const date = record.date ?? record.day ?? `${month}-${String(index + 1).padStart(2, "0")}`;
    const gridImportKwh =
      record.value ?? record.energy ?? record.consumption ?? record.importKwh ?? 0;

    return {
      date,
      gridImportKwh,
      gridExportKwh: 0,
      pvProductionKwh: 0,
      loadConsumptionKwh: gridImportKwh
    };
  });
}

async function fetchDatadisToken(): Promise<string> {
  const authUrl = process.env.DATADIS_AUTH_URL;
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
  const baseUrl = process.env.DATADIS_CONSUMPTION_URL;
  const cups = process.env.DATADIS_CUPS;

  if (!baseUrl || !cups) {
    throw new Error("Faltan DATADIS_CONSUMPTION_URL o DATADIS_CUPS.");
  }

  const { startDate, endDate } = getMonthRange(month);
  const url = new URL(baseUrl);
  url.searchParams.set("cups", cups);
  url.searchParams.set("startDate", startDate);
  url.searchParams.set("endDate", endDate);

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
    (process.env.DATADIS_CONSUMPTION_URL && process.env.DATADIS_CUPS) &&
    (token || (process.env.DATADIS_AUTH_URL && process.env.DATADIS_USERNAME && process.env.DATADIS_PASSWORD));

  if (!hasEnv) {
    const daily = buildMockDaily(month);
    const datadisImportKwh = daily.reduce((total, record) => total + record.gridImportKwh, 0);
    return {
      month,
      datadisImportKwh: Number(datadisImportKwh.toFixed(2)),
      daily
    };
  }

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
}
