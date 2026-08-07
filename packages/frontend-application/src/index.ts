export type { FrontendClient, TaxParametersFilters } from './client.js';
export { FeedbackProvider, useFeedback, LoadingModal, LOG } from './feedback.js';
export type { Toast, ConfirmOptions, FeedbackCtx } from './feedback.js';
export { useAsyncAction } from './hooks.js';
export type { AsyncActionState } from './hooks.js';
export {
  createIncomeService,
  createFeeReceiptService,
  createMortgageService,
  createScenarioService,
  createSourceService,
  createExecutionLogService,
  createSettingsService,
  computeFeeReceiptPreview,
  computeFeeSummary,
  filterFeeReceipts,
  sanitizeMortgageLoan,
  annualRecordsByLoan,
  findAnnualInterest,
  buildDividendSchedule,
  isRegimeA,
  isRegimeB,
  baselineAnnualTax,
  scenarioApvBenefit,
  filterReferences,
  filterTaxRuleSources
} from './features/index.js';
export type {
  IncomeService,
  FeeReceiptService,
  MortgageService,
  ScenarioService,
  SourceService,
  ExecutionLogService,
  SettingsService,
  FeeReceiptComputed,
  FeeSummary,
  FeeReceiptFilters,
  FeeReceiptSortBy,
  WithholdingMode,
  FeeReceiptPreviewInput,
  FeeSummaryReceipt,
  MortgageLoanInput,
  AnnualRecordLike,
  DividendSchedule,
  DividendScheduleInput,
  ScenarioLike,
  ScenarioTotalsLike,
  ReferenceLike,
  TaxRuleSourceLike
} from './features/index.js';
