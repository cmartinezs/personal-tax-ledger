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

export function feeReceiptRequest(value = {}) {
  return {
    taxYear: Number(value.taxYear),
    issueDate: String(value.issueDate || ''),
    folio: value.folio == null ? null : String(value.folio),
    clientName: String(value.clientName || '').trim(),
    clientTaxId: value.clientTaxId == null ? null : String(value.clientTaxId),
    description: value.description == null ? null : String(value.description),
    amountInputType: value.amountInputType === 'NET' ? 'NET' : 'GROSS',
    grossAmount: Math.max(0, Number(value.grossAmount) || 0),
    netAmount: Math.max(0, Number(value.netAmount) || 0),
    withholdingMode: ['WITHHELD_BY_RECIPIENT', 'PPM_PAID_BY_ISSUER', 'NO_WITHHOLDING'].includes(value.withholdingMode)
      ? value.withholdingMode
      : 'WITHHELD_BY_RECIPIENT',
    withholdingRate: Math.min(1, Math.max(0, Number(value.withholdingRate) || 0)),
    withheldAmount: Math.max(0, Number(value.withheldAmount) || 0),
    ppmPaidAmount: Math.max(0, Number(value.ppmPaidAmount) || 0),
    taxable: value.taxable !== false,
    status: value.status === 'CANCELLED' ? 'CANCELLED' : 'ACTIVE',
    paymentStatus: value.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
    paymentDate: value.paymentDate == null ? null : String(value.paymentDate),
    notes: value.notes == null ? null : String(value.notes)
  };
}

export function feeReceiptResponse(value = {}) {
  return { ...feeReceiptRequest(value), id: value.id == null ? undefined : String(value.id), createdAt: value.createdAt, updatedAt: value.updatedAt };
}

export function feeReceiptFilters(value = {}) {
  return {
    taxYear: value.taxYear == null || value.taxYear === '' ? undefined : Number(value.taxYear),
    clientName: value.clientName ? String(value.clientName) : undefined,
    status: value.status ? String(value.status) : undefined,
    paymentStatus: value.paymentStatus ? String(value.paymentStatus) : undefined,
    withholdingMode: value.withholdingMode ? String(value.withholdingMode) : undefined
  };
}

export function feeExpenseSettingsRequest(value = {}) {
  return {
    taxYear: Number(value.taxYear),
    expenseMode: value.expenseMode === 'ACTUAL' ? 'ACTUAL' : 'PRESUMED',
    actualAnnualExpenses: Math.max(0, Number(value.actualAnnualExpenses) || 0),
    notes: value.notes == null ? null : String(value.notes)
  };
}

export function feeExpenseSettingsResponse(value = {}) {
  return { ...feeExpenseSettingsRequest(value), id: value.id == null ? undefined : String(value.id), createdAt: value.createdAt, updatedAt: value.updatedAt };
}

