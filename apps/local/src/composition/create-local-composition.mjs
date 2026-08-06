import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createIncomeComposition } from '../income-composition.mjs';
import { createSettingsComposition } from '../settings-composition.mjs';
import { createExecutionLogComposition } from '../execution-log-composition.mjs';
import { createFeeReceiptComposition } from '../fee-receipt-composition.mjs';
import { createMortgageComposition } from '../mortgage-composition.mjs';
import { createTaxParameterComposition, createTaxRuleSourceComposition } from '../tax-catalog-composition.mjs';
import { createSupportCatalogComposition } from '../support-catalog-composition.mjs';
import { createSystemComposition } from '../system-composition.mjs';
import { createSqliteDatabase } from '@personal-tax-ledger/sqlite-adapter';

export function createLocalComposition(dependencies) {
  const database = dependencies?.database || (!dependencies ? createSqliteDatabase() : undefined);
  const compositionDependencies = { ...dependencies, database };
  const income = createIncomeComposition(compositionDependencies);
  const settings = createSettingsComposition(compositionDependencies);
  const logs = createExecutionLogComposition(compositionDependencies);
  const fees = createFeeReceiptComposition(compositionDependencies);
  const mortgages = createMortgageComposition(compositionDependencies);
  const taxParameters = createTaxParameterComposition(compositionDependencies);
  const taxSources = createTaxRuleSourceComposition(compositionDependencies);
  const support = createSupportCatalogComposition(compositionDependencies);
  return {
    context: LOCAL_WORKSPACE_CONTEXT,
    database,
    close() {
      database?.close();
    },
    ...income,
    ...settings,
    ...logs,
    ...fees,
    ...mortgages,
    ...taxParameters,
    ...taxSources,
    ...support,
    ...createSystemComposition({
      settingsUseCases: settings.settingsUseCases,
      incomeUseCases: income.incomeUseCases,
      referenceUseCases: support.referenceUseCases,
      yearUseCases: support.yearUseCases,
      taxParameterUseCases: taxParameters.taxParameterUseCases
    })
  };
}
