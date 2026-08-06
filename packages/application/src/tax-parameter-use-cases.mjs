import { assertTaxParameterRepositoryContract } from '@personal-tax-ledger/contracts';

export function createTaxParameterUseCases({ repository }) {
  assertTaxParameterRepositoryContract(repository);
  return {
    async listTaxParameters(context, taxYear) { return repository.list(context, taxYear); },
    async getTaxParameter(context, taxYear, ruleKey) { return repository.get(context, taxYear, ruleKey); },
    async upsertTaxParameter(context, taxYear, ruleKey, value, type, description) { return repository.upsert(context, taxYear, ruleKey, value, type, description); }
  };
}