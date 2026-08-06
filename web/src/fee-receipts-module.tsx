import { useEffect, useMemo, useState } from 'react';
import { api, ApiRequestError } from './api';
import { useFeedback, LOG } from './feedback';
import type { FeeReceipt, FeeReceiptComputed, FeeExpenseSettings, Settings, FeeSummary } from './types';

const money = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
const money2 = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 2 });
const pct = (value: number) => `${(Number(value) * 100).toFixed(2).replace('.', ',')}%`;

const emptyReceipt: FeeReceipt = {
  taxYear: new Date().getFullYear(),
  issueDate: new Date().toISOString().slice(0, 10),
  folio: '',
  clientName: '',
  clientTaxId: '',
  description: '',
  amountInputType: 'GROSS',
  grossAmount: 0,
  netAmount: 0,
  withholdingMode: 'WITHHELD_BY_RECIPIENT',
  withholdingRate: 0.1525,
  withheldAmount: 0,
  ppmPaidAmount: 0,
  taxable: true,
  status: 'ACTIVE',
  paymentStatus: 'PENDING',
  paymentDate: '',
  notes: ''
};

type Props = {
  settings: Settings;
  taxYear: number;
  onSettingsChange: (patch: Partial<Settings>) => void;
  onSimulationStale: () => void;
};

