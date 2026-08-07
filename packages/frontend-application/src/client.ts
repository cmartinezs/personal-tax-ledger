import type {
  BootstrapResponse,
  ExecutionLogFilters,
  ExecutionLogRequest,
  ExecutionLogPageResponse,
  ExecutionLogResponse,
  FeeExpenseSettingsRequest,
  FeeExpenseSettingsResponse,
  FeeReceiptFilters,
  FeeReceiptRequest,
  FeeReceiptResponse,
  IncomeSourceRequest,
  IncomeSourceResponse,
  MortgageAnnualRecordFilters,
  MortgageAnnualRecordRequest,
  MortgageAnnualRecordResponse,
  MortgageLoanFilters,
  MortgageLoanRequest,
  MortgageLoanResponse,
  ScenarioResponse,
  SettingsRequest,
  SettingsResponse,
  TaxParameterResponse,
  TaxParametersFilters,
  TaxParametersRequest,
  TaxRuleSourceFilters,
  TaxRuleSourceRequest,
  TaxRuleSourceResponse
} from '@personal-tax-ledger/api-contracts';

export type FrontendClient = {
  bootstrap: () => Promise<BootstrapResponse<IncomeSourceResponse>>;
  listYears: () => Promise<number[]>;
  listIncomes: (taxYear?: number) => Promise<IncomeSourceResponse[]>;
  createIncome: (source: IncomeSourceRequest) => Promise<IncomeSourceResponse>;
  updateIncome: (source: IncomeSourceRequest & { id: number }) => Promise<IncomeSourceResponse>;
  deleteIncome: (id: number) => Promise<void>;
  copyIncomes: (fromTaxYear: number, toTaxYear: number) => Promise<IncomeSourceResponse[]>;
  updateSettings: (settings: SettingsRequest) => Promise<SettingsResponse>;

  listFeeReceipts: (filters?: FeeReceiptFilters) => Promise<FeeReceiptResponse[]>;
  createFeeReceipt: (receipt: FeeReceiptRequest) => Promise<FeeReceiptResponse>;
  updateFeeReceipt: (receipt: FeeReceiptRequest & { id?: string }) => Promise<FeeReceiptResponse>;
  deleteFeeReceipt: (id: string) => Promise<void>;
  duplicateFeeReceipt: (id: string) => Promise<FeeReceiptResponse>;
  computeFeeReceipt: (receipt: Partial<FeeReceiptRequest>, settings?: Partial<SettingsRequest>) => Promise<Record<string, unknown>>;
  listFeeExpenseSettings: () => Promise<FeeExpenseSettingsResponse[]>;
  upsertFeeExpenseSettings: (settings: FeeExpenseSettingsRequest) => Promise<FeeExpenseSettingsResponse>;
  getFeeExpenseSettings: (taxYear: number) => Promise<FeeExpenseSettingsResponse>;

  listMortgages: (filters?: MortgageLoanFilters) => Promise<MortgageLoanResponse[]>;
  createMortgage: (loan: MortgageLoanRequest) => Promise<MortgageLoanResponse>;
  updateMortgage: (loan: MortgageLoanRequest & { id?: string }) => Promise<MortgageLoanResponse>;
  deleteMortgage: (id: string) => Promise<void>;
  listAnnualRecords: (loanId: string, filters?: MortgageAnnualRecordFilters) => Promise<MortgageAnnualRecordResponse[]>;
  createAnnualRecord: (loanId: string, record: MortgageAnnualRecordRequest) => Promise<MortgageAnnualRecordResponse>;
  updateAnnualRecord: (record: MortgageAnnualRecordRequest & { id?: string }) => Promise<MortgageAnnualRecordResponse>;
  deleteAnnualRecord: (id: string) => Promise<void>;

  listTaxParameters: (taxYear: number) => Promise<TaxParameterResponse[]>;
  updateTaxParameters: (taxYear: number, values: TaxParametersRequest['values']) => Promise<Record<string, TaxParameterResponse>>;
  listTaxRuleSources: (filters?: TaxRuleSourceFilters) => Promise<TaxRuleSourceResponse[]>;
  createTaxRuleSource: (source: TaxRuleSourceRequest) => Promise<TaxRuleSourceResponse>;
  deleteTaxRuleSource: (id: string) => Promise<void>;

  listExecutionLogs: (filters?: ExecutionLogFilters) => Promise<ExecutionLogPageResponse>;
  createExecutionLog: (entry: ExecutionLogRequest) => Promise<ExecutionLogResponse>;

  simulate: (payload: {
    sources?: IncomeSourceRequest[];
    settings?: Partial<SettingsRequest>;
    extraApv?: { annualAmount: number; regime: 'A' | 'B' | 'NONE' };
    feeReceipts?: FeeReceiptRequest[];
    mortgages?: MortgageLoanRequest[];
    annualRecords?: MortgageAnnualRecordRequest[];
  }) => Promise<unknown>;
  compareApv: (annualContribution: number, sources?: IncomeSourceRequest[], settings?: Partial<SettingsRequest>, modules?: { feeReceipts?: FeeReceiptRequest[]; mortgages?: MortgageLoanRequest[]; annualRecords?: MortgageAnnualRecordRequest[] }) => Promise<unknown>;
  buildScenarios: (payload: {
    sources?: IncomeSourceRequest[];
    settings?: Partial<SettingsRequest>;
    feeReceipts?: FeeReceiptRequest[];
    mortgages?: MortgageLoanRequest[];
    annualRecords?: MortgageAnnualRecordRequest[];
  }) => Promise<ScenarioResponse[]>;
  saveSnapshot: (name: string, payload: Record<string, unknown>) => Promise<{ id: number; result: unknown }>;
  article55Bis: (payload: {
    mortgages: MortgageLoanRequest[];
    annualRecords: MortgageAnnualRecordRequest[];
    incomeEstimate: number;
    settings?: Partial<SettingsRequest>;
  }) => Promise<unknown>;
};

export type { TaxParametersFilters };
