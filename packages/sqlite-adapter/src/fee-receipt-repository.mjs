import { assertFeeReceiptRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';
import {
  configureFeeReceiptsDatabase,
  listFeeReceipts,
  getFeeReceipt,
  createFeeReceipt,
  updateFeeReceipt,
  deleteFeeReceipt,
  duplicateFeeReceipt
} from './database/fee-receipts.mjs';
import { createSqliteDatabase } from './database/database.mjs';

export function createSqliteFeeReceiptRepository(delegate, database) {
  let resolved;
  async function resolveDelegate() {
    if (delegate) return delegate;
    if (!resolved) {
      const connection = database || createSqliteDatabase();
      configureFeeReceiptsDatabase(connection.db);
      resolved = { listFeeReceipts, getFeeReceipt, createFeeReceipt, updateFeeReceipt, deleteFeeReceipt, duplicateFeeReceipt };
    }
    return resolved;
  }
  const repository = {
    async list(context, filters) {
      assertWorkspaceContext(context);
      const { listFeeReceipts } = await resolveDelegate();
      return listFeeReceipts(filters);
    },
    async get(context, id) {
      assertWorkspaceContext(context);
      const { getFeeReceipt } = await resolveDelegate();
      return getFeeReceipt(id);
    },
    async create(context, input) {
      assertWorkspaceContext(context);
      const { createFeeReceipt } = await resolveDelegate();
      return createFeeReceipt(input);
    },
    async update(context, id, input) {
      assertWorkspaceContext(context);
      const { updateFeeReceipt } = await resolveDelegate();
      return updateFeeReceipt(id, input);
    },
    async remove(context, id) {
      assertWorkspaceContext(context);
      const { deleteFeeReceipt } = await resolveDelegate();
      return deleteFeeReceipt(id);
    },
    async duplicate(context, id) {
      assertWorkspaceContext(context);
      const { duplicateFeeReceipt } = await resolveDelegate();
      return duplicateFeeReceipt(id);
    }
  };
  return assertFeeReceiptRepositoryContract(repository);
}
