import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createIncomeUseCases } from '@personal-tax-ledger/application';
import { sqliteIncomeRepository } from '@personal-tax-ledger/sqlite-adapter';
import { createIncomeRouter } from '../../../server/routes/incomes.mjs';

export function createLocalComposition(dependencies) {
  const repository = dependencies?.incomeRepository || sqliteIncomeRepository;
  const useCases = createIncomeUseCases({ repository });
  return {
    context: LOCAL_WORKSPACE_CONTEXT,
    incomeRepository: repository,
    incomeUseCases: useCases,
    createIncomeRouter: routerDependencies => createIncomeRouter({ ...routerDependencies, useCases, context: LOCAL_WORKSPACE_CONTEXT })
  };
}

export const localComposition = createLocalComposition();
