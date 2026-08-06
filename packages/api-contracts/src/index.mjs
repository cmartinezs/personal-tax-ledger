export const packageName = '@personal-tax-ledger/api-contracts';

export function isApiError(value) {
  return Boolean(value && typeof value === 'object' && typeof value.code === 'string' && typeof value.message === 'string');
}

export function incomeSourceRequest(value) {
  return {
    active: value.active !== false,
    name: String(value.name || '').trim(),
    kind: value.kind,
    amount: Number(value.amount),
    inputMode: value.inputMode === 'NET' ? 'NET' : 'GROSS',
    frequency: ['MONTHLY', 'ANNUAL', 'ONE_TIME'].includes(value.frequency) ? value.frequency : 'MONTHLY',
    months: Math.min(12, Math.max(1, Number(value.months) || 12)),
    taxable: value.taxable !== false,
    withholdingRate: Math.max(0, Number(value.withholdingRate) || 0),
    afpName: value.afpName || 'UNO',
    afpCommissionRate: value.afpCommissionRate === '' || value.afpCommissionRate == null ? null : Number(value.afpCommissionRate),
    healthSystem: ['FONASA', 'ISAPRE', 'NONE'].includes(value.healthSystem) ? value.healthSystem : 'FONASA',
    healthPlanAmount: Math.max(0, Number(value.healthPlanAmount) || 0),
    contractType: value.contractType === 'FIXED' ? 'FIXED' : 'INDEFINITE',
    apvRegime: ['A', 'B'].includes(value.apvRegime) ? value.apvRegime : 'NONE',
    apvPaymentMethod: value.apvPaymentMethod === 'DIRECT' ? 'DIRECT' : 'PAYROLL',
    apvMonthly: Math.max(0, Number(value.apvMonthly) || 0),
    notes: typeof value.notes === 'string' ? value.notes.slice(0, 1000) : '',
    taxYear: Number(value.taxYear)
  };
}

export function incomeSourceResponse(value) {
  return {
    ...value,
    id: Number(value.id),
    taxYear: Number(value.taxYear),
    amount: Number(value.amount),
    months: Number(value.months),
    apvMonthly: Number(value.apvMonthly) || 0,
    healthPlanAmount: Number(value.healthPlanAmount) || 0,
    afpCommissionRate: value.afpCommissionRate == null ? null : Number(value.afpCommissionRate)
  };
}
