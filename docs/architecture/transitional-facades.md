# Fachadas transitorias

Estado al 2026-08-06.

| Archivo | Propósito | Consumidores | Razón para conservar | Condición de eliminación | Estado |
|---|---|---|---|---|---|
| `server/index.mjs` | Entry point HTTP compatible; crea el servidor y expone `startServer`/`stopServer`. | `apps/local/src/main.mjs`, `dev:api`, tests HTTP. | Mantener `npm run dev:api` y la compatibilidad del entrypoint durante la migración del lifecycle. | Extraer la factory HTTP a `apps/local/src/http-server.mjs` y cambiar consumidores a esa factory. | TRANSITIONAL |
| `server/lib/database.mjs` | Implementación SQLite existente, esquema, migraciones y funciones legacy. | Cálculos/lecturas restantes y adaptadores diferidos. | No reescribir migraciones aplicadas ni arriesgar la base existente. | Migrar todos los agregados restantes a un factory SQLite único con cierre explícito y tests de compatibilidad. | TRANSITIONAL |
| `server/lib/fee-receipts.mjs` | Persistencia y normalización legacy de boletas. | `sqlite-adapter` vía import dinámico. | Preservar cálculo de montos y comportamiento mientras se separan DTOs y parámetros tributarios. | Mover SQL/normalización a repositorios del adaptador y casos de uso sin consumidores legacy. | TRANSITIONAL |
| `server/lib/mortgages.mjs` | Persistencia legacy de préstamos y registros anuales. | `sqlite-adapter` vía import dinámico. | Preservar `syncLoanAnnualSnapshot` y compatibilidad histórica. | Migrar coordinación padre/hijo a un transaction manager del adaptador/caso de uso. | TRANSITIONAL |
| `server/lib/{calculator,fee-calculator,mortgage-calculator,...}.mjs` | Reexports hacia `packages/core`. | Tests y módulos legacy. | Mantener imports históricos sin duplicar cálculos. | Eliminar cuando no haya consumidores fuera de `packages/core` y `server/index.mjs`. | TRANSITIONAL |
| `web/src/incomes-section.tsx` | Reexport local de `IncomesSection`. | `web/src/App.tsx`. | Evitar cambiar la ruta de import del frontend mientras `shared-ui` se consolida. | Importar desde `@personal-tax-ledger/shared-ui` directamente y eliminar la fachada. | TRANSITIONAL |
| `web/src/api.ts` | Cliente HTTP local y fachada de servicios. | `web/src/services.ts`, `App.tsx` y módulos migrados. | Centraliza `fetch` y conserva errores HTTP mientras cada módulo adopta servicios propios. | Extraer cliente HTTP a un paquete/servicio de aplicación frontend y eliminar el objeto monolítico `api`. | TRANSITIONAL |

No se registran como fachadas los routers de `server/routes`: son módulos
activos de transporte, no reexports de compatibilidad.
