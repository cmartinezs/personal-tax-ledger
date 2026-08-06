import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertIncomeRepositoryContract,
  assertSettingsRepositoryContract,
  assertExecutionLogRepositoryContract,
  assertFeeReceiptRepositoryContract,
  assertFeeExpenseSettingsRepositoryContract,
  assertMortgageRepositoryContract,
  assertMortgageAnnualRecordRepositoryContract,
  assertTaxParameterRepositoryContract,
  assertTaxRuleSourceRepositoryContract,
  assertWorkspaceContext,
  INCOME_REPOSITORY_METHODS,
  SETTINGS_REPOSITORY_METHODS,
  EXECUTION_LOG_REPOSITORY_METHODS,
  FEE_RECEIPT_REPOSITORY_METHODS,
  FEE_EXPENSE_SETTINGS_REPOSITORY_METHODS,
  MORTGAGE_REPOSITORY_METHODS,
  MORTGAGE_ANNUAL_RECORD_REPOSITORY_METHODS,
  TAX_PARAMETER_REPOSITORY_METHODS,
  TAX_RULE_SOURCE_REPOSITORY_METHODS,
  LOCAL_WORKSPACE_CONTEXT
} from '@personal-tax-ledger/contracts';

test('el contexto local cumple el contrato de propietario', () => {
  assert.deepEqual(assertWorkspaceContext(LOCAL_WORKSPACE_CONTEXT), { workspaceId: 'local-workspace', actorId: 'local-user' });
  assert.throws(() => assertWorkspaceContext({ workspaceId: 'local-workspace' }), /actorId/);
});

test('el contrato de repositorio de ingresos exige métodos por agregado', () => {
  const repository = Object.fromEntries(INCOME_REPOSITORY_METHODS.map(method => [method, () => null]));
  assert.equal(assertIncomeRepositoryContract(repository), repository);
  assert.throws(() => assertIncomeRepositoryContract({ list() {} }), /get/);
});

test('el contrato de repositorio de settings exige get/update, no reutiliza el de ingresos', () => {
  const repository = Object.fromEntries(SETTINGS_REPOSITORY_METHODS.map(method => [method, () => null]));
  assert.equal(assertSettingsRepositoryContract(repository), repository);
  assert.throws(() => assertSettingsRepositoryContract({ get() {} }), /update/);
  assert.throws(() => assertIncomeRepositoryContract(repository), /list/, 'el contrato de settings no debe satisfacer el de ingresos');
});

test('el contrato de repositorio de bitácora exige create/list', () => {
  const repository = Object.fromEntries(EXECUTION_LOG_REPOSITORY_METHODS.map(method => [method, () => null]));
  assert.equal(assertExecutionLogRepositoryContract(repository), repository);
  assert.throws(() => assertExecutionLogRepositoryContract({ create() {} }), /list/);
});

test('el contrato de repositorio de boletas exige list/get/create/update/remove/duplicate', () => {
  const repository = Object.fromEntries(FEE_RECEIPT_REPOSITORY_METHODS.map(method => [method, () => null]));
  assert.equal(assertFeeReceiptRepositoryContract(repository), repository);
  assert.throws(() => assertFeeReceiptRepositoryContract({ list() {} }), /get/);
});

test('el contrato de repositorio de gastos de honorarios exige list/get/upsert', () => {
  const repository = Object.fromEntries(FEE_EXPENSE_SETTINGS_REPOSITORY_METHODS.map(method => [method, () => null]));
  assert.equal(assertFeeExpenseSettingsRepositoryContract(repository), repository);
  assert.throws(() => assertFeeExpenseSettingsRepositoryContract({ list() {} }), /get/);
});

test('el contrato de repositorio de créditos hipotecarios exige list/get/create/update/remove', () => {
  const repository = Object.fromEntries(MORTGAGE_REPOSITORY_METHODS.map(method => [method, () => null]));
  assert.equal(assertMortgageRepositoryContract(repository), repository);
  assert.throws(() => assertMortgageRepositoryContract({ list() {} }), /get/);
});

test('el contrato de repositorio de registros anuales hipotecarios exige listByLoan/listByYear/get/create/update/remove', () => {
  const repository = Object.fromEntries(MORTGAGE_ANNUAL_RECORD_REPOSITORY_METHODS.map(method => [method, () => null]));
  assert.equal(assertMortgageAnnualRecordRepositoryContract(repository), repository);
  assert.throws(() => assertMortgageAnnualRecordRepositoryContract({ listByLoan() {} }), /listByYear/);
  assert.throws(() => assertMortgageRepositoryContract(repository), /list/, 'el contrato de annual records no debe satisfacer el de préstamos');
});

test('el contrato de repositorio de parámetros tributarios exige list/get/upsert', () => {
  const repository = Object.fromEntries(TAX_PARAMETER_REPOSITORY_METHODS.map(method => [method, () => null]));
  assert.equal(assertTaxParameterRepositoryContract(repository), repository);
  assert.throws(() => assertTaxParameterRepositoryContract({ list() {} }), /get/);
});

test('el contrato de repositorio de fuentes oficiales exige list/upsert/remove', () => {
  const repository = Object.fromEntries(TAX_RULE_SOURCE_REPOSITORY_METHODS.map(method => [method, () => null]));
  assert.equal(assertTaxRuleSourceRepositoryContract(repository), repository);
  assert.throws(() => assertTaxRuleSourceRepositoryContract({ list() {} }), /upsert/);
});
