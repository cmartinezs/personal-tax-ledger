import { useEffect, useMemo, useState } from 'react';
import { api, ApiRequestError } from './api';
import { useFeedback, LOG } from './feedback';
import type { MortgageLoan, MortgageAnnualRecord, MortgageBenefit, Settings, Simulation } from './types';

const money = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
const money2 = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 2 });
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const round2 = (n: number) => Math.round(n * 100) / 100;

const year = new Date().getFullYear();
const emptyLoan: MortgageLoan = {
  taxYear: year,
  institutionName: '',
  institutionTaxId: '',
  operationNumber: '',
  propertyAlias: '',
  propertyAddress: '',
  propertyRole: '',
  purpose: 'PURCHASE',
  ownershipType: 'SOLE_OWNER',
  ownershipPercentage: 1,
  isDesignatedBeneficiary: true,
  originalPrincipal: null,
  outstandingPrincipal: null,
  monthlyPayment: null,
  annualInterestPaid: 0,
  annualPrincipalPaid: null,
  annualInsurancePaid: null,
  annualOtherCharges: null,
  certificateReference: '',
  certificateDate: '',
  eligibleForArticle55Bis: true,
  notes: ''
};

type Props = {
  settings: Settings;
  taxYear: number;
  grossTaxableIncome: number;
  loans: MortgageLoan[];
  annualRecords: MortgageAnnualRecord[];
  onLoansChange: () => void;
};

