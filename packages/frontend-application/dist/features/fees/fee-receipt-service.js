export function createFeeReceiptService(client) {
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
