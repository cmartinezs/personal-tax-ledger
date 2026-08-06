export function createMortgageFeatureService(client: typeof import('../../api').api) {
  return {
    list: client.listMortgages,
    create: client.createMortgage,
    update: client.updateMortgage,
    remove: client.deleteMortgage,
    listAnnualRecords: client.listAnnualRecords,
    createAnnualRecord: client.createAnnualRecord,
    updateAnnualRecord: client.updateAnnualRecord,
    removeAnnualRecord: client.deleteAnnualRecord
  };
}
