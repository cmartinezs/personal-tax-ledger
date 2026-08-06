import { db } from './database.mjs';
import { generateId, num, toBool, fromBool, round2, ValidationError } from './util.mjs';

const ALLOWED_PURPOSE = new Set(['PURCHASE', 'CONSTRUCTION', 'REFINANCING_ELIGIBLE_LOAN']);
const ALLOWED_OWNERSHIP = new Set(['SOLE_OWNER', 'CO_OWNERSHIP', 'SPOUSAL_COMMUNITY']);

function rowToLoan(row) {
  if (!row) return null;
  return {
    id: row.id,
    taxYear: row.tax_year,
    institutionName: row.institution_name,
    institutionTaxId: row.institution_tax_id ?? null,
    operationNumber: row.operation_number ?? null,
    propertyAlias: row.property_alias,
    propertyAddress: row.property_address ?? null,
    propertyRole: row.property_role ?? null,
    purpose: row.purpose,
    ownershipType: row.ownership_type,
    ownershipPercentage: num(row.ownership_percentage),
    isDesignatedBeneficiary: toBool(row.is_designated_beneficiary),
    originalPrincipal: row.original_principal == null ? null : num(row.original_principal),
    outstandingPrincipal: row.outstanding_principal == null ? null : num(row.outstanding_principal),
    monthlyPayment: row.monthly_payment == null ? null : num(row.monthly_payment),
    annualInterestPaid: num(row.annual_interest_paid),
    annualPrincipalPaid: row.annual_principal_paid == null ? null : num(row.annual_principal_paid),
    annualInsurancePaid: row.annual_insurance_paid == null ? null : num(row.annual_insurance_paid),
    annualOtherCharges: row.annual_other_charges == null ? null : num(row.annual_other_charges),
    certificateReference: row.certificate_reference ?? null,
    certificateDate: row.certificate_date ?? null,
    eligibleForArticle55Bis: toBool(row.eligible_for_article_55_bis),
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowToAnnualRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    mortgageLoanId: row.mortgage_loan_id,
    taxYear: row.tax_year,
    interestPaid: num(row.interest_paid),
    principalPaid: row.principal_paid == null ? null : num(row.principal_paid),
    insurancePaid: row.insurance_paid == null ? null : num(row.insurance_paid),
    otherCharges: row.other_charges == null ? null : num(row.other_charges),
    certificateReference: row.certificate_reference ?? null,
    certificateDate: row.certificate_date ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function listMortgageLoans(filters = {}) {
  const where = [];
  const args = [];
  if (filters.taxYear != null && filters.taxYear !== '') { where.push('tax_year = ?'); args.push(Number(filters.taxYear)); }
  if (filters.institutionName) { where.push('institution_name LIKE ?'); args.push(`%${filters.institutionName}%`); }
  if (filters.propertyAlias) { where.push('property_alias LIKE ?'); args.push(`%${filters.propertyAlias}%`); }
  const sql = where.length
    ? `SELECT * FROM mortgage_loans WHERE ${where.join(' AND ')} ORDER BY created_at DESC, id DESC`
    : 'SELECT * FROM mortgage_loans ORDER BY created_at DESC, id DESC';
  return db.prepare(sql).all(...args).map(rowToLoan);
}

export function getMortgageLoan(id) {
  return rowToLoan(db.prepare('SELECT * FROM mortgage_loans WHERE id = ?').get(id));
}

export function createMortgageLoan(data) {
  const loan = sanitizeMortgageInput(data, generateId('mort-'));
  db.prepare(`
    INSERT INTO mortgage_loans (
      id, tax_year, institution_name, institution_tax_id, operation_number,
      property_alias, property_address, property_role,
      purpose, ownership_type, ownership_percentage, is_designated_beneficiary,
      original_principal, outstanding_principal, monthly_payment,
      annual_interest_paid, annual_principal_paid, annual_insurance_paid, annual_other_charges,
      certificate_reference, certificate_date, eligible_for_article_55_bis, notes
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    loan.id, loan.taxYear, loan.institutionName, loan.institutionTaxId, loan.operationNumber,
    loan.propertyAlias, loan.propertyAddress, loan.propertyRole,
    loan.purpose, loan.ownershipType, JSON.stringify(loan.ownershipPercentage), fromBool(loan.isDesignatedBeneficiary),
    loan.originalPrincipal == null ? null : JSON.stringify(loan.originalPrincipal),
    loan.outstandingPrincipal == null ? null : JSON.stringify(loan.outstandingPrincipal),
    loan.monthlyPayment == null ? null : JSON.stringify(loan.monthlyPayment),
    JSON.stringify(loan.annualInterestPaid),
    loan.annualPrincipalPaid == null ? null : JSON.stringify(loan.annualPrincipalPaid),
    loan.annualInsurancePaid == null ? null : JSON.stringify(loan.annualInsurancePaid),
    loan.annualOtherCharges == null ? null : JSON.stringify(loan.annualOtherCharges),
    loan.certificateReference, loan.certificateDate, fromBool(loan.eligibleForArticle55Bis), loan.notes
  );
  return getMortgageLoan(loan.id);
}

export function updateMortgageLoan(id, data) {
  const existing = getMortgageLoan(id);
  if (!existing) return null;
  const loan = sanitizeMortgageInput({ ...existing, ...data }, id);
  const r = db.prepare(`
    UPDATE mortgage_loans SET
      tax_year = ?, institution_name = ?, institution_tax_id = ?, operation_number = ?,
      property_alias = ?, property_address = ?, property_role = ?,
      purpose = ?, ownership_type = ?, ownership_percentage = ?, is_designated_beneficiary = ?,
      original_principal = ?, outstanding_principal = ?, monthly_payment = ?,
      annual_interest_paid = ?, annual_principal_paid = ?, annual_insurance_paid = ?, annual_other_charges = ?,
      certificate_reference = ?, certificate_date = ?, eligible_for_article_55_bis = ?, notes = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    loan.taxYear, loan.institutionName, loan.institutionTaxId, loan.operationNumber,
    loan.propertyAlias, loan.propertyAddress, loan.propertyRole,
    loan.purpose, loan.ownershipType, JSON.stringify(loan.ownershipPercentage), fromBool(loan.isDesignatedBeneficiary),
    loan.originalPrincipal == null ? null : JSON.stringify(loan.originalPrincipal),
    loan.outstandingPrincipal == null ? null : JSON.stringify(loan.outstandingPrincipal),
    loan.monthlyPayment == null ? null : JSON.stringify(loan.monthlyPayment),
    JSON.stringify(loan.annualInterestPaid),
    loan.annualPrincipalPaid == null ? null : JSON.stringify(loan.annualPrincipalPaid),
    loan.annualInsurancePaid == null ? null : JSON.stringify(loan.annualInsurancePaid),
    loan.annualOtherCharges == null ? null : JSON.stringify(loan.annualOtherCharges),
    loan.certificateReference, loan.certificateDate, fromBool(loan.eligibleForArticle55Bis), loan.notes,
    id
  );
  if (!r.changes) return null;
  return getMortgageLoan(id);
}

export function deleteMortgageLoan(id) {
  return db.prepare('DELETE FROM mortgage_loans WHERE id = ?').run(id).changes > 0;
}

export function listAnnualRecords(mortgageLoanId, filters = {}) {
  const where = ['mortgage_loan_id = ?'];
  const args = [mortgageLoanId];
  if (filters.taxYear != null && filters.taxYear !== '') { where.push('tax_year = ?'); args.push(Number(filters.taxYear)); }
  return db.prepare(`SELECT * FROM mortgage_annual_records WHERE ${where.join(' AND ')} ORDER BY tax_year DESC`).all(...args).map(rowToAnnualRecord);
}

export function listAnnualRecordsByYear(taxYear) {
  return db.prepare('SELECT * FROM mortgage_annual_records WHERE tax_year = ? ORDER BY tax_year DESC').all(Number(taxYear)).map(rowToAnnualRecord);
}

export function getAnnualRecord(id) {
  return rowToAnnualRecord(db.prepare('SELECT * FROM mortgage_annual_records WHERE id = ?').get(id));
}

export function createAnnualRecord(loanId, data) {
  const loan = getMortgageLoan(loanId);
  if (!loan) throw new ValidationError('mortgage_not_found', 'Crédito hipotecario no encontrado', { mortgageLoanId: 'no_existe' });
  const record = sanitizeAnnualRecordInput(loanId, data, generateId('mortann-'));
  db.prepare(`
    INSERT INTO mortgage_annual_records (
      id, mortgage_loan_id, tax_year, interest_paid, principal_paid,
      insurance_paid, other_charges, certificate_reference, certificate_date, notes
    ) VALUES (?,?,?,?,?,?,?,?,?,?)
  `).run(
    record.id, record.mortgageLoanId, record.taxYear,
    JSON.stringify(record.interestPaid),
    record.principalPaid == null ? null : JSON.stringify(record.principalPaid),
    record.insurancePaid == null ? null : JSON.stringify(record.insurancePaid),
    record.otherCharges == null ? null : JSON.stringify(record.otherCharges),
    record.certificateReference, record.certificateDate, record.notes
  );
  // Sync the loan's default tax_year snapshot for backwards compatibility.
  syncLoanAnnualSnapshot(loan.id, record.taxYear);
  return getAnnualRecord(record.id);
}

export function updateAnnualRecord(id, data) {
  const existing = getAnnualRecord(id);
  if (!existing) return null;
  const record = sanitizeAnnualRecordInput(existing.mortgageLoanId, { ...existing, ...data }, id);
  const r = db.prepare(`
    UPDATE mortgage_annual_records SET
      tax_year = ?, interest_paid = ?, principal_paid = ?, insurance_paid = ?,
      other_charges = ?, certificate_reference = ?, certificate_date = ?, notes = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    record.taxYear, JSON.stringify(record.interestPaid),
    record.principalPaid == null ? null : JSON.stringify(record.principalPaid),
    record.insurancePaid == null ? null : JSON.stringify(record.insurancePaid),
    record.otherCharges == null ? null : JSON.stringify(record.otherCharges),
    record.certificateReference, record.certificateDate, record.notes,
    id
  );
  if (!r.changes) return null;
  syncLoanAnnualSnapshot(existing.mortgageLoanId, record.taxYear);
  return getAnnualRecord(id);
}

export function deleteAnnualRecord(id) {
  const rec = getAnnualRecord(id);
  const r = db.prepare('DELETE FROM mortgage_annual_records WHERE id = ?').run(id).changes > 0;
  if (r && rec) syncLoanAnnualSnapshot(rec.mortgageLoanId, rec.taxYear);
  return r;
}

// Mirrors the annual record back into the loan header for the loan's tax_year so
// that simple "current year" reads keep working without joining the annual records table.
function syncLoanAnnualSnapshot(loanId, taxYear) {
  const record = db.prepare('SELECT * FROM mortgage_annual_records WHERE mortgage_loan_id = ? AND tax_year = ?').get(loanId, Number(taxYear));
  if (!record) return;
  db.prepare(`
    UPDATE mortgage_loans SET
      annual_interest_paid = ?,
      annual_principal_paid = ?,
      annual_insurance_paid = ?,
      annual_other_charges = ?,
      certificate_reference = ?,
      certificate_date = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    record.interest_paid,
    record.principal_paid, record.insurance_paid, record.other_charges,
    record.certificate_reference, record.certificate_date, loanId
  );
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
export function sanitizeMortgageInput(input, id) {
  const taxYear = Number(input.taxYear);
  if (!Number.isInteger(taxYear) || taxYear < 2000 || taxYear > 2100) throw new ValidationError('invalid_tax_year', 'Año comercial inválido', { taxYear: 'invalido' });
  if (!input.institutionName || !String(input.institutionName).trim()) throw new ValidationError('invalid_institution', 'La institución financiera es obligatoria', { institutionName: 'obligatorio' });
  if (!input.propertyAlias || !String(input.propertyAlias).trim()) throw new ValidationError('invalid_property_alias', 'El alias de la propiedad es obligatorio', { propertyAlias: 'obligatorio' });
  const purpose = ALLOWED_PURPOSE.has(input.purpose) ? input.purpose : 'PURCHASE';
  const ownershipType = ALLOWED_OWNERSHIP.has(input.ownershipType) ? input.ownershipType : 'SOLE_OWNER';
  let ownershipPercentage = Math.min(1, Math.max(0, num(input.ownershipPercentage, 1)));
  if (ownershipType === 'SOLE_OWNER') ownershipPercentage = 1;
  return {
    id,
    taxYear,
    institutionName: String(input.institutionName).trim().slice(0, 200),
    institutionTaxId: input.institutionTaxId ? String(input.institutionTaxId).slice(0, 30) : null,
    operationNumber: input.operationNumber ? String(input.operationNumber).slice(0, 100) : null,
    propertyAlias: String(input.propertyAlias).trim().slice(0, 200),
    propertyAddress: input.propertyAddress ? String(input.propertyAddress).slice(0, 500) : null,
    propertyRole: input.propertyRole ? String(input.propertyRole).slice(0, 100) : null,
    purpose,
    ownershipType,
    ownershipPercentage,
    isDesignatedBeneficiary: toBool(input.isDesignatedBeneficiary ?? true),
    originalPrincipal: input.originalPrincipal == null || input.originalPrincipal === '' ? null : Math.max(0, num(input.originalPrincipal)),
    outstandingPrincipal: input.outstandingPrincipal == null || input.outstandingPrincipal === '' ? null : Math.max(0, num(input.outstandingPrincipal)),
    monthlyPayment: input.monthlyPayment == null || input.monthlyPayment === '' ? null : Math.max(0, num(input.monthlyPayment)),
    annualInterestPaid: Math.max(0, round2(num(input.annualInterestPaid, 0))),
    annualPrincipalPaid: input.annualPrincipalPaid == null || input.annualPrincipalPaid === '' ? null : Math.max(0, round2(num(input.annualPrincipalPaid, 0))),
    annualInsurancePaid: input.annualInsurancePaid == null || input.annualInsurancePaid === '' ? null : Math.max(0, round2(num(input.annualInsurancePaid, 0))),
    annualOtherCharges: input.annualOtherCharges == null || input.annualOtherCharges === '' ? null : Math.max(0, round2(num(input.annualOtherCharges, 0))),
    certificateReference: input.certificateReference ? String(input.certificateReference).slice(0, 200) : null,
    certificateDate: input.certificateDate || null,
    eligibleForArticle55Bis: toBool(input.eligibleForArticle55Bis ?? true),
    notes: input.notes ? String(input.notes).slice(0, 2000) : null
  };
}

export function sanitizeAnnualRecordInput(mortgageLoanId, input, id) {
  const taxYear = Number(input.taxYear);
  if (!Number.isInteger(taxYear) || taxYear < 2000 || taxYear > 2100) throw new ValidationError('invalid_tax_year', 'Año tributario inválido', { taxYear: 'invalido' });
  const interestPaid = round2(Math.max(0, num(input.interestPaid, 0)));
  return {
    id,
    mortgageLoanId,
    taxYear,
    interestPaid,
    principalPaid: input.principalPaid == null || input.principalPaid === '' ? null : round2(Math.max(0, num(input.principalPaid, 0))),
    insurancePaid: input.insurancePaid == null || input.insurancePaid === '' ? null : round2(Math.max(0, num(input.insurancePaid, 0))),
    otherCharges: input.otherCharges == null || input.otherCharges === '' ? null : round2(Math.max(0, num(input.otherCharges, 0))),
    certificateReference: input.certificateReference ? String(input.certificateReference).slice(0, 200) : null,
    certificateDate: input.certificateDate || null,
    notes: input.notes ? String(input.notes).slice(0, 2000) : null
  };
}
