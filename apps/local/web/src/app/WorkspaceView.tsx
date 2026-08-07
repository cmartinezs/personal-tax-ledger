import { useEffect, useMemo, useState, useCallback } from 'react';
import { api, incomeService, ApiRequestError } from '../api';
import type { IncomeSource, Reference, Settings, Simulation, FeeReceipt, MortgageLoan, MortgageAnnualRecord, TaxParameter } from '../types';
import FeeReceiptsModule from '../features/fee-receipts/FeeReceiptsModule';
import MortgagesModule from '../features/mortgages/MortgagesModule';
import ScenariosModule from '../features/scenarios/ScenariosModule';
import SourcesModule from '../features/sources/SourcesModule';
import LogsModule from '../features/logs/LogsModule';
import { useFeedback, LOG } from '../feedback';
import CalculationExplanationPanel from '../calculation-explanation-panel';
import { IncomesSection, SummaryMetrics } from '@personal-tax-ledger/shared-ui';

const money = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
const pct = (value: number) => `${(Number(value) * 100).toFixed(2).replace('.', ',')}%`;
const YEAR_FLOOR = 2024;
const emptySource: IncomeSource = {
  taxYear: 0, active: true, name: '', kind: 'SALARY', amount: 0, inputMode: 'GROSS', frequency: 'MONTHLY', months: 12,
  taxable: true, withholdingRate: 0, afpName: 'UNO', afpCommissionRate: null, healthSystem: 'FONASA', healthPlanAmount: 0,
  contractType: 'INDEFINITE', apvRegime: 'NONE', apvPaymentMethod: 'PAYROLL', apvMonthly: 0, notes: ''
};

type Tab = 'dashboard' | 'incomes' | 'fees' | 'mortgages' | 'apv' | 'scenarios' | 'settings' | 'sources' | 'logs';

