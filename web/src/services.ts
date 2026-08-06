import { api } from './api';

export function createFeeReceiptService(client = api) {
  return {
    list: client.listFeeReceipts,
    create: client.createFeeReceipt,
    update: client.updateFeeReceipt,
    remove: client.deleteFeeReceipt,
    duplicate: client.duplicateFeeReceipt,
    compute: client.computeFeeReceipt,
    listExpenseSettings: client.listFeeExpenseSettings,
    saveExpenseSettings: client.upsertFeeExpenseSettings,
    getExpenseSettings: client.getFeeExpenseSettings
  };
}

export function createMortgageService(client = api) {
  return {
    list: client.listMortgages,
    create: client.createMortgage,
    update: client.updateMortgage,
    remove: client.deleteMortgage,
    listAnnualRecords: client.listAnnualRecords,
    createAnnualRecord: client.createAnnualRecord,
    updateAnnualRecord: client.updateAnnualRecord,
    removeAnnualRecord: client.deleteAnnualRecord,
    article55Bis: client.article55Bis
  };
}

export function createScenarioService(client = api) {
  return { build: client.buildScenarios };
}

export function createSourceService(client = api) {
  return { list: client.listTaxRuleSources, create: client.createTaxRuleSource, remove: client.deleteTaxRuleSource };
}

export function createExecutionLogService(client = api) {
  return { list: client.listExecutionLogs, create: client.createExecutionLog };
}

export function createSettingsService(client = api) {
  return { update: client.updateSettings };
}

export const feeReceiptService = createFeeReceiptService();
export const mortgageService = createMortgageService();
export const scenarioService = createScenarioService();
export const sourceService = createSourceService();
export const executionLogService = createExecutionLogService();
export const settingsService = createSettingsService();
