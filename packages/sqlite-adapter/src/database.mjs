// server/lib/database.mjs opens (and migrates) the SQLite file as a side
// effect of being imported. Every repository in this package imports it
// dynamically, only the first time one of its methods actually runs, so
// merely importing @personal-tax-ledger/sqlite-adapter (or
// @personal-tax-ledger/local-app, which imports it) never touches the real
// database. See docs/gaps/migration-fails.md, hallazgo 2.
let modulePromise;

export async function resolveDatabaseModule() {
  modulePromise ??= import('../../../server/lib/database.mjs');
  return modulePromise;
}
