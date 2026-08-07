import { createIncomeService as createIncomeServicePackage } from '@personal-tax-ledger/frontend-application';

export type { IncomeService } from '@personal-tax-ledger/frontend-application';

export const createIncomeService = (client: Parameters<typeof createIncomeServicePackage>[0]) => createIncomeServicePackage(client);
