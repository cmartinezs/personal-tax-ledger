import { startServer } from '@personal-tax-ledger/local-app';

export { createLocalApp, createLocalComposition, startServer, stopServer } from '@personal-tax-ledger/local-app';

const isMain = process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url;
if (isMain) await startServer();