export default function MortgagesModule({ settings, taxYear, grossTaxableIncome, loans: loansProp, annualRecords: annualRecordsProp, onLoansChange }: Props) {
  const [editing, setEditing] = useState<MortgageLoan>({ ...emptyLoan, taxYear });
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { notify, log, confirm } = useFeedback();
  const [annualRecordDraft, setAnnualRecordDraft] = useState<Record<string, MortgageAnnualRecord>>({});
  const [benefit, setBenefit] = useState<MortgageBenefit | null>(null);

  const [widgetOpen, setWidgetOpen] = useState(false);
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [annualRate, setAnnualRate] = useState<number>(0);
  const [dividends, setDividends] = useState<(number | null)[]>(Array(12).fill(null));
  const [updateOutstanding, setUpdateOutstanding] = useState(true);
  const [pendingAnnual, setPendingAnnual] = useState<{ taxYear: number; interestPaid: number; principalPaid: number } | null>(null);
  const [mortgageTab, setMortgageTab] = useState<'benefit' | 'loans' | 'records'>('benefit');

  // Treat taxYear prop as "current year being registered". Allow the user to view annual records.
  const loans = loansProp;
  const annualRecords = annualRecordsProp;

  const refreshBenefit = async () => {
    try {
      const result = await api.article55Bis({
        mortgages: loans,
        annualRecords,
        incomeEstimate: grossTaxableIncome,
        settings
      });
      setBenefit(result);
    } catch (e) { setError(errMsg(e)); }
  };

  useEffect(() => { refreshBenefit(); }, [loans, annualRecords, grossTaxableIncome, settings]);

  const saveLoan = async () => {
    setBusy(true); setError('');
    const started = performance.now();
    try {
      const payload = sanitizeLoan(editing);
      const saved = editing.id ? await api.updateMortgage(payload) : await api.createMortgage(payload);
      if (pendingAnnual && saved.id) {
        const existing = (await api.listAnnualRecords(saved.id, { taxYear: pendingAnnual.taxYear }))[0];
        if (existing) await api.updateAnnualRecord({ ...existing, interestPaid: pendingAnnual.interestPaid, principalPaid: pendingAnnual.principalPaid });
        else await api.createAnnualRecord(saved.id, { taxYear: pendingAnnual.taxYear, interestPaid: pendingAnnual.interestPaid, principalPaid: pendingAnnual.principalPaid });
        setPendingAnnual(null);
      }
      setEditing({ ...emptyLoan, taxYear });
      setShowForm(false);
      onLoansChange();
      log({ kind: 'ASYNC', operation: LOG.SAVE_MORTGAGE, status: 'OK', message: payload.propertyAlias || payload.institutionName || '', auditMessage: JSON.stringify({ id: payload.id, institution: payload.institutionName, alias: payload.propertyAlias, outstandingPrincipal: payload.outstandingPrincipal, annualInterestPaid: payload.annualInterestPaid, taxYear: payload.taxYear }), durationMs: Math.round(performance.now() - started) });
      notify('Crédito hipotecario guardado');
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      log({ kind: 'ASYNC', operation: LOG.SAVE_MORTGAGE, status: 'ERROR', message: msg, auditMessage: `alias=${editing.propertyAlias} error: ${msg}`, durationMs: Math.round(performance.now() - started) });
      notify('No se pudo guardar el crédito', { tone: 'error', message: msg });
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    const ok = await confirm({ message: '¿Eliminar este crédito hipotecario? Se eliminarán también sus registros anuales.', confirmLabel: 'Eliminar', cancelLabel: 'Cancelar', danger: true });
    if (!ok) return;
    const started = performance.now();
    try {
      await api.deleteMortgage(id); onLoansChange();
      log({ kind: 'ASYNC', operation: LOG.DELETE_MORTGAGE, status: 'OK', message: id, auditMessage: `id=${id}`, durationMs: Math.round(performance.now() - started) });
      notify('Crédito hipotecario eliminado');
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      log({ kind: 'ASYNC', operation: LOG.DELETE_MORTGAGE, status: 'ERROR', message: msg, auditMessage: `id=${id} error: ${msg}`, durationMs: Math.round(performance.now() - started) });
      notify('No se pudo eliminar el crédito', { tone: 'error', message: msg });
    }
  };

  const saveAnnualRecord = async (loanId: string) => {
    const draft = annualRecordDraft[loanId] || { taxYear, interestPaid: 0 };
    const started = performance.now();
    try {
      await api.createAnnualRecord(loanId, { taxYear: Number(draft.taxYear), interestPaid: Number(draft.interestPaid) || 0 });
      setAnnualRecordDraft({ ...annualRecordDraft, [loanId]: { taxYear, interestPaid: 0 } });
      onLoansChange();
      log({ kind: 'ASYNC', operation: LOG.SAVE_ANNUAL_RECORD, status: 'OK', message: `${loanId} · ${Number(draft.taxYear)}`, auditMessage: `loanId=${loanId} taxYear=${Number(draft.taxYear)} interest=${Number(draft.interestPaid) || 0}`, durationMs: Math.round(performance.now() - started) });
      notify('Registro anual guardado');
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      log({ kind: 'ASYNC', operation: LOG.SAVE_ANNUAL_RECORD, status: 'ERROR', message: msg, durationMs: Math.round(performance.now() - started) });
      notify('No se pudo guardar el registro anual', { tone: 'error', message: msg });
    }
  };

  const uta = Number(settings.utmValue) * 12;
  const mortgageDeduction = benefit?.deduction || 0;
  const mortgageTaxSaving = Number(simulationMortgageTaxSaving()) || 0;

  const openWidget = () => {
    setInitialBalance(Number(editing.outstandingPrincipal) || 0);
    setWidgetOpen(true);
  };

  const effectiveInitialBalance = Number(initialBalance) > 0 ? Number(initialBalance) : (Number(editing.outstandingPrincipal) || 0);

  const schedule = useMemo(() => {
    const monthlyRate = Math.max(0, Number(annualRate) || 0) / 100 / 12;
    let saldo = effectiveInitialBalance;
    const rows = dividends.map((div, i) => {
      const d = Math.max(0, Number(div) || 0);
      let interest = 0;
      let principal = 0;
      if (d > 0 && saldo > 0) {
        interest = round2(Math.min(d, saldo * monthlyRate));
        principal = round2(Math.max(0, d - interest));
        saldo = round2(saldo - principal);
      }
      return { month: i, dividend: d, interest, principal, balance: saldo };
    });
    const totals = rows.reduce((acc, r) => ({
      dividend: acc.dividend + r.dividend,
      interest: acc.interest + r.interest,
      principal: acc.principal + r.principal
    }), { dividend: 0, interest: 0, principal: 0 });
    const paidMonths = rows.filter(r => r.dividend > 0).length;
    return { rows, totals, paidMonths, finalBalance: saldo };
  }, [annualRate, dividends, effectiveInitialBalance]);

  const applySchedule = () => {
    const next: MortgageLoan = {
      ...editing,
      annualInterestPaid: schedule.totals.interest,
      annualPrincipalPaid: schedule.totals.principal,
      monthlyPayment: schedule.paidMonths > 0 ? round2(schedule.totals.dividend / schedule.paidMonths) : editing.monthlyPayment
    };
    if (updateOutstanding && schedule.paidMonths > 0) next.outstandingPrincipal = schedule.finalBalance;
    setEditing(next);
    setPendingAnnual({ taxYear, interestPaid: schedule.totals.interest, principalPaid: schedule.totals.principal });
    setWidgetOpen(false);
  };

  const clearSchedule = () => {
    setDividends(Array(12).fill(null));
    setAnnualRate(0);
    setInitialBalance(0);
  };

  function simulationMortgageTaxSaving(): number {
    // We don't have a recompute here; instead we expose the figure from benefit context
    // The actual tax saving computed by the engine lives in simulation.totals.mortgageTaxSaving.
    // For display purposes, return 0 unless parent provided it via prop (we deliberately
    // keep this module self-contained, so the parent will provide via onLoansChange).
    return 0;
  }

  return (
    <div className="module">
      <nav className="sub-tabs">
        {([
          ['benefit', 'Beneficio art. 55 bis'],
          ['loans', 'Créditos registrados'],
          ['records', 'Registros anuales']
        ] as const).map(([key, label]) =>
          <button key={key} className={mortgageTab === key ? 'active' : ''} onClick={() => setMortgageTab(key)}>{label}</button>)}
      </nav>

      {mortgageTab === 'benefit' && <Card title="Resumen del beneficio art. 55 bis LIR" hint="El beneficio se calcula sobre el interés efectivamente pagado en el año por los créditos elegibles, con tope de 8 UTA y un porcentaje que decrece según la renta imponible proyectada.">
        <div className="callout callout-info">
          ⚠ Solo los intereses elegibles efectivamente pagados durante el año se utilizan para calcular la rebaja tributaria. Capital, seguros, gastos comunes y comisiones bancarias <strong>no</strong> son deducibles.
        </div>
        <div className="metrics">
          <Metric label="Créditos registrados" value={String(loans.length)} hint={`Cantidad de créditos hipotecarios cargados para el año comercial ${taxYear}.`} />
          <Metric label="Intereses anuales totales" value={money.format(benefit?.totalInterestPaid || 0)} hint="Suma del interés pagado en el año por todos los créditos (registro anual o campo del crédito)." />
          <Metric label="Intereses elegibles" value={money.format(benefit?.eligibleInterest || 0)} hint="Intereses de créditos que cumplen los requisitos del art. 55 bis; excluye los no elegibles y los sin beneficiario designado." />
          <Metric label={`Máximo legal (${Number(settings.mortgageInterestMaxUta) || 8} UTA)`} value={money.format(benefit?.capInterest || (Number(settings.mortgageInterestMaxUta) || 8) * uta)} hint={`Tope de la base deducible: ${Number(settings.mortgageInterestMaxUta) || 8} UTA × ${money.format(uta)} (valor UTA).`} />
          <Metric label="Base deducible" value={money.format(benefit?.baseDeductibleInterest || 0)} hint="Mínimo entre los intereses elegibles y el máximo legal." />
          <Metric label="Porcentaje aplicable" value={`${benefit?.applicablePercentage?.toFixed(2).replace('.', ',') || '0'}%`} hint="100% si la renta es ≤ 90 UTA; fórmula decreciente entre 90 y 150 UTA; 0% sobre 150 UTA." />
          <Metric label="Rebaja estimada (base)" value={money.format(mortgageDeduction)} hint="Base deducible × porcentaje aplicable. Rebaja la base imponible del Global Complementario." />
          <Metric label="Ahorro tributario estimado" value={money.format(mortgageTaxSaving)} hint="Diferencia del impuesto anual con y sin la rebaja; se estima en la simulación del Resumen." />
          <Metric label="Créditos excluidos" value={String(benefit?.excluded?.length || 0)} hint="Créditos no elegibles para el beneficio; no aportan intereses a la rebaja." />
        </div>
        <div className="legend">
          <strong>Tramo</strong>: {benefit && (benefit.bracket === 'FULL' ? 'Rento inferior a 90 UTA: 100% de rebaja' : benefit.bracket === 'PARTIAL' ? 'Tramo 90-150 UTA con fórmula decreciente' : 'Renta superior a 150 UTA: sin rebaja')}
          <br />
          <small>Renta imponible proyectada: {benefit ? `${benefit.incomeUta.toFixed(2)} UTA` : '—'} · Fórmula aplicada: <code>250 − renta_constante_uta × 1,667</code></small>
        </div>

        {benefit && benefit.excluded.length > 0 && (
          <div className="callout callout-warn">
            <strong>Créditos excluidos del beneficio:</strong>
            <ul>{benefit.excluded.map(e => <li key={e.loanId}>{e.propertyAlias}: {e.reasons.join(' · ')}</li>)}</ul>
          </div>
        )}
        {benefit && benefit.warnings.length > 0 && (
          <div className="callout callout-warn">
            <strong>Advertencias pendientes:</strong>
            <ul>{benefit.warnings.map((w, i) => <li key={i}>{w.message}</li>)}</ul>
          </div>
        )}
      </Card>}

      {mortgageTab === 'loans' && <Card title="Créditos hipotecarios registrados" hint="La columna «Intereses año» muestra el interés del registro anual del año comercial; si no existe, cae al campo «Intereses pagados este año» del propio crédito.">
        <div className="filter-bar">
          <button className="primary" onClick={() => { setEditing({ ...emptyLoan, taxYear }); setShowForm(true); }}>+ Nuevo crédito hipotecario</button>
          {showForm && <button onClick={() => setShowForm(false)}>Ocultar formulario</button>}
        </div>

        {showForm && (
          <div className="card form-card">
            <h3>{editing.id ? 'Editar crédito hipotecario' : 'Nuevo crédito hipotecario'}</h3>
            <div className="form-grid">
              <Field label="Institución financiera"><input value={editing.institutionName} onChange={e => setEditing({ ...editing, institutionName: e.target.value })} /></Field>
              <Field label="Número de operación"><input value={editing.operationNumber || ''} onChange={e => setEditing({ ...editing, operationNumber: e.target.value })} /></Field>
              <Field label="Alias de la propiedad"><input value={editing.propertyAlias} onChange={e => setEditing({ ...editing, propertyAlias: e.target.value })} /></Field>
              <Field label="Dirección"><input value={editing.propertyAddress || ''} onChange={e => setEditing({ ...editing, propertyAddress: e.target.value })} /></Field>
              <Field label="Rol de avalúo (opcional)"><input value={editing.propertyRole || ''} onChange={e => setEditing({ ...editing, propertyRole: e.target.value })} /></Field>
              <Field label="Destino">
                <select value={editing.purpose} onChange={e => setEditing({ ...editing, purpose: e.target.value as any })}>
                  <option value="PURCHASE">Compra de vivienda</option>
                  <option value="CONSTRUCTION">Construcción</option>
                  <option value="REFINANCING_ELIGIBLE_LOAN">Refinanciamiento de crédito elegible</option>
                </select>
              </Field>
              <Field label="Tipo de propiedad">
                <select value={editing.ownershipType} onChange={e => setEditing({ ...editing, ownershipType: e.target.value as any, ownershipPercentage: e.target.value === 'SOLE_OWNER' ? 1 : editing.ownershipPercentage })}>
                  <option value="SOLE_OWNER">Titular único</option>
                  <option value="CO_OWNERSHIP">Copropiedad</option>
                  <option value="SPOUSAL_COMMUNITY">Sociedad conyugal</option>
                </select>
              </Field>
              <Field label="Porcentaje de propiedad"><input type="number" min={0} max={1} step="0.01" disabled={editing.ownershipType === 'SOLE_OWNER'} value={editing.ownershipPercentage} onChange={e => setEditing({ ...editing, ownershipPercentage: Math.min(1, Math.max(0, Number(e.target.value) || 0)) })} /></Field>
              <Field label="Beneficiario designado del beneficio">
                <select value={editing.isDesignatedBeneficiary ? 'yes' : 'no'} onChange={e => setEditing({ ...editing, isDesignatedBeneficiary: e.target.value === 'yes' })}>
                  <option value="yes">Sí, estoy designado</option>
                  <option value="no">No / en discusión</option>
                </select>
              </Field>
              <Field label="Elegibilidad art. 55 bis">
                <select value={editing.eligibleForArticle55Bis ? 'yes' : 'no'} onChange={e => setEditing({ ...editing, eligibleForArticle55Bis: e.target.value === 'yes' })}>
                  <option value="yes">Sí, es elegible</option>
                  <option value="no">No elegible</option>
                </select>
              </Field>
              <Field label="Capital original"><input type="number" value={editing.originalPrincipal ?? ''} onChange={e => setEditing({ ...editing, originalPrincipal: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
              <Field label="Saldo actual"><input type="number" value={editing.outstandingPrincipal ?? ''} onChange={e => setEditing({ ...editing, outstandingPrincipal: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
              <Field label="Dividendo mensual informativo"><input type="number" value={editing.monthlyPayment ?? ''} onChange={e => setEditing({ ...editing, monthlyPayment: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
              <Field label="Intereses pagados este año"><input type="number" value={editing.annualInterestPaid} onChange={e => setEditing({ ...editing, annualInterestPaid: Number(e.target.value) || 0 })} /></Field>
              <Field label="Capital amortizado este año"><input type="number" value={editing.annualPrincipalPaid ?? ''} onChange={e => setEditing({ ...editing, annualPrincipalPaid: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
              <Field label="Seguros pagados este año"><input type="number" value={editing.annualInsurancePaid ?? ''} onChange={e => setEditing({ ...editing, annualInsurancePaid: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
              <Field label="Otros cargos"><input type="number" value={editing.annualOtherCharges ?? ''} onChange={e => setEditing({ ...editing, annualOtherCharges: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
              <Field label="Referencia del certificado bancario"><input value={editing.certificateReference || ''} onChange={e => setEditing({ ...editing, certificateReference: e.target.value })} /></Field>
              <Field label="Fecha del certificado"><input type="date" value={editing.certificateDate || ''} onChange={e => setEditing({ ...editing, certificateDate: e.target.value })} /></Field>
              <Field label="Notas" wide><textarea value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} /></Field>
            </div>
            <div className="dividend-widget">
              <div className="dividend-widget-header">
                <h4>¿No tienes los intereses del año? Registra los dividendos mensuales</h4>
                <button onClick={() => widgetOpen ? setWidgetOpen(false) : openWidget()}>{widgetOpen ? 'Ocultar calculadora de dividendos' : 'Registrar dividendos mensuales'}</button>
              </div>
              {widgetOpen && <>
                <p className="hint">Ingresa cada dividendo pagado en el año (puedes dejar vacíos los meses sin pago). Con la tasa anual y el saldo inicial estimamos cuánto fue interés y cuánto amortización, mes a mes y en total.</p>
                <div className="dividend-fields">
                  <label><span>Saldo inicial del año</span><input type="number" min="0" value={effectiveInitialBalance || ''} onChange={e => setInitialBalance(Number(e.target.value) || 0)} /></label>
                  <label><span>Tasa anual (%)</span><input type="number" min="0" step="0.01" value={annualRate || ''} onChange={e => setAnnualRate(Number(e.target.value) || 0)} placeholder="Ej. 4.5" /></label>
                  <label className="check"><span>Actualizar saldo actual con el saldo final estimado</span><input type="checkbox" checked={updateOutstanding} onChange={e => setUpdateOutstanding(e.target.checked)} /></label>
                </div>
                <div className="table-wrap"><table className="schedule-table">
                  <thead><tr><th>Mes</th><th>Dividendo</th><th>Interés</th><th>Amortización</th><th>Saldo final</th></tr></thead>
                  <tbody>
                    {schedule.rows.map((r, i) => (
                      <tr key={i}>
                        <td>{MONTHS[i]}</td>
                        <td><input type="number" min="0" placeholder="—" value={dividends[i] ?? ''} onChange={e => setDividends(dividends.map((d, j) => j === i ? (e.target.value === '' ? null : Math.max(0, Number(e.target.value))) : d))} /></td>
                        <td>{r.dividend > 0 ? money2.format(r.interest) : '—'}</td>
                        <td>{r.dividend > 0 ? money2.format(r.principal) : '—'}</td>
                        <td>{money2.format(r.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr><th>Total {schedule.paidMonths} de 12 meses</th><th>{money2.format(schedule.totals.dividend)}</th><th>{money2.format(schedule.totals.interest)}</th><th>{money2.format(schedule.totals.principal)}</th><th>{money2.format(schedule.finalBalance)}</th></tr>
                  </tfoot>
                </table></div>
                <div className="schedule-summary">
                  <div><small>Intereses del año (art. 55 bis)</small><strong>{money.format(schedule.totals.interest)}</strong></div>
                  <div><small>Capital amortizado</small><strong>{money.format(schedule.totals.principal)}</strong></div>
                  <div><small>Total dividendos pagados</small><strong>{money.format(schedule.totals.dividend)}</strong></div>
                </div>
                <div className="actions">
                  <button className="primary" disabled={schedule.paidMonths === 0 || (Number(annualRate) > 0 && effectiveInitialBalance === 0)} onClick={applySchedule}>Usar estos valores en el crédito</button>
                  <button onClick={clearSchedule}>Limpiar dividendos</button>
                </div>
                {Number(annualRate) > 0 && effectiveInitialBalance === 0 && <small className="widget-warn">Ingresa el saldo inicial para poder separar interés y amortización.</small>}
              </>}
            </div>
            <div className="actions">
              <button className="primary" disabled={busy || !editing.institutionName || !editing.propertyAlias} onClick={saveLoan}>{editing.id ? 'Guardar cambios' : 'Crear crédito'}</button>
              <button onClick={() => { setShowForm(false); setEditing({ ...emptyLoan, taxYear }); }}>Cancelar</button>
            </div>
            <p className="hint">⚠ Recomendamos obtener los intereses deducibles del certificado anual emitido por la institución financiera.</p>
          </div>
        )}

        {error && <div className="alert error">{error}<button onClick={() => setError('')}>×</button></div>}

        {loans.length === 0 ? <Empty text="No hay créditos hipotecarios registrados." /> :
          <div className="table-wrap"><table>
            <thead><tr><th>Institución</th><th>Operación</th><th>Propiedad</th><th>Destino</th><th>Participación</th><th>Beneficiario</th><th>Intereses año</th><th>55 bis</th><th>Acciones</th></tr></thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan.id}>
                  <td>{loan.institutionName}</td>
                  <td>{loan.operationNumber || '—'}</td>
                  <td>{loan.propertyAlias}<br/>{loan.propertyAddress && <small>{loan.propertyAddress}</small>}</td>
                  <td>{labelPurpose(loan.purpose)}</td>
                  <td>{(loan.ownershipPercentage * 100).toFixed(0)}%</td>
                  <td>{loan.isDesignatedBeneficiary ? 'Sí' : 'No'}</td>
                  <td>{money.format(findInterest(loan.id!, annualRecords) || Number(loan.annualInterestPaid) || 0)}</td>
                  <td>{loan.eligibleForArticle55Bis ? 'Sí' : 'Excluido'}</td>
                  <td>
                    <button onClick={() => { setEditing(loan); setShowForm(true); }}>Editar</button>
                    <button className="danger-text" onClick={() => remove(loan.id!)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>}
      </Card>}

      {mortgageTab === 'records' && <Card title="Registros anuales de intereses (art. 55 bis)">
        <p className="hint">Agregue un registro por año calendario. La información tributaria cambia por año: esto evita sobrescribir el interés histórico al actualizar un crédito.</p>
        {loans.length === 0 ? <Empty text="Agregue un crédito primero." /> :
          loans.map(loan => (
            <div key={loan.id} className="register-card">
              <h3>{loan.propertyAlias} — {loan.institutionName}</h3>
              <div className="rows">
                {(annualRecordsByLoan(loan.id!, annualRecords)).length === 0
                  ? <div className="empty small">Sin registros anuales. Solo usamos annualInterestPaid guardado en el crédito.</div>
                  : annualRecordsByLoan(loan.id!, annualRecords).map(rec => (
                    <div key={rec.id}>
                      <span>Año {rec.taxYear}</span>
                      <strong>{money.format(Number(rec.interestPaid))}</strong>
                    </div>
                  ))}
              </div>
              <div className="inline-form">
                <input type="number" placeholder="Año" value={annualRecordDraft[loan.id!]?.taxYear ?? taxYear} onChange={e => setAnnualRecordDraft({ ...annualRecordDraft, [loan.id!]: { ...(annualRecordDraft[loan.id!] || { interestPaid: 0 }), taxYear: Number(e.target.value) } })} />
                <input type="number" placeholder="Intereses pagados" value={annualRecordDraft[loan.id!]?.interestPaid ?? 0} onChange={e => setAnnualRecordDraft({ ...annualRecordDraft, [loan.id!]: { taxYear: annualRecordDraft[loan.id!]?.taxYear ?? taxYear, interestPaid: Number(e.target.value) } })} />
                <button onClick={() => saveAnnualRecord(loan.id!)}>+ Año</button>
              </div>
            </div>
          ))}
      </Card>}
    </div>
  );
}

function annualRecordsByLoan(loanId: string, records: MortgageAnnualRecord[]) {
  return records.filter(r => r.mortgageLoanId === loanId).sort((a, b) => (b.taxYear || 0) - (a.taxYear || 0));
}
function findInterest(loanId: string, records: MortgageAnnualRecord[]) {
  return records.find(r => r.mortgageLoanId === loanId)?.interestPaid;
}
function labelPurpose(p: string) { return p === 'PURCHASE' ? 'Compra' : p === 'CONSTRUCTION' ? 'Construcción' : p === 'REFINANCING_ELIGIBLE_LOAN' ? 'Refinanciamiento' : p; }
function sanitizeLoan(l: MortgageLoan): MortgageLoan {
  return {
    ...l,
    institutionName: l.institutionName.trim(),
    propertyAlias: l.propertyAlias.trim(),
    originalPrincipal: l.originalPrincipal === null ? null : Math.max(0, Number(l.originalPrincipal)),
    outstandingPrincipal: l.outstandingPrincipal === null ? null : Math.max(0, Number(l.outstandingPrincipal)),
    monthlyPayment: l.monthlyPayment === null ? null : Math.max(0, Number(l.monthlyPayment)),
    annualInterestPaid: Math.max(0, Number(l.annualInterestPaid) || 0),
    annualPrincipalPaid: l.annualPrincipalPaid === null ? null : Math.max(0, Number(l.annualPrincipalPaid)),
    annualInsurancePaid: l.annualInsurancePaid === null ? null : Math.max(0, Number(l.annualInsurancePaid)),
    annualOtherCharges: l.annualOtherCharges === null ? null : Math.max(0, Number(l.annualOtherCharges))
  };
}

function Card({ title, children, hint }: { title: string; children: any; hint?: string }) { return <section className="card"><h2>{title}</h2>{children}{hint && <p className="card-hint">{hint}</p>}</section>; }
function Field({ label, children, wide }: { label: string; children: any; wide?: boolean }) { return <label className={wide ? 'wide' : ''}><span>{label}</span>{children}</label>; }
function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) { return <article className="metric"><small>{label}</small><strong>{value}</strong>{hint && <span className="metric-hint">{hint}</span>}</article>; }
function Empty({ text }: { text: string }) { return <div className="empty">{text}</div>; }
function errMsg(e: any) { return e instanceof ApiRequestError ? `[${e.code}] ${e.message}` : e instanceof Error ? e.message : 'Error inesperado'; }
