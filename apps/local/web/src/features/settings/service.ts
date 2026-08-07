import { api } from '../../api';
import { createSettingsService } from '@personal-tax-ledger/frontend-application';
export const createSettingsFeatureService = (client: typeof api) => ({ ...createSettingsService(client), listYears: client.listYears, bootstrap: client.bootstrap });
