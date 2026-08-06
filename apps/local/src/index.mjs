import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createIncomeComposition } from './income-composition.mjs';
import { createSettingsComposition } from './settings-composition.mjs';
import { createExecutionLogComposition } from './execution-log-composition.mjs';
import { createFeeReceiptComposition } from './fee-receipt-composition.mjs';
import { createMortgageComposition } from './mortgage-composition.mjs';
import { createTaxParameterComposition, createTaxRuleSourceComposition } from './tax-catalog-composition.mjs';
import { createSupportCatalogComposition } from './support-catalog-composition.mjs';
import { createSystemComposition } from './system-composition.mjs';

export function createLocalComposition(dependencies) {
  const income = createIncomeComposition(dependencies);
  const settings = createSettingsComposition(dependencies);
  const logs = createExecutionLogComposition(dependencies);
  const fees = createFeeReceiptComposition(dependencies);
  const mortgages = createMortgageComposition(dependencies);
  const taxParameters = createTaxParameterComposition(dependencies);
  const taxSources = createTaxRuleSourceComposition(dependencies);
  const support = createSupportCatalogComposition(dependencies);
  return {
    context: LOCAL_WORKSPACE_CONTEXT,
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
