export type FeeReceiptService<C extends Record<string, any>> = {
  list(filters?: Parameters<C['listFeeReceipts']>[0]): Promise<Awaited<ReturnType<C['listFeeReceipts']>>>;
  create(receipt: Parameters<C['createFeeReceipt']>[0]): Promise<Awaited<ReturnType<C['createFeeReceipt']>>>;
  update(receipt: Parameters<C['updateFeeReceipt']>[0]): Promise<Awaited<ReturnType<C['updateFeeReceipt']>>>;
  remove(id: Parameters<C['deleteFeeReceipt']>[0]): Promise<Awaited<ReturnType<C['deleteFeeReceipt']>>>;
  duplicate(id: Parameters<C['duplicateFeeReceipt']>[0]): Promise<Awaited<ReturnType<C['duplicateFeeReceipt']>>>;
  compute(receipt: Parameters<C['computeFeeReceipt']>[0], settings?: Parameters<C['computeFeeReceipt']>[1]): Promise<Awaited<ReturnType<C['computeFeeReceipt']>>>;
  listExpenseSettings(): Promise<Awaited<ReturnType<C['listFeeExpenseSettings']>>>;
  saveExpenseSettings(settings: Parameters<C['upsertFeeExpenseSettings']>[0]): Promise<Awaited<ReturnType<C['upsertFeeExpenseSettings']>>>;
  getExpenseSettings(taxYear: Parameters<C['getFeeExpenseSettings']>[0]): Promise<Awaited<ReturnType<C['getFeeExpenseSettings']>>>;
};

export function createFeeReceiptService<C extends Record<string, any>>(client: C): FeeReceiptService<C> {
  return {
    list: filters => client.listFeeReceipts(filters),
    create: receipt => client.createFeeReceipt(receipt),
    update: receipt => client.updateFeeReceipt(receipt),
    remove: id => client.deleteFeeReceipt(id),
    duplicate: id => client.duplicateFeeReceipt(id),
    compute: (receipt, settings) => client.computeFeeReceipt(receipt, settings),
    listExpenseSettings: () => client.listFeeExpenseSettings(),
    saveExpenseSettings: settings => client.upsertFeeExpenseSettings(settings),
    getExpenseSettings: taxYear => client.getFeeExpenseSettings(taxYear)
  };
}
