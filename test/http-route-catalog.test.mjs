import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('apps/local registra los routers modulares de todas las rutas migradas', async () => {
  const source = await readFile('apps/local/src/http/router.mjs', 'utf8');
  for (const router of ['routeSystem', 'routeYears', 'routeExecutionLogs', 'routeSettings', 'routeIncomes', 'routeTaxParameters', 'routeTaxRuleSources', 'routeFeeReceipts', 'routeFeeExpenseSettings', 'routeMortgages', 'routeSimulation', 'routeSnapshots']) {
    assert.match(source, new RegExp(`await ${router}\\(`), `${router} debe estar conectado al servidor`);
  }
  assert.doesNotMatch(source, /repo\.(?:listMortgageLoans|createMortgageLoan|listFeeReceipts|createFeeReceipt)\(/);
  assert.doesNotMatch(source, /path === '\/api\/(?:simulate|compare-apv|scenarios|article-55-bis|fee-receipt-calc)'/);
});
