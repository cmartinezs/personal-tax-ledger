import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useState } from 'react';
const Ctx = createContext(null);
let toastId = 0;
export function FeedbackProvider({ children, client }) {
    const [busy, setBusy] = useState(false);
    const [busyMessage, setBusyMessage] = useState('');
    const [toasts, setToasts] = useState([]);
    const [pendingConfirm, setPendingConfirm] = useState(null);
    const dismiss = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);
    const notify = useCallback((title, opts = {}) => {
        const id = ++toastId;
        setToasts(t => [...t, { id, tone: opts.tone || 'success', title, message: opts.message }]);
        window.setTimeout(() => dismiss(id), 5000);
    }, [dismiss]);
    const beginSync = useCallback((message) => { setBusyMessage(message); setBusy(true); }, []);
    const endSync = useCallback(() => setBusy(false), []);
    const log = useCallback((entry) => {
        if (!client)
            return;
        client.createExecutionLog({
            kind: entry.kind,
            operation: entry.operation,
            status: entry.status,
            message: entry.message || null,
            auditMessage: entry.auditMessage || null,
            durationMs: entry.durationMs || 0
        }).catch(() => { });
    }, [client]);
    const confirm = useCallback((opts) => {
        return new Promise(resolve => setPendingConfirm({ opts, resolve }));
    }, []);
    const answerConfirm = useCallback((value) => {
        setPendingConfirm(pc => {
            if (pc)
                pc.resolve(value);
            return null;
        });
    }, []);
    return _jsxs(Ctx.Provider, { value: { busy, busyMessage, beginSync, endSync, notify, log, confirm }, children: [children, busy && _jsx(LoadingModal, { message: busyMessage }), pendingConfirm && _jsx(ConfirmDialog, { opts: pendingConfirm.opts, onAnswer: answerConfirm }), _jsx(Toaster, { toasts: toasts, onDismiss: dismiss })] });
}
export function useFeedback() {
    const ctx = useContext(Ctx);
    if (!ctx)
        throw new Error('useFeedback debe usarse dentro de FeedbackProvider');
    return ctx;
}
export function LoadingModal({ message }) {
    return _jsx("div", { className: "loading-modal", role: "dialog", "aria-busy": "true", children: _jsxs("div", { className: "loading-modal-box", children: [_jsx("div", { className: "loader" }), _jsx("p", { children: message })] }) });
}
function Toaster({ toasts, onDismiss }) {
    return _jsx("div", { className: "toast-stack", children: toasts.map(t => _jsxs("div", { className: `toast ${t.tone}`, role: "status", children: [_jsxs("div", { className: "toast-body", children: [_jsx("strong", { children: t.title }), t.message && _jsx("span", { children: t.message })] }), _jsx("button", { onClick: () => onDismiss(t.id), children: "\u00D7" })] }, t.id)) });
}
function ConfirmDialog({ opts, onAnswer }) {
    return _jsx("div", { className: "confirm-modal", role: "dialog", "aria-modal": "true", children: _jsxs("div", { className: "confirm-modal-box", children: [_jsx("h3", { children: opts.title || 'Confirmar acción' }), _jsx("p", { children: opts.message }), _jsxs("div", { className: "confirm-actions", children: [_jsx("button", { onClick: () => onAnswer(false), children: opts.cancelLabel || 'Cancelar' }), _jsx("button", { className: opts.danger ? 'danger' : 'primary', onClick: () => onAnswer(true), children: opts.confirmLabel || 'Confirmar' })] })] }) });
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
};
