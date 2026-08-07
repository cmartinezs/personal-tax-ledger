import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('las features A9 tienen entrypoints y servicios reales', async () => {
  const files = [
    ['apps/local/web/src/features/fee-receipts/FeeReceiptsModule.tsx', 'FeeReceiptsModule'],
    ['apps/local/web/src/features/mortgages/MortgagesModule.tsx', 'MortgagesModule'],
    ['apps/local/web/src/features/scenarios/ScenariosModule.tsx', 'ScenariosModule'],
    ['apps/local/web/src/features/sources/SourcesModule.tsx', 'SourcesModule'],
    ['apps/local/web/src/features/logs/LogsModule.tsx', 'LogsModule']
  ];
  for (const [path, marker] of files) assert.match(await readFile(path, 'utf8'), new RegExp(marker));
  const app = await readFile('apps/local/web/src/app/WorkspaceView.tsx', 'utf8');
  assert.match(app, /features\/fee-receipts\/FeeReceiptsModule/);
  assert.match(app, /features\/mortgages\/MortgagesModule/);
  assert.match(app, /features\/scenarios\/ScenariosModule/);
  assert.match(app, /features\/sources\/SourcesModule/);
  assert.match(app, /features\/logs\/LogsModule/);
  for (const path of ['apps/local/web/src/features/fee-receipts/service.ts', 'apps/local/web/src/features/mortgages/service.ts', 'apps/local/web/src/features/scenarios/service.ts', 'apps/local/web/src/features/settings/service.ts', 'apps/local/web/src/features/sources/service.ts', 'apps/local/web/src/features/logs/service.ts', 'apps/local/web/src/features/bootstrap/service.ts']) {
    assert.match(await readFile(path, 'utf8'), /client/);
  }
});
