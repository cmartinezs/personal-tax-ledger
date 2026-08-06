// server/lib/mortgages.mjs imports `db` from database.mjs at its own top
// level, so importing it eagerly would cascade into the same
// import-time side effect this package avoids for every other
// repository. Deferring the import until a method actually runs keeps
// the same guarantee (see packages/sqlite-adapter/src/database.mjs).
// Shared by mortgage-repository.mjs and mortgage-annual-record-repository.mjs,
// which both wrap this same file.
let modulePromise;

export async function resolveMortgagesModule() {
  modulePromise ??= import('../../../server/lib/mortgages.mjs');
  return modulePromise;
}
