import { assertIncomeRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';
import { createSqliteDatabase } from './database/database.mjs';

export function createSqliteIncomeRepository(delegate, database) {
  let resolved;
  async function resolveDelegate() {
    return delegate || database || (resolved ??= createSqliteDatabase());
  }
  const repository = {
    async list(context, taxYear) {
      assertWorkspaceContext(context);
      const { listIncomeSources } = await resolveDelegate();
      return listIncomeSources(taxYear == null ? null : Number(taxYear));
    },
    async get(context, id) {
      assertWorkspaceContext(context);
      const { listIncomeSources } = await resolveDelegate();
      return listIncomeSources(null).find(source => Number(source.id) === Number(id)) || null;
    },
    async create(context, input) {
      assertWorkspaceContext(context);
      const { createIncomeSource } = await resolveDelegate();
      return createIncomeSource(input);
    },
    async update(context, id, input) {
      assertWorkspaceContext(context);
      const { updateIncomeSource } = await resolveDelegate();
      return updateIncomeSource(Number(id), input);
    },
    async remove(context, id) {
      assertWorkspaceContext(context);
      const { deleteIncomeSource } = await resolveDelegate();
      return deleteIncomeSource(Number(id));
    },
    async copy(context, fromTaxYear, toTaxYear) {
      assertWorkspaceContext(context);
      const { copyIncomeSources } = await resolveDelegate();
      return copyIncomeSources(fromTaxYear, toTaxYear);
    }
  };
  return assertIncomeRepositoryContract(repository);
}
