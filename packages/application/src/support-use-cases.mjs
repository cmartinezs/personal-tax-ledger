import { assertReferenceRepositoryContract, assertYearRepositoryContract, assertSnapshotRepositoryContract } from '@personal-tax-ledger/contracts';

export function createReferenceUseCases({ repository }) { assertReferenceRepositoryContract(repository); return { async listReferences() { return repository.list(); } }; }
export function createYearUseCases({ repository }) { assertYearRepositoryContract(repository); return { async listYears() { return repository.list(); } }; }
export function createSnapshotUseCases({ repository }) { assertSnapshotRepositoryContract(repository); return { async saveSnapshot(name, payload, result) { return repository.create(name, payload, result); } }; }