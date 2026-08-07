import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createIncomeUseCases } from '@personal-tax-ledger/application';
import { createSqliteIncomeRepository } from '@personal-tax-ledger/sqlite-adapter';
import { createIncomeRouter } from '@personal-tax-ledger/http-api';

export function createIncomeComposition(dependencies) {
  const repository = dependencies?.incomeRepository || createSqliteIncomeRepository(undefined, dependencies?.database);
  const useCases = createIncomeUseCases({ repository });
  return {
    incomeRepository: repository,
    incomeUseCases: useCases,
    createIncomeRouter: routerDependencies => createIncomeRouter({ ...routerDependencies, useCases, context: LOCAL_WORKSPACE_CONTEXT })
  };
}
