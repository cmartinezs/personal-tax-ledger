export function createFeeReceiptFeatureService(client: typeof import('../../api').api) {
  return {
    list: client.listFeeReceipts,
    create: client.createFeeReceipt,
    update: client.updateFeeReceipt,
    remove: client.deleteFeeReceipt,
    duplicate: client.duplicateFeeReceipt,
    listExpenseSettings: client.listFeeExpenseSettings,
    saveExpenseSettings: client.upsertFeeExpenseSettings
  };
}
