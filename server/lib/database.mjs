import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { defaultSettings, officialReferences } from './defaults.mjs';
import { TAX_PARAMETER_KEYS, TAX_PARAMETER_SEEDS } from './tax-parameters.mjs';
import { TAX_RULE_SOURCES_SEEDS } from './official-sources.mjs';

const dbPath = resolve(process.env.DB_PATH || 'server/data/apv-chile.sqlite');
mkdirSync(dirname(dbPath), { recursive: true });
export const db = new DatabaseSync(dbPath, { timeout: 5000 });
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

// ---------------------------------------------------------------------------
// Original schema (kept untouched for back-compat with existing installs)
// ---------------------------------------------------------------------------
db.exec(`
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS income_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS official_references (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  authority TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  applies_to TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS simulation_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  payload TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

const incomeSourceColumns = db.prepare('PRAGMA table_info(income_sources)').all().map(c => c.name);
if (!incomeSourceColumns.includes('tax_year')) {
  db.exec(`ALTER TABLE income_sources ADD COLUMN tax_year INTEGER NOT NULL DEFAULT ${defaultSettings.year}`);
}

db.exec(`
CREATE TABLE IF NOT EXISTS execution_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  operation TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  audit_message TEXT,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_execution_logs_created ON execution_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_execution_logs_kind ON execution_logs(kind);
CREATE INDEX IF NOT EXISTS idx_execution_logs_operation ON execution_logs(operation);
`);

const logColumns = db.prepare('PRAGMA table_info(execution_logs)').all().map(c => c.name);
if (!logColumns.includes('audit_message')) {
  db.exec('ALTER TABLE execution_logs ADD COLUMN audit_message TEXT');
}

// ---------------------------------------------------------------------------
// Migrations for the new modules (2026).
// Uses CREATE TABLE IF NOT EXISTS and additive ALTER TABLE on SQLite to keep
// existing databases intact. Numeric values are stored as JSON strings via
// DataSync with TEXT columns to avoid float round-trip drift. Reads always
// parse Number() with explicit rounding performed by the calculator layer.
// ---------------------------------------------------------------------------

// Versioned tax parameters keyed by (tax_year, rule_key).
// value is stored as TEXT (JSON serialized) to preserve exact decimals.
db.exec(`
CREATE TABLE IF NOT EXISTS tax_parameters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tax_year INTEGER NOT NULL,
  rule_key TEXT NOT NULL,
  value TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'number',
  description TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tax_year, rule_key)
);
CREATE INDEX IF NOT EXISTS idx_tax_parameters_year ON tax_parameters(tax_year);
`);

// Traceability for tax rules consulted. No scraping; manual seeds only.
db.exec(`
CREATE TABLE IF NOT EXISTS tax_rule_sources (
  id TEXT PRIMARY KEY,
  rule_key TEXT NOT NULL,
  tax_year INTEGER NOT NULL,
  institution TEXT NOT NULL,
  title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  retrieved_at TEXT NOT NULL,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_tax_rule_sources_rule ON tax_rule_sources(rule_key, tax_year);
`);

// Fee receipts (boletas de honorarios). Hospitalizable per-year.
db.exec(`
CREATE TABLE IF NOT EXISTS fee_receipts (
  id TEXT PRIMARY KEY,
  tax_year INTEGER NOT NULL,
  issue_date TEXT NOT NULL,
  folio TEXT,
  client_name TEXT NOT NULL,
  client_tax_id TEXT,
  description TEXT,
  amount_input_type TEXT NOT NULL CHECK (amount_input_type IN ('GROSS','NET')),
  gross_amount TEXT NOT NULL,
  net_amount TEXT NOT NULL,
  withholding_mode TEXT NOT NULL CHECK (withholding_mode IN ('WITHHELD_BY_RECIPIENT','PPM_PAID_BY_ISSUER','NO_WITHHOLDING')),
  withholding_rate TEXT NOT NULL,
  withheld_amount TEXT NOT NULL,
  ppm_paid_amount TEXT NOT NULL,
  taxable INTEGER NOT NULL CHECK (taxable IN (0,1)),
  status TEXT NOT NULL CHECK (status IN ('ACTIVE','CANCELLED')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('PENDING','PAID')),
  payment_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_fee_receipts_tax_year ON fee_receipts(tax_year);
CREATE INDEX IF NOT EXISTS idx_fee_receipts_issue_date ON fee_receipts(issue_date);
CREATE INDEX IF NOT EXISTS idx_fee_receipts_client ON fee_receipts(client_name);
CREATE INDEX IF NOT EXISTS idx_fee_receipts_status ON fee_receipts(status);
CREATE INDEX IF NOT EXISTS idx_fee_receipts_payment_status ON fee_receipts(payment_status);
CREATE INDEX IF NOT EXISTS idx_fee_receipts_withholding_mode ON fee_receipts(withholding_mode);
`);

// Annual fee expense configuration (presumed vs. actual). One row per tax_year.
db.exec(`
CREATE TABLE IF NOT EXISTS fee_expense_settings (
  id TEXT PRIMARY KEY,
  tax_year INTEGER NOT NULL UNIQUE,
  expense_mode TEXT NOT NULL CHECK (expense_mode IN ('PRESUMED','ACTUAL')),
  actual_annual_expenses TEXT NOT NULL DEFAULT '0',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_fee_expense_settings_year ON fee_expense_settings(tax_year);
`);

// Mortgage loans (header). One row per loan/property.
db.exec(`
CREATE TABLE IF NOT EXISTS mortgage_loans (
  id TEXT PRIMARY KEY,
  tax_year INTEGER NOT NULL,
  institution_name TEXT NOT NULL,
  institution_tax_id TEXT,
  operation_number TEXT,
  property_alias TEXT NOT NULL,
  property_address TEXT,
  property_role TEXT,
  purpose TEXT NOT NULL CHECK (purpose IN ('PURCHASE','CONSTRUCTION','REFINANCING_ELIGIBLE_LOAN')),
  ownership_type TEXT NOT NULL CHECK (ownership_type IN ('SOLE_OWNER','CO_OWNERSHIP','SPOUSAL_COMMUNITY')),
  ownership_percentage TEXT NOT NULL,
  is_designated_beneficiary INTEGER NOT NULL CHECK (is_designated_beneficiary IN (0,1)),
  original_principal TEXT,
  outstanding_principal TEXT,
  monthly_payment TEXT,
  annual_interest_paid TEXT NOT NULL DEFAULT '0',
  annual_principal_paid TEXT,
  annual_insurance_paid TEXT,
  annual_other_charges TEXT,
  certificate_reference TEXT,
  certificate_date TEXT,
  eligible_for_article_55_bis INTEGER NOT NULL CHECK (eligible_for_article_55_bis IN (0,1)),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_mortgage_loans_tax_year ON mortgage_loans(tax_year);
CREATE INDEX IF NOT EXISTS idx_mortgage_loans_institution ON mortgage_loans(institution_name);
`);

// Annual records for mortgage loans: avoids overwriting historical interest.
db.exec(`
CREATE TABLE IF NOT EXISTS mortgage_annual_records (
  id TEXT PRIMARY KEY,
  mortgage_loan_id TEXT NOT NULL,
  tax_year INTEGER NOT NULL,
  interest_paid TEXT NOT NULL,
  principal_paid TEXT,
  insurance_paid TEXT,
  other_charges TEXT,
  certificate_reference TEXT,
  certificate_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mortgage_loan_id) REFERENCES mortgage_loans(id) ON DELETE CASCADE,
  UNIQUE(mortgage_loan_id, tax_year)
);
CREATE INDEX IF NOT EXISTS idx_mortgage_annual_records_loan ON mortgage_annual_records(mortgage_loan_id);
CREATE INDEX IF NOT EXISTS idx_mortgage_annual_records_year ON mortgage_annual_records(tax_year);
`);

// ---------------------------------------------------------------------------
// Seed outstanding data
// ---------------------------------------------------------------------------
const settingsCount = db.prepare('SELECT COUNT(*) AS count FROM settings').get().count;
if (!settingsCount) {
  db.prepare('INSERT INTO settings (id, data) VALUES (1, ?)').run(JSON.stringify(defaultSettings));
}

const insertReference = db.prepare(`
  INSERT INTO official_references (authority, title, url, applies_to)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(url) DO UPDATE SET authority=excluded.authority, title=excluded.title, applies_to=excluded.applies_to
`);
for (const ref of officialReferences) insertReference.run(ref.authority, ref.title, ref.url, ref.appliesTo);

// Seed tax parameters idempotently for every year present in TAX_PARAMETER_SEEDS.
const upsertParameter = db.prepare(`
  INSERT INTO tax_parameters (tax_year, rule_key, value, type, description)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(tax_year, rule_key) DO UPDATE SET
    value=excluded.value,
    type=excluded.type,
    description=excluded.description,
    updated_at=CURRENT_TIMESTAMP
`);
for (const [yearStr, seeds] of Object.entries(TAX_PARAMETER_SEEDS)) {
  const year = Number(yearStr);
  for (const s of seeds) upsertParameter.run(year, s.key, JSON.stringify(s.value), s.type, s.description || null);
}

// Seed tax_rule_sources for traceability (id is generated from rule key + year).
const upsertRuleSource = db.prepare(`
  INSERT INTO tax_rule_sources (id, rule_key, tax_year, institution, title, source_url, retrieved_at, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    institution=excluded.institution,
    title=excluded.title,
    source_url=excluded.source_url,
    retrieved_at=excluded.retrieved_at,
    notes=excluded.notes
`);
for (const s of TAX_RULE_SOURCES_SEEDS) {
  upsertRuleSource.run(`${s.ruleKey}-${s.taxYear}`, s.ruleKey, s.taxYear, s.institution, s.title, s.sourceUrl, s.retrievedAt, s.notes || null);
}

// ---------------------------------------------------------------------------
// Helpers shared by entity repositories
// ---------------------------------------------------------------------------
function parseRow(row) {
  if (!row) return null;
  return { id: row.id, ...JSON.parse(row.data), createdAt: row.created_at, updatedAt: row.updated_at };
}

export function getSettings() {
  const row = db.prepare('SELECT data FROM settings WHERE id = 1').get();
  return JSON.parse(row.data);
}

export function updateSettings(data) {
  db.prepare('UPDATE settings SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(JSON.stringify(data));
  return getSettings();
}

export function listIncomeSources(taxYear = null) {
  if (taxYear != null) {
    return db.prepare('SELECT * FROM income_sources WHERE tax_year = ? ORDER BY id').all(Number(taxYear)).map(parseRow);
  }
  return db.prepare('SELECT * FROM income_sources ORDER BY id').all().map(parseRow);
}

export function createIncomeSource(data) {
  const year = Number(data.taxYear) || defaultSettings.year;
  const result = db.prepare('INSERT INTO income_sources (name, kind, data, tax_year) VALUES (?, ?, ?, ?)')
    .run(data.name, data.kind, JSON.stringify({ ...data, taxYear: year }), year);
  return parseRow(db.prepare('SELECT * FROM income_sources WHERE id = ?').get(result.lastInsertRowid));
}

export function updateIncomeSource(id, data) {
  const year = Number(data.taxYear) || defaultSettings.year;
  const result = db.prepare(`
    UPDATE income_sources SET name = ?, kind = ?, data = ?, tax_year = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(data.name, data.kind, JSON.stringify({ ...data, taxYear: year }), year, id);
  if (!result.changes) return null;
  return parseRow(db.prepare('SELECT * FROM income_sources WHERE id = ?').get(id));
}

export function deleteIncomeSource(id) {
  return db.prepare('DELETE FROM income_sources WHERE id = ?').run(id).changes > 0;
}

export function copyIncomeSources(fromTaxYear, toTaxYear) {
  const from = Number(fromTaxYear);
  const to = Number(toTaxYear);
  if (from === to) return listIncomeSources(to);
  const destCount = db.prepare('SELECT COUNT(*) AS c FROM income_sources WHERE tax_year = ?').get(to).c;
  if (destCount > 0) return null;
  const rows = db.prepare('SELECT name, kind, data FROM income_sources WHERE tax_year = ?').all(from);
  const insert = db.prepare('INSERT INTO income_sources (name, kind, data, tax_year) VALUES (?, ?, ?, ?)');
  for (const r of rows) {
    const data = JSON.parse(r.data);
    delete data.id;
    data.taxYear = to;
    insert.run(r.name, r.kind, JSON.stringify(data), to);
  }
  return listIncomeSources(to);
}

export function listYears() {
  const rows = db.prepare(`
    SELECT DISTINCT tax_year AS y FROM (
      SELECT tax_year FROM fee_receipts
      UNION SELECT tax_year FROM mortgage_loans
      UNION SELECT tax_year FROM mortgage_annual_records
      UNION SELECT tax_year FROM income_sources
      UNION SELECT tax_year FROM fee_expense_settings
      UNION SELECT tax_year FROM tax_rule_sources
      UNION SELECT tax_year FROM tax_parameters
    ) WHERE tax_year IS NOT NULL
  `).all();
  const set = new Set(rows.map(r => Number(r.y)));
  set.add(Number(getSettings().year));
  return [...set].sort((a, b) => b - a);
}

export function createExecutionLog(entry) {
  const result = db.prepare('INSERT INTO execution_logs (kind, operation, status, message, audit_message, duration_ms) VALUES (?, ?, ?, ?, ?, ?)')
    .run(entry.kind, entry.operation, entry.status, entry.message || null, entry.auditMessage || null, Math.max(0, Number(entry.durationMs) || 0));
  return db.prepare('SELECT * FROM execution_logs WHERE id = ?').get(result.lastInsertRowid);
}

export function listExecutionLogs(filters = {}) {
  const where = [];
  const params = [];
  if (filters.kind && ['SYNC', 'ASYNC'].includes(filters.kind)) { where.push('kind = ?'); params.push(filters.kind); }
  if (filters.status && ['OK', 'ERROR'].includes(filters.status)) { where.push('status = ?'); params.push(filters.status); }
  if (filters.operation) { where.push('operation = ?'); params.push(filters.operation); }
  if (filters.q) { where.push('(message LIKE ? OR audit_message LIKE ? OR operation LIKE ?)'); params.push(`%${filters.q}%`, `%${filters.q}%`, `%${filters.q}%`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(200, Math.max(5, Number(filters.pageSize) || 20));
  const total = db.prepare(`SELECT COUNT(*) AS c FROM execution_logs ${whereSql}`).get(...params).c;
  const rows = db.prepare(`SELECT * FROM execution_logs ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`)
    .all(...params, pageSize, (page - 1) * pageSize);
  return {
    items: rows.map(r => ({ id: r.id, kind: r.kind, operation: r.operation, status: r.status, message: r.message, auditMessage: r.audit_message, durationMs: r.duration_ms, createdAt: r.created_at })),
    total: Number(total),
    page,
    pageSize
  };
}

export function listReferences() {
  return db.prepare('SELECT id, authority, title, url, applies_to AS appliesTo FROM official_references ORDER BY authority, title').all();
}

export function saveSnapshot(name, payload, result) {
  const saved = db.prepare('INSERT INTO simulation_snapshots (name, payload, result) VALUES (?, ?, ?)')
    .run(name, JSON.stringify(payload), JSON.stringify(result));
  return Number(saved.lastInsertRowid);
}

// ---------------------------------------------------------------------------
// Tax parameters (versioned per year)
// ---------------------------------------------------------------------------
export function listTaxParameters(taxYear) {
  const rows = db.prepare('SELECT rule_key, value, type, description, updated_at FROM tax_parameters WHERE tax_year = ? ORDER BY rule_key').all(Number(taxYear));
  return rows.map(r => ({ ruleKey: r.rule_key, value: JSON.parse(r.value), type: r.type, description: r.description, updatedAt: r.updated_at }));
}

export function getTaxParameter(taxYear, ruleKey) {
  const row = db.prepare('SELECT value FROM tax_parameters WHERE tax_year = ? AND rule_key = ?').get(Number(taxYear), ruleKey);
  return row ? JSON.parse(row.value) : null;
}

export function upsertTaxParameter(taxYear, ruleKey, value, type = 'number', description = null) {
  upsertParameter.run(Number(taxYear), ruleKey, JSON.stringify(value), type, description);
  return getTaxParameter(taxYear, ruleKey);
}

// Returns the tax parameters for the requested year merged with sensible
// fallbacks to year 2026 seeds. Used by all tax engines to avoid hardcoded rates.
export function resolveTaxParameters(taxYear) {
  const year = Number(taxYear) || defaultSettings.year;
  const rows = db.prepare('SELECT rule_key, value FROM tax_parameters WHERE tax_year = ?').all(year);
  const params = {};
  for (const r of rows) params[r.rule_key] = JSON.parse(r.value);
  // Fallback to 2026 seeds if a key is missing (e.g., user requested a year we did not seed).
  const fallback = TAX_PARAMETER_SEEDS[2026] || [];
  for (const s of fallback) {
    if (!(s.key in params)) params[s.key] = s.value;
  }
  return params;
}

export function listTaxRuleSources(ruleKey = null, taxYear = null) {
  const where = [];
  const args = [];
  if (ruleKey) { where.push('rule_key = ?'); args.push(ruleKey); }
  if (taxYear) { where.push('tax_year = ?'); args.push(Number(taxYear)); }
  const sql = where.length
    ? `SELECT id, rule_key, tax_year, institution, title, source_url, retrieved_at, notes FROM tax_rule_sources WHERE ${where.join(' AND ')} ORDER BY tax_year DESC, rule_key`
    : 'SELECT id, rule_key, tax_year, institution, title, source_url, retrieved_at, notes FROM tax_rule_sources ORDER BY tax_year DESC, rule_key';
  const rows = db.prepare(sql).all(...args);
  return rows.map(r => ({
    id: r.id, ruleKey: r.rule_key, taxYear: r.tax_year, institution: r.institution,
    title: r.title, sourceUrl: r.source_url, retrievedAt: r.retrieved_at, notes: r.notes
  }));
}

export function upsertTaxRuleSource(source) {
  const id = source.id || `${source.ruleKey}-${source.taxYear}`;
  upsertRuleSource.run(id, source.ruleKey, Number(source.taxYear), source.institution, source.title, source.sourceUrl, source.retrievedAt, source.notes || null);
  return listTaxRuleSources(source.ruleKey, source.taxYear).find(s => s.id === id);
}

export function deleteTaxRuleSource(id) {
  return db.prepare('DELETE FROM tax_rule_sources WHERE id = ?').run(id).changes > 0;
}
