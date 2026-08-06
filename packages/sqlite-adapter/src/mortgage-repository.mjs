import { assertMortgageRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';
import { configureMortgagesDatabase, listMortgageLoans, getMortgageLoan, createMortgageLoan, updateMortgageLoan, deleteMortgageLoan } from './database/mortgages.mjs';
import { createSqliteDatabase } from './database/database.mjs';

export function createSqliteMortgageRepository(delegate, database) {
  let resolved;
  async function resolveDelegate() {
    if (delegate) return delegate;
    if (!resolved) {
      const connection = database || createSqliteDatabase();
      configureMortgagesDatabase(connection.db);
      resolved = { listMortgageLoans, getMortgageLoan, createMortgageLoan, updateMortgageLoan, deleteMortgageLoan };
    }
    return resolved;
  }
  const repository = {
    async list(context, filters) {
      assertWorkspaceContext(context);
      const { listMortgageLoans } = await resolveDelegate();
      return listMortgageLoans(filters);
    },
    async get(context, id) {
      assertWorkspaceContext(context);
      const { getMortgageLoan } = await resolveDelegate();
      return getMortgageLoan(id);
    },
    async create(context, input) {
      assertWorkspaceContext(context);
      const { createMortgageLoan } = await resolveDelegate();
      return createMortgageLoan(input);
    },
    async update(context, id, input) {
      assertWorkspaceContext(context);
      const { updateMortgageLoan } = await resolveDelegate();
      return updateMortgageLoan(id, input);
    },
    async remove(context, id) {
      assertWorkspaceContext(context);
      const { deleteMortgageLoan } = await resolveDelegate();
      return deleteMortgageLoan(id);
    }
  };
  return assertMortgageRepositoryContract(repository);
}
