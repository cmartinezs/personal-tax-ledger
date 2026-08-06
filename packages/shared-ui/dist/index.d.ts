export type IncomesSectionSource = {
    id?: number;
    kind: string;
    name: string;
    amount: number;
    frequency: 'MONTHLY' | 'ANNUAL' | 'ONE_TIME';
    months: number;
};
export type IncomesSectionProps<T extends IncomesSectionSource = IncomesSectionSource> = {
    sources: T[];
    taxYear: number;
    prevYears: number[];
    busy: boolean;
    formatAmount: (value: number) => string;
    formatFrequencyLabel: (frequency: string) => string;
    sourceAnnual: (source: T) => number;
    sourceHint: (source: T) => string;
    onEdit: (source: T) => void;
    onRemove: (id?: number) => void;
    onCopyFromPrevious: () => void;
};
export declare function IncomesSection<T extends IncomesSectionSource>({ sources, taxYear, prevYears, busy, formatAmount, formatFrequencyLabel, sourceAnnual, sourceHint, onEdit, onRemove, onCopyFromPrevious }: IncomesSectionProps<T>): import("react").JSX.Element;
export type SummaryMetric = {
    key: string;
    label: string;
    value: string;
    hint?: string;
    tone?: string;
};
export declare function SummaryMetrics({ metrics, onExplain }: {
    metrics: SummaryMetric[];
    onExplain?: (key: string) => void;
}): import("react").JSX.Element;
export declare function Panel({ title, children, tone }: {
    title: string;
    children: React.ReactNode;
    tone?: 'default' | 'info' | 'warning';
}): import("react").JSX.Element;
export declare function EmptyState({ title, actionLabel, onAction }: {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
}): import("react").JSX.Element;
export declare function StatusBadge({ label, tone }: {
    label: string;
    tone?: 'neutral' | 'positive' | 'warning' | 'danger';
}): import("react").JSX.Element;
export type FeeReceiptRow = {
    id: string;
    clientName: string;
    issueDate: string;
    grossAmount: number;
    status: string;
    paymentStatus: string;
};
export declare function FeeReceiptsTable({ rows, formatAmount, onSelect }: {
    rows: FeeReceiptRow[];
    formatAmount: (value: number) => string;
    onSelect?: (id: string) => void;
}): import("react").JSX.Element;
export type MortgageRow = {
    id: string;
    propertyAlias: string;
    institutionName: string;
    annualInterestPaid: number;
};
export declare function MortgageSummary({ loans, formatAmount }: {
    loans: MortgageRow[];
    formatAmount: (value: number) => string;
}): import("react").JSX.Element;
export declare function ScenarioTable({ scenarios, formatAmount }: {
    scenarios: Array<{
        key: string;
        label: string;
        balance: number;
    }>;
    formatAmount: (value: number) => string;
}): import("react").JSX.Element;
export declare function SettingsForm({ fields, onChange, onSave }: {
    fields: Array<{
        key: string;
        label: string;
        value: string | number;
    }>;
    onChange: (key: string, value: string) => void;
    onSave: () => void;
}): import("react").JSX.Element;
