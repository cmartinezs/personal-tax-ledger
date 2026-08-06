import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('App.tsx usa el income-service en vez de llamar la API de ingresos directamente', async () => {
  const source = await readFile('web/src/App.tsx', 'utf8');
  assert.match(source, /import\s*\{[^}]*incomeService[^}]*\}\s*from\s*'\.\/api'/);
  assert.match(source, /incomeService\.list\(/);
  assert.match(source, /incomeService\.create\(/);
  assert.match(source, /incomeService\.update\(/);
  assert.match(source, /incomeService\.remove\(/);
  assert.doesNotMatch(source, /api\.(?:listIncomes|createIncome|updateIncome|deleteIncome)\(/);
});
