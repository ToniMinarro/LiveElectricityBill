import type { DailyEnergyRecord, EnergySummary } from "../lib/types";
import { defaultTariff } from "../lib/config";
import { getMonthlySummary } from "../lib/summary";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR"
});

const numberFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

const priceFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3
});

const percentFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const dayFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC"
});

const monthFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  year: "numeric",
  timeZone: "UTC"
});

function formatMonth(month: string) {
  return monthFormatter.format(new Date(`${month}-01T00:00:00Z`));
}

function formatDay(date: string) {
  return dayFormatter.format(new Date(`${date}T00:00:00Z`)).replace(".", "");
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function estimateBillWithoutSolar(summary: EnergySummary) {
  const energyCost = summary.totals.loadConsumptionKwh * defaultTariff.energyPriceEurPerKwh;
  const subtotal = energyCost + summary.costs.fixedCharges;
  const electricTax = subtotal * defaultTariff.electricTaxRate;
  const vat = (subtotal + electricTax) * defaultTariff.vatRate;

  return subtotal + electricTax + vat;
}

type MetricCardProps = {
  eyebrow: string;
  value: string;
  detail: string;
  emphasis?: "primary" | "positive" | "neutral";
};

function MetricCard({ eyebrow, value, detail, emphasis = "neutral" }: MetricCardProps) {
  return (
    <article className={`metric-card metric-card--${emphasis}`}>
      <p className="eyebrow">{eyebrow}</p>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

type GaugeProps = {
  label: string;
  value: number;
  detail: string;
};

function Gauge({ label, value, detail }: GaugeProps) {
  const safeValue = clamp(value);
  const degrees = safeValue * 3.6;

  return (
    <div className="gauge-card">
      <div
        className="gauge"
        style={{ background: `conic-gradient(#7c3aed ${degrees}deg, #20283a ${degrees}deg)` }}
        role="img"
        aria-label={`${label}: ${percentFormatter.format(safeValue)} %`}
      >
        <div className="gauge__inner">
          <strong>{percentFormatter.format(safeValue)}%</strong>
          <span>{label}</span>
        </div>
      </div>
      <p>{detail}</p>
    </div>
  );
}

type EnergyChartProps = {
  daily: DailyEnergyRecord[];
};

function EnergyChart({ daily }: EnergyChartProps) {
  const width = 960;
  const height = 300;
  const paddingX = 48;
  const paddingTop = 26;
  const paddingBottom = 42;
  const plotHeight = height - paddingTop - paddingBottom;
  const plotWidth = width - paddingX * 2;
  const maxValue = Math.max(
    1,
    ...daily.flatMap((record) => [
      record.pvProductionKwh,
      record.loadConsumptionKwh,
      record.gridImportKwh
    ])
  );
  const xFor = (index: number) => paddingX + (index / Math.max(1, daily.length - 1)) * plotWidth;
  const yFor = (value: number) => paddingTop + plotHeight - (value / maxValue) * plotHeight;
  const pointsFor = (selector: (record: DailyEnergyRecord) => number) =>
    daily.map((record, index) => `${xFor(index)},${yFor(selector(record))}`).join(" ");
  const labels = daily.filter((_, index) => index === 0 || index === daily.length - 1 || (index + 1) % 5 === 0);

  return (
    <div className="chart-shell">
      <div className="chart-heading">
        <div>
          <p className="eyebrow">Evolución diaria</p>
          <h2>Consumo, producción e importación</h2>
        </div>
        <div className="legend" aria-label="Leyenda del gráfico">
          <span><i className="legend__dot legend__dot--solar" />Producción solar</span>
          <span><i className="legend__dot legend__dot--load" />Consumo hogar</span>
          <span><i className="legend__dot legend__dot--grid" />Compra de red</span>
        </div>
      </div>

      <div className="chart-scroll">
        <svg className="energy-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Gráfico diario de energía en kilovatios hora">
          <defs>
            <linearGradient id="solar-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + plotHeight - plotHeight * ratio;
            return (
              <g key={ratio}>
                <line x1={paddingX} x2={width - paddingX} y1={y} y2={y} className="chart-grid" />
                <text x={paddingX - 12} y={y + 4} textAnchor="end" className="chart-axis-label">
                  {numberFormatter.format(maxValue * ratio)}
                </text>
              </g>
            );
          })}
          <polygon
            points={`${paddingX},${paddingTop + plotHeight} ${pointsFor((record) => record.pvProductionKwh)} ${width - paddingX},${paddingTop + plotHeight}`}
            fill="url(#solar-fill)"
          />
          <polyline points={pointsFor((record) => record.pvProductionKwh)} className="chart-line chart-line--solar" />
          <polyline points={pointsFor((record) => record.loadConsumptionKwh)} className="chart-line chart-line--load" />
          <polyline points={pointsFor((record) => record.gridImportKwh)} className="chart-line chart-line--grid" />
          {labels.map((record) => {
            const index = daily.findIndex((day) => day.date === record.date);
            return (
              <text key={record.date} x={xFor(index)} y={height - 14} textAnchor="middle" className="chart-axis-label">
                {record.date.slice(-2)}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

type CostBreakdownProps = {
  summary: EnergySummary;
};

function CostBreakdown({ summary }: CostBreakdownProps) {
  const taxes = summary.costs.electricTax + summary.costs.vat;
  const gross = summary.costs.energyCost + summary.costs.fixedCharges + taxes;
  const widthFor = (value: number) => `${Math.max(4, (value / Math.max(gross, 1)) * 100)}%`;

  return (
    <article className="panel cost-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Desglose estimado</p>
          <h2>De dónde sale la factura</h2>
        </div>
        <strong className="section-total">{currencyFormatter.format(summary.costs.total)}</strong>
      </div>
      <div className="cost-list">
        <div className="cost-row">
          <div><span>Consumo de red</span><strong>{currencyFormatter.format(summary.costs.energyCost)}</strong></div>
          <div className="cost-track"><span className="cost-fill cost-fill--energy" style={{ width: widthFor(summary.costs.energyCost) }} /></div>
        </div>
        <div className="cost-row">
          <div><span>Potencia, contador y servicios</span><strong>{currencyFormatter.format(summary.costs.fixedCharges)}</strong></div>
          <div className="cost-track"><span className="cost-fill cost-fill--fixed" style={{ width: widthFor(summary.costs.fixedCharges) }} /></div>
        </div>
        <div className="cost-row">
          <div><span>Impuestos</span><strong>{currencyFormatter.format(taxes)}</strong></div>
          <div className="cost-track"><span className="cost-fill cost-fill--tax" style={{ width: widthFor(taxes) }} /></div>
        </div>
        <div className="cost-row cost-row--credit">
          <div><span>Compensación de excedentes</span><strong>-{currencyFormatter.format(summary.costs.exportCredit)}</strong></div>
          <div className="cost-track"><span className="cost-fill cost-fill--credit" style={{ width: widthFor(summary.costs.exportCredit) }} /></div>
        </div>
      </div>
    </article>
  );
}

export default async function Page() {
  const month = new Date().toISOString().slice(0, 7);
  const summary = await getMonthlySummary(month);
  const selfConsumedKwh = summary.totals.pvProductionKwh - summary.totals.gridExportKwh;
  const selfConsumptionRate = summary.totals.pvProductionKwh === 0
    ? 0
    : (selfConsumedKwh / summary.totals.pvProductionKwh) * 100;
  const solarCoverageRate = summary.totals.loadConsumptionKwh === 0
    ? 0
    : (selfConsumedKwh / summary.totals.loadConsumptionKwh) * 100;
  const noSolarTotal = estimateBillWithoutSolar(summary);
  const estimatedSavings = Math.max(0, noSolarTotal - summary.costs.total);
  const averageDailyCost = summary.costs.total / Math.max(1, summary.daily.length);
  const latestDays = summary.daily.slice(-8).reverse();

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="https://minarrolabs.dev" aria-label="Volver a Minarrolabs">
          <span className="brand__mark">M</span>
          <span><strong>Minarrolabs</strong><small>Demo de datos y dashboard</small></span>
        </a>
        <a className="back-link" href="https://minarrolabs.dev/#examples">← Ver más ejemplos</a>
      </header>

      <section className="hero">
        <div className="hero__copy">
          <div className="hero__badges">
            <span className="badge badge--demo">Datos simulados</span>
            <span className="badge">Autoconsumo residencial · 3,7 kWp</span>
          </div>
          <p className="eyebrow">Live Electricity Bill</p>
          <h1>Entiende tu factura eléctrica <span>antes de recibirla</span></h1>
          <p className="hero__lead">Un dashboard que combina consumo de red, producción solar, excedentes y tarifa para estimar el coste mensual y explicar de dónde sale cada euro.</p>
          <div className="hero__meta">
            <span>Periodo: <strong>{formatMonth(summary.month)}</strong></span>
            <span>Tarifa demo: <strong>{priceFormatter.format(defaultTariff.energyPriceEurPerKwh)} €/kWh</strong></span>
            <span>Excedentes: <strong>{priceFormatter.format(defaultTariff.exportCompensationEurPerKwh)} €/kWh</strong></span>
          </div>
        </div>
        <div className="hero__summary">
          <p className="eyebrow">Total estimado</p>
          <strong>{currencyFormatter.format(summary.costs.total)}</strong>
          <span>{currencyFormatter.format(averageDailyCost)} al día</span>
          <div className="hero__saving">
            <span>Ahorro estimado con solar</span>
            <strong>{currencyFormatter.format(estimatedSavings)}</strong>
          </div>
        </div>
      </section>

      <section className="metrics metrics--primary" aria-label="Resumen económico">
        <MetricCard eyebrow="Factura estimada" value={currencyFormatter.format(summary.costs.total)} detail="Incluye energía, fijos, impuestos y compensación." emphasis="primary" />
        <MetricCard eyebrow="Sin autoconsumo" value={currencyFormatter.format(noSolarTotal)} detail="Estimación usando el consumo total del hogar." />
        <MetricCard eyebrow="Ahorro solar" value={currencyFormatter.format(estimatedSavings)} detail="Autoconsumo directo más compensación de excedentes." emphasis="positive" />
        <MetricCard eyebrow="Diferencia de fuentes" value={`${numberFormatter.format(summary.discrepancyPercent)} %`} detail="Desfase simulado entre contador e inversor." />
      </section>

      <section className="dashboard-grid">
        <EnergyChart daily={summary.daily} />
        <aside className="panel efficiency-panel">
          <div>
            <p className="eyebrow">Rendimiento solar</p>
            <h2>Qué parte de la energía aprovechas</h2>
          </div>
          <div className="gauges">
            <Gauge label="Autoconsumo" value={selfConsumptionRate} detail="Parte de la producción solar utilizada directamente en la vivienda." />
            <Gauge label="Cobertura solar" value={solarCoverageRate} detail="Parte del consumo total cubierta sin comprar energía a la red." />
          </div>
          <div className="insight">
            <span>Consejo de la demo</span>
            <p>Desplazar lavadora, termo o carga del vehículo a las horas solares aumentaría el autoconsumo y reduciría la compra de red.</p>
          </div>
        </aside>
      </section>

      <section className="metrics" aria-label="Balance energético">
        <MetricCard eyebrow="Consumo del hogar" value={`${numberFormatter.format(summary.totals.loadConsumptionKwh)} kWh`} detail="Demanda total simulada del mes." />
        <MetricCard eyebrow="Producción solar" value={`${numberFormatter.format(summary.totals.pvProductionKwh)} kWh`} detail="Generación estimada de la instalación." emphasis="positive" />
        <MetricCard eyebrow="Compra de red" value={`${numberFormatter.format(summary.totals.gridImportKwh)} kWh`} detail="Energía que no pudo cubrir el autoconsumo." />
        <MetricCard eyebrow="Excedentes" value={`${numberFormatter.format(summary.totals.gridExportKwh)} kWh`} detail="Energía enviada a la red y compensada." />
      </section>

      <section className="details-grid">
        <CostBreakdown summary={summary} />
        <article className="panel source-panel">
          <div>
            <p className="eyebrow">Integración de fuentes</p>
            <h2>Una única lectura del negocio</h2>
          </div>
          <div className="source-flow" aria-label="Flujo de datos de la demostración">
            <div><span>01</span><strong>Contador</strong><small>Consumo de red</small></div>
            <i>+</i>
            <div><span>02</span><strong>Inversor</strong><small>Producción y vertidos</small></div>
            <i>→</i>
            <div><span>03</span><strong>Dashboard</strong><small>Costes e indicadores</small></div>
          </div>
          <p className="source-note">En esta versión todos los registros son simulados y deterministas. La arquitectura permite sustituir los proveedores por APIs reales sin cambiar el cálculo ni la interfaz.</p>
          <dl className="source-stats">
            <div><dt>Días procesados</dt><dd>{summary.sources.huaweiDays}</dd></div>
            <div><dt>Lectura contador</dt><dd>{numberFormatter.format(summary.sources.datadisImportKwh)} kWh</dd></div>
            <div><dt>Modo</dt><dd>Demostración</dd></div>
          </dl>
        </article>
      </section>

      <section className="panel table-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Detalle diario</p>
            <h2>Últimos registros del mes</h2>
          </div>
          <span className="badge">kWh</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Día</th>
                <th>Consumo</th>
                <th>Producción</th>
                <th>Compra red</th>
                <th>Excedentes</th>
              </tr>
            </thead>
            <tbody>
              {latestDays.map((day) => (
                <tr key={day.date}>
                  <td>{formatDay(day.date)}</td>
                  <td>{numberFormatter.format(day.loadConsumptionKwh)}</td>
                  <td>{numberFormatter.format(day.pvProductionKwh)}</td>
                  <td>{numberFormatter.format(day.gridImportKwh)}</td>
                  <td>{numberFormatter.format(day.gridExportKwh)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="demo-note">
        <div>
          <p className="eyebrow">Sobre esta demostración</p>
          <h2>Datos creíbles, pero no datos personales</h2>
        </div>
        <p>Los consumos, la producción y la tarifa se generan para mostrar cómo funcionaría un cuadro de mando conectado a Datadis, un inversor solar u otras fuentes. No representan una vivienda ni una factura reales.</p>
      </section>

      <footer>
        <p>Proyecto demostrativo de <a href="https://minarrolabs.dev">Minarrolabs</a>.</p>
        <p>Next.js · TypeScript · Integración de datos · Reglas de facturación</p>
      </footer>
    </main>
  );
}
