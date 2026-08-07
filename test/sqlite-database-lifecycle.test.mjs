import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createSqliteDatabase } from '@personal-tax-ledger/sqlite-adapter';

test('la factory SQLite usa un path inyectable, migra y cierra la conexión', () => {
  const directory = mkdtempSync(join(tmpdir(), 'personal-tax-ledger-a71-'));
  const path = join(directory, 'database.sqlite');
  try {
    assert.equal(existsSync(path), false);
    const database = createSqliteDatabase({ path });
    assert.equal(database.path, path);
    assert.equal(database.db.prepare('PRAGMA journal_mode').get().journal_mode, 'wal');
    assert.equal(database.db.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
    assert.equal(database.getSettings().year, 2026);
    assert.ok(database.db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tax_parameters'").get());
    database.close();
    database.close();
    assert.throws(() => database.db.prepare('SELECT 1').get());
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('importar el adapter no crea una base ni abre una conexión global', () => {
  const directory = mkdtempSync(join(tmpdir(), 'personal-tax-ledger-a71-import-'));
  const path = join(directory, 'not-created.sqlite');
  try {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', "await import('@personal-tax-ledger/sqlite-adapter')"], {
      cwd: process.cwd(),
      env: { ...process.env, DB_PATH: path },
      encoding: 'utf8'
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(existsSync(path), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