export function mortgageLoanRequest(value = {}) {
  return {
    taxYear: Number(value.taxYear),
    institutionName: String(value.institutionName || '').trim(),
    institutionTaxId: value.institutionTaxId == null ? null : String(value.institutionTaxId),
    operationNumber: value.operationNumber == null ? null : String(value.operationNumber),
    propertyAlias: String(value.propertyAlias || '').trim(),
    propertyAddress: value.propertyAddress == null ? null : String(value.propertyAddress),
    propertyRole: value.propertyRole == null ? null : String(value.propertyRole),
    purpose: ['PURCHASE', 'CONSTRUCTION', 'REFINANCING_ELIGIBLE_LOAN'].includes(value.purpose) ? value.purpose : 'PURCHASE',
    ownershipType: ['SOLE_OWNER', 'CO_OWNERSHIP', 'SPOUSAL_COMMUNITY'].includes(value.ownershipType) ? value.ownershipType : 'SOLE_OWNER',
    ownershipPercentage: Math.min(1, Math.max(0, Number(value.ownershipPercentage) || 0)),
    isDesignatedBeneficiary: value.isDesignatedBeneficiary !== false,
    originalPrincipal: value.originalPrincipal == null || value.originalPrincipal === '' ? null : Math.max(0, Number(value.originalPrincipal) || 0),
    outstandingPrincipal: value.outstandingPrincipal == null || value.outstandingPrincipal === '' ? null : Math.max(0, Number(value.outstandingPrincipal) || 0),
    monthlyPayment: value.monthlyPayment == null || value.monthlyPayment === '' ? null : Math.max(0, Number(value.monthlyPayment) || 0),
    annualInterestPaid: Math.max(0, Number(value.annualInterestPaid) || 0),
    annualPrincipalPaid: value.annualPrincipalPaid == null || value.annualPrincipalPaid === '' ? null : Math.max(0, Number(value.annualPrincipalPaid) || 0),
    annualInsurancePaid: value.annualInsurancePaid == null || value.annualInsurancePaid === '' ? null : Math.max(0, Number(value.annualInsurancePaid) || 0),
    annualOtherCharges: value.annualOtherCharges == null || value.annualOtherCharges === '' ? null : Math.max(0, Number(value.annualOtherCharges) || 0),
    certificateReference: value.certificateReference == null ? null : String(value.certificateReference),
    certificateDate: value.certificateDate == null ? null : String(value.certificateDate),
    eligibleForArticle55Bis: value.eligibleForArticle55Bis !== false,
    notes: value.notes == null ? null : String(value.notes)
  };
}

export function mortgageLoanResponse(value = {}) {
  return { ...mortgageLoanRequest(value), id: value.id == null ? undefined : String(value.id), createdAt: value.createdAt, updatedAt: value.updatedAt };
}

export function mortgageLoanFilters(value = {}) {
  return {
    taxYear: value.taxYear == null || value.taxYear === '' ? undefined : Number(value.taxYear),
    institutionName: value.institutionName ? String(value.institutionName) : undefined,
    propertyAlias: value.propertyAlias ? String(value.propertyAlias) : undefined
  };
}

export function mortgageAnnualRecordRequest(value = {}) {
  return {
    taxYear: Number(value.taxYear),
    interestPaid: Math.max(0, Number(value.interestPaid) || 0),
    principalPaid: value.principalPaid == null || value.principalPaid === '' ? null : Math.max(0, Number(value.principalPaid) || 0),
    insurancePaid: value.insurancePaid == null || value.insurancePaid === '' ? null : Math.max(0, Number(value.insurancePaid) || 0),
    otherCharges: value.otherCharges == null || value.otherCharges === '' ? null : Math.max(0, Number(value.otherCharges) || 0),
    certificateReference: value.certificateReference == null ? null : String(value.certificateReference),
    certificateDate: value.certificateDate == null ? null : String(value.certificateDate),
    notes: value.notes == null ? null : String(value.notes)
  };
}

export function mortgageAnnualRecordResponse(value = {}) {
  return { ...mortgageAnnualRecordRequest(value), id: value.id == null ? undefined : String(value.id), mortgageLoanId: value.mortgageLoanId == null ? undefined : String(value.mortgageLoanId), createdAt: value.createdAt, updatedAt: value.updatedAt };
}

export function mortgageAnnualRecordFilters(value = {}) {
  return { taxYear: value.taxYear == null || value.taxYear === '' ? undefined : Number(value.taxYear) };
}

export function settingsRequest(value = {}) {
  return { ...value, year: Number(value.year) };
}

export function settingsResponse(value = {}) {
  return { ...value, year: Number(value.year), ufValue: Number(value.ufValue) || 0, utmValue: Number(value.utmValue) || 0 };
}

export function bootstrapResponse(value = {}) {
  return {
    settings: settingsResponse(value.settings || {}),
    sources: Array.isArray(value.sources) ? value.sources : [],
    references: Array.isArray(value.references) ? value.references : []
  };
}

export function yearsResponse(value) {
  return Array.isArray(value) ? value.map(Number) : [];
}

export function referenceResponse(value = {}) {
  return {
    id: Number(value.id),
    authority: String(value.authority || ''),
    title: String(value.title || ''),
    url: String(value.url || ''),
    appliesTo: String(value.appliesTo || '')
  };
}

