export function createIncomeService(client) {
    return {
        list: taxYear => client.listIncomes(taxYear),
        create: source => client.createIncome(source),
        update: source => client.updateIncome(source),
        remove: id => client.deleteIncome(id)
    };
}
