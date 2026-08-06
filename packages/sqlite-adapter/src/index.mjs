import { assertRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';
import { createIncomeSource, deleteIncomeSource, getSettings, listIncomeSources, updateIncomeSource } from '../../../server/lib/database.mjs';

export function createSqliteIncomeRepository(delegate = { createIncomeSource, deleteIncomeSource, getSettings, listIncomeSources, updateIncomeSource }) {
  const repository = {
    list(context, taxYear) {
      assertWorkspaceContext(context);
      return delegate.listIncomeSources(taxYear == null ? null : Number(taxYear));
    },
    get(context, id) {
      assertWorkspaceContext(context);
      return delegate.listIncomeSources(null).find(source => Number(source.id) === Number(id)) || null;
    },
    create(context, input) {
      assertWorkspaceContext(context);
      return delegate.createIncomeSource(input);
    },
    update(context, id, input) {
      assertWorkspaceContext(context);
      return delegate.updateIncomeSource(Number(id), input);
    },
    remove(context, id) {
      assertWorkspaceContext(context);
      return delegate.deleteIncomeSource(Number(id));
    }
  };
  return assertRepositoryContract(repository);
}

export const sqliteIncomeRepository = createSqliteIncomeRepository();
export { getSettings };
