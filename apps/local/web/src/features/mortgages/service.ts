import { api } from '../../api';
import { createMortgageService } from '@personal-tax-ledger/frontend-application';
export const createMortgageFeatureService = (client: typeof api) => createMortgageService(client);
