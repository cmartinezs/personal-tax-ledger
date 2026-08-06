export const packageName = '@personal-tax-ledger/api-contracts';

export function isApiError(value) {
  return Boolean(value && typeof value === 'object' && typeof value.code === 'string' && typeof value.message === 'string');
}
