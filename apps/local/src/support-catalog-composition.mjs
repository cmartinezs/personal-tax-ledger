import { createReferenceUseCases, createYearUseCases, createSnapshotUseCases } from '@personal-tax-ledger/application';
import { createSqliteReferenceRepository, createSqliteYearRepository, createSqliteSnapshotRepository } from '@personal-tax-ledger/sqlite-adapter';
import { createReferenceRouter, createYearRouter, createSnapshotRouter } from '../../../server/routes/support-catalogs.mjs';

export function createSupportCatalogComposition(dependencies) {
  const referenceRepository = dependencies?.referenceRepository || createSqliteReferenceRepository();
  const yearRepository = dependencies?.yearRepository || createSqliteYearRepository();
  const snapshotRepository = dependencies?.snapshotRepository || createSqliteSnapshotRepository();
  return {
    referenceUseCases: createReferenceUseCases({ repository: referenceRepository }),
    yearUseCases: createYearUseCases({ repository: yearRepository }),
    snapshotUseCases: createSnapshotUseCases({ repository: snapshotRepository }),
    createReferenceRouter: ({ json }) => createReferenceRouter({ useCases: createReferenceUseCases({ repository: referenceRepository }), json }),
    createYearRouter: ({ json }) => createYearRouter({ useCases: createYearUseCases({ repository: yearRepository }), json }),
    createSnapshotRouter: (deps) => createSnapshotRouter({ ...deps, useCases: createSnapshotUseCases({ repository: snapshotRepository }) })
  };
}