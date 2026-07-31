import { NextResponse } from "next/server";
import { getMonthlySummary } from "../../../lib/summary";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const month = url.searchParams.get("month") ?? new Date().toISOString().slice(0, 7);

  try {
    return NextResponse.json(await getMonthlySummary(month));
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo calcular el resumen";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