type SummaryTab = 'overview' | 'reconciliation' | 'provision' | 'employers';

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [summaryTab, setSummaryTab] = useState<SummaryTab>('overview');
  const [incomesTab, setIncomesTab] = useState<'list' | 'form'>('list');
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [references, setReferences] = useState<Reference[]>([]);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [editing, setEditing] = useState<IncomeSource>({ ...emptySource });
  const [apvMonthly, setApvMonthly] = useState(250000);
  const [apvMonths, setApvMonths] = useState(12);
  const [apvComparison, setApvComparison] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [feeReceipts, setFeeReceipts] = useState<FeeReceipt[]>([]);
  const [mortgages, setMortgages] = useState<MortgageLoan[]>([]);
  const [annualRecords, setAnnualRecords] = useState<MortgageAnnualRecord[]>([]);
  const [taxParameters, setTaxParameters] = useState<TaxParameter[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [simulationVersion, setSimulationVersion] = useState(0);
  const [explanationFocusKey, setExplanationFocusKey] = useState<string | null>(null);

  const salarySources = useMemo(() => sources.filter(s => s.kind === 'SALARY'), [sources]);
  const taxYear = Number(settings?.year) || new Date().getFullYear();
  const { beginSync, endSync, notify, log, confirm } = useFeedback();

  const refreshSimulation = useCallback(async () => {
    if (!settings) return;
    try {
      const result = await api.simulate({ sources, settings, feeReceipts, mortgages, annualRecords });
      setSimulation(result);
    } catch (e) { setError(errMsg(e)); }
  }, [settings, sources, feeReceipts, mortgages, annualRecords]);

  useEffect(() => {
    if (!settings) return;
    const timer = setTimeout(() => { refreshSimulation().catch(e => setError(errMsg(e))); }, 200);
    return () => clearTimeout(timer);
  }, [settings, sources, feeReceipts, mortgages, annualRecords, simulationVersion, refreshSimulation]);

  const refreshCore = async () => {
    const data = await api.bootstrap();
    setSources(data.sources); setSettings(data.settings); setReferences(data.references);
    const [fees, morts, params, yrs] = await Promise.all([
      api.listFeeReceipts({ taxYear: Number(data.settings.year) }),
      api.listMortgages({ taxYear: Number(data.settings.year) }),
      api.listTaxParameters(Number(data.settings.year)),
      api.listYears()
    ]);
    setFeeReceipts(fees);
    setMortgages(morts);
    setTaxParameters(params);
    setYears(yrs);
    if (morts.length > 0) {
      const records = await Promise.all(morts.map(m => api.listAnnualRecords(m.id!, { taxYear: Number(data.settings.year) })));
      setAnnualRecords(records.flat());
    } else {
      setAnnualRecords([]);
    }
    setSimulationVersion(v => v + 1);
    return Number(data.settings.year);
  };

  const loadInitial = async () => {
    beginSync('Cargando datos iniciales…');
    const started = performance.now();
    try {
      const year = await refreshCore();
      log({ kind: 'SYNC', operation: LOG.LOAD_INITIAL, status: 'OK', message: `Año comercial ${year}`, auditMessage: 'bootstrap + fee_receipts + mortgages + annual_records + tax_parameters + years', durationMs: Math.round(performance.now() - started) });
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      log({ kind: 'SYNC', operation: LOG.LOAD_INITIAL, status: 'ERROR', message: msg, auditMessage: `error: ${msg}`, durationMs: Math.round(performance.now() - started) });
    } finally {
      endSync();
    }
  };

  useEffect(() => { loadInitial(); }, []);

  const refreshFeeReceipts = async () => {
    const list = await api.listFeeReceipts({ taxYear });
    setFeeReceipts(list);
    setSimulationVersion(v => v + 1);
  };
  const refreshMortgages = async () => {
    const list = await api.listMortgages({ taxYear });
    setMortgages(list);
    const records = await Promise.all(list.map(m => api.listAnnualRecords(m.id!, { taxYear })));
    setAnnualRecords(records.flat());
    setSimulationVersion(v => v + 1);
  };

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    const list: number[] = [];
    for (let y = current; y >= YEAR_FLOOR; y--) list.push(y);
    return list;
  }, []);

  const prevYears = useMemo(() => years.map(Number).filter(y => y < (Number(settings?.year) || 0) && y >= YEAR_FLOOR).sort((a, b) => b - a), [years, settings?.year]);

  const changeYear = async (y: number) => {
    if (!settings || y === Number(settings.year)) return;
    setBusy(true); setError('');
    beginSync(`Cargando año comercial ${y}…`);
    const started = performance.now();
    try {
      const next = { ...settings, year: y };
      setSettings(next);
      await api.updateSettings(next);
      const [srcs, fees, morts, params, yrs] = await Promise.all([
        incomeService.list(y),
        api.listFeeReceipts({ taxYear: y }),
        api.listMortgages({ taxYear: y }),
        api.listTaxParameters(y),
        api.listYears()
      ]);
      setSources(srcs); setFeeReceipts(fees); setMortgages(morts); setTaxParameters(params); setYears(yrs);
      let recordCount = 0;
      if (morts.length > 0) {
        const records = await Promise.all(morts.map(m => api.listAnnualRecords(m.id!, { taxYear: y })));
        recordCount = records.flat().length;
        setAnnualRecords(records.flat());
      } else {
        setAnnualRecords([]);
      }
      setSimulationVersion(v => v + 1);
      setApvComparison(null);
      setEditing({ ...emptySource });
      setIncomesTab('list');
      log({ kind: 'SYNC', operation: LOG.CHANGE_YEAR, status: 'OK', message: `Año ${y}`, auditMessage: `year=${y} sources=${srcs.length} fees=${fees.length} mortgages=${morts.length} annualRecords=${recordCount}`, durationMs: Math.round(performance.now() - started) });
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      log({ kind: 'SYNC', operation: LOG.CHANGE_YEAR, status: 'ERROR', message: msg, auditMessage: `year=${y} error: ${msg}`, durationMs: Math.round(performance.now() - started) });
    } finally { setBusy(false); endSync(); }
  };

  const copySourcesFromPrevious = async () => {
    if (!prevYears.length) return;
    setBusy(true); setError('');
    const started = performance.now();
    try {
      const copied = await api.copyIncomes(prevYears[0], Number(settings?.year));
      setSources(copied);
      setSimulationVersion(v => v + 1);
      log({ kind: 'ASYNC', operation: LOG.COPY_INCOMES, status: 'OK', message: `${prevYears[0]} → ${Number(settings?.year)}`, auditMessage: `from=${prevYears[0]} to=${Number(settings?.year)} copied=${copied.length}`, durationMs: Math.round(performance.now() - started) });
      notify('Ingresos copiados', { message: `Se copiaron ${copied.length} ingresos desde ${prevYears[0]}.` });
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      log({ kind: 'ASYNC', operation: LOG.COPY_INCOMES, status: 'ERROR', message: msg, auditMessage: `from=${prevYears[0]} to=${Number(settings?.year)} error: ${msg}`, durationMs: Math.round(performance.now() - started) });
      notify('No se pudieron copiar los ingresos', { tone: 'error', message: msg });
    } finally { setBusy(false); }
  };

  const updateSettingsState = async (next: Settings) => {
    setSettings(next);
    try { await api.updateSettings(next); } catch (e) { setError(errMsg(e)); }
  };

  const saveSource = async () => {
    setBusy(true); setError('');
    const started = performance.now();
    try {
      const source = { ...editing, taxYear: editing.id ? Number(editing.taxYear) || taxYear : taxYear };
      if (source.id) await incomeService.update(source); else await incomeService.create(source);
      setEditing({ ...emptySource });
      setIncomesTab('list');
      await refreshCore();
      log({ kind: 'ASYNC', operation: LOG.SAVE_INCOME, status: 'OK', message: source.name, auditMessage: JSON.stringify({ id: source.id, kind: source.kind, amount: source.amount, frequency: source.frequency, months: source.months, taxYear: source.taxYear }), durationMs: Math.round(performance.now() - started) });
      notify('Ingreso guardado', { message: source.name });
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      log({ kind: 'ASYNC', operation: LOG.SAVE_INCOME, status: 'ERROR', message: msg, auditMessage: `name=${editing.name} error: ${msg}`, durationMs: Math.round(performance.now() - started) });
      notify('No se pudo guardar el ingreso', { tone: 'error', message: msg });
    } finally { setBusy(false); }
  };

  const removeSource = async (id?: number) => {
    if (!id) return;
    const ok = await confirm({ message: '¿Eliminar esta fuente de ingreso?', confirmLabel: 'Eliminar', cancelLabel: 'Cancelar', danger: true });
    if (!ok) return;
    const started = performance.now();
    try {
      await incomeService.remove(id); await refreshCore();
      log({ kind: 'ASYNC', operation: LOG.DELETE_INCOME, status: 'OK', message: `Id ${id}`, auditMessage: `id=${id}`, durationMs: Math.round(performance.now() - started) });
      notify('Ingreso eliminado');
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      log({ kind: 'ASYNC', operation: LOG.DELETE_INCOME, status: 'ERROR', message: msg, auditMessage: `id=${id} error: ${msg}`, durationMs: Math.round(performance.now() - started) });
      notify('No se pudo eliminar el ingreso', { tone: 'error', message: msg });
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    const started = performance.now();
    try {
      await updateSettingsState(settings);
      log({ kind: 'ASYNC', operation: LOG.SAVE_SETTINGS, status: 'OK', message: `Año comercial ${settings.year}`, auditMessage: `year=${settings.year} keys=${Object.keys(settings).length}`, durationMs: Math.round(performance.now() - started) });
      notify('Configuración guardada');
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      log({ kind: 'ASYNC', operation: LOG.SAVE_SETTINGS, status: 'ERROR', message: msg, auditMessage: `year=${settings.year} error: ${msg}`, durationMs: Math.round(performance.now() - started) });
      notify('No se pudo guardar la configuración', { tone: 'error', message: msg });
    }
  };

  const compare = async () => {
    const started = performance.now();
    try {
      setApvComparison(await api.compareApv(apvMonthly * apvMonths, sources, settings || undefined, { feeReceipts, mortgages, annualRecords }));
      log({ kind: 'ASYNC', operation: LOG.COMPARE_APV, status: 'OK', message: `Aporte anual ${money.format(apvMonthly * apvMonths)}`, auditMessage: `annualContribution=${apvMonthly * apvMonths} sources=${sources.length} fees=${feeReceipts.length} mortgages=${mortgages.length}`, durationMs: Math.round(performance.now() - started) });
      notify('Comparación APV lista');
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      log({ kind: 'ASYNC', operation: LOG.COMPARE_APV, status: 'ERROR', message: msg, auditMessage: `annualContribution=${apvMonthly * apvMonths} error: ${msg}`, durationMs: Math.round(performance.now() - started) });
      notify('No se pudo comparar el APV', { tone: 'error', message: msg });
    }
  };

  if (!settings || !simulation) return <div className="loading">Cargando simulador…</div>;

  const totalMortgageTaxSaving = Number(simulation.totals.mortgageTaxSaving) || 0;
  const annual = simulation.annualResult;
  const payrollApv = Number(annual.payrollApvContribution) || 0;
  const directApv = Number(annual.directApvContribution) || 0;
  const salariesBeforeApv = Number(simulation.components.salaryTaxable) + payrollApv;
  const balanceTone = Number(annual.estimatedBalance) > 0 ? 'danger' : 'success';

  type RecoRow = { section: string } | { desc: string; op: '+' | '−' | '='; value: number; subtotal?: boolean; final?: boolean };
  const recoRows: RecoRow[] = [
    { section: 'Cálculo de la base imponible' },
    { desc: 'Rentas de empleadores (antes de APV por planilla)', op: '+', value: salariesBeforeApv },
    { desc: 'APV Régimen B por planilla', op: '−', value: payrollApv },
    { desc: 'Rentas de empleadores', op: '=', value: Number(simulation.components.salaryTaxable), subtotal: true },
    ...(Number(simulation.components.rejectedPayrollB) > 0
      ? [{ desc: 'APV B por planilla sobre el tope (revertido)', op: '+' as const, value: Number(simulation.components.rejectedPayrollB) }]
      : []),
    { desc: 'Renta neta de honorarios', op: '+', value: Number(simulation.components.honorariosTaxable) },
    { desc: 'Otros ingresos afectos', op: '+', value: Number(simulation.components.otherTaxable) },
    { desc: 'Renta consolidada', op: '=', value: Number(annual.totalTaxableIncome), subtotal: true },
    { desc: 'Intereses hipotecarios (art. 55 bis)', op: '−', value: Number(simulation.totals.mortgageDeduction) || 0 },
    { desc: 'APV Régimen B (directo)', op: '−', value: Number(annual.directApvContribution) },
    { desc: 'Base imponible estimada', op: '=', value: Number(annual.finalTaxableBase), subtotal: true },
    { section: 'Impuesto y saldo' },
    { desc: 'Impuesto anual estimado', op: '=', value: Number(annual.estimatedAnnualTax) },
    { desc: 'IUSC retenido por empleadores', op: '−', value: Number(simulation.components.salaryWithheld) },
    { desc: 'Retenciones de honorarios', op: '−', value: Number(simulation.components.honorariosWithheld) },
    { desc: 'PPM pagados', op: '−', value: Number(simulation.components.honorariosPPM) },
    { desc: Number(annual.estimatedBalance) > 0 ? 'Saldo estimado (por pagar)' : 'Saldo estimado (a devolver)', op: '=', value: Math.abs(Number(annual.estimatedBalance)), final: true }
  ];

  const metricsData = [
    { key: 'income.gross.total', label: 'Ingresos brutos', value: Number(simulation.totals.grossIncome), hint: 'Sueldos brutos + honorarios brutos + premios/otros, antes de descuentos previsionales y de salud.' },
    { key: 'taxable.consolidated', label: 'Renta bruta imponible', value: Number(annual.totalTaxableIncome), hint: 'Brutos menos cotizaciones de AFP/salud y gastos de honorarios. El APV B por planilla ya viene descontado.' },
    { key: 'taxable.consolidated', label: 'Base tributable estimada', value: Number(annual.finalTaxableBase), hint: 'Renta bruta imponible − rebaja hipotecaria (art. 55 bis) − APV B aportado directamente.' },
    { key: 'tax.annual', label: 'Impuesto Global Complementario estimado', value: Number(annual.estimatedAnnualTax), hint: 'Tabla progresiva del Global Complementario aplicada a la base tributable estimada.' },
    { key: 'fees.withholding', label: 'Retenciones y PPM acumulados', value: Number(annual.totalWithholdings), hint: 'IUSC retenido por empleadores + retención y PPM de honorarios + otros retenidos.' },
    { key: 'mortgage.deduction', label: 'Rebaja hipotecaria (base)', value: Number(simulation.totals.mortgageDeduction) || 0, hint: 'Intereses elegibles del art. 55 bis (tope 8 UTA) × porcentaje según el tramo de renta imponible.' },
    { key: 'mortgage.deduction', label: 'Ahorro tributario hipotecario', value: totalMortgageTaxSaving, hint: 'Impuesto anual sin la rebaja − impuesto anual con la rebaja hipotecaria.' },
    { key: 'balance.estimated', label: Number(annual.estimatedBalance) > 0 ? 'Saldo estimado por pagar' : 'Devolución estimada', value: Math.abs(Number(annual.estimatedBalance)), hint: 'Impuesto anual estimado − retenciones y PPM acumulados.', tone: balanceTone },
    { key: 'income.net.total', label: 'Caja estimada recibida', value: Number(simulation.totals.estimatedCashReceived), hint: 'Suma de líquidos cobrados: sueldos netos + honorarios netos + otros ingresos netos.' }
  ];

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span>CL</span><div><strong>Tributación + APV</strong><small>Simulador estimativo Chile</small></div></div>
      <nav>
        {([
          ['dashboard', 'Resumen'],
          ['incomes', 'Ingresos laborales'],
          ['fees', 'Boletas de honorarios'],
          ['mortgages', 'Créditos hipotecarios'],
          ['apv', 'APV'],
          ['scenarios', 'Simulación anual'],
          ['settings', 'Configuración tributaria'],
          ['sources', 'Fuentes oficiales'],
          ['logs', 'Bitácora de ejecuciones']
        ] as const).map(([key, label]) =>
          <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>)}
      </nav>
      <div className="sidebar-note">Año comercial {settings.year}<br/>UF: {money.format(Number(settings.ufValue))}<br/>UTM: {money.format(Number(settings.utmValue))}<br/>UTA = UTM × 12</div>
    </aside>
    <main>
      <header><div><h1>{tabTitle(tab)}</h1><p>{tabSubtitle(tab)}</p></div><div className="header-actions"><label className="year-picker"><small>Año comercial</small><select value={Number(settings.year)} onChange={e => changeYear(Number(e.target.value))}>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select></label><span className="estimate-badge">No vinculante</span></div></header>
      {error && <div className="alert error">{error}<button onClick={() => setError('')}>×</button></div>}

      {tab === 'dashboard' && <>
        <nav className="sub-tabs">
          {([
            ['overview', 'Indicadores'],
            ['reconciliation', 'Reconciliación anual'],
            ['provision', 'Previsión y APV'],
            ['employers', 'Detalle por trabajo']
          ] as const).map(([key, label]) =>
            <button key={key} className={summaryTab === key ? 'active' : ''} onClick={() => setSummaryTab(key)}>{label}</button>)}
        </nav>

        {summaryTab === 'overview' && <>
           <SummaryMetrics metrics={metricsData.map(metric => ({ ...metric, value: money.format(metric.value) }))} onExplain={setExplanationFocusKey} />
          <p className="summary-note">Valores anuales actualizados automáticamente al modificar ingresos, boletas, créditos hipotecarios o APV. La metodología de cada indicador se detalla bajo su valor.</p>
        </>}

        {summaryTab === 'reconciliation' && <Card title="Reconciliación anual estimada">
          <div className="table-wrap reco-wrap"><table className="reco-table">
            <thead><tr><th>Descripción</th><th>Operación</th><th>Valor</th></tr></thead>
            <tbody>
              {recoRows.map((row, i) => 'section' in row
                ? <tr key={i} className="reco-section"><td colSpan={3}>{row.section}</td></tr>
                : <tr key={i} className={`${row.subtotal ? 'subtotal' : ''} ${row.final ? 'final' : ''}`}><td>{row.desc}</td><td className="reco-op">{row.op}</td><td>{money.format(row.value)}</td></tr>)}
            </tbody>
          </table></div>
        </Card>}

        {summaryTab === 'provision' && <section className="grid two">
          <Card title="Previsión y salud anual" hint="Aporte obligatorio AFP (10% del bruto) + comisión AFP + cotización de salud + seguro de cesantía. En honorarios se restan los gastos aceptados según el método configurado (presunto 30% tope 15 UTA o efectivo).">
            <Rows rows={[
              ['Aporte obligatorio AFP', Number(simulation.totals.mandatoryPension)],
              ['Comisiones AFP', Number(simulation.totals.afpCommissions)],
              ['Salud Fonasa/Isapre', Number(simulation.totals.health)],
              ['Seguro de cesantía', Number(simulation.totals.afc)],
              ['Gastos de honorarios aceptados', Number(simulation.totals.honorariosExpense)]
            ]}/>
          </Card>
          <Card title="APV registrado" hint="Régimen A: aporte con bonificación fiscal estatal. Régimen B: rebaja de la base imponible con tope anual (UF). El exceso sobre el tope no genera beneficio tributario.">
            <Rows rows={[
              ['Aportes Régimen A', Number(simulation.totals.apvAContributions)],
              ['Bonificación A estimada', Number(simulation.totals.apvABonus)],
              ['APV B total (Régimen B)', Number(annual.totalApvRegimeBContribution)],
              ['APV B por planilla', Number(annual.payrollApvContribution)],
              ['APV B aportado directamente', Number(annual.directApvContribution)],
              ['Exceso sobre tope B', Number(simulation.totals.apvBRejectedOverCap)]
            ]}/>
          </Card>
        </section>}

        {summaryTab === 'employers' && <Card title="Retención por empleador versus impuesto combinado" hint="Bruto mensual estimado − cotizaciones de AFP/salud y cesantía = base IUSC; sobre ella se aplica la tabla de retención. El líquido es el bruto menos cotizaciones y retención.">
          {salarySources.length === 0 ? <Empty text="Agregue uno o más trabajos para visualizar la diferencia."/> :
            <div className="table-wrap"><table><thead><tr><th>Trabajo</th><th>Bruto mensual estimado</th><th>Base IUSC</th><th>IUSC retenido</th><th>Líquido</th></tr></thead><tbody>
              {simulation.salaryBreakdown.map((row:any) => <tr key={String(row.id)}><td>{row.name}</td><td>{money.format(Number(row.gross))}</td><td>{money.format(Number(row.taxableBase))}</td><td>{money.format(Number(row.taxWithheld))}</td><td>{money.format(Number(row.net))}</td></tr>)}
            </tbody></table></div>}
        </Card>}

        <div className="warnings">{simulation.warnings.map((w,i)=><p key={i}>⚠ {w}</p>)}</div>
      </>}

      {tab === 'incomes' && <>
        <nav className="sub-tabs">
          {([
            ['list', 'Ingresos guardados'],
            ['form', editing.id ? 'Editar ingreso' : 'Nuevo ingreso']
          ] as const).map(([key, label]) =>
            <button key={key} className={incomesTab === key ? 'active' : ''} onClick={() => setIncomesTab(key)}>{label}</button>)}
        </nav>

        {incomesTab === 'list' && <IncomesSection
          sources={sources}
          taxYear={taxYear}
          prevYears={prevYears}
          busy={busy}
          formatAmount={value => money.format(value)}
          formatFrequencyLabel={freqLabel}
          sourceAnnual={sourceAnnual}
          sourceHint={sourceHint}
          onEdit={source => { setEditing({ ...source }); setIncomesTab('form'); }}
          onRemove={removeSource}
          onCopyFromPrevious={copySourcesFromPrevious}
        />}

        {incomesTab === 'form' && <Card title={editing.id ? 'Editar ingreso' : 'Agregar ingreso'} hint="El monto se anualiza según la frecuencia: mensual × meses, anual directo o de una sola vez. Para sueldos, el motor convierte a bruto los valores ingresados como líquidos antes de aplicar cotizaciones y retención.">
          <div className="form-grid">
            <Field label="Nombre"><input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} placeholder="Ej. Trabajo principal"/></Field>
            <Field label="Tipo"><select value={editing.kind} onChange={e=>setEditing({...editing,kind:e.target.value as any})}><option value="SALARY">Sueldo</option><option value="HONORARIA">Boleta de honorarios (simple)</option><option value="BONUS">Premio / bono</option><option value="OTHER">Otro ingreso</option></select><small>Para boletas detalladas use la sección «Boletas de honorarios».</small></Field>
            <Field label="Monto"><input type="number" value={editing.amount || ''} onChange={e=>setEditing({...editing,amount:Number(e.target.value)})}/></Field>
            {editing.kind === 'SALARY' && <Field label="Monto ingresado"><select value={editing.inputMode} onChange={e=>setEditing({...editing,inputMode:e.target.value as any})}><option value="GROSS">Bruto</option><option value="NET">Líquido</option></select></Field>}
            <Field label="Frecuencia"><select value={editing.frequency} onChange={e=>setEditing({...editing,frequency:e.target.value as any})}><option value="MONTHLY">Mensual</option><option value="ANNUAL">Anual</option><option value="ONE_TIME">Una vez</option></select></Field>
            {editing.frequency === 'MONTHLY' && <Field label="Meses"><input type="number" min="1" max="12" value={editing.months} onChange={e=>setEditing({...editing,months:Number(e.target.value)})}/></Field>}
            {editing.kind === 'SALARY' && <>
              <Field label="AFP"><select value={editing.afpName} onChange={e=>setEditing({...editing,afpName:e.target.value})}>{['CAPITAL','CUPRUM','HABITAT','MODELO','PLANVITAL','PROVIDA','UNO'].map(v=><option key={v}>{v}</option>)}</select></Field>
              <Field label="Salud"><select value={editing.healthSystem} onChange={e=>setEditing({...editing,healthSystem:e.target.value as any})}><option value="FONASA">Fonasa</option><option value="ISAPRE">Isapre</option><option value="NONE">Sin descuento</option></select></Field>
              {editing.healthSystem === 'ISAPRE' && <Field label="Plan Isapre mensual"><input type="number" value={editing.healthPlanAmount || ''} onChange={e=>setEditing({...editing,healthPlanAmount:Number(e.target.value)})}/></Field>}
              <Field label="Contrato"><select value={editing.contractType} onChange={e=>setEditing({...editing,contractType:e.target.value as any})}><option value="INDEFINITE">Indefinido</option><option value="FIXED">Plazo fijo</option></select></Field>
              <Field label="APV"><select value={editing.apvRegime} onChange={e=>setEditing({...editing,apvRegime:e.target.value as any})}><option value="NONE">Sin APV</option><option value="A">Régimen A</option><option value="B">Régimen B</option></select></Field>
              {editing.apvRegime !== 'NONE' && <><Field label="APV mensual"><input type="number" value={editing.apvMonthly || ''} onChange={e=>setEditing({...editing,apvMonthly:Number(e.target.value)})}/></Field><Field label="Forma"><select value={editing.apvPaymentMethod} onChange={e=>setEditing({...editing,apvPaymentMethod:e.target.value as any})}><option value="PAYROLL">Por planilla</option><option value="DIRECT">Aporte directo</option></select></Field></>}
            </>}
            {editing.kind === 'HONORARIA' && <Field label="Retención"><input type="number" step="0.0001" value={editing.withholdingRate || Number(settings.honorariosRetentionRate)} onChange={e=>setEditing({...editing,withholdingRate:Number(e.target.value)})}/><small>{pct(editing.withholdingRate || Number(settings.honorariosRetentionRate))}</small></Field>}
            {(editing.kind === 'BONUS' || editing.kind === 'OTHER') && <><Field label="Afecto a impuesto"><select value={editing.taxable?'yes':'no'} onChange={e=>setEditing({...editing,taxable:e.target.value==='yes'})}><option value="yes">Sí</option><option value="no">No</option></select></Field><Field label="Retención aplicada"><input type="number" step="0.01" value={editing.withholdingRate} onChange={e=>setEditing({...editing,withholdingRate:Number(e.target.value)})}/></Field></>}
            <Field label="Notas" wide><textarea value={editing.notes} onChange={e=>setEditing({...editing,notes:e.target.value})}/></Field>
          </div>
          <div className="actions"><button className="primary" disabled={busy || !editing.name || !editing.amount} onClick={saveSource}>{editing.id?'Guardar cambios':'Agregar ingreso'}</button><button onClick={()=>{setEditing({...emptySource});setIncomesTab('list');}}>Cancelar</button></div>
        </Card>}
      </>}

      {tab === 'fees' && <FeeReceiptsModule settings={settings} taxYear={taxYear} onSettingsChange={patch => updateSettingsState({ ...settings, ...patch } as Settings)} onSimulationStale={() => refreshFeeReceipts()} />}

      {tab === 'mortgages' && <MortgagesModule
        settings={settings}
        taxYear={taxYear}
        grossTaxableIncome={Number(simulation.totals.grossTaxableIncome)}
        loans={mortgages}
        annualRecords={annualRecords}
        onLoansChange={() => refreshMortgages()}
      />}

      {tab === 'apv' && <>
        <Card title="Mismo ahorro, dos tratamientos tributarios">
          <div className="callout callout-info">
            <strong>En palabras simples:</strong> el APV (Ahorro Previsional Voluntario) te deja ahorrar más para tu pensión y, como premio, pagar menos impuesto este año. Hay dos regímenes, y cada uno te premia de una forma distinta:
            <ul>
              <li><strong>Régimen A — bonificación:</strong> el Estado te devuelve un porcentaje de lo que ahorras ({(Number(settings.apvABonusRate) || 0.15) * 100}%, con tope de bonificación en {Number(settings.apvABonusCapUtm) || 6} UTM).</li>
              <li><strong>Régimen B — rebaja de base:</strong> tu aporte se descuenta de la base sobre la que se calcula tu impuesto, así que pagas menos. El descuento tiene tope de {Number(settings.apvBAnnualCapUf) || 600} UF al año.</li>
            </ul>
            Este comparador usa el <strong>mismo aporte anual</strong> en ambos regímenes, para que compares en igualdad de condiciones.
          </div>
          <div className="apv-inputs"><Field label="Aporte mensual"><input type="number" value={apvMonthly} onChange={e=>setApvMonthly(Number(e.target.value))}/></Field><Field label="Meses"><input type="number" min="1" max="12" value={apvMonths} onChange={e=>setApvMonths(Number(e.target.value))}/></Field><div><small>Aporte anual</small><strong>{money.format(apvMonthly*apvMonths)}</strong></div><button className="primary" onClick={compare}>Comparar</button></div>
        </Card>
        {apvComparison && (() => {
          const contribution = Number(apvComparison.annualContribution) || 0;
          const rate = Number(settings.apvABonusRate) || 0.15;
          const capABonus = (Number(settings.apvABonusCapUtm) || 6) * Number(settings.utmValue);
          const capBDeduction = (Number(settings.apvBAnnualCapUf) || 600) * Number(settings.ufValue);
          const bonusRaw = contribution * rate;
          const bonusCapped = Math.min(bonusRaw, capABonus);
          const aBenefit = Number(apvComparison.regimeA.incrementalBenefit) || 0;
          const bBenefit = Number(apvComparison.regimeB.incrementalBenefit) || 0;
          return <section className="comparison-grid">
            <ApvCard title="Régimen A" subtitle="El Estado te devuelve una bonificación por ahorrar"
              rows={[
                { label: 'Aporte anual', value: contribution, hint: 'El total que ahorras en el año (aporte mensual × meses).' },
                { label: 'Beneficio inmediato', value: aBenefit, hint: `Bonificación estatal: menor entre aporte × ${(rate * 100).toFixed(0).replace('.', ',')}% (${money.format(bonusRaw)}) y el tope de ${money.format(capABonus)} (6 UTM).` },
                { label: 'Costo económico neto', value: Number(apvComparison.regimeA.effectiveCashCost), hint: `Aporte anual − beneficio: ${money.format(contribution)} − ${money.format(aBenefit)}. Es lo que realmente sale de tu bolsillo.` },
                { label: 'Impuesto anual estimado', value: Number(apvComparison.regimeA.totals.annualTax), hint: 'Impuesto Global Complementario estimado en este escenario.' },
                { label: Number(apvComparison.regimeA.totals.estimatedBalance) > 0 ? 'Saldo por pagar' : 'Devolución estimada', value: Math.abs(Number(apvComparison.regimeA.totals.estimatedBalance)), hint: 'Impuesto anual − retenciones y PPM acumulados.', tone: Number(apvComparison.regimeA.totals.estimatedBalance) > 0 ? 'danger' : 'success' }
              ]}
              how={`Aportas ${money.format(contribution)} en el año. El Estado entrega un ${(rate * 100).toFixed(0).replace('.', ',')}% adicional: ${money.format(bonusRaw)}; como la bonificación no puede superar 6 UTM (${money.format(capABonus)}), el beneficio final es ${money.format(bonusCapped)}. Este beneficio no paga impuesto y lo recibes en el año, sin afectar tu base imponible.`} />
            <ApvCard title="Régimen B" subtitle="Tu aporte baja la base sobre la que pagas impuesto"
              rows={[
                { label: 'Aporte anual', value: contribution, hint: 'El total que ahorras en el año (aporte mensual × meses).' },
                { label: 'Beneficio inmediato', value: bBenefit, hint: 'Rebaja de impuesto: impuesto sin APV − impuesto con APV. Depende de tu tramo: a mayor tasa, mayor rebaja.' },
                { label: 'Costo económico neto', value: Number(apvComparison.regimeB.effectiveCashCost), hint: `Aporte anual − beneficio: ${money.format(contribution)} − ${money.format(bBenefit)}. Es lo que realmente sale de tu bolsillo.` },
                { label: 'Impuesto anual estimado', value: Number(apvComparison.regimeB.totals.annualTax), hint: 'Impuesto Global Complementario estimado en este escenario.' },
                { label: Number(apvComparison.regimeB.totals.estimatedBalance) > 0 ? 'Saldo por pagar' : 'Devolución estimada', value: Math.abs(Number(apvComparison.regimeB.totals.estimatedBalance)), hint: 'Impuesto anual − retenciones y PPM acumulados.', tone: Number(apvComparison.regimeB.totals.estimatedBalance) > 0 ? 'danger' : 'success' }
              ]}
              how={`Aportas ${money.format(contribution)} en el año. Este monto se descuenta de tu base imponible (tope de ${money.format(capBDeduction)}, 600 UF), así que el impuesto se calcula sobre una base menor. El beneficio es la diferencia entre el impuesto sin APV y el impuesto con APV (${money.format(bBenefit)}): cuanto más alto sea tu tramo, mayor será la rebaja.`} />
            <div className="recommendation"><strong>Lectura inmediata</strong><p>{apvComparison.recommendation}</p><small>La comparación no incorpora rentabilidad, comisiones del producto, tributación futura de la pensión ni impuesto por retiro anticipado.</small></div>
          </section>;
        })()}
      </>}

      {tab === 'scenarios' && <ScenariosModule settings={settings} sources={sources} feeReceipts={feeReceipts} mortgages={mortgages} annualRecords={annualRecords} />}

      {tab === 'settings' && <section className="grid two">
        <Card title="Valores y reglas editables"><div className="form-grid">
          <Field label="Año comercial"><select value={Number(settings.year)} onChange={e => changeYear(Number(e.target.value))}>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select></Field>
          <Field label="UF de referencia"><input type="number" value={Number(settings.ufValue)} onChange={e=>setSettings({...settings,ufValue:Number(e.target.value)})}/></Field>
          <Field label="UTM de referencia"><input type="number" value={Number(settings.utmValue)} onChange={e=>setSettings({...settings,utmValue:Number(e.target.value)})}/></Field>
          <Field label="Retención honorarios"><input type="number" step="0.0001" value={Number(settings.honorariosRetentionRate)} onChange={e=>setSettings({...settings,honorariosRetentionRate:Number(e.target.value)})}/><small>{pct(Number(settings.honorariosRetentionRate))}</small></Field>
          <Field label="Gastos de honorarios"><select value={String(settings.honorariosExpenseMethod)} onChange={e=>setSettings({...settings,honorariosExpenseMethod:e.target.value as any})}><option value="PRESUMED">Presuntos 30%, tope 15 UTA</option><option value="ACTUAL">Gastos efectivos</option></select></Field>
          {settings.honorariosExpenseMethod === 'ACTUAL' && <Field label="Gastos efectivos anuales"><input type="number" value={Number(settings.honorariosActualAnnualExpenses)} onChange={e=>setSettings({...settings,honorariosActualAnnualExpenses:Number(e.target.value)})}/></Field>}
          <Field label="Reconocimiento de boletas"><select value={String(settings.feeRecognitionMode || 'ISSUE_DATE')} onChange={e=>setSettings({...settings,feeRecognitionMode:e.target.value as any})}><option value="ISSUE_DATE">Por fecha de emisión</option><option value="PAID_ONLY">Solo boletas pagadas</option></select></Field>
        </div>
        <h3>Parámetros art. 55 bis LIR</h3>
        <div className="form-grid">
          <Field label="Tope de intereses (UTA)"><input type="number" step="0.01" value={Number(settings.mortgageInterestMaxUta)} onChange={e=>setSettings({...settings,mortgageInterestMaxUta:Number(e.target.value)})}/></Field>
          <Field label="Renta tope 100% (UTA)"><input type="number" step="0.01" value={Number(settings.mortgageFullBenefitIncomeMaxUta)} onChange={e=>setSettings({...settings,mortgageFullBenefitIncomeMaxUta:Number(e.target.value)})}/></Field>
          <Field label="Renta tope sin beneficio (UTA)"><input type="number" step="0.01" value={Number(settings.mortgagePartialBenefitIncomeMaxUta)} onChange={e=>setSettings({...settings,mortgagePartialBenefitIncomeMaxUta:Number(e.target.value)})}/></Field>
          <Field label="Constante fórmula"><input type="number" step="0.001" value={Number(settings.mortgagePartialFormulaConstant)} onChange={e=>setSettings({...settings,mortgagePartialFormulaConstant:Number(e.target.value)})}/></Field>
          <Field label="Factor de la fórmula"><input type="number" step="0.001" value={Number(settings.mortgagePartialFormulaFactor)} onChange={e=>setSettings({...settings,mortgagePartialFormulaFactor:Number(e.target.value)})}/></Field>
        </div>
        <div className="actions"><button className="primary" onClick={saveSettings}>Guardar parámetros</button></div></Card>
        <Card title="Parámetros versionados en la base de datos"><div className="parameter-list">{taxParameters.length===0?<Empty text="No hay parámetros cargados aún."/>:taxParameters.map(p=><div key={p.ruleKey}><strong>{p.ruleKey}</strong><small>{String(p.value)}</small><span>{p.description || ''}</span></div>)}</div></Card>
      </section>}

      {tab === 'sources' && <SourcesModule references={references} />}

      {tab === 'logs' && <LogsModule />}
      <CalculationExplanationPanel explanations={simulation.explanations} defaultExpanded={false} focusKey={explanationFocusKey} exportData={{ simulationId: `live-${simulation.audit.generatedAt}`, generatedAt: simulation.audit.generatedAt, taxYear: simulation.audit.taxYear, ruleVersion: simulation.audit.ruleVersion, inputs: { sources, settings, feeReceipts, mortgages, annualRecords }, results: simulation.annualResult, explanations: simulation.explanations, sources: references }} />
    </main>
  </div>;
}

