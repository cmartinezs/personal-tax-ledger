import { assertSnapshotRepositoryContract } from '@personal-tax-ledger/contracts';

export function createSnapshotUseCases({ repository }) { assertSnapshotRepositoryContract(repository); return { async saveSnapshot(name, payload, result) { return repository.create(name, payload, result); } }; }
