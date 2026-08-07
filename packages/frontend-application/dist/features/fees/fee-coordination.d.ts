export type WithholdingMode = 'WITHHELD_BY_RECIPIENT' | 'PPM_PAID_BY_ISSUER' | 'NO_WITHHOLDING';
export type FeeSettingsLike = {
    honorariosRetentionRate?: number;
    feeRecognitionMode?: string;
};
export type FeeReceiptComputed = {
    grossAmount: number;
    netAmount: number;
    withholdingRate: number;
    withheldAmount: number;
    ppmPaidAmount: number;
};
export type FeeSummary = {
    recognitionMode: 'ISSUE_DATE' | 'PAID_ONLY';
    utaValue: number;
    totalGrossIssued: number;
    totalGrossPaid: number;
    grossPaidByWithholdingMode: Record<WithholdingMode, number>;
    totalWithheldByThirds: number;
    totalPPMPaidByIssuer: number;
    totalNetReceived: number;
    activeCount: number;
    pendingCount: number;
    cancelledCount: number;
    recognizedGrossForTax: number;
    recognizedWithheldForTax: number;
    recognizedPPMForTax: number;
    recognizedNetForTax: number;
};
export type FeeReceiptPreviewInput = {
    amountInputType?: string;
    grossAmount?: number;
    netAmount?: number;
    withholdingMode?: string;
    withholdingRate?: number;
};
export declare function computeFeeReceiptPreview(receipt: FeeReceiptPreviewInput, settings: FeeSettingsLike): FeeReceiptComputed;
export type FeeSummaryReceipt = {
    status?: string;
    paymentStatus?: string;
    grossAmount?: number;
    withholdingMode?: string;
    withheldAmount?: number;
    ppmPaidAmount?: number;
    netAmount?: number;
};
export declare function computeFeeSummary<T extends FeeSummaryReceipt>(receipts: T[], settings: FeeSettingsLike): FeeSummary;
export type FeeReceiptFilters = {
    clientName?: string;
    status?: string;
    paymentStatus?: string;
    withholdingMode?: string;
};
export type FeeReceiptSortBy = 'date' | 'amount';
export declare function filterFeeReceipts<T extends {
    clientName?: string;
    status?: string;
    paymentStatus?: string;
    withholdingMode?: string;
    issueDate?: string;
    grossAmount?: number;
}>(receipts: T[], filters: FeeReceiptFilters, sortBy: FeeReceiptSortBy): T[];
