// Versioned tax parameters per commercial year.
// Values are seeded from official SII/Superintendencia sources for tax year 2026.
// Each rule key is stored as a separate row so it can be edited without overwriting history.
// See TAX_RULE_SOURCES in ./official-sources.mjs for traceability.

export const TAX_PARAMETER_KEYS = {
  FEE_WITHHOLDING_RATE: 'fee_withholding_rate',
  FEE_PRESUMED_EXPENSE_RATE: 'fee_presumed_expense_rate',
  FEE_PRESUMED_EXPENSE_MAX_UTA: 'fee_presumed_expense_max_uta',
  MORTGAGE_INTEREST_MAX_UTA: 'mortgage_interest_max_uta',
  MORTGAGE_FULL_BENEFIT_INCOME_MAX_UTA: 'mortgage_full_benefit_income_max_uta',
  MORTGAGE_PARTIAL_BENEFIT_INCOME_MAX_UTA: 'mortgage_partial_benefit_income_max_uta',
  MORTGAGE_PARTIAL_FORMULA_CONSTANT: 'mortgage_partial_formula_constant',
  MORTGAGE_PARTIAL_FORMULA_FACTOR: 'mortgage_partial_formula_factor'
};

// Seed values per tax year. Numeric values are stored as TEXT in SQLite via JSON encoding
// to avoid float drift; we always parse back through Number() and then round explicitly.
export const TAX_PARAMETER_SEEDS = {
  2026: [
    { key: TAX_PARAMETER_KEYS.FEE_WITHHOLDING_RATE, value: 0.1525, type: 'number', description: 'Tasa de retención de honorarios del SII para el año comercial 2026.' },
    { key: TAX_PARAMETER_KEYS.FEE_PRESUMED_EXPENSE_RATE, value: 0.30, type: 'number', description: 'Gasto presunto aplicable a rentas de honorarios (art. 50 N°1 LIR).' },
    { key: TAX_PARAMETER_KEYS.FEE_PRESUMED_EXPENSE_MAX_UTA, value: 15, type: 'number', description: 'Tope anual del gasto presunto de honorarios expresado en UTA.' },
    { key: TAX_PARAMETER_KEYS.MORTGAGE_INTEREST_MAX_UTA, value: 8, type: 'number', description: 'Tope de intereses deducibles del art. 55 bis LIR, expresado en UTA.' },
    { key: TAX_PARAMETER_KEYS.MORTGAGE_FULL_BENEFIT_INCOME_MAX_UTA, value: 90, type: 'number', description: 'Renta anual (en UTA) por debajo de la cual el art. 55 bis aplica 100% de rebaja.' },
    { key: TAX_PARAMETER_KEYS.MORTGAGE_PARTIAL_BENEFIT_INCOME_MAX_UTA, value: 150, type: 'number', description: 'Renta anual (en UTA). Sobre este tramo el art. 55 bis NO aplica rebaja.' },
    { key: TAX_PARAMETER_KEYS.MORTGAGE_PARTIAL_FORMULA_CONSTANT, value: 250, type: 'number', description: 'Constante de la fórmula del tramo 90-150 UTA del art. 55 bis.' },
    { key: TAX_PARAMETER_KEYS.MORTGAGE_PARTIAL_FORMULA_FACTOR, value: 1.667, type: 'number', description: 'Factor por UTA de la fórmula del tramo 90-150 UTA del art. 55 bis.' }
  ]
};

// Common defaults shared across years. Override per year if a value changes.
export function defaultTaxParameters(taxYear) {
  const year = Number(taxYear);
  const seed = TAX_PARAMETER_SEEDS[year] || TAX_PARAMETER_SEEDS[2026];
  const params = {};
  for (const row of seed) params[row.key] = row.value;
  return params;
}
