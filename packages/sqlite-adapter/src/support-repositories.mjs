import { assertReferenceRepositoryContract, assertYearRepositoryContract, assertSnapshotRepositoryContract } from '@personal-tax-ledger/contracts';
import { resolveDatabaseModule } from './database.mjs';

export function createSqliteReferenceRepository(delegate) {
  async function resolveDelegate() { return delegate || resolveDatabaseModule(); }
  return assertReferenceRepositoryContract({
    async list() { const { listReferences } = await resolveDelegate(); return listReferences(); }
  });
}

export function createSqliteYearRepository(delegate) {
  async function resolveDelegate() { return delegate || resolveDatabaseModule(); }
  return assertYearRepositoryContract({
    async list() { const { listYears } = await resolveDelegate(); return listYears(); }
  });
}

export function createSqliteSnapshotRepository(delegate) {
  async function resolveDelegate() { return delegate || resolveDatabaseModule(); }
  return assertSnapshotRepositoryContract({
    async create(name, payload, result) { const { saveSnapshot } = await resolveDelegate(); return saveSnapshot(name, payload, result); }
  });
}