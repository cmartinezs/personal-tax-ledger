# Fachadas de compatibilidad

Estado actualizado después de A.6-A.13. Una fachada se conserva solo si protege un consumidor real; no es una ubicación válida para agregar persistencia o lógica nueva.

| Fachada | Consumidores | Propósito | Condición de eliminación |
|---|---|---|---|
| `server/index.mjs` | scripts y consumidores históricos | Reexportar `@personal-tax-ledger/local-app` y permitir `node server/index.mjs`. | Cuando todos los consumidores usen `apps/local` directamente. |
| `server/lib/{calculator,fee-calculator,mortgage-calculator,calculation-explanation,defaults,tax-parameters,util}.mjs` | imports históricos y tests | Reexportar `@personal-tax-ledger/core`. | Cuando no queden imports fuera de core. |
| `apps/local/web/src/api.ts` | WorkspaceView | Cliente HTTP concreto del host local. | Permanece mientras exista este host. |

No quedan fachadas persistentes en `server/lib/database.mjs`, `server/lib/fee-receipts.mjs` ni `server/lib/mortgages.mjs`: la implementación vive en [`packages/sqlite-adapter`](../../packages/sqlite-adapter/README.md).
