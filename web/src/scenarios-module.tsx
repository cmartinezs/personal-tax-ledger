import { useState } from 'react';
import { ApiRequestError } from './api';
import { scenarioService } from './services';
import type { IncomeSource, Settings, FeeReceipt, MortgageLoan, MortgageAnnualRecord, Scenario } from './types';

const money = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

type ColKey = 'taxableIncome' | 'annualTax' | 'withheld' | 'mortgage' | 'apv' | 'balance' | 'diff' | 'liquidity' | 'pension';

const COLUMNS: { key: ColKey; label: string; hint: string }[] = [
  { key: 'taxableIncome', label: 'Base imponible', hint: 'El monto de tus ingresos que queda gravado después de los descuentos legales. Mientras menor, mejor.' },
  { key: 'annualTax', label: 'Impuesto anual', hint: 'El impuesto Global Complementario estimado para el año comercial.' },
  { key: 'withheld', label: 'Retenciones ya pagadas', hint: 'Lo que tus empleadores y tus boletas ya retuvieron durante el año.' },
  { key: 'mortgage', label: 'Rebaja hipotecaria', hint: 'El descuento por los intereses de tu crédito hipotecario (art. 55 bis de la LIR).' },
  { key: 'apv', label: 'Beneficio APV', hint: 'Bonificación del Estado (Régimen A) o rebaja de impuesto por aportar al APV (Régimen B).' },
  { key: 'balance', label: 'Resultado final', hint: 'Lo que pagas o te devuelven. En rojo: pagas. En verde: te devuelven.' },
  { key: 'diff', label: 'Diferencia vs. base', hint: 'Cuánto cambia tu resultado comparado con el escenario más simple (sin hipotecario ni APV).' },
  { key: 'liquidity', label: 'Dinero que comprometes', hint: 'Cuánto debes poner de tu bolsillo (por ejemplo, el aporte anual al APV).' },
  { key: 'pension', label: 'Ahorro para tu pensión', hint: 'Cuánto queda ahorrado para tu futura pensión en ese escenario.' }
];

const ESSENTIAL_COLS: ColKey[] = ['taxableIncome', 'annualTax', 'balance', 'diff', 'liquidity', 'pension'];
const ALL_COLS: ColKey[] = COLUMNS.map(c => c.key);

type Props = {
  settings: Settings;
  sources: IncomeSource[];
  feeReceipts: FeeReceipt[];
  mortgages: MortgageLoan[];
  annualRecords: MortgageAnnualRecord[];
};

