import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('las features A9 tienen entrypoints y servicios reales', async () => {
  const files = [
    ['web/src/features/fee-receipts/FeeReceiptsModule.tsx', 'FeeReceiptsModule'],
    ['web/src/features/mortgages/MortgagesModule.tsx', 'MortgagesModule'],
    ['web/src/features/scenarios/ScenariosModule.tsx', 'ScenariosModule'],
    ['web/src/features/sources/SourcesModule.tsx', 'SourcesModule'],
    ['web/src/features/logs/LogsModule.tsx', 'LogsModule']
  ];
  for (const [path, marker] of files) assert.match(await readFile(path, 'utf8'), new RegExp(marker));
  const app = await readFile('web/src/app/WorkspaceView.tsx', 'utf8');
  assert.match(app, /features\/fee-receipts\/FeeReceiptsModule/);
  assert.match(app, /features\/mortgages\/MortgagesModule/);
  assert.match(app, /features\/scenarios\/ScenariosModule/);
  assert.match(app, /features\/sources\/SourcesModule/);
  assert.match(app, /features\/logs\/LogsModule/);
  for (const path of ['web/src/features/fee-receipts/service.ts', 'web/src/features/mortgages/service.ts', 'web/src/features/scenarios/service.ts', 'web/src/features/settings/service.ts', 'web/src/features/sources/service.ts', 'web/src/features/logs/service.ts', 'web/src/features/bootstrap/service.ts']) {
    assert.match(await readFile(path, 'utf8'), /client/);
  }
});
