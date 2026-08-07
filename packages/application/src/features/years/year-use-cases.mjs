import { assertYearRepositoryContract } from '@personal-tax-ledger/contracts';

export function createYearUseCases({ repository }) { assertYearRepositoryContract(repository); return { async listYears() { return repository.list(); } }; }
