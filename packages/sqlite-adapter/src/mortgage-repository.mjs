import { assertMortgageRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';
import { resolveMortgagesModule } from './mortgages-module.mjs';

export function createSqliteMortgageRepository(delegate) {
  async function resolveDelegate() {
    return delegate || resolveMortgagesModule();
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
