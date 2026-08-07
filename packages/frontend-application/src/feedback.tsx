import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { ExecutionLogRequest } from '@personal-tax-ledger/api-contracts';
import type { FrontendClient } from './client.js';

export type Toast = { id: number; tone: 'success' | 'error'; title: string; message?: string };
export type ConfirmOptions = { title?: string; message: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean };

export type FeedbackCtx = {
  busy: boolean;
  busyMessage: string;
  beginSync: (message: string) => void;
  endSync: () => void;
  notify: (title: string, opts?: { tone?: 'success' | 'error'; message?: string }) => void;
  log: (entry: Omit<ExecutionLogRequest, 'durationMs'> & { durationMs?: number }) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
};

const Ctx = createContext<FeedbackCtx | null>(null);

let toastId = 0;

export function FeedbackProvider({ children, client }: { children: ReactNode; client?: FrontendClient }) {
  const [busy, setBusy] = useState(false);
  const [busyMessage, setBusyMessage] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingConfirm, setPendingConfirm] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);

  const dismiss = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);

  const notify = useCallback((title: string, opts: { tone?: 'success' | 'error'; message?: string } = {}) => {
    const id = ++toastId;
    setToasts(t => [...t, { id, tone: opts.tone || 'success', title, message: opts.message }]);
    window.setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);

  const beginSync = useCallback((message: string) => { setBusyMessage(message); setBusy(true); }, []);
  const endSync = useCallback(() => setBusy(false), []);

  const log = useCallback((entry: Omit<ExecutionLogRequest, 'durationMs'> & { durationMs?: number }) => {
    if (!client) return;
    client.createExecutionLog({
      kind: entry.kind,
      operation: entry.operation,
      status: entry.status,
      message: entry.message || null,
      auditMessage: entry.auditMessage || null,
      durationMs: entry.durationMs || 0
    }).catch(() => {});
  }, [client]);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>(resolve => setPendingConfirm({ opts, resolve }));
  }, []);

  const answerConfirm = useCallback((value: boolean) => {
    setPendingConfirm(pc => {
      if (pc) pc.resolve(value);
      return null;
    });
  }, []);

  return <Ctx.Provider value={{ busy, busyMessage, beginSync, endSync, notify, log, confirm }}>
    {children}
    {busy && <LoadingModal message={busyMessage} />}
    {pendingConfirm && <ConfirmDialog opts={pendingConfirm.opts} onAnswer={answerConfirm} />}
    <Toaster toasts={toasts} onDismiss={dismiss} />
  </Ctx.Provider>;
}

export function useFeedback(): FeedbackCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useFeedback debe usarse dentro de FeedbackProvider');
  return ctx;
}

export function LoadingModal({ message }: { message: string }) {
  return <div className="loading-modal" role="dialog" aria-busy="true">
    <div className="loading-modal-box">
      <div className="loader" />
      <p>{message}</p>
    </div>
  </div>;
}

function Toaster({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return <div className="toast-stack">
    {toasts.map(t => <div key={t.id} className={`toast ${t.tone}`} role="status">
      <div className="toast-body"><strong>{t.title}</strong>{t.message && <span>{t.message}</span>}</div>
      <button onClick={() => onDismiss(t.id)}>×</button>
    </div>)}
  </div>;
}

function ConfirmDialog({ opts, onAnswer }: { opts: ConfirmOptions; onAnswer: (v: boolean) => void }) {
  return <div className="confirm-modal" role="dialog" aria-modal="true">
    <div className="confirm-modal-box">
      <h3>{opts.title || 'Confirmar acción'}</h3>
      <p>{opts.message}</p>
      <div className="confirm-actions">
        <button onClick={() => onAnswer(false)}>{opts.cancelLabel || 'Cancelar'}</button>
        <button className={opts.danger ? 'danger' : 'primary'} onClick={() => onAnswer(true)}>{opts.confirmLabel || 'Confirmar'}</button>
      </div>
    </div>
  </div>;
}

export const LOG = {
  LOAD_INITIAL: 'LOAD_INITIAL',
  CHANGE_YEAR: 'CHANGE_YEAR',
  SAVE_INCOME: 'SAVE_INCOME',
  DELETE_INCOME: 'DELETE_INCOME',
  COPY_INCOMES: 'COPY_INCOMES',
  SAVE_SETTINGS: 'SAVE_SETTINGS',
  SAVE_FEE_RECEIPT: 'SAVE_FEE_RECEIPT',
  DELETE_FEE_RECEIPT: 'DELETE_FEE_RECEIPT',
  DUPLICATE_FEE_RECEIPT: 'DUPLICATE_FEE_RECEIPT',
  TOGGLE_FEE_STATUS: 'TOGGLE_FEE_STATUS',
  SAVE_FEE_EXPENSE_SETTINGS: 'SAVE_FEE_EXPENSE_SETTINGS',
  SAVE_MORTGAGE: 'SAVE_MORTGAGE',
  DELETE_MORTGAGE: 'DELETE_MORTGAGE',
  SAVE_ANNUAL_RECORD: 'SAVE_ANNUAL_RECORD',
  COMPARE_APV: 'COMPARE_APV',
  SIMULATE: 'SIMULATE'
} as const;
