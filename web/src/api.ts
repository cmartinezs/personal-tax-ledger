import type { IncomeSource, Settings, Reference, FeeReceipt, FeeExpenseSettings, MortgageLoan, MortgageAnnualRecord, TaxParameter, TaxRuleSource, Simulation, ExecutionLog, ExecutionLogPage } from './types';
import { apiErrorResponse, bootstrapResponse, executionLogFilters, executionLogPageResponse, executionLogRequest, feeExpenseSettingsRequest, feeReceiptFilters, feeReceiptRequest, incomeSourceRequest, mortgageAnnualRecordFilters, mortgageAnnualRecordRequest, mortgageLoanFilters, mortgageLoanRequest, scenariosResponse, settingsRequest, snapshotRequest, snapshotResponse, taxParametersFilters, taxParametersRequest, taxRuleSourceFilters, taxRuleSourceRequest, yearsResponse } from '@personal-tax-ledger/api-contracts';
import { createIncomeService } from './income-service';

type FeeReceiptComputed = Pick<FeeReceipt, 'grossAmount' | 'netAmount' | 'withheldAmount' | 'ppmPaidAmount' | 'withholdingRate'>;

export type ApiError = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
};

export class ApiRequestError extends Error {
  code: string;
  fieldErrors?: Record<string, string>;
  constructor(body: ApiError) {
    super(body.message);
    this.code = body.code;
    this.fieldErrors = body.fieldErrors;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { headers: { 'content-type': 'application/json', ...(options?.headers || {}) }, ...options });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ code: 'unexpected', message: response.statusText }));
    throw new ApiRequestError(apiErrorResponse(body as ApiError));
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

function qs(params: Record<string, string | number | undefined | null>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === '') continue;
    u.set(k, String(v));
  }
  const s = u.toString();
  return s ? `?${s}` : '';
}

