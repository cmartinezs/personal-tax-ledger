import { assertTaxParameterRepositoryContract } from '@personal-tax-ledger/contracts';
import { createSqliteDatabase } from './database/database.mjs';

export function createSqliteTaxParameterRepository(delegate, database) {
  let resolved;
  async function resolveDelegate() { return delegate || database || (resolved ??= createSqliteDatabase()); }
  const repository = {
    async list(context, taxYear) {
      const { listTaxParameters } = await resolveDelegate();
      return listTaxParameters(taxYear);
    },
    async get(context, taxYear, ruleKey) {
      const { getTaxParameter } = await resolveDelegate();
      return getTaxParameter(taxYear, ruleKey);
    },
    async upsert(context, taxYear, ruleKey, value, type, description) {
      const { upsertTaxParameter } = await resolveDelegate();
      return upsertTaxParameter(taxYear, ruleKey, value, type, description);
    }
  };
  return assertTaxParameterRepositoryContract(repository);
}
