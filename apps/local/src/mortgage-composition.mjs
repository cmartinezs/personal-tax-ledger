import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createMortgageUseCases, createMortgageAnnualRecordUseCases } from '@personal-tax-ledger/application';
import { createSqliteMortgageRepository, createSqliteMortgageAnnualRecordRepository } from '@personal-tax-ledger/sqlite-adapter';
import { createMortgageRouter } from '../../../server/routes/mortgages.mjs';

export function createMortgageComposition(dependencies) {
  const mortgageRepository = dependencies?.mortgageRepository || createSqliteMortgageRepository(undefined, dependencies?.database);
  const mortgageAnnualRecordRepository = dependencies?.mortgageAnnualRecordRepository || createSqliteMortgageAnnualRecordRepository(undefined, dependencies?.database);
  const mortgageUseCases = createMortgageUseCases({ repository: mortgageRepository });
  const mortgageAnnualRecordUseCases = createMortgageAnnualRecordUseCases({ repository: mortgageAnnualRecordRepository });
  return {
    mortgageRepository,
    mortgageUseCases,
    mortgageAnnualRecordRepository,
    mortgageAnnualRecordUseCases,
    createMortgageRouter: routerDependencies => createMortgageRouter({ ...routerDependencies, mortgageUseCases, annualRecordUseCases: mortgageAnnualRecordUseCases, context: LOCAL_WORKSPACE_CONTEXT })
  };
}
