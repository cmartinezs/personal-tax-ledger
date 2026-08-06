import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { ExecutionLogPage } from './types';

const PAGE_SIZES = [10, 20, 50, 100];
const dateFmt = new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'medium' });

export default function LogsModule() {
  const [data, setData] = useState<ExecutionLogPage | null>(null);
  const [kind, setKind] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [msgView, setMsgView] = useState<'user' | 'audit'>('user');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setBusy(true); setError('');
    try {
      const res = await api.listExecutionLogs({ kind: kind || undefined, status: status || undefined, q: q || undefined, page, pageSize });
      setData(res);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error inesperado'); } finally { setBusy(false); }
  }, [kind, status, q, page, pageSize]);

  useEffect(() => { load(); }, [load]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="module">
      <div className="logs-filters">
        <div className="logs-msg-toggle">
          <button className={msgView === 'user' ? 'active' : ''} onClick={() => setMsgView('user')}>Usuario</button>
          <button className={msgView === 'audit' ? 'active' : ''} onClick={() => setMsgView('audit')}>Auditoría</button>
        </div>
        <select value={kind} onChange={e => { setKind(e.target.value); setPage(1); }}>
          <option value="">Tipo: todos</option><option value="SYNC">Sincrono</option><option value="ASYNC">Asincrono</option>
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Estado: todos</option><option value="OK">OK</option><option value="ERROR">Error</option>
        </select>
        <input placeholder="Buscar por operación o mensaje…" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
        <button onClick={() => load()} disabled={busy}>Recargar</button>
      </div>
      {error && <div className="alert error">{error}<button onClick={() => setError('')}>×</button></div>}
      <div className="table-wrap logs-wrap"><table className="logs-table">
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Operación</th><th>Estado</th><th>Duración</th><th>{msgView === 'user' ? 'Mensaje para el usuario' : 'Detalle de auditoría'}</th></tr></thead>
        <tbody>
          {(data?.items || []).map(r => (
            <tr key={r.id}>
              <td>{dateFmt.format(new Date(`${r.createdAt}Z`))}</td>
              <td><span className={`log-kind ${r.kind.toLowerCase()}`}>{r.kind === 'SYNC' ? 'Sincrono' : 'Asincrono'}</span></td>
              <td><code>{r.operation}</code></td>
              <td><span className={`log-status ${r.status.toLowerCase()}`}>{r.status}</span></td>
              <td>{r.durationMs} ms</td>
              <td className="logs-msg">{msgView === 'user' ? (r.message || '') : (r.auditMessage || '')}</td>
            </tr>
          ))}
          {data && data.items.length === 0 && <tr><td colSpan={6} className="logs-empty">Sin registros para los filtros aplicados.</td></tr>}
        </tbody>
      </table></div>
      <div className="logs-pager">
        <span>Página {data?.page || 1} de {totalPages} · {data?.total || 0} registros</span>
        <div className="logs-pager-actions">
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s} por página</option>)}
          </select>
          <button disabled={busy || page <= 1} onClick={() => setPage(p => p - 1)}>‹ Anterior</button>
          <button disabled={busy || page >= totalPages} onClick={() => setPage(p => p + 1)}>Siguiente ›</button>
        </div>
      </div>
    </div>
  );
}
