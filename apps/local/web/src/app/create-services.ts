import { api } from '../api';
import {
  createIncomeService,
  createFeeReceiptService,
  createMortgageService,
  createScenarioService,
  createSettingsService,
  createSourceService,
  createExecutionLogService
} from '@personal-tax-ledger/frontend-application';

export function createServices(client = api) {
  return {
    api: client,
    income: createIncomeService(client),
    feeReceipts: createFeeReceiptService(client),
    mortgages: createMortgageService(client),
    scenarios: createScenarioService(client),
    settings: createSettingsService(client),
    sources: createSourceService(client),
    logs: createExecutionLogService(client),
    bootstrap: { bootstrap: client.bootstrap, listYears: client.listYears, updateSettings: client.updateSettings }
  };
}
