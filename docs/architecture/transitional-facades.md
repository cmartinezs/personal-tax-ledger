# Fachadas de compatibilidad

Estado actualizado después de A.6-A.13. Una fachada se conserva solo si protege un consumidor real; no es una ubicación válida para agregar persistencia o lógica nueva.

| Fachada | Consumidores | Propósito | Condición de eliminación |
|---|---|---|---|
| `server/index.mjs` | scripts y consumidores históricos | Reexportar `@personal-tax-ledger/local-app` y permitir `node server/index.mjs`. | Cuando todos los consumidores usen `apps/local` directamente. |
| `server/lib/{calculator,fee-calculator,mortgage-calculator,calculation-explanation,defaults,tax-parameters,util}.mjs` | imports históricos y tests | Reexportar `@personal-tax-ledger/core`. | Cuando no queden imports fuera de core. |
| `web/src/fee-receipts-module.tsx` y equivalentes históricos | imports externos antiguos | Reexportar el componente ahora ubicado en `web/src/features`. | Cuando se confirme que no hay consumidores externos. |
| `web/src/incomes-section.tsx` | integración y imports históricos | Reexportar el componente de `shared-ui`. | Cuando se eliminen imports históricos. |
| `web/src/api.ts` | features y WorkspaceView | Cliente HTTP local y punto de compatibilidad. | Cuando exista un cliente frontend compartido estable. |

No quedan fachadas persistentes en `server/lib/database.mjs`, `server/lib/fee-receipts.mjs` ni `server/lib/mortgages.mjs`: la implementación vive en [`packages/sqlite-adapter`](../../packages/sqlite-adapter/README.md).
