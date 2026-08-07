import { api } from '../../api';
import { createFeeReceiptService } from '@personal-tax-ledger/frontend-application';
export const createFeeReceiptFeatureService = (client: typeof api) => createFeeReceiptService(client);
