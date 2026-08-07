import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Estos tests son una red estática complementaria (detectan rápido si
// App.tsx deja de usar el servicio/componente compartido). La cobertura
// real del comportamiento de income-service vive en
// test/income-service.test.mjs.
test('App.tsx usa el income-service en vez de llamar la API de ingresos directamente', async () => {
  const source = await readFile('web/src/app/WorkspaceView.tsx', 'utf8');
  assert.match(source, /import\s*\{[^}]*incomeService[^}]*\}\s*from\s*'\.\.\/api'/);
  assert.match(source, /incomeService\.list\(/);
  assert.match(source, /incomeService\.create\(/);
  assert.match(source, /incomeService\.update\(/);
  assert.match(source, /incomeService\.remove\(/);
  assert.doesNotMatch(source, /api\.(?:listIncomes|createIncome|updateIncome|deleteIncome)\(/);
});

test('WorkspaceView renderiza la sección de ingresos compartida de shared-ui', async () => {
  const source = await readFile('web/src/app/WorkspaceView.tsx', 'utf8');
  assert.match(source, /import\s*\{\s*IncomesSection\s*\}\s*from\s*'\.\.\/features\/incomes\/IncomesSection'/);
  assert.match(source, /<IncomesSection\b/);
  const facade = await readFile('web/src/incomes-section.tsx', 'utf8');
  assert.match(facade, /@personal-tax-ledger\/shared-ui/);
});
