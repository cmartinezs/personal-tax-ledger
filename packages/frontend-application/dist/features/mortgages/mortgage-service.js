export function createMortgageService(client) {
    return {
        list: filters => client.listMortgages(filters),
        create: loan => client.createMortgage(loan),
        update: loan => client.updateMortgage(loan),
        remove: id => client.deleteMortgage(id),
        listAnnualRecords: (loanId, filters) => client.listAnnualRecords(loanId, filters),
        createAnnualRecord: (loanId, record) => client.createAnnualRecord(loanId, record),
        updateAnnualRecord: record => client.updateAnnualRecord(record),
        removeAnnualRecord: id => client.deleteAnnualRecord(id),
        article55Bis: payload => client.article55Bis(payload)
    };
}
