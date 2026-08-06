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
