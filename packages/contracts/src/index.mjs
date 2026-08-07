export const packageName = '@personal-tax-ledger/contracts';

export { assertWorkspaceContext, LOCAL_WORKSPACE_CONTEXT } from './shared/workspace-context.mjs';
export { INCOME_REPOSITORY_METHODS, assertIncomeRepositoryContract } from './features/income/income-source.mjs';
export { SETTINGS_REPOSITORY_METHODS, assertSettingsRepositoryContract } from './features/settings/settings.mjs';
export { EXECUTION_LOG_REPOSITORY_METHODS, assertExecutionLogRepositoryContract } from './features/logs/execution-log.mjs';
export { FEE_RECEIPT_REPOSITORY_METHODS, assertFeeReceiptRepositoryContract } from './features/fees/fee-receipt.mjs';
export { FEE_EXPENSE_SETTINGS_REPOSITORY_METHODS, assertFeeExpenseSettingsRepositoryContract } from './features/fees/fee-expense-settings.mjs';
export { MORTGAGE_REPOSITORY_METHODS, assertMortgageRepositoryContract } from './features/mortgages/mortgage.mjs';
export { MORTGAGE_ANNUAL_RECORD_REPOSITORY_METHODS, assertMortgageAnnualRecordRepositoryContract } from './features/mortgages/mortgage-annual-record.mjs';
export { TAX_PARAMETER_REPOSITORY_METHODS, assertTaxParameterRepositoryContract } from './features/tax/tax-parameter.mjs';
export { TAX_RULE_SOURCE_REPOSITORY_METHODS, assertTaxRuleSourceRepositoryContract } from './features/tax/tax-rule-source.mjs';
export { REFERENCE_REPOSITORY_METHODS, assertReferenceRepositoryContract } from './features/references/reference.mjs';
export { YEAR_REPOSITORY_METHODS, assertYearRepositoryContract } from './features/years/year.mjs';
export { SNAPSHOT_REPOSITORY_METHODS, assertSnapshotRepositoryContract } from './features/snapshots/snapshot.mjs';