function tabTitle(tab: Tab): string {
  return ({
    dashboard: 'Resumen anual estimado',
    incomes: 'Fuentes de ingreso laboral',
    fees: 'Boletas de honorarios',
    mortgages: 'Créditos hipotecarios y art. 55 bis',
    apv: 'Simulación APV A versus B',
    scenarios: 'Simulación anual y escenarios',
    settings: 'Configuración tributaria',
    sources: 'Fuentes oficiales',
    logs: 'Bitácora de ejecuciones'
  } as Record<Tab, string>)[tab];
}

function tabSubtitle(tab: Tab): string {
  return ({
    dashboard: 'Integra sueldos, honorarios, premios, hipotecario y APV en una sola proyección.',
    incomes: 'Administra empleadores y un ingreso simplificado por honorarios.',
    fees: 'Registra boletas de honorarios con cálculo de retención, PPM, gastos y consolidación tributaria.',
    mortgages: 'Registra créditos hipotecarios y estima el beneficio del artículo 55 bis de la LIR.',
    apv: 'Compara el efecto tributario inmediato de los regímenes A y B.',
    scenarios: 'Compara escenarios combinando hipotecario, APV y tipos de honorarios.',
    settings: 'Parámetros editables del motor tributario, versionados por año comercial.',
    sources: 'Fuentes oficiales consultadas y trazabilidad de reglas tributarias.',
    logs: 'Registro de ejecuciones sincronas y asincronas, con filtros y paginación.'
  } as Record<Tab, string>)[tab];
}

