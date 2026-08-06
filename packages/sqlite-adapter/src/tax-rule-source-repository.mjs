import { assertTaxRuleSourceRepositoryContract } from '@personal-tax-ledger/contracts';
import { resolveDatabaseModule } from './database.mjs';

export function createSqliteTaxRuleSourceRepository(delegate) {
  async function resolveDelegate() { return delegate || resolveDatabaseModule(); }
  const repository = {
    async list(context, ruleKey, taxYear) {
      const { listTaxRuleSources } = await resolveDelegate();
      return listTaxRuleSources(ruleKey, taxYear);
    },
    async upsert(context, source) {
      const { upsertTaxRuleSource } = await resolveDelegate();
      return upsertTaxRuleSource(source);
    },
    async remove(context, id) {
      const { deleteTaxRuleSource } = await resolveDelegate();
      return deleteTaxRuleSource(id);
    }
  };
  return assertTaxRuleSourceRepositoryContract(repository);
}