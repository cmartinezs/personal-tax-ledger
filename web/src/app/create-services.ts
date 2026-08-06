import { api } from '../api';
import { createIncomeService } from '../income-service';
import { createFeeReceiptFeatureService } from '../features/fee-receipts/service';
import { createMortgageFeatureService } from '../features/mortgages/service';
import { createScenarioFeatureService } from '../features/scenarios/service';
import { createSettingsFeatureService } from '../features/settings/service';
import { createSourcesFeatureService } from '../features/sources/service';
import { createLogsFeatureService } from '../features/logs/service';
import { createBootstrapFeatureService } from '../features/bootstrap/service';

export function createServices(client = api) {
  return {
    api: client,
    income: createIncomeService({
      list: taxYear => client.listIncomes(taxYear),
      create: source => client.createIncome(source),
      update: source => client.updateIncome(source),
      remove: id => client.deleteIncome(id)
    }),
    feeReceipts: createFeeReceiptFeatureService(client),
    mortgages: createMortgageFeatureService(client),
    scenarios: createScenarioFeatureService(client),
    settings: createSettingsFeatureService(client),
    sources: createSourcesFeatureService(client),
    logs: createLogsFeatureService(client),
    bootstrap: createBootstrapFeatureService(client)
  };
}
