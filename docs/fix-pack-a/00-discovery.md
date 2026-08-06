# 00 — Descubrimiento (Fase 0)

**Fecha**: 2026-08-06
**Commit base**: `824de61` (cierre de `pack-a5-fix`)
**Rama**: `master`
**Working tree**: limpio antes de empezar

## Comandos ejecutados

| Comando | Resultado |
|---|---|
| `git status --short` | limpio |
| `git log --oneline --decorate -30` | ok, historial revisado |
| `npm ci` | ✅ |
| `npm test` | ✅ 67/67 |
| `npm run architecture:check` | ✅ 7 paquetes internos, sin ciclos |
| `npm run build` | ✅ (ver `docs/gaps/2026-08-06-tsc-web.md` para el porqué ya no falla) |
| `npm run test --workspaces --if-present` | ✅ (0 tests por paquete, ver nota abajo) |
| `npm run build --workspaces --if-present` | ✅ (web + shared-ui) |
| `npm run pack:smoke` | ✅ |
| `npm run smoke:local` | ✅ |
| `npm run validate:pack-a` | **no existe** — no hay ningún script con ese nombre ni un alias equivalente de un solo comando. El equivalente actual es la combinación `architecture:check` + `pack:smoke` + `smoke:local` + `test:workspaces` + `build:packages`. |

## Mapa real de `server/index.mjs` (364 líneas)

Rutas HTTP actuales, agrupadas por agregado/responsabilidad:

| Agregado | Rutas | Backing actual | Pasa por caso de uso |
|---|---|---|---|
| Health | `GET /api/health` | `getSettings()` (database.mjs) | No |
| Bootstrap | `GET /api/bootstrap` | `getSettings`, `listIncomeSources`, `listReferences` | No |
| Years | `GET /api/years` | `listYears()` | No |
| Execution logs | `GET/POST /api/logs` | `listExecutionLogs`, `createExecutionLog` | No |
| Settings | `PUT /api/settings` | `updateSettings` | No |
| **Ingresos** | `GET/POST /api/incomes`, `POST /api/incomes/copy`, `PUT/DELETE /api/incomes/:id` | `apps/local` → `packages/application` → `packages/sqlite-adapter` | **Sí, salvo `copy`** (ver A07 abajo) |
| Tax parameters | `GET/PUT /api/tax-parameters` | `listTaxParameters`, `upsertTaxParameter` | No |
| Tax rule sources | `GET/POST /api/tax-rule-sources`, `DELETE /api/tax-rule-sources/:id` | `listTaxRuleSources`, `upsertTaxRuleSource`, `deleteTaxRuleSource` | No |
| Boletas (fee receipts) | `GET/POST /api/fee-receipts`, `GET/PUT/DELETE /api/fee-receipts/:id`, `POST /api/fee-receipts/:id/duplicate` | `server/lib/fee-receipts.mjs` | No |
| Gastos de honorarios | `GET/PUT /api/fee-expense-settings`, `GET /api/fee-expense-settings/:taxYear` | `server/lib/fee-receipts.mjs` | No |
| Hipotecario | `GET/POST /api/mortgages`, `GET/PUT/DELETE /api/mortgages/:id` | `server/lib/mortgages.mjs` | No |
| Registros anuales hipotecarios | `GET/POST /api/mortgages/:id/annual-records`, `PUT/DELETE /api/mortgage-annual-records/:id` | `server/lib/mortgages.mjs` | No |
| Simulación | `POST /api/simulate`, `/api/compare-apv`, `/api/scenarios`, `/api/article-55-bis`, `/api/fee-receipt-calc` | `packages/core` (puro) + `listIncomeSources`/`listTaxParameters` para defaults | No aplica (cálculo puro, no persistencia propia) |
| Snapshots | `POST /api/snapshots` | `saveSnapshot` | No |
| Estáticos | `GET /*` (catch-all) | `serveStatic` (filesystem) | No aplica |

**Hallazgo clave**: el patrón A05–A11 (contrato asíncrono + adaptador SQLite + caso de uso + router desacoplado) solo se aplicó al agregado de **ingresos**. Todos los demás agregados persistentes (boletas, gastos de honorarios, hipotecario, registros anuales, tax parameters, tax rule sources, execution logs, settings, snapshots, references, years) siguen accediendo a `server/lib/*.mjs` directamente desde `server/index.mjs`.

