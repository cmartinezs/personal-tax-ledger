import { api } from '../../api';
import { createExecutionLogService } from '@personal-tax-ledger/frontend-application';
export const createLogsFeatureService = (client: typeof api) => createExecutionLogService(client);