export default function ScenariosModule({ settings, sources, feeReceipts, mortgages, annualRecords }: Props) {
  const [scenarioApvAnnual, setScenarioApvAnnual] = useState(3_000_000);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [visibleCols, setVisibleCols] = useState<ColKey[]>(ESSENTIAL_COLS);

  const toggleCol = (key: ColKey) => setVisibleCols(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const build = async () => {
    setBusy(true); setError('');
    try {
      const list = await scenarioService.build({
        sources,
        settings: { ...settings, scenarioApvAnnual },
        feeReceipts,
        mortgages,
        annualRecords
      });
      setScenarios(list);
    } catch (e) { setError(errMsg(e)); } finally { setBusy(false); }
  };

  const activeCols = COLUMNS.filter(c => visibleCols.includes(c.key));
  const bestResult = scenarios.length > 0 ? scenarios.reduce((a, b) => Number(a.result.totals.estimatedBalance) <= Number(b.result.totals.estimatedBalance) ? a : b) : null;

  return (
    <div className="module">
      <Card title="Simulación anual y escenarios">
        <div className="callout callout-info">
          <strong>En palabras simples:</strong> esta tabla responde una sola pregunta — <em>¿qué pasaría con tu impuesto si combinaras los módulos de otra forma?</em>
          Cada fila es una «versión» distinta de tu año tributario (por ejemplo, con el crédito hipotecario pero sin APV, o con hipotecario más APV).
          Mírala por la columna <strong>«Resultado final»</strong>: si aparece una devolución mayor o un saldo por pagar menor, ese escenario te conviene más en impuestos.
          Eso sí: los escenarios con APV requieren poner dinero hoy y a cambio aumentan tu futura pensión.
        </div>

        <div className="filter-bar">
          <label>Aporte APV anual a comparar en los escenarios de hipotecario + APV</label>
          <input type="number" min={0} value={scenarioApvAnnual} onChange={e => setScenarioApvAnnual(Number(e.target.value) || 0)} />
          <button className="primary" disabled={busy} onClick={build}>Construir escenarios</button>
        </div>

        {error && <div className="alert error">{error}<button onClick={() => setError('')}>×</button></div>}

        {scenarios.length === 0 ? <Empty text="Crea el análisis para ver las comparaciones." /> :
          <>
            <div className="col-filters">
              <span className="col-filters-label">Mostrar columnas:</span>
              {COLUMNS.map(c => (
                <label key={c.key} className="col-toggle">
                  <input type="checkbox" checked={visibleCols.includes(c.key)} onChange={() => toggleCol(c.key)} />
                  {c.label}
                </label>
              ))}
              <div className="col-filters-actions">
                <button onClick={() => setVisibleCols(ALL_COLS)}>Todas</button>
                <button onClick={() => setVisibleCols(ESSENTIAL_COLS)}>Solo esenciales</button>
              </div>
            </div>

            <div className="table-wrap scenario-wrap"><table className="scenario-table">
              <thead><tr>
                <th>Escenario</th>
                {activeCols.map(c => <th key={c.key} title={c.hint}>{c.label}</th>)}
              </tr></thead>
              <tbody>
                {scenarios.map(s => {
                  const t = s.result.totals as Record<string, number>;
                  const apvBenefit = regimeA(s.result) ? Number(t.apvABonus) || 0 : regimeB(s.result) ? Number(t.annualTax) - baselineTax(scenarios) : 0;
                  const balance = Number(t.estimatedBalance);
                  return (
                    <tr key={s.key}>
                      <td><strong>{s.label}</strong></td>
                      {activeCols.map(c => <td key={c.key}>{cellValue(c.key, t, s, apvBenefit, balance)}</td>)}
                    </tr>
                  );
                })}
              </tbody>
            </table></div>

            <div className="scenario-legend">
              <strong>¿Qué significa cada columna?</strong>
              <ul>
                {activeCols.map(c => <li key={c.key}><strong>{c.label}:</strong> {c.hint}</li>)}
              </ul>
            </div>

            {bestResult && <>
              <div className="scenario-note">
                <strong>Lectura rápida:</strong> el escenario con el mejor resultado tributario neto es <strong>{bestResult.label}</strong>.
                {Number(bestResult.result.totals.estimatedBalance) > 0
                  ? ` En ese caso pagarías ${money.format(Math.abs(Number(bestResult.result.totals.estimatedBalance)))} de impuesto.`
                  : ` En ese caso te devolverían ${money.format(Math.abs(Number(bestResult.result.totals.estimatedBalance)))}.`}
                {' '}Revisa también cuánto dinero comprometes y cuánto ahorras para tu pensión antes de decidir.
              </div>
              <p className="scenario-warn">⚠ La comparación no incorpora rentabilidad, comisiones del producto, tributación futura de la pensión ni impuesto por retiro anticipado. No es una recomendación de inversión.</p>
            </>}
          </>}
      </Card>
    </div>
  );
}

function cellValue(key: ColKey, t: Record<string, number>, s: Scenario, apvBenefit: number, balance: number) {
  switch (key) {
    case 'taxableIncome': return money.format(Number(t.taxableIncome));
    case 'annualTax': return money.format(Number(t.annualTax));
    case 'withheld': return money.format(Number(t.totalWithheld));
    case 'mortgage': return money.format(Number(t.mortgageDeduction) || 0);
    case 'apv': return money.format(Math.max(0, apvBenefit));
    case 'balance': return <span className={balance > 0 ? 'danger-cell' : 'success-cell'}>{money.format(Math.abs(balance))}{balance > 0 ? ' (pagar)' : ' (devolver)'}</span>;
    case 'diff': return <span className={Number(s.diff) > 0 ? 'danger-cell' : 'success-cell'}>{signed(s.diff)}</span>;
    case 'liquidity': return money.format(s.liquidityCommitted);
    case 'pension': return money.format(s.accumulatedPensionSaving);
  }
}

function regimeA(s: any) {
  return Number(s.totals?.apvAContributions) > 0;
}
function regimeB(s: any) {
  return Number(s.totals?.apvBAccepted) > 0;
}
function baselineTax(scenarios: Scenario[]) {
  return Number(scenarios.find(s => s.key === 'base')?.result.totals.annualTax) || 0;
}
function signed(v: number) { const n = Number(v) || 0; const s = money.format(Math.abs(n)); return n > 0 ? `+${s}` : n < 0 ? `−${s}` : s; }

function Card({ title, children }: { title: string; children: any }) { return <section className="card"><h2>{title}</h2>{children}</section>; }
function Empty({ text }: { text: string }) { return <div className="empty">{text}</div>; }
function errMsg(e: any) { return e instanceof ApiRequestError ? `[${e.code}] ${e.message}` : e instanceof Error ? e.message : 'Error inesperado'; }