export function taxParameterResponse(value = {}) {
  return {
    ruleKey: String(value.ruleKey || ''),
    value: value.value,
    type: String(value.type || 'number'),
    description: value.description == null ? null : String(value.description),
    updatedAt: value.updatedAt == null ? undefined : String(value.updatedAt)
  };
}

export function taxParametersRequest(value = {}) {
  return {
    taxYear: Number(value.taxYear),
    values: value.values && typeof value.values === 'object' ? { ...value.values } : {}
  };
}

export function taxParametersFilters(value = {}) {
  return { taxYear: value.taxYear == null || value.taxYear === '' ? undefined : Number(value.taxYear) };
}

export function taxRuleSourceRequest(value = {}) {
  return {
    id: value.id == null ? undefined : String(value.id),
    ruleKey: String(value.ruleKey || ''),
    taxYear: Number(value.taxYear),
    institution: String(value.institution || ''),
    title: String(value.title || ''),
    sourceUrl: String(value.sourceUrl || ''),
    retrievedAt: String(value.retrievedAt || ''),
    notes: value.notes == null ? null : String(value.notes)
  };
}

export function taxRuleSourceResponse(value = {}) {
  return taxRuleSourceRequest(value);
}

export function taxRuleSourceFilters(value = {}) {
  return {
    ruleKey: value.ruleKey ? String(value.ruleKey) : undefined,
    taxYear: value.taxYear == null || value.taxYear === '' ? undefined : Number(value.taxYear)
  };
}

export function snapshotRequest(value = {}) {
  return { name: String(value.name || 'Simulación'), payload: value.payload && typeof value.payload === 'object' ? value.payload : {} };
}

export function snapshotResponse(value = {}) {
  return { id: Number(value.id), result: value.result };
}

export function scenarioResponse(value = {}) {
  return { ...value, key: String(value.key || ''), label: String(value.label || ''), liquidityCommitted: Number(value.liquidityCommitted) || 0, accumulatedPensionSaving: Number(value.accumulatedPensionSaving) || 0, diff: Number(value.diff) || 0 };
}

export function scenariosResponse(value) {
  return Array.isArray(value) ? value.map(scenarioResponse) : [];
}

export function executionLogRequest(value = {}) {
  return {
    kind: value.kind === 'ASYNC' ? 'ASYNC' : 'SYNC',
    operation: String(value.operation || ''),
    status: value.status === 'ERROR' ? 'ERROR' : 'OK',
    message: value.message == null ? null : String(value.message),
    auditMessage: value.auditMessage == null ? null : String(value.auditMessage),
    durationMs: Math.max(0, Number(value.durationMs) || 0)
  };
}

export function executionLogResponse(value = {}) {
  return { ...executionLogRequest(value), id: Number(value.id), createdAt: String(value.createdAt || '') };
}

export function executionLogFilters(value = {}) {
  return {
    kind: value.kind ? String(value.kind) : undefined,
    status: value.status ? String(value.status) : undefined,
    operation: value.operation ? String(value.operation) : undefined,
    q: value.q ? String(value.q) : undefined,
    page: value.page == null || value.page === '' ? undefined : Number(value.page),
    pageSize: value.pageSize == null || value.pageSize === '' ? undefined : Number(value.pageSize)
  };
}

export function executionLogPageResponse(value = {}) {
  return { items: Array.isArray(value.items) ? value.items.map(executionLogResponse) : [], total: Number(value.total) || 0, page: Number(value.page) || 1, pageSize: Number(value.pageSize) || 20 };
}

export function apiErrorResponse(value = {}) {
  return { code: String(value.code || 'unexpected'), message: String(value.message || 'Error inesperado'), fieldErrors: value.fieldErrors && typeof value.fieldErrors === 'object' ? { ...value.fieldErrors } : undefined };
}

export function pagination(value = {}) {
  return { page: Math.max(1, Number(value.page) || 1), pageSize: Math.min(200, Math.max(1, Number(value.pageSize) || 20)), total: Math.max(0, Number(value.total) || 0) };
}
