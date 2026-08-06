import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('los módulos frontend usan servicios por módulo y no importan api directamente', async () => {
  for (const file of ['fee-receipts-module.tsx', 'mortgages-module.tsx', 'scenarios-module.tsx', 'sources-module.tsx', 'logs-module.tsx']) {
    const source = await readFile(`web/src/${file}`, 'utf8');
    assert.doesNotMatch(source, /import\s+\{[^}]*api[^}]*\}\s+from\s+'\.\/api'/, `${file} no debe importar api directamente`);
  }
});

test('los servicios frontend exponen factories inyectables por módulo', async () => {
  const source = await readFile('web/src/services.ts', 'utf8');
  for (const factory of ['createFeeReceiptService', 'createMortgageService', 'createScenarioService', 'createSourceService', 'createExecutionLogService']) {
    assert.match(source, new RegExp(`${factory}\\(client = api\\)`));
  }
});
