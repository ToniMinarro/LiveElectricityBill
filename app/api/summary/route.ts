import { NextResponse } from "next/server";
import { defaultTariff } from "../../../lib/config";
import { calculateMonthlySummary } from "../../../lib/billing/calc";
import { fetchHuaweiMonthlyData } from "../../../lib/providers/huawei";
import { fetchDatadisMonthlyData } from "../../../lib/providers/datadis";
import { getCache, setCache } from "../../../lib/store";

const SUMMARY_TTL_MS = 1000 * 60 * 5;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const month = url.searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
  const cacheKey = `summary:${month}`;

  const cached = getCache(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

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

  const response = {
    ...summary,
    sources: {
      datadisImportKwh: datadisData.datadisImportKwh,
      datadisDays: datadisData.daily.length,
      huaweiDays: huaweiData.daily.length
    }
  };

  setCache(cacheKey, response, SUMMARY_TTL_MS);

  return NextResponse.json(response);
}
