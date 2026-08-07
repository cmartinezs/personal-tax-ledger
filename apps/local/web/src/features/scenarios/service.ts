import { api } from '../../api';
import { createScenarioService } from '@personal-tax-ledger/frontend-application';
export const createScenarioFeatureService = (client: typeof api) => ({ ...createScenarioService(client), simulate: client.simulate, compareApv: client.compareApv, article55Bis: client.article55Bis });
