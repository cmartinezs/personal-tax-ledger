export type MortgageService<C extends Record<string, any>> = {
  list(filters?: Parameters<C['listMortgages']>[0]): Promise<Awaited<ReturnType<C['listMortgages']>>>;
  create(loan: Parameters<C['createMortgage']>[0]): Promise<Awaited<ReturnType<C['createMortgage']>>>;
  update(loan: Parameters<C['updateMortgage']>[0]): Promise<Awaited<ReturnType<C['updateMortgage']>>>;
  remove(id: Parameters<C['deleteMortgage']>[0]): Promise<Awaited<ReturnType<C['deleteMortgage']>>>;
  listAnnualRecords(loanId: Parameters<C['listAnnualRecords']>[0], filters?: Parameters<C['listAnnualRecords']>[1]): Promise<Awaited<ReturnType<C['listAnnualRecords']>>>;
  createAnnualRecord(loanId: Parameters<C['createAnnualRecord']>[0], record: Parameters<C['createAnnualRecord']>[1]): Promise<Awaited<ReturnType<C['createAnnualRecord']>>>;
  updateAnnualRecord(record: Parameters<C['updateAnnualRecord']>[0]): Promise<Awaited<ReturnType<C['updateAnnualRecord']>>>;
  removeAnnualRecord(id: Parameters<C['deleteAnnualRecord']>[0]): Promise<Awaited<ReturnType<C['deleteAnnualRecord']>>>;
  article55Bis(payload: Parameters<C['article55Bis']>[0]): Promise<Awaited<ReturnType<C['article55Bis']>>>;
};

export function createMortgageService<C extends Record<string, any>>(client: C): MortgageService<C> {
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
