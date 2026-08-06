import { assertTaxRuleSourceRepositoryContract } from '@personal-tax-ledger/contracts';
import { createSqliteDatabase } from './database/database.mjs';

export function createSqliteTaxRuleSourceRepository(delegate, database) {
  let resolved;
  async function resolveDelegate() { return delegate || database || (resolved ??= createSqliteDatabase()); }
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
