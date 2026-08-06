import { assertRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';

// database.mjs opens (and migrates) the SQLite file as a side effect of
// being imported. Importing it dynamically, only the first time a
// repository method actually runs, means merely importing this package
// (or @personal-tax-ledger/local-app, which imports it) never touches
// the real database. See docs/gaps/migration-fails.md, hallazgo 2.
let defaultDelegatePromise;
async function resolveDefaultDelegate() {
  defaultDelegatePromise ??= import('../../../server/lib/database.mjs');
  return defaultDelegatePromise;
}

export function createSqliteIncomeRepository(delegate) {
  async function resolveDelegate() {
    return delegate || resolveDefaultDelegate();
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
    }
  };
  return assertRepositoryContract(repository);
}
