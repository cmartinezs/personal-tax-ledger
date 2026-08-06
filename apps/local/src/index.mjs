import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createIncomeComposition } from './income-composition.mjs';
import { createSettingsComposition } from './settings-composition.mjs';
import { createExecutionLogComposition } from './execution-log-composition.mjs';

export function createLocalComposition(dependencies) {
  return {
    context: LOCAL_WORKSPACE_CONTEXT,
    ...createIncomeComposition(dependencies),
    ...createSettingsComposition(dependencies),
    ...createExecutionLogComposition(dependencies)
  };
}
