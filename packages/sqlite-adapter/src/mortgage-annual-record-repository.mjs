import { assertMortgageAnnualRecordRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';
import { resolveMortgagesModule } from './mortgages-module.mjs';

export function createSqliteMortgageAnnualRecordRepository(delegate) {
  async function resolveDelegate() {
    return delegate || resolveMortgagesModule();
  }
  const repository = {
    async listByLoan(context, mortgageLoanId, filters) {
      assertWorkspaceContext(context);
      const { listAnnualRecords } = await resolveDelegate();
      return listAnnualRecords(mortgageLoanId, filters);
    },
    async listByYear(context, taxYear) {
      assertWorkspaceContext(context);
      const { listAnnualRecordsByYear } = await resolveDelegate();
      return listAnnualRecordsByYear(taxYear);
    },
    async get(context, id) {
      assertWorkspaceContext(context);
      const { getAnnualRecord } = await resolveDelegate();
      return getAnnualRecord(id);
    },
    async create(context, mortgageLoanId, input) {
      assertWorkspaceContext(context);
      const { createAnnualRecord } = await resolveDelegate();
      return createAnnualRecord(mortgageLoanId, input);
    },
    async update(context, id, input) {
      assertWorkspaceContext(context);
      const { updateAnnualRecord } = await resolveDelegate();
      return updateAnnualRecord(id, input);
    },
    async remove(context, id) {
      assertWorkspaceContext(context);
      const { deleteAnnualRecord } = await resolveDelegate();
      return deleteAnnualRecord(id);
    }
  };
  return assertMortgageAnnualRecordRepositoryContract(repository);
}
