import { headers } from "next/headers";
import type { MonthlySummary } from "../lib/types";

const money = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const number = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" });

function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const host = headers().get("host") ?? "localhost:3000";
  return `${host.startsWith("localhost") ? "http" : "https"}://${host}`;
}

async function fetchSummary(): Promise<MonthlySummary & { sources: Record<string, number> }> {
  const response = await fetch(`${getBaseUrl()}/api/summary`, { cache: "no-store" });
  if (!response.ok) throw new Error("No se pudo cargar el resumen energético");
  return response.json();
}

export default async function Page() {
  const summary = await fetchSummary();
  const maxEnergy = Math.max(...summary.daily.map((item) => Math.max(item.pvProductionKwh, item.loadConsumptionKwh)));
  const selfConsumed = Math.max(0, summary.totals.pvProductionKwh - summary.totals.gridExportKwh);
  const selfConsumptionRate = summary.totals.pvProductionKwh > 0 ? selfConsumed / summary.totals.pvProductionKwh * 100 : 0;
  const solarCoverage = summary.totals.loadConsumptionKwh > 0 ? selfConsumed / summary.totals.loadConsumptionKwh * 100 : 0;

  return (
    <main>
      <nav className="topbar">
        <a className="brand" href="https://minarrolabs.dev">Minarrolabs</a>
        <span className="demo-pill">Demo con datos simulados</span>
      </nav>

      <header className="hero">
        <div>
          <p className="eyebrow">Dashboard energético</p>
          <h1>Tu factura eléctrica, antes de que llegue</h1>
          <p className="intro">Una vista unificada de consumo, producción solar, excedentes y costes para entender cómo evoluciona el mes.</p>
        </div>
        <div className="total-card">
          <span>Estimación del mes</span>
          <strong>{money.format(summary.costs.total)}</strong>
          <small>Incluye energía, potencia, impuestos y compensación</small>
        </div>
      </header>

      <section className="metrics">
        <article><span>Consumo del hogar</span><strong>{number.format(summary.totals.loadConsumptionKwh)} kWh</strong><small>Demanda total estimada</small></article>
        <article><span>Producción solar</span><strong>{number.format(summary.totals.pvProductionKwh)} kWh</strong><small>{number.format(solarCoverage)} % del consumo cubierto</small></article>
        <article><span>Importación de red</span><strong>{number.format(summary.sources.datadisImportKwh)} kWh</strong><small>Lectura simulada de distribuidora</small></article>
        <article><span>Excedentes</span><strong>{number.format(summary.totals.gridExportKwh)} kWh</strong><small>{money.format(summary.costs.exportCredit)} compensados</small></article>
      </section>

      <section className="grid-two">
        <article className="panel chart-panel">
          <div className="panel-heading"><div><p className="eyebrow">Evolución diaria</p><h2>Producción frente a consumo</h2></div><div className="legend"><span className="solar-dot">Solar</span><span className="load-dot">Consumo</span></div></div>
          <div className="chart" aria-label="Gráfico diario de producción y consumo">
            {summary.daily.map((day) => (
              <div className="chart-day" key={day.date} title={`${day.date}: ${day.pvProductionKwh} kWh solar, ${day.loadConsumptionKwh} kWh consumo`}>
                <div className="bars"><i className="solar-bar" style={{ height: `${day.pvProductionKwh / maxEnergy * 100}%` }} /><i className="load-bar" style={{ height: `${day.loadConsumptionKwh / maxEnergy * 100}%` }} /></div>
                {(Number(day.date.slice(-2)) === 1 || Number(day.date.slice(-2)) % 5 === 0) && <span>{day.date.slice(-2)}</span>}
              </div>
            ))}
          </div>
        </article>

        <article className="panel breakdown">
          <p className="eyebrow">Desglose estimado</p><h2>De dónde sale el total</h2>
          <div className="cost-row"><span>Energía importada</span><strong>{money.format(summary.costs.energyCost)}</strong></div>
          <div className="cost-row credit"><span>Compensación de excedentes</span><strong>−{money.format(summary.costs.exportCredit)}</strong></div>
          <div className="cost-row"><span>Potencia y costes fijos</span><strong>{money.format(summary.costs.fixedCharges)}</strong></div>
          <div className="cost-row"><span>Impuesto eléctrico</span><strong>{money.format(summary.costs.electricTax)}</strong></div>
          <div className="cost-row"><span>IVA</span><strong>{money.format(summary.costs.vat)}</strong></div>
          <div className="cost-row total"><span>Total estimado</span><strong>{money.format(summary.costs.total)}</strong></div>
        </article>
      </section>

      <section className="grid-two lower-grid">
        <article className="panel insight">
          <p className="eyebrow">Autoconsumo</p><h2>{number.format(selfConsumptionRate)} % de la energía solar se aprovecha directamente</h2>
          <div className="progress"><i style={{ width: `${Math.min(100, selfConsumptionRate)}%` }} /></div>
          <p>El resto se vierte a la red y se descuenta de la parte variable de la factura dentro del límite de compensación.</p>
        </article>
        <article className="panel insight">
          <p className="eyebrow">Calidad del dato</p><h2>Desfase entre fuentes: {number.format(Math.abs(summary.discrepancyPercent))} %</h2>
          <p>El dashboard compara la lectura de la distribuidora con la telemetría del inversor para detectar diferencias y días incompletos.</p>
        </article>
      </section>

      <section className="panel table-panel">
        <div className="panel-heading"><div><p className="eyebrow">Detalle</p><h2>Últimos días registrados</h2></div></div>
        <div className="table-wrap"><table><thead><tr><th>Día</th><th>Red</th><th>Vertido</th><th>Solar</th><th>Consumo</th></tr></thead><tbody>{summary.daily.slice(-7).reverse().map((day) => <tr key={day.date}><td>{date.format(new Date(`${day.date}T12:00:00`))}</td><td>{number.format(day.gridImportKwh)} kWh</td><td>{number.format(day.gridExportKwh)} kWh</td><td>{number.format(day.pvProductionKwh)} kWh</td><td>{number.format(day.loadConsumptionKwh)} kWh</td></tr>)}</tbody></table></div>
      </section>

      <footer><p>Demostración técnica de Minarrolabs. Los datos son simulados, deterministas y no corresponden a una vivienda real.</p><a href="https://minarrolabs.dev/#contact">¿Necesitas un dashboard para tu negocio?</a></footer>
    </main>
  );
}
