export const packageName = '@personal-tax-ledger/api-contracts';

export function isApiError(value) {
  return Boolean(value && typeof value === 'object' && typeof value.code === 'string' && typeof value.message === 'string');
}

export function incomeSourceRequest(value) {
  return {
    name: String(value.name || '').trim(),
    kind: value.kind,
    amount: Number(value.amount),
    inputMode: value.inputMode === 'NET' ? 'NET' : 'GROSS',
    frequency: ['MONTHLY', 'ANNUAL', 'ONE_TIME'].includes(value.frequency) ? value.frequency : 'MONTHLY',
    months: Math.min(12, Math.max(1, Number(value.months) || 12)),
    taxYear: Number(value.taxYear)
  };
}

export function incomeSourceResponse(value) {
  return { ...value, id: Number(value.id), taxYear: Number(value.taxYear), amount: Number(value.amount) };
}