export default function FeeReceiptsModule({ settings, taxYear, onSettingsChange, onSimulationStale }: Props) {
  const [receipts, setReceipts] = useState<FeeReceipt[]>([]);
  const [expenseSettings, setExpenseSettings] = useState<FeeExpenseSettings | null>(null);
  const [editing, setEditing] = useState<FeeReceipt>({ ...emptyReceipt, taxYear });
  const [filters, setFilters] = useState({ clientName: '', status: '', paymentStatus: '', withholdingMode: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [feeTab, setFeeTab] = useState<'summary' | 'gastos' | 'boletas'>('summary');
  const { notify, log, confirm } = useFeedback();

  const refresh = async () => {
    const [list, expenseList] = await Promise.all([api.listFeeReceipts({ taxYear }), api.listFeeExpenseSettings()]);
    setReceipts(list);
    const exp = expenseList.find(e => e.taxYear === taxYear) || null;
    setExpenseSettings(exp);
  };

  useEffect(() => { refresh().catch(e => setError(errMsg(e))); }, [taxYear]);

  // Recompute canonical values locally using settings in real-time.
  const preview: FeeReceiptComputed = useMemo(() => {
    const rate = Number(editing.withholdingRate) || Number(settings.honorariosRetentionRate) || 0;
    if (editing.amountInputType === 'NET') {
      const net = Math.max(0, Number(editing.netAmount) || 0);
      if (editing.withholdingMode === 'WITHHELD_BY_RECIPIENT' && rate > 0) {
        const gross = net / (1 - rate);
        return { grossAmount: gross, netAmount: net, withholdingRate: rate, withheldAmount: gross - net, ppmPaidAmount: 0 };
      }
      if (editing.withholdingMode === 'PPM_PAID_BY_ISSUER' && rate > 0) {
        const gross = net / (1 - rate);
        return { grossAmount: gross, netAmount: net, withholdingRate: rate, withheldAmount: 0, ppmPaidAmount: gross - net };
      }
      return { grossAmount: net, netAmount: net, withholdingRate: 0, withheldAmount: 0, ppmPaidAmount: 0 };
    }
    const gross = Math.max(0, Number(editing.grossAmount) || 0);
    if (editing.withholdingMode === 'WITHHELD_BY_RECIPIENT') return { grossAmount: gross, netAmount: gross - gross * rate, withholdingRate: rate, withheldAmount: gross * rate, ppmPaidAmount: 0 };
    if (editing.withholdingMode === 'PPM_PAID_BY_ISSUER') return { grossAmount: gross, netAmount: gross, withholdingRate: rate, withheldAmount: 0, ppmPaidAmount: gross * rate };
    return { grossAmount: gross, netAmount: gross, withholdingRate: 0, withheldAmount: 0, ppmPaidAmount: 0 };
  }, [editing.amountInputType, editing.netAmount, editing.grossAmount, editing.withholdingMode, editing.withholdingRate, settings.honorariosRetentionRate]);

  const summary: FeeSummary = useMemo(() => {
    let totalGrossIssued = 0, totalGrossPaid = 0;
    let totalWithheld = 0, totalPPM = 0, noWithholdingGross = 0, totalNet = 0;
    let activeCount = 0, pendingCount = 0, cancelledCount = 0;
    for (const r of receipts) {
      if (r.status === 'CANCELLED') { cancelledCount += 1; continue; }
      activeCount += 1;
      if (r.paymentStatus === 'PENDING') pendingCount += 1;
      totalGrossIssued += Number(r.grossAmount) || 0;
      if (r.paymentStatus === 'PAID') totalGrossPaid += Number(r.grossAmount) || 0;
      if (r.withholdingMode === 'NO_WITHHOLDING') noWithholdingGross += Number(r.grossAmount) || 0;
      totalWithheld += Number(r.withheldAmount) || 0;
      totalPPM += Number(r.ppmPaidAmount) || 0;
      totalNet += Number(r.netAmount) || 0;
    }
    return {
      recognitionMode: (settings.feeRecognitionMode as 'ISSUE_DATE' | 'PAID_ONLY') || 'ISSUE_DATE',
      utaValue: 0,
      totalGrossIssued, totalGrossPaid, totalWithheldByThirds: totalWithheld, totalPPMPaidByIssuer: totalPPM,
      totalNetReceived: totalNet, activeCount, pendingCount, cancelledCount,
      grossPaidByWithholdingMode: {
        WITHHELD_BY_RECIPIENT: receipts.filter(r => r.status === 'ACTIVE' && r.withholdingMode === 'WITHHELD_BY_RECIPIENT').reduce((s, r) => s + Number(r.grossAmount || 0), 0),
        PPM_PAID_BY_ISSUER: receipts.filter(r => r.status === 'ACTIVE' && r.withholdingMode === 'PPM_PAID_BY_ISSUER').reduce((s, r) => s + Number(r.grossAmount || 0), 0),
        NO_WITHHOLDING: noWithholdingGross
      },
      recognizedGrossForTax: 0, recognizedWithheldForTax: 0, recognizedPPMForTax: 0, recognizedNetForTax: 0
    };
  }, [receipts, settings.feeRecognitionMode]);

  const filtered = useMemo(() => {
    let list = receipts.slice();
    if (filters.clientName) list = list.filter(r => r.clientName.toLowerCase().includes(filters.clientName.toLowerCase()));
    if (filters.status) list = list.filter(r => r.status === filters.status);
    if (filters.paymentStatus) list = list.filter(r => r.paymentStatus === filters.paymentStatus);
    if (filters.withholdingMode) list = list.filter(r => r.withholdingMode === filters.withholdingMode);
    if (sortBy === 'date') list.sort((a, b) => a.issueDate.localeCompare(b.issueDate));
    else list.sort((a, b) => (Number(b.grossAmount) || 0) - (Number(a.grossAmount) || 0));
    return list;
  }, [receipts, filters, sortBy]);

  const save = async () => {
    setBusy(true); setError('');
    const started = performance.now();
    try {
      const payload: FeeReceipt = {
        ...editing,
        withholdingRate: preview.withholdingRate,
        grossAmount: round2(preview.grossAmount),
        netAmount: round2(preview.netAmount),
        withheldAmount: round2(preview.withheldAmount),
        ppmPaidAmount: round2(preview.ppmPaidAmount),
        folio: editing.folio || null as any,
        clientTaxId: editing.clientTaxId || null as any,
        description: editing.description || null as any,
        paymentDate: editing.paymentDate || null as any,
        notes: editing.notes || null as any,
        taxYear: Number(editing.taxYear)
      };
      if (editing.id) await api.updateFeeReceipt(payload);
      else await api.createFeeReceipt(payload);
      setEditing({ ...emptyReceipt, taxYear });
      setShowForm(false);
      await refresh();
      onSimulationStale();
      log({ kind: 'ASYNC', operation: LOG.SAVE_FEE_RECEIPT, status: 'OK', message: payload.clientName || payload.folio || '', auditMessage: JSON.stringify({ id: payload.id, folio: payload.folio, clientName: payload.clientName, gross: payload.grossAmount, net: payload.netAmount, taxYear: payload.taxYear }), durationMs: Math.round(performance.now() - started) });
      notify('Boleta guardada');
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      log({ kind: 'ASYNC', operation: LOG.SAVE_FEE_RECEIPT, status: 'ERROR', message: msg, auditMessage: `folio=${editing.folio} error: ${msg}`, durationMs: Math.round(performance.now() - started) });
      notify('No se pudo guardar la boleta', { tone: 'error', message: msg });
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    const ok = await confirm({ message: '¿Eliminar esta boleta definitivamente?', confirmLabel: 'Eliminar', cancelLabel: 'Cancelar', danger: true });
    if (!ok) return;
    const started = performance.now();
    try {
      await api.deleteFeeReceipt(id); await refresh(); onSimulationStale();
      log({ kind: 'ASYNC', operation: LOG.DELETE_FEE_RECEIPT, status: 'OK', message: id, auditMessage: `id=${id}`, durationMs: Math.round(performance.now() - started) });
      notify('Boleta eliminada');
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      log({ kind: 'ASYNC', operation: LOG.DELETE_FEE_RECEIPT, status: 'ERROR', message: msg, auditMessage: `id=${id} error: ${msg}`, durationMs: Math.round(performance.now() - started) });
      notify('No se pudo eliminar la boleta', { tone: 'error', message: msg });
    }
  };

  const duplicate = async (id: string) => {
    const started = performance.now();
    try {
      await api.duplicateFeeReceipt(id); await refresh(); onSimulationStale();
      log({ kind: 'ASYNC', operation: LOG.DUPLICATE_FEE_RECEIPT, status: 'OK', message: id, auditMessage: `sourceId=${id}`, durationMs: Math.round(performance.now() - started) });
      notify('Boleta duplicada');
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      log({ kind: 'ASYNC', operation: LOG.DUPLICATE_FEE_RECEIPT, status: 'ERROR', message: msg, durationMs: Math.round(performance.now() - started) });
      notify('No se pudo duplicar la boleta', { tone: 'error', message: msg });
    }
  };

  const toggleStatus = async (r: FeeReceipt) => {
    const newStatus = r.status === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE';
    const started = performance.now();
    try {
      await api.updateFeeReceipt({ ...r, status: newStatus });
      await refresh(); onSimulationStale();
      log({ kind: 'ASYNC', operation: LOG.TOGGLE_FEE_STATUS, status: 'OK', message: `${r.clientName || r.folio || r.id} → ${newStatus}`, auditMessage: `id=${r.id} ${r.status} → ${newStatus}`, durationMs: Math.round(performance.now() - started) });
      notify(newStatus === 'CANCELLED' ? 'Boleta anulada' : 'Boleta reactivada');
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      log({ kind: 'ASYNC', operation: LOG.TOGGLE_FEE_STATUS, status: 'ERROR', message: msg, durationMs: Math.round(performance.now() - started) });
      notify('No se pudo actualizar el estado', { tone: 'error', message: msg });
    }
  };

  const saveExpenseSettings = async (mode: 'PRESUMED' | 'ACTUAL', actualExpenses: number) => {
    const started = performance.now();
    try {
      await api.upsertFeeExpenseSettings({ taxYear, expenseMode: mode, actualAnnualExpenses: actualExpenses });
      onSettingsChange({ honorariosExpenseMethod: mode, honorariosActualAnnualExpenses: actualExpenses });
      onSimulationStale();
      log({ kind: 'ASYNC', operation: LOG.SAVE_FEE_EXPENSE_SETTINGS, status: 'OK', message: `${mode} ${money.format(actualExpenses)}`, auditMessage: `taxYear=${taxYear} mode=${mode} actualExpenses=${actualExpenses}`, durationMs: Math.round(performance.now() - started) });
      notify('Gastos del año guardados');
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      log({ kind: 'ASYNC', operation: LOG.SAVE_FEE_EXPENSE_SETTINGS, status: 'ERROR', message: msg, durationMs: Math.round(performance.now() - started) });
      notify('No se pudieron guardar los gastos', { tone: 'error', message: msg });
    }
  };

  // Detectamos desviaciones entre settings y configuración anual guardada (back-compat).
  useEffect(() => {
    if (!expenseSettings) return;
    if (expenseSettings.expenseMode !== settings.honorariosExpenseMethod || expenseSettings.actualAnnualExpenses !== Number(settings.honorariosActualAnnualExpenses || 0)) {
      onSettingsChange({ honorariosExpenseMethod: expenseSettings.expenseMode, honorariosActualAnnualExpenses: expenseSettings.actualAnnualExpenses });
    }
  }, [expenseSettings]);

  return (
    <div className="module">
      <nav className="sub-tabs">
        {([
          ['summary', 'Resumen anual'],
          ['gastos', 'Gastos del año'],
          ['boletas', 'Boletas registradas']
        ] as const).map(([key, label]) =>
          <button key={key} className={feeTab === key ? 'active' : ''} onClick={() => setFeeTab(key)}>{label}</button>)}
      </nav>

      {feeTab === 'summary' && <Card title="Resumen anual de boletas" hint="Montos calculados con los registros guardados del año comercial. La consolidación tributaria anual la realiza el motor en el Resumen general.">
        <div className="metrics">
          <Metric label="Bruto emitido (activas)" value={money.format(summary.totalGrossIssued)} hint="Suma del monto bruto de boletas activas, incluidas las pendientes de pago." />
          <Metric label="Bruto pagado" value={money.format(summary.totalGrossPaid)} hint="Suma del monto bruto de boletas activas y ya pagadas." />
          <Metric label="Retenciones por terceros" value={money.format(summary.totalWithheldByThirds)} hint="Suma de la retención del 15,25% aplicada por el receptor en boletas con retención." />
          <Metric label="PPM pagados" value={money.format(summary.totalPPMPaidByIssuer)} hint="Suma de los PPM pagados por el emisor en boletas con modalidad PPM." />
          <Metric label="Bruto sin retención" value={money.format(summary.grossPaidByWithholdingMode.NO_WITHHOLDING)} hint="Bruto de boletas activas emitidas sin retención." />
          <Metric label="Líquido recibido" value={money.format(summary.totalNetReceived)} hint="Suma del monto neto recibido (bruto − retención o PPM)." />
          <Metric label="Activas" value={String(summary.activeCount)} hint="Boletas con estado activo, sin importar si están pagadas." />
          <Metric label="Pendientes de pago" value={String(summary.pendingCount)} hint="Boletas activas aún no pagadas." />
          <Metric label="Anuladas" value={String(summary.cancelledCount)} hint="Boletas anuladas; no se consolidan tributariamente." />
        </div>
        <div className="notice">
          Reconocimiento tributario:&nbsp;
          <select value={String(settings.feeRecognitionMode || 'ISSUE_DATE')} onChange={e => onSettingsChange({ feeRecognitionMode: e.target.value as any })}>
            <option value="ISSUE_DATE">Por fecha de emisión (incluye pendientes)</option>
            <option value="PAID_ONLY">Solo boletas pagadas</option>
          </select>
          <small>El tratamiento definitivo debe contrastarse con los certificados del SII.</small>
        </div>
      </Card>}

      {feeTab === 'gastos' && <Card title="Gastos de honorarios del año comercial" hint="Presuntos: 30% del bruto de honorarios con tope de 15 UTA. Efectivos: monto acreditado ante el SII, que reemplaza el porcentaje presunto.">
        <div className="form-grid">
          <Field label="Modo de gastos">
            <select
              value={String(settings.honorariosExpenseMethod || 'PRESUMED')}
              onChange={e => saveExpenseSettings(e.target.value as any, Number(settings.honorariosActualAnnualExpenses) || 0)}
            >
              <option value="PRESUMED">Presuntos (30%, tope 15 UTA)</option>
              <option value="ACTUAL">Gastos efectivos</option>
            </select>
          </Field>
          {settings.honorariosExpenseMethod === 'ACTUAL' && (
            <Field label="Gastos efectivos anuales acreditorios">
              <input
                type="number"
                min={0}
                value={Number(settings.honorariosActualAnnualExpenses) || 0}
                onChange={e => saveExpenseSettings('ACTUAL', Math.max(0, Number(e.target.value) || 0))}
              />
            </Field>
          )}
        </div>
        {settings.honorariosExpenseMethod === 'ACTUAL' && (
          <p className="hint">⚠ Los gastos efectivos requieren respaldo documental y deben acreditarse ante el SII.</p>
        )}
      </Card>}

      {feeTab === 'boletas' && <Card title="Boletas de honorarios registradas" hint="La retención vigente para honorarios es del 15,25%. Las boletas se reconocen por fecha de emisión o solo pagadas según la configuración de reconocimiento tributario.">
        <div className="filter-bar">
          <input placeholder="Cliente…" value={filters.clientName} onChange={e => setFilters({ ...filters, clientName: e.target.value })} />
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Estado: todos</option>
            <option value="ACTIVE">Activas</option>
            <option value="CANCELLED">Anuladas</option>
          </select>
          <select value={filters.paymentStatus} onChange={e => setFilters({ ...filters, paymentStatus: e.target.value })}>
            <option value="">Pago: todos</option>
            <option value="PENDING">Pendientes</option>
            <option value="PAID">Pagadas</option>
          </select>
          <select value={filters.withholdingMode} onChange={e => setFilters({ ...filters, withholdingMode: e.target.value })}>
            <option value="">Retención: todas</option>
            <option value="WITHHELD_BY_RECIPIENT">Retención por receptor</option>
            <option value="PPM_PAID_BY_ISSUER">PPM pagado por emisor</option>
            <option value="NO_WITHHOLDING">Sin retención</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
            <option value="date">Ordenar por fecha</option>
            <option value="amount">Ordenar por monto</option>
          </select>
          <button className="primary" onClick={() => { setEditing({ ...emptyReceipt, taxYear }); setShowForm(true); }}>+ Nueva boleta</button>
          <button onClick={() => setShowForm(false)}>Ocultar formulario</button>
        </div>

        {showForm && (
          <div className="card form-card">
            <h3>{editing.id ? 'Editar boleta' : 'Nueva boleta'}</h3>
            <div className="form-grid">
              <Field label="Año comercial"><input type="number" min={2000} max={2100} value={editing.taxYear} onChange={e => setEditing({ ...editing, taxYear: Number(e.target.value) })} /></Field>
              <Field label="Fecha de emisión"><input type="date" value={editing.issueDate} onChange={e => setEditing({ ...editing, issueDate: e.target.value })} /></Field>
              <Field label="Folio"><input value={editing.folio || ''} onChange={e => setEditing({ ...editing, folio: e.target.value })} /></Field>
              <Field label="Nombre del cliente"><input value={editing.clientName} onChange={e => setEditing({ ...editing, clientName: e.target.value })} /></Field>
              <Field label="RUT del cliente (opcional)"><input value={editing.clientTaxId || ''} onChange={e => setEditing({ ...editing, clientTaxId: e.target.value })} /></Field>
              <Field label="Descripción del servicio (opcional)"><input value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} /></Field>
              <Field label="Monto ingresado como"><select value={editing.amountInputType} onChange={e => setEditing({ ...editing, amountInputType: e.target.value as any, grossAmount: 0, netAmount: 0 })}><option value="GROSS">Bruto</option><option value="NET">Líquido</option></select></Field>
              <Field label="Monto"><input type="number" value={editing.amountInputType === 'GROSS' ? (editing.grossAmount || '') : (editing.netAmount || '')} onChange={e => setEditing({ ...editing, [editing.amountInputType === 'GROSS' ? 'grossAmount' : 'netAmount']: Number(e.target.value) })} /></Field>
              <Field label="Tipo de retención"><select value={editing.withholdingMode} onChange={e => setEditing({ ...editing, withholdingMode: e.target.value as any })}><option value="WITHHELD_BY_RECIPIENT">Retenido por receptor</option><option value="PPM_PAID_BY_ISSUER">PPM pagado por emisor</option><option value="NO_WITHHOLDING">Sin retención</option></select></Field>
              <Field label="Tasa de retención"><input type="number" step="0.0001" value={editing.withholdingRate} onChange={e => setEditing({ ...editing, withholdingRate: Number(e.target.value) })} /><small>{pct(editing.withholdingRate)}</small></Field>
              <Field label="Retención / PPM calculado"><input disabled value={money2.format(editing.withholdingMode === 'PPM_PAID_BY_ISSUER' ? preview.ppmPaidAmount : preview.withheldAmount)} /></Field>
              <Field label="Monto líquido"><input disabled value={money2.format(preview.netAmount)} /></Field>
              <Field label="Estado de pago"><select value={editing.paymentStatus} onChange={e => setEditing({ ...editing, paymentStatus: e.target.value as any })}><option value="PENDING">Pendiente</option><option value="PAID">Pagada</option></select></Field>
              <Field label="Fecha de pago"><input type="date" value={editing.paymentDate || ''} onChange={e => setEditing({ ...editing, paymentDate: e.target.value })} /></Field>
              <Field label="Estado"><select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as any })}><option value="ACTIVE">Activa</option><option value="CANCELLED">Anulada</option></select></Field>
              <Field label="Renta afecta"><select value={editing.taxable ? 'yes' : 'no'} onChange={e => setEditing({ ...editing, taxable: e.target.value === 'yes' })}><option value="yes">Sí</option><option value="no">No</option></select></Field>
              <Field label="Notas" wide><textarea value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} /></Field>
            </div>
            <div className="summary-box">
              <strong>Resumen antes de guardar</strong>
              <Rows rows={[
                ['Monto bruto', round2(preview.grossAmount)],
                ['Retención o PPM', round2(editing.withholdingMode === 'PPM_PAID_BY_ISSUER' ? preview.ppmPaidAmount : preview.withheldAmount)],
                ['Monto líquido', round2(preview.netAmount)],
                ['Ingreso tributable estimado', round2(editing.taxable ? preview.grossAmount : 0)]
              ]} />
            </div>
            <div className="actions">
              <button className="primary" disabled={busy || !editing.clientName || (preview.grossAmount === 0 && preview.netAmount === 0)} onClick={save}>{editing.id ? 'Guardar cambios' : 'Crear boleta'}</button>
              <button onClick={() => { setShowForm(false); setEditing({ ...emptyReceipt, taxYear }); }}>Cancelar</button>
            </div>
          </div>
        )}

        {error && <div className="alert error">{error}<button onClick={() => setError('')}>×</button></div>}

        {filtered.length === 0 ? <Empty text="No hay boletas con los filtros actuales." /> :
          <div className="table-wrap"><table>
            <thead><tr><th>Fecha</th><th>Folio</th><th>Cliente</th><th>Descripción</th><th>Bruto</th><th>Tasa</th><th>Retención</th><th>Líquido</th><th>Pago</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className={r.status === 'CANCELLED' ? 'row-muted' : ''}>
                  <td>{r.issueDate}</td>
                  <td>{r.folio || '—'}</td>
                  <td>{r.clientName}{r.clientTaxId ? ` (${r.clientTaxId})` : ''}</td>
                  <td>{r.description || '—'}</td>
                  <td>{money.format(Number(r.grossAmount))}</td>
                  <td>{pct(Number(r.withholdingRate) || 0)}</td>
                  <td>{r.withholdingMode === 'PPM_PAID_BY_ISSUER' ? `${money.format(Number(r.ppmPaidAmount))} (PPM)` : money.format(Number(r.withheldAmount))}</td>
                  <td>{money.format(Number(r.netAmount))}</td>
                  <td>{r.paymentStatus === 'PAID' ? 'Pagada' : (r.paymentDate || 'Pendiente')}</td>
                  <td>{r.status === 'ACTIVE' ? 'Activa' : 'Anulada'}{r.taxable === false ? ' · no afecta' : ''}</td>
                  <td>
                    <button onClick={() => { setEditing(r); setShowForm(true); }}>Editar</button>
                    <button onClick={() => duplicate(r.id!)}>Duplicar</button>
                    <button onClick={() => toggleStatus(r)}>{r.status === 'ACTIVE' ? 'Anular' : 'Restaurar'}</button>
                    <button className="danger-text" onClick={() => remove(r.id!)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>}
      </Card>}

      <div className="warnings">
        <p>⚠ La simulación consolidada usa el motor tributario anual del proyecto; el resumen de boletas aquí presente solo considera los registros guardados. La retención de honorarios del SII para 2026 es del 15,25%.</p>
      </div>
    </div>
  );
}

// Shared small components to stay consistent with App.tsx
function Card({ title, children, hint }: { title: string; children: any; hint?: string }) { return <section className="card"><h2>{title}</h2>{children}{hint && <p className="card-hint">{hint}</p>}</section>; }
function Field({ label, children, wide }: { label: string; children: any; wide?: boolean }) { return <label className={wide ? 'wide' : ''}><span>{label}</span>{children}</label>; }
function Rows({ rows }: { rows: [string, number][] }) { return <div className="rows">{rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{money.format(value)}</strong></div>)}</div>; }
function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) { return <article className="metric"><small>{label}</small><strong>{value}</strong>{hint && <span className="metric-hint">{hint}</span>}</article>; }
function Empty({ text }: { text: string }) { return <div className="empty">{text}</div>; }
function round2(value: number) { return Math.round((Number(value) || 0) * 100) / 100; }
function errMsg(e: any) { return e instanceof ApiRequestError ? `[${e.code}] ${e.message}` : e instanceof Error ? e.message : 'Error inesperado'; }
