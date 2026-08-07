# Mapa de módulos

Este mapa indica dónde debe vivir cada responsabilidad. “Actual” identifica el código conectado; “fachada” identifica una ruta de compatibilidad que no debe convertirse en una nueva fuente de verdad.

| Responsabilidad | Implementación actual | Consumida por | Notas |
|---|---|---|---|
| Cálculo anual | `packages/core/src/calculator.mjs` | application, tests, server facades | Sin I/O. |
| Cálculo de honorarios | `packages/core/src/fee-calculator.mjs` | core, adapter de boletas, tests | Tasas vienen por parámetros. |
| Cálculo hipotecario | `packages/core/src/mortgage-calculator.mjs` | core, application, tests | Art. 55 bis. |
| Explicaciones | `packages/core/src/calculation-explanation.mjs` | calculator, UI | Estructura serializable. |
| Contratos de repositorio | `packages/contracts/src` | application, adapter, tests | Un contrato por agregado. |
| DTOs HTTP | `packages/api-contracts/src` | web, tests, consumidores externos | No contienen reglas de persistencia. |
| Casos de uso | `packages/application/src` | apps/local, tests, consumidores inyectables | Contexto explícito. |
| Conexión/migraciones | `packages/sqlite-adapter/src/database/database.mjs` | composition, repositories | Factory y cierre explícitos. |
| Persistencia de incomes/settings/logs | `packages/sqlite-adapter/src/database/database.mjs` | repositorios SQLite | SQL agrupado en la factory compartida. |
| Persistencia de boletas | `packages/sqlite-adapter/src/database/fee-receipts.mjs` | `fee-receipt-repository.mjs` | Incluye gastos anuales. |
| Persistencia hipotecaria | `packages/sqlite-adapter/src/database/mortgages.mjs` | repositorios hipotecarios | Incluye annual records y snapshot. |
| Catálogos y snapshots | `packages/sqlite-adapter/src/database/database.mjs` | repositorios de catálogos | Versionados cuando aplica. |
| Composition root | `apps/local/src/composition` | `create-local-app.mjs` | Único ensamblaje local. |
| HTTP | `apps/local/src/http` + `packages/http-api` | apps/local | Routers HTTP inyectables y host local. |
| Shell React | `apps/local/web/src/app` | `apps/local/web/src/main.tsx` | Providers, navegación y workspace. |
| Features React | `apps/local/web/src/features` | WorkspaceView | Componentes y services por módulo. |
| UI reutilizable | `packages/shared-ui/src` y `dist` | web, external-consumer | Props/callbacks, sin fetch. |

## Reglas de cambio

- Si cambias un cálculo, edita `packages/core` y sus tests.
- Si cambias la forma de un endpoint, edita `api-contracts`, cliente, router y tests.
- Si cambias SQL, edita el adapter y verifica compatibilidad con una base temporal.
- Si cambias un componente compartido, recompila `packages/shared-ui/dist`.
- Si agregas un módulo frontend, crea su carpeta y README siguiendo [`apps/local/web/src/features/README.md`](../../apps/local/web/src/features/README.md).
