import { db } from './database.mjs';
import { generateId, num, toBool, fromBool, round2, ValidationError } from './util.mjs';
import { computeFeeReceiptAmounts } from './fee-calculator.mjs';
import { TAX_PARAMETER_KEYS } from './tax-parameters.mjs';

const ALLOWED_INPUT = new Set(['GROSS', 'NET']);
const ALLOWED_WITHHOLDING = new Set(['WITHHELD_BY_RECIPIENT', 'PPM_PAID_BY_ISSUER', 'NO_WITHHOLDING']);
const ALLOWED_STATUS = new Set(['ACTIVE', 'CANCELLED']);
const ALLOWED_PAYMENT = new Set(['PENDING', 'PAID']);

function rowToFeeReceipt(row) {
  if (!row) return null;
  return {
    id: row.id,
    taxYear: row.tax_year,
    issueDate: row.issue_date,
    folio: row.folio ?? null,
    clientName: row.client_name,
    clientTaxId: row.client_tax_id ?? null,
    description: row.description ?? null,
    amountInputType: row.amount_input_type,
    grossAmount: num(row.gross_amount),
    netAmount: num(row.net_amount),
    withholdingMode: row.withholding_mode,
    withholdingRate: num(row.withholding_rate),
    withheldAmount: num(row.withheld_amount),
    ppmPaidAmount: num(row.ppm_paid_amount),
    taxable: toBool(row.taxable),
    status: row.status,
    paymentStatus: row.payment_status,
    paymentDate: row.payment_date ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function listFeeReceipts(filters = {}) {
  const where = [];
  const args = [];
  if (filters.taxYear != null && filters.taxYear !== '') { where.push('tax_year = ?'); args.push(Number(filters.taxYear)); }
  if (filters.clientName) { where.push('client_name LIKE ?'); args.push(`%${filters.clientName}%`); }
  if (filters.status && ALLOWED_STATUS.has(filters.status)) { where.push('status = ?'); args.push(filters.status); }
  if (filters.paymentStatus && ALLOWED_PAYMENT.has(filters.paymentStatus)) { where.push('payment_status = ?'); args.push(filters.paymentStatus); }
  if (filters.withholdingMode && ALLOWED_WITHHOLDING.has(filters.withholdingMode)) { where.push('withholding_mode = ?'); args.push(filters.withholdingMode); }
  const sql = where.length
    ? `SELECT * FROM fee_receipts WHERE ${where.join(' AND ')} ORDER BY issue_date DESC, id DESC`
    : 'SELECT * FROM fee_receipts ORDER BY issue_date DESC, id DESC';
  return db.prepare(sql).all(...args).map(rowToFeeReceipt);
}

export function getFeeReceipt(id) {
  return rowToFeeReceipt(db.prepare('SELECT * FROM fee_receipts WHERE id = ?').get(id));
}

export function createFeeReceipt(data) {
  const receipt = sanitizeFeeReceiptInput(data, generateId('fee-'));
  const recomputed = recomputeAmounts(receipt);
  db.prepare(`
    INSERT INTO fee_receipts (
      id, tax_year, issue_date, folio, client_name, client_tax_id, description,
      amount_input_type, gross_amount, net_amount,
      withholding_mode, withholding_rate, withheld_amount, ppm_paid_amount,
      taxable, status, payment_status, payment_date, notes
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    recomputed.id, recomputed.taxYear, recomputed.issueDate, recomputed.folio, recomputed.clientName, recomputed.clientTaxId, recomputed.description,
    recomputed.amountInputType, JSON.stringify(recomputed.grossAmount), JSON.stringify(recomputed.netAmount),
    recomputed.withholdingMode, JSON.stringify(recomputed.withholdingRate), JSON.stringify(recomputed.withheldAmount), JSON.stringify(recomputed.ppmPaidAmount),
    fromBool(recomputed.taxable), recomputed.status, recomputed.paymentStatus, recomputed.paymentDate, recomputed.notes
  );
  return getFeeReceipt(recomputed.id);
}

export function updateFeeReceipt(id, data) {
  const existing = getFeeReceipt(id);
  if (!existing) return null;
  const receipt = sanitizeFeeReceiptInput({ ...existing, ...data }, id);
  const recomputed = recomputeAmounts(receipt);
  const r = db.prepare(`
    UPDATE fee_receipts SET
      tax_year = ?, issue_date = ?, folio = ?, client_name = ?, client_tax_id = ?, description = ?,
      amount_input_type = ?, gross_amount = ?, net_amount = ?,
      withholding_mode = ?, withholding_rate = ?, withheld_amount = ?, ppm_paid_amount = ?,
      taxable = ?, status = ?, payment_status = ?, payment_date = ?, notes = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    recomputed.taxYear, recomputed.issueDate, recomputed.folio, recomputed.clientName, recomputed.clientTaxId, recomputed.description,
    recomputed.amountInputType, JSON.stringify(recomputed.grossAmount), JSON.stringify(recomputed.netAmount),
    recomputed.withholdingMode, JSON.stringify(recomputed.withholdingRate), JSON.stringify(recomputed.withheldAmount), JSON.stringify(recomputed.ppmPaidAmount),
    fromBool(recomputed.taxable), recomputed.status, recomputed.paymentStatus, recomputed.paymentDate, recomputed.notes,
    id
  );
  if (!r.changes) return null;
  return getFeeReceipt(id);
}

export function deleteFeeReceipt(id) {
  return db.prepare('DELETE FROM fee_receipts WHERE id = ?').run(id).changes > 0;
}

export function duplicateFeeReceipt(id) {
  const base = getFeeReceipt(id);
  if (!base) return null;
  const { id: _ignored, createdAt: _c, updatedAt: _u, ...clean } = base;
  return createFeeReceipt({ ...clean, folio: base.folio ? `${base.folio}-copia` : null });
}

// Recomputes the canonical gross/net/withholding/PPM before persisting. Always pulls
// the withholding rate from the versioned tax_parameters table (falling back to the
// receipt's stored rate if the table is empty). This is the single source of truth.
function recomputeAmounts(receipt) {
  const params = {};
  const rateFromTable = db.prepare('SELECT value FROM tax_parameters WHERE tax_year = ? AND rule_key = ?').get(receipt.taxYear, TAX_PARAMETER_KEYS.FEE_WITHHOLDING_RATE);
  if (rateFromTable) params[TAX_PARAMETER_KEYS.FEE_WITHHOLDING_RATE] = JSON.parse(rateFromTable.value);
  else if (receipt.withholdingRate > 0) params[TAX_PARAMETER_KEYS.FEE_WITHHOLDING_RATE] = receipt.withholdingRate;
  else params[TAX_PARAMETER_KEYS.FEE_WITHHOLDING_RATE] = 0.1525;

  const c = computeFeeReceiptAmounts(receipt, params);
  return {
    ...receipt,
    grossAmount: c.grossAmount,
    netAmount: c.netAmount,
    withholdingRate: c.withholdingRate,
    withheldAmount: c.withheldAmount,
    ppmPaidAmount: c.ppmPaidAmount
  };
}

// Soft status transitions used by UI quick actions.
export function setFeeReceiptStatus(id, status) {
  if (!ALLOWED_STATUS.has(status)) throw new ValidationError('invalid_status', 'Estado inválido', { status: 'invalido' });
  const r = db.prepare('UPDATE fee_receipts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
  return r.changes > 0 ? getFeeReceipt(id) : null;
}

// ---------------------------------------------------------------------------
// Fee expense settings (yearly)
// ---------------------------------------------------------------------------
function rowToExpenseSettings(row) {
  if (!row) return null;
  return {
    id: row.id,
    taxYear: row.tax_year,
    expenseMode: row.expense_mode,
    actualAnnualExpenses: num(row.actual_annual_expenses),
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function listFeeExpenseSettings() {
  return db.prepare('SELECT * FROM fee_expense_settings ORDER BY tax_year DESC').all().map(rowToExpenseSettings);
}

export function getFeeExpenseSettings(taxYear) {
  return rowToExpenseSettings(db.prepare('SELECT * FROM fee_expense_settings WHERE tax_year = ?').get(Number(taxYear)));
}

export function upsertFeeExpenseSettings(taxYear, data) {
  const year = Number(taxYear);
  const mode = data.expenseMode === 'ACTUAL' ? 'ACTUAL' : 'PRESUMED';
  const actual = Math.max(0, num(data.actualAnnualExpenses, 0));
  const existing = getFeeExpenseSettings(year);
  const id = existing?.id || generateId('feeexp-');
  db.prepare(`
    INSERT INTO fee_expense_settings (id, tax_year, expense_mode, actual_annual_expenses, notes)
    VALUES (?,?,?,?,?)
    ON CONFLICT(tax_year) DO UPDATE SET
      expense_mode=excluded.expense_mode,
      actual_annual_expenses=excluded.actual_annual_expenses,
      notes=excluded.notes,
      updated_at=CURRENT_TIMESTAMP
  `).run(id, year, mode, JSON.stringify(actual), data.notes || null);
  return getFeeExpenseSettings(year);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
export function sanitizeFeeReceiptInput(input, id) {
  const taxYear = Number(input.taxYear);
  if (!Number.isInteger(taxYear) || taxYear < 2000 || taxYear > 2100) throw new ValidationError('invalid_tax_year', 'Año comercial inválido', { taxYear: 'invalido' });
  if (!input.issueDate || typeof input.issueDate !== 'string') throw new ValidationError('invalid_issue_date', 'La fecha de emisión es obligatoria', { issueDate: 'obligatorio' });
  if (!input.clientName || !String(input.clientName).trim()) throw new ValidationError('invalid_client_name', 'El nombre del cliente es obligatorio', { clientName: 'obligatorio' });
  const amountInputType = ALLOWED_INPUT.has(input.amountInputType) ? input.amountInputType : 'GROSS';
  const grossAmount = Math.max(0, num(input.grossAmount, 0));
  const netAmount = Math.max(0, num(input.netAmount, 0));
  if (grossAmount === 0 && netAmount === 0) throw new ValidationError('invalid_amount', 'Debe ingresar un monto mayor a 0', { amount: 'invalido' });
  const withholdingMode = ALLOWED_WITHHOLDING.has(input.withholdingMode) ? input.withholdingMode : 'WITHHELD_BY_RECIPIENT';
  let withholdingRate = Math.min(1, Math.max(0, num(input.withholdingRate, 0)));
  if (withholdingMode === 'NO_WITHHOLDING') withholdingRate = 0;
  const status = ALLOWED_STATUS.has(input.status) ? input.status : 'ACTIVE';
  const paymentStatus = ALLOWED_PAYMENT.has(input.paymentStatus) ? input.paymentStatus : 'PENDING';
  const taxable = toBool(input.taxable ?? true);
  const withheldAmount = round2(num(input.withheldAmount, 0));
  const ppmPaidAmount = round2(num(input.ppmPaidAmount, 0));
  const notes = input.notes ? String(input.notes).slice(0, 2000) : null;
  const folio = input.folio ? String(input.folio).slice(0, 100) : null;
  const clientTaxId = input.clientTaxId ? String(input.clientTaxId).slice(0, 30) : null;
  const description = input.description ? String(input.description).slice(0, 500) : null;
  const paymentDate = input.paymentDate || null;
  return {
    id,
    taxYear,
    issueDate: input.issueDate,
    folio,
    clientName: String(input.clientName).trim().slice(0, 200),
    clientTaxId,
    description,
    amountInputType,
    grossAmount,
    netAmount,
    withholdingMode,
    withholdingRate,
    withheldAmount,
    ppmPaidAmount,
    taxable,
    status,
    paymentStatus,
    paymentDate,
    notes
  };
}
