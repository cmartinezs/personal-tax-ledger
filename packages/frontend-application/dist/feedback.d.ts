import { type ReactNode } from 'react';
import type { ExecutionLogRequest } from '@personal-tax-ledger/api-contracts';
import type { FrontendClient } from './client.js';
export type Toast = {
    id: number;
    tone: 'success' | 'error';
    title: string;
    message?: string;
};
export type ConfirmOptions = {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
};
export type FeedbackCtx = {
    busy: boolean;
    busyMessage: string;
    beginSync: (message: string) => void;
    endSync: () => void;
    notify: (title: string, opts?: {
        tone?: 'success' | 'error';
        message?: string;
    }) => void;
    log: (entry: Omit<ExecutionLogRequest, 'durationMs'> & {
        durationMs?: number;
    }) => void;
    confirm: (opts: ConfirmOptions) => Promise<boolean>;
};
export declare function FeedbackProvider({ children, client }: {
    children: ReactNode;
    client?: FrontendClient;
}): import("react").JSX.Element;
export declare function useFeedback(): FeedbackCtx;
export declare function LoadingModal({ message }: {
    message: string;
}): import("react").JSX.Element;
export declare const LOG: {
    readonly LOAD_INITIAL: 'LOAD_INITIAL';
    readonly CHANGE_YEAR: 'CHANGE_YEAR';
    readonly SAVE_INCOME: 'SAVE_INCOME';
    readonly DELETE_INCOME: 'DELETE_INCOME';
    readonly COPY_INCOMES: 'COPY_INCOMES';
    readonly SAVE_SETTINGS: 'SAVE_SETTINGS';
    readonly SAVE_FEE_RECEIPT: 'SAVE_FEE_RECEIPT';
    readonly DELETE_FEE_RECEIPT: 'DELETE_FEE_RECEIPT';
    readonly DUPLICATE_FEE_RECEIPT: 'DUPLICATE_FEE_RECEIPT';
    readonly TOGGLE_FEE_STATUS: 'TOGGLE_FEE_STATUS';
    readonly SAVE_FEE_EXPENSE_SETTINGS: 'SAVE_FEE_EXPENSE_SETTINGS';
    readonly SAVE_MORTGAGE: 'SAVE_MORTGAGE';
    readonly DELETE_MORTGAGE: 'DELETE_MORTGAGE';
    readonly SAVE_ANNUAL_RECORD: 'SAVE_ANNUAL_RECORD';
    readonly COMPARE_APV: 'COMPARE_APV';
    readonly SIMULATE: 'SIMULATE';
};
