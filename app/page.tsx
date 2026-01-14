import { headers } from "next/headers";
import type { MonthlySummary } from "../lib/types";

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR"
});

const numberFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function getBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const headerList = headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";

  return `${protocol}://${host}`;
}

async function fetchSummary(): Promise<MonthlySummary & { sources: Record<string, number> }> {
  const response = await fetch(`${getBaseUrl()}/api/summary`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el resumen");
  }

  return response.json();
}

export default async function Page() {
  const summary = await fetchSummary();

  return (
    <main>
      <header>
        <h1>Factura eléctrica en curso</h1>
        <p>Estimación en tiempo real con datos de i-DE e inversor Huawei.</p>
      </header>

      <section className="section">
        <div className="cards">
          <div className="card">
            <h2>Total estimado</h2>
            <strong>{currencyFormatter.format(summary.costs.total)}</strong>
            <span className="badge">Mes {summary.month}</span>
          </div>
          <div className="card">
            <h2>Consumo red (i-DE)</h2>
            <strong>{numberFormatter.format(summary.sources.ideImportKwh)} kWh</strong>
            <span className="badge">Fuente principal</span>
          </div>
          <div className="card">
            <h2>Vertido solar</h2>
            <strong>{numberFormatter.format(summary.totals.gridExportKwh)} kWh</strong>
            <span className="badge">Huawei</span>
          </div>
          <div className="card">
            <h2>Desfase IDE vs Huawei</h2>
            <strong>{numberFormatter.format(summary.discrepancyPercent)} %</strong>
            <span className="badge">Comparativa</span>
          </div>
        </div>

        <div className="cards">
          <div className="card">
            <h2>Coste energía</h2>
            <strong>{currencyFormatter.format(summary.costs.energyCost)}</strong>
            <p>kWh importados x tarifa</p>
          </div>
          <div className="card">
            <h2>Compensación vertidos</h2>
            <strong>-{currencyFormatter.format(summary.costs.exportCredit)}</strong>
            <p>Con límite de compensación</p>
          </div>
          <div className="card">
            <h2>Término fijo</h2>
            <strong>{currencyFormatter.format(summary.costs.fixedCharges)}</strong>
            <p>Potencia y servicios</p>
          </div>
          <div className="card">
            <h2>Impuestos</h2>
            <strong>{currencyFormatter.format(summary.costs.electricTax + summary.costs.vat)}</strong>
            <p>Impuesto eléctrico + IVA</p>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Día</th>
              <th>Importación (kWh)</th>
              <th>Vertido (kWh)</th>
              <th>Producción (kWh)</th>
              <th>Consumo hogar (kWh)</th>
            </tr>
          </thead>
          <tbody>
            {summary.daily.map((day) => (
              <tr key={day.date}>
                <td>{day.date}</td>
                <td>{numberFormatter.format(day.gridImportKwh)}</td>
                <td>{numberFormatter.format(day.gridExportKwh)}</td>
                <td>{numberFormatter.format(day.pvProductionKwh)}</td>
                <td>{numberFormatter.format(day.loadConsumptionKwh)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="footer-note">
          Este resumen es un ejemplo con datos simulados. Sustituye los conectores por las APIs reales
          de i-DE/Datadis y Huawei FusionSolar.
        </p>
      </section>
    </main>
  );
}
