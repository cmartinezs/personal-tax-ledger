import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createFeeReceiptUseCases, createFeeExpenseSettingsUseCases } from '@personal-tax-ledger/application';
import { createSqliteFeeReceiptRepository, createSqliteFeeExpenseSettingsRepository } from '@personal-tax-ledger/sqlite-adapter';
import { createFeeReceiptRouter, createFeeExpenseSettingsRouter } from '../../../server/routes/fee-receipts.mjs';

export function createFeeReceiptComposition(dependencies) {
  const feeReceiptRepository = dependencies?.feeReceiptRepository || createSqliteFeeReceiptRepository(undefined, dependencies?.database);
  const feeExpenseSettingsRepository = dependencies?.feeExpenseSettingsRepository || createSqliteFeeExpenseSettingsRepository(undefined, dependencies?.database);
  const feeReceiptUseCases = createFeeReceiptUseCases({ repository: feeReceiptRepository });
  const feeExpenseSettingsUseCases = createFeeExpenseSettingsUseCases({ repository: feeExpenseSettingsRepository });
  return {
    feeReceiptRepository,
    feeReceiptUseCases,
    feeExpenseSettingsRepository,
    feeExpenseSettingsUseCases,
    createFeeReceiptRouter: routerDependencies => createFeeReceiptRouter({ ...routerDependencies, useCases: feeReceiptUseCases, context: LOCAL_WORKSPACE_CONTEXT }),
    createFeeExpenseSettingsRouter: routerDependencies => createFeeExpenseSettingsRouter({ ...routerDependencies, useCases: feeExpenseSettingsUseCases, context: LOCAL_WORKSPACE_CONTEXT })
  };
}
