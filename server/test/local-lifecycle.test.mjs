import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

test('apps/local main arranca y cierra limpiamente ante SIGTERM', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'personal-tax-ledger-lifecycle-'));
  const port = 3912;
  const child = spawn(process.execPath, ['apps/local/src/main.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port), DB_PATH: join(directory, 'lifecycle.sqlite') },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  try {
    const started = Date.now();
    while (Date.now() - started < 10_000) {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/api/health`);
        if (response.ok) break;
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    child.kill('SIGTERM');
    const exit = await new Promise(resolve => child.once('exit', (code, signal) => resolve({ code, signal })));
    assert.equal(exit.code, 0);
    assert.equal(exit.signal, null);
  } finally {
    child.kill('SIGKILL');
    await rm(directory, { recursive: true, force: true });
  }
});
