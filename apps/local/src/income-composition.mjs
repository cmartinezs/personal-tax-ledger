import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createIncomeUseCases } from '@personal-tax-ledger/application';
import { createSqliteIncomeRepository } from '@personal-tax-ledger/sqlite-adapter';
import { createIncomeRouter } from '../../../server/routes/incomes.mjs';

export function createIncomeComposition(dependencies) {
  const repository = dependencies?.incomeRepository || createSqliteIncomeRepository();
  const useCases = createIncomeUseCases({ repository });
  return {
    incomeRepository: repository,
    incomeUseCases: useCases,
    createIncomeRouter: routerDependencies => createIncomeRouter({ ...routerDependencies, useCases, context: LOCAL_WORKSPACE_CONTEXT })
  };
}
