import { assertMortgageAnnualRecordRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';

export function createMortgageAnnualRecordUseCases({ repository }) {
  assertMortgageAnnualRecordRepositoryContract(repository);
  return {
    async listAnnualRecords(context, mortgageLoanId, filters) {
      assertWorkspaceContext(context);
      return repository.listByLoan(context, mortgageLoanId, filters);
    },
    async listAnnualRecordsByYear(context, taxYear) {
      assertWorkspaceContext(context);
      return repository.listByYear(context, taxYear);
    },
    async getAnnualRecord(context, id) {
      assertWorkspaceContext(context);
      return repository.get(context, id);
    },
    async createAnnualRecord(context, mortgageLoanId, input) {
      assertWorkspaceContext(context);
      return repository.create(context, mortgageLoanId, input);
    },
    async updateAnnualRecord(context, id, input) {
      assertWorkspaceContext(context);
      return repository.update(context, id, input);
    },
    async deleteAnnualRecord(context, id) {
      assertWorkspaceContext(context);
      return repository.remove(context, id);
    }
  };
}
