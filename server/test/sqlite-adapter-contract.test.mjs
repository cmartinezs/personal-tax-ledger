import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { incomeSourceRepositoryContract } from '@personal-tax-ledger/contracts/testing';
import { createInMemoryIncomeRepository } from './fixtures/in-memory-income-repository.mjs';

const createLocalContext = () => ({ workspaceId: 'local-workspace', actorId: 'local-user' });

test('el adaptador SQLite satisface la suite de contract tests reutilizable contra una base temporal real', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'personal-tax-ledger-a06-'));
  process.env.DB_PATH = join(directory, 'adapter.sqlite');
  try {
    const { sqliteIncomeRepository } = await import('@personal-tax-ledger/sqlite-adapter');
    await incomeSourceRepositoryContract(async () => sqliteIncomeRepository, createLocalContext);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('un repositorio en memoria satisface la misma suite de contract tests', async () => {
  await incomeSourceRepositoryContract(
    async () => createInMemoryIncomeRepository(),
    createLocalContext
  );
});
