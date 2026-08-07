import { api } from '../../api';
import { createSourceService } from '@personal-tax-ledger/frontend-application';
export const createSourcesFeatureService = (client: typeof api) => createSourceService(client);
