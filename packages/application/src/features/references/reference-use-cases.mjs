import { assertReferenceRepositoryContract } from '@personal-tax-ledger/contracts';

export function createReferenceUseCases({ repository }) { assertReferenceRepositoryContract(repository); return { async listReferences() { return repository.list(); } }; }
