import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

test('el adaptador SQLite satisface el contrato contra una base temporal real', () => {
  const directory = mkdtempSync(join(tmpdir(), 'personal-tax-ledger-a06-'));
  const script = `
    import { sqliteIncomeRepository } from '@personal-tax-ledger/sqlite-adapter';
    const context = { workspaceId: 'local-workspace', actorId: 'local-user' };
    const input = { name: 'Fixture SQLite', kind: 'SALARY', amount: 123, taxYear: 2026 };
    const created = sqliteIncomeRepository.create(context, input);
    if (created.name !== input.name || created.amount !== input.amount) process.exit(2);
    if (sqliteIncomeRepository.get(context, created.id)?.id !== created.id) process.exit(3);
    if (sqliteIncomeRepository.list(context, 2026).length !== 1) process.exit(4);
    if (!sqliteIncomeRepository.remove(context, created.id)) process.exit(5);
    if (sqliteIncomeRepository.get(context, created.id) !== null) process.exit(6);
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: process.cwd(),
    env: { ...process.env, DB_PATH: join(directory, 'adapter.sqlite') },
    encoding: 'utf8'
  });
  rmSync(directory, { recursive: true, force: true });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
