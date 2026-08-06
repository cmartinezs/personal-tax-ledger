import { assertReferenceRepositoryContract, assertYearRepositoryContract, assertSnapshotRepositoryContract } from '@personal-tax-ledger/contracts';
import { createSqliteDatabase } from './database/database.mjs';

export function createSqliteReferenceRepository(delegate, database) {
  let resolved;
  async function resolveDelegate() { return delegate || database || (resolved ??= createSqliteDatabase()); }
  return assertReferenceRepositoryContract({
    async list() { const { listReferences } = await resolveDelegate(); return listReferences(); }
  });
}

export function createSqliteYearRepository(delegate, database) {
  let resolved;
  async function resolveDelegate() { return delegate || database || (resolved ??= createSqliteDatabase()); }
  return assertYearRepositoryContract({
    async list() { const { listYears } = await resolveDelegate(); return listYears(); }
  });
}

export function createSqliteSnapshotRepository(delegate, database) {
  let resolved;
  async function resolveDelegate() { return delegate || database || (resolved ??= createSqliteDatabase()); }
  return assertSnapshotRepositoryContract({
    async create(name, payload, result) { const { saveSnapshot } = await resolveDelegate(); return saveSnapshot(name, payload, result); }
  });
}
