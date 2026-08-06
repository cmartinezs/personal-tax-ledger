import { createTaxParameterUseCases, createTaxRuleSourceUseCases } from '@personal-tax-ledger/application';
import { createSqliteTaxParameterRepository, createSqliteTaxRuleSourceRepository } from '@personal-tax-ledger/sqlite-adapter';
import { createTaxParameterRouter } from '../../../server/routes/tax-parameters.mjs';
import { createTaxRuleSourceRouter } from '../../../server/routes/tax-rule-sources.mjs';

export function createTaxParameterComposition(dependencies) {
  const repository = dependencies?.taxParameterRepository || createSqliteTaxParameterRepository();
  const useCases = createTaxParameterUseCases({ repository });
  return {
    taxParameterUseCases: useCases,
    createTaxParameterRouter: routerDependencies => createTaxParameterRouter({ ...routerDependencies, useCases })
  };
}

export function createTaxRuleSourceComposition(dependencies) {
  const repository = dependencies?.taxRuleSourceRepository || createSqliteTaxRuleSourceRepository();
  const useCases = createTaxRuleSourceUseCases({ repository });
  return {
    taxRuleSourceUseCases: useCases,
    createTaxRuleSourceRouter: routerDependencies => createTaxRuleSourceRouter({ ...routerDependencies, useCases })
  };
}