export const api = {
  bootstrap: async () => bootstrapResponse(await request<{ settings: Settings; sources: IncomeSource[]; references: Reference[] }>('/api/bootstrap')) as unknown as { settings: Settings; sources: IncomeSource[]; references: Reference[] },
  listYears: async () => yearsResponse(await request<unknown>('/api/years')),
  listIncomes: (taxYear?: number) => request<IncomeSource[]>(`/api/incomes${qs({ taxYear })}`),
  createIncome: (source: IncomeSource) => request<IncomeSource>('/api/incomes', { method: 'POST', body: JSON.stringify(incomeSourceRequest(source)) }),
  updateIncome: (source: IncomeSource) => request<IncomeSource>(`/api/incomes/${source.id}`, { method: 'PUT', body: JSON.stringify(incomeSourceRequest(source)) }),
  deleteIncome: (id: number) => request<void>(`/api/incomes/${id}`, { method: 'DELETE' }),
  copyIncomes: (fromTaxYear: number, toTaxYear: number) => request<IncomeSource[]>('/api/incomes/copy', { method: 'POST', body: JSON.stringify({ fromTaxYear, toTaxYear }) }),
  updateSettings: (settings: Settings) => request<Settings>('/api/settings', { method: 'PUT', body: JSON.stringify(settingsRequest(settings)) }),

  // Fee receipts
  listFeeReceipts: (filters: { taxYear?: number | string; clientName?: string; status?: string; paymentStatus?: string; withholdingMode?: string } = {}) =>
    request<FeeReceipt[]>(`/api/fee-receipts${qs(feeReceiptFilters(filters))}`),
  createFeeReceipt: (receipt: FeeReceipt) => request<FeeReceipt>('/api/fee-receipts', { method: 'POST', body: JSON.stringify(feeReceiptRequest(receipt)) }),
  updateFeeReceipt: (receipt: FeeReceipt) => request<FeeReceipt>(`/api/fee-receipts/${receipt.id}`, { method: 'PUT', body: JSON.stringify(feeReceiptRequest(receipt)) }),
  deleteFeeReceipt: (id: string) => request<void>(`/api/fee-receipts/${id}`, { method: 'DELETE' }),
  duplicateFeeReceipt: (id: string) => request<FeeReceipt>(`/api/fee-receipts/${id}/duplicate`, { method: 'POST' }),
  computeFeeReceipt: (receipt: Partial<FeeReceipt>, settings?: Partial<Settings>) => request<FeeReceiptComputed>('/api/fee-receipt-calc', { method: 'POST', body: JSON.stringify({ receipt, settings }) }),

  // Fee expense settings
  listFeeExpenseSettings: () => request<FeeExpenseSettings[]>('/api/fee-expense-settings'),
   upsertFeeExpenseSettings: (settings: FeeExpenseSettings) => request<FeeExpenseSettings>('/api/fee-expense-settings', { method: 'PUT', body: JSON.stringify(feeExpenseSettingsRequest(settings)) }),
  getFeeExpenseSettings: (taxYear: number) => request<FeeExpenseSettings>(`/api/fee-expense-settings/${taxYear}`),

  // Mortgages
  listMortgages: (filters: { taxYear?: number | string; institutionName?: string; propertyAlias?: string } = {}) =>
    request<MortgageLoan[]>(`/api/mortgages${qs(mortgageLoanFilters(filters))}`),
  createMortgage: (loan: MortgageLoan) => request<MortgageLoan>('/api/mortgages', { method: 'POST', body: JSON.stringify(mortgageLoanRequest(loan)) }),
  updateMortgage: (loan: MortgageLoan) => request<MortgageLoan>(`/api/mortgages/${loan.id}`, { method: 'PUT', body: JSON.stringify(mortgageLoanRequest(loan)) }),
  deleteMortgage: (id: string) => request<void>(`/api/mortgages/${id}`, { method: 'DELETE' }),

  // Annual records
  listAnnualRecords: (loanId: string, filters: { taxYear?: number | string } = {}) =>
    request<MortgageAnnualRecord[]>(`/api/mortgages/${loanId}/annual-records${qs(mortgageAnnualRecordFilters(filters))}`),
  createAnnualRecord: (loanId: string, record: MortgageAnnualRecord) =>
    request<MortgageAnnualRecord>(`/api/mortgages/${loanId}/annual-records`, { method: 'POST', body: JSON.stringify(mortgageAnnualRecordRequest(record)) }),
  updateAnnualRecord: (record: MortgageAnnualRecord) =>
    request<MortgageAnnualRecord>(`/api/mortgage-annual-records/${record.id}`, { method: 'PUT', body: JSON.stringify(mortgageAnnualRecordRequest(record)) }),
  deleteAnnualRecord: (id: string) => request<void>(`/api/mortgage-annual-records/${id}`, { method: 'DELETE' }),

  // Tax parameters
  listTaxParameters: (taxYear: number) => request<TaxParameter[]>(`/api/tax-parameters${qs(taxParametersFilters({ taxYear }))}`),
  updateTaxParameters: (taxYear: number, values: Record<string, number | string>) =>
    request<Record<string, TaxParameter>>('/api/tax-parameters', { method: 'PUT', body: JSON.stringify(taxParametersRequest({ taxYear, values })) }),

  // Tax rule sources
  listTaxRuleSources: (filters: { ruleKey?: string; taxYear?: number } = {}) =>
    request<TaxRuleSource[]>(`/api/tax-rule-sources${qs(taxRuleSourceFilters(filters))}`),
  createTaxRuleSource: (s: TaxRuleSource) => request<TaxRuleSource>('/api/tax-rule-sources', { method: 'POST', body: JSON.stringify(taxRuleSourceRequest(s)) }),
  deleteTaxRuleSource: (id: string) => request<void>(`/api/tax-rule-sources/${id}`, { method: 'DELETE' }),

  // Execution log (bitácora)
  listExecutionLogs: (filters: { kind?: string; status?: string; operation?: string; q?: string; page?: number; pageSize?: number } = {}) =>
    request<ExecutionLogPage>(`/api/logs${qs(executionLogFilters(filters))}`).then(value => executionLogPageResponse(value as unknown as Partial<import('@personal-tax-ledger/api-contracts').ExecutionLogPageResponse>) as unknown as ExecutionLogPage),
  createExecutionLog: (entry: { kind: 'SYNC' | 'ASYNC'; operation: string; status: 'OK' | 'ERROR'; message?: string | null; auditMessage?: string | null; durationMs?: number }) =>
    request<ExecutionLog>('/api/logs', { method: 'POST', body: JSON.stringify(executionLogRequest(entry)) }),

  // Simulation
  simulate: (payload: { sources?: IncomeSource[]; settings?: Partial<Settings>; extraApv?: { annualAmount: number; regime: 'A' | 'B' | 'NONE' }; feeReceipts?: FeeReceipt[]; mortgages?: MortgageLoan[]; annualRecords?: MortgageAnnualRecord[] }) =>
    request<Simulation>('/api/simulate', { method: 'POST', body: JSON.stringify(payload) }),
  compareApv: (annualContribution: number, sources?: IncomeSource[], settings?: Partial<Settings>, modules?: { feeReceipts?: FeeReceipt[]; mortgages?: MortgageLoan[]; annualRecords?: MortgageAnnualRecord[] }) =>
    request<any>('/api/compare-apv', { method: 'POST', body: JSON.stringify({ annualContribution, sources, settings, ...modules }) }),
  buildScenarios: (payload: { sources?: IncomeSource[]; settings?: Partial<Settings>; feeReceipts?: FeeReceipt[]; mortgages?: MortgageLoan[]; annualRecords?: MortgageAnnualRecord[] }) =>
    request<unknown[]>('/api/scenarios', { method: 'POST', body: JSON.stringify(payload) }).then(value => scenariosResponse(value) as any),
  saveSnapshot: (name: string, payload: Record<string, unknown>) => request<{ id: number; result: unknown }>('/api/snapshots', { method: 'POST', body: JSON.stringify(snapshotRequest({ name, payload })) }).then(snapshotResponse),
  article55Bis: (payload: { mortgages: MortgageLoan[]; annualRecords: MortgageAnnualRecord[]; incomeEstimate: number; settings?: Partial<Settings> }) =>
    request<any>('/api/article-55-bis', { method: 'POST', body: JSON.stringify(payload) })
};

export const incomeService = createIncomeService({
  list: taxYear => api.listIncomes(taxYear),
  create: source => api.createIncome(source),
  update: source => api.updateIncome(source),
  remove: id => api.deleteIncome(id)
});