**A07 (ingresos)**: `copyIncomeSources` sigue siendo una función concreta de `server/lib/database.mjs`, inyectada directamente al router de ingresos (`server/index.mjs:155`), sin pasar por el caso de uso ni por el repositorio. No forma parte del contrato `IncomeSourceRepository`.

**A08**: consecuencia directa de lo anterior — el router de ingresos (`server/routes/incomes.mjs`) recibe `copyIncomeSources` como dependencia concreta de persistencia, no como caso de uso.

## Mapa de `server/lib/database.mjs` (430 líneas)

Contiene:

1. **Conexión y esquema**: `export const db = new DatabaseSync(...)` a nivel de módulo — se ejecuta al importarse (abre archivo, crea directorio, activa WAL, corre todas las migraciones). Esto es un efecto secundario de import para CUALQUIER módulo que importe `database.mjs`, incluido `server/index.mjs` (que lo necesita para arrancar) y `server/lib/fee-receipts.mjs`/`server/lib/mortgages.mjs` (que importan `db` directamente).
2. **Repositorios funcionales ya expuestos** (funciones sueltas, no clases/objetos): settings, income sources (ya migrado), years, execution logs, references, snapshots, tax parameters, tax rule sources.

**Decisión de alcance** (documentada para no repetir un refactor masivo no solicitado): no se reescribirá `database.mjs` como una factory inyectable de extremo a extremo en esta iteración — sería un cambio de altísimo riesgo que toca el archivo más central del backend y once tablas. En su lugar, cada nuevo repositorio de `packages/sqlite-adapter` seguirá el patrón ya probado en A11 (`import()` dinámico y memoizado dentro de cada método async, nunca en el top-level del módulo), que ya demostró satisfacer el requisito "importar el paquete no crea la base" sin tocar `database.mjs`. Esto se documenta explícitamente como una decisión, no un olvido.

## Mapa de `server/lib/fee-receipts.mjs` (226 líneas) y `server/lib/mortgages.mjs` (279 líneas)

Ambos módulos:

- importan `db` directamente desde `database.mjs` (top-level, efecto secundario de import ya existente hoy, independientemente de esta migración);
- contienen su propia validación/normalización (`sanitizeFeeReceiptInput`, `sanitizeMortgageInput`, `sanitizeAnnualRecordInput`) — equivalente a lo que en ingresos se separó entre `api-contracts` (forma) y `server/index.mjs` (transporte);
- `fee-receipts.mjs` además recalcula montos (`recomputeAmounts`) leyendo `tax_parameters` directamente — mezcla persistencia + cálculo, debe convertirse en una coordinación explícita del caso de uso entre el repositorio de boletas y el repositorio/lectura de parámetros tributarios;
- `mortgages.mjs` sincroniza el registro anual con el "snapshot" del préstamo (`syncLoanAnnualSnapshot`) — lógica de coordinación entre dos tablas que pertenece al caso de uso, no al adaptador puro.

## Mapa del frontend

- `web/src/App.tsx` (568 líneas): composition root real de React. Ya delega ingresos en `incomeService`/`IncomesSection`. El resto de las pestañas (dashboard, boletas, hipotecario, APV, escenarios, configuración, fuentes, bitácora) siguen viviendo aquí como estado y lógica de orquestación (fetch inicial, cambio de año, guardado de settings), aunque la presentación de cada módulo ya está extraída a componentes propios.
- `web/src/{fee-receipts,mortgages,scenarios,sources,logs}-module.tsx`: ya son componentes separados por sección (buena noticia: la extracción de componentes ya existe), pero cada uno importa `api` (el objeto global de `web/src/api.ts`) directamente en vez de un servicio inyectado con tipos de `api-contracts`. Ninguno vive en `packages/shared-ui`.
- `web/src/api.ts`: ya usa `@personal-tax-ledger/api-contracts` para el DTO de ingresos; el resto de los métodos usan tipos locales de `web/src/types.ts`.

## Paquetes internos existentes

`packages/core`, `packages/contracts` (+ `./testing`), `packages/api-contracts`, `packages/application`, `packages/sqlite-adapter`, `packages/shared-ui` (con build a `dist/`), `apps/local`. Todos ya pasan `architecture:check` (sin ciclos, `core`/`contracts` sin dependencias internas).

## Plan de commits (ajustado tras el descubrimiento)

