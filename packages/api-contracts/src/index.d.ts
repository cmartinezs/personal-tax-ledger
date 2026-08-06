export type ApiError = { code: string; message: string; fieldErrors?: Record<string, string> };
export type IncomeSourceRequest = { name: string; kind: 'SALARY' | 'HONORARIA' | 'BONUS' | 'OTHER'; amount: number; inputMode: 'GROSS' | 'NET'; frequency: 'MONTHLY' | 'ANNUAL' | 'ONE_TIME'; months: number; taxYear: number };
export type IncomeSourceResponse = IncomeSourceRequest & { id: number; active: boolean; taxable: boolean };
export function isApiError(value: unknown): value is ApiError;
export function incomeSourceRequest(value: Partial<IncomeSourceRequest>): IncomeSourceRequest;
export function incomeSourceResponse(value: unknown): IncomeSourceResponse;