function Metric({label,value,tone='',hint='',onExplain}:{label:string,value:string,tone?:string,hint?:string,onExplain?:()=>void}) { return <article className={`metric ${tone}`}><small>{label}</small><strong>{value}</strong>{hint && <span className="metric-hint">{hint}</span>}{onExplain && <button className="metric-explain" onClick={onExplain}>Ver cálculo</button>}</article>; }
function Card({title,children,hint}:{title:string,children:any,hint?:string}) { return <section className="card"><h2>{title}</h2>{children}{hint && <p className="card-hint">{hint}</p>}</section>; }
function Field({label,children,wide=false}:{label:string,children:any,wide?:boolean}) { return <label className={wide?'wide':''}><span>{label}</span>{children}</label>; }
function Rows({rows}:{rows:[string,number][]}) { return <div className="rows">{rows.map(([label,value])=><div key={label}><span>{label}</span><strong>{money.format(value)}</strong></div>)}</div>; }
function Empty({text}:{text:string}) { return <div className="empty">{text}</div>; }
function ApvCard({ title, subtitle, rows, how }: { title: string; subtitle: string; rows: { label: string; value: number; hint: string; tone?: string }[]; how: string }) {
  return <Card title={title}><p className="subtitle">{subtitle}</p>
    <div className="metrics apv-metrics">
      {rows.map(r => <Metric key={r.label} label={r.label} value={money.format(r.value)} hint={r.hint} tone={r.tone || ''} />)}
    </div>
    <div className="how-box"><strong>¿Cómo se calcula?</strong><p>{how}</p></div>
  </Card>;
}
function sourceAnnual(s: IncomeSource): number {
  return s.frequency === 'MONTHLY' ? (Number(s.amount) || 0) * (Number(s.months) || 12) : (Number(s.amount) || 0);
}
function sourceHint(s: IncomeSource): string {
  const annual = sourceAnnual(s);
  if (s.frequency === 'MONTHLY') return `Proyección anual estimada: ${money.format(annual)} (${money.format(Number(s.amount))} × ${Number(s.months) || 12} meses).`;
  if (s.frequency === 'ANNUAL') return 'Monto anual directo; se suma a la renta del año comercial.';
  return 'Ingreso de una sola vez durante el año.';
}
function freqLabel(f: string): string { return f === 'ANNUAL' ? 'Anual' : f === 'ONE_TIME' ? 'Una vez' : f; }
function errMsg(e: any) { return e instanceof ApiRequestError ? `[${e.code}] ${e.message}` : e instanceof Error ? e.message : 'Error inesperado'; }