Dado el tamaño real del trabajo pendiente (10+ agregados con contrato + adaptador + caso de uso + router + DTO + servicio frontend + tests cada uno, más la modularización completa de `server/index.mjs`, la reducción de `App.tsx` y la expansión de `shared-ui`), se prioriza así, un documento de plan en `docs/fix-pack-a/NN-*.md` antes de cada paso y un commit por paso:

1. `docs/fix-pack-a/01-a07-a08-income-copy.md` → mover `copyIncomeSources` al caso de uso/repositorio de ingresos.
2. `docs/fix-pack-a/02-settings-aggregate.md` → `SettingsRepository` (agregado simple, singleton).
3. `docs/fix-pack-a/03-execution-logs-aggregate.md` → `ExecutionLogRepository` (append + lectura paginada).
4. `docs/fix-pack-a/04-fee-receipts-aggregate.md` → `FeeReceiptRepository` + `FeeExpenseSettingsRepository`.
5. `docs/fix-pack-a/05-mortgages-aggregate.md` → `MortgageRepository` + `MortgageAnnualRecordRepository`.
6. `docs/fix-pack-a/06-tax-catalog-aggregates.md` → `TaxParameterRepository` + `TaxRuleSourceRepository` (catálogos globales, sin `WorkspaceContext`).
7. `docs/fix-pack-a/07-references-snapshots-years.md` → referencias oficiales, snapshots, años disponibles.
8. `docs/fix-pack-a/08-http-modularization.md` → extraer un router por agregado desde `server/index.mjs`, catálogo de rutas.
9. `docs/fix-pack-a/09-local-composition-root.md` → `apps/local/src/main.mjs` real, señales `SIGINT`/`SIGTERM`, `server/index.mjs` como fachada mínima.
10. `docs/fix-pack-a/10-frontend-services.md` → servicios frontend por módulo, reducción de `App.tsx`.
11. `docs/fix-pack-a/11-shared-ui-expansion.md` → secciones adicionales reutilizables en `shared-ui`.
12. `docs/fix-pack-a/12-packages-policy.md` → decisión de superficie pública para `application`, exports, changelog.
13. `docs/fix-pack-a/13-ci-and-docs.md` → CI, `pack-a-completion-matrix.md`, `http-route-catalog.md`, `transitional-facades.md`.
14. `docs/fix-pack-a/14-final-report.md` → informe final y veredicto.

Cada paso se verifica con `npm test`, `npm run architecture:check`, `vite build`, y `curl` cuando toque la API, antes de comitear. La matriz `docs/architecture/pack-a-completion-matrix.md` se actualiza en cada paso.

## Advertencia honesta sobre el alcance

El pedido original describe una Definition of Done con ~10 agregados completos de punta a punta (contrato, adaptador, caso de uso, router, DTO, servicio frontend, UI compartida, tests) más la eliminación del composition root legacy y la reducción completa de `App.tsx`. Esto es, en la práctica, equivalente a una reescritura completa de la capa de persistencia y presentación del backend/frontend. Se ejecutará tanta profundidad como sea razonablemente posible en esta sesión, priorizando los ítems de mayor apalancamiento (A07/A08, un segundo y tercer agregado completos para demostrar el patrón, modularización HTTP, composition root real). El informe final (`docs/fix-pack-a/14-final-report.md`) declarará honestamente `PACK_A_COMPLETE`, `PACK_A_PARTIAL` o `PACK_A_BLOCKED` según la evidencia real acumulada, sin inflar el veredicto.

## Hallazgos menores encontrados durante la ejecución (no corregidos, fuera de alcance)

- **`POST /api/logs` devuelve columnas crudas de SQLite** (`audit_message`,
  `duration_ms`, `created_at`), mientras que `GET /api/logs` devuelve el
  mismo registro mapeado a camelCase (`auditMessage`, `durationMs`,
  `createdAt`). Es un bug preexistente de `server/lib/database.mjs`
  (`createExecutionLog` retorna la fila cruda de `db.prepare(...).get()`
  sin pasar por el mismo mapeo que `listExecutionLogs`), confirmado
  también en el commit `824de61` (previo a esta sesión). No se corrige
  aquí para no alterar el contrato observable sin que se pida
  explícitamente; documentado como gap de prioridad baja para cuando se
  defina el DTO de `ExecutionLogRepository` en `api-contracts`.
