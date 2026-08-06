import { assertTaxRuleSourceRepositoryContract } from '@personal-tax-ledger/contracts';

export function createTaxRuleSourceUseCases({ repository }) {
  assertTaxRuleSourceRepositoryContract(repository);
  return {
    async listTaxRuleSources(context, ruleKey, taxYear) { return repository.list(context, ruleKey, taxYear); },
    async upsertTaxRuleSource(context, source) { return repository.upsert(context, source); },
    async deleteTaxRuleSource(context, id) { return repository.remove(context, id); }
  };
}