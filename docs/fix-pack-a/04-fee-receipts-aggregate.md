# 04 — Fee Receipts + Fee Expense Settings

## Objetivo

Cuarto y quinto agregado. El primero con lógica de negocio real más
allá de CRUD simple (recalcula montos leyendo la tasa de retención
vigente, duplicar, transición de estado).

## Alcance

- `packages/contracts/src/fee-receipt.mjs`:
  `FEE_RECEIPT_REPOSITORY_METHODS = ['list','get','create','update','remove','duplicate']`,
  `assertFeeReceiptRepositoryContract`.
- `packages/contracts/src/fee-expense-settings.mjs`:
  `FEE_EXPENSE_SETTINGS_REPOSITORY_METHODS = ['list','get','upsert']`,
  `assertFeeExpenseSettingsRepositoryContract`.
- `packages/sqlite-adapter/src/fee-receipt-repository.mjs` +
  `fee-expense-settings-repository.mjs`: envuelven
  `server/lib/fee-receipts.mjs` (que a su vez sigue usando `db`
  directamente — no se toca ese archivo, solo se importa de forma
  diferida desde el adaptador, igual que `database.mjs`).
- `packages/application/src/fee-receipt-use-cases.mjs` +
  `fee-expense-settings-use-cases.mjs`: coordinan contexto + repositorio.
  El recálculo de montos (`recomputeAmounts`, que hoy lee
  `tax_parameters` directamente) se queda encapsulado dentro del
  adaptador/`server/lib/fee-receipts.mjs` — es un detalle de
  persistencia (similar a una columna calculada), no una decisión de
  negocio nueva que deba orquestar el caso de uso. Se documenta esta
  decisión explícitamente para no bloquear el paso por falta del
  agregado de parámetros tributarios (que se migra recién en el paso 06).
- `server/routes/fee-receipts.mjs`: rutas
  `GET/POST /api/fee-receipts`, `GET/PUT/DELETE /api/fee-receipts/:id`,
  `POST /api/fee-receipts/:id/duplicate`,
  `GET/PUT /api/fee-expense-settings`, `GET /api/fee-expense-settings/:taxYear`.
- `apps/local/src/fee-receipt-composition.mjs`.
- `server/index.mjs`: usa el router nuevo, deja de importar las
  funciones de `server/lib/fee-receipts.mjs` directamente ni el objeto
  `repo` intermedio para estos dos agregados.

## Restricciones

- Mismos endpoints, payloads, filtros y estados HTTP.
- No se modifica `server/lib/fee-receipts.mjs` (se importa de forma
  diferida, igual que `database.mjs`).
- La validación de campos (`sanitizeFeeReceiptInput`) se queda donde
  está (dentro de `server/lib/fee-receipts.mjs`, ejecutada por el
  adaptador antes de persistir) — moverla a `api-contracts` es un paso
  posterior opcional, no bloqueante para este PR.

## Criterios de aceptación

- Contratos propios para cada agregado.
- `npm test`, `architecture:check` y `curl` contra
  `/api/fee-receipts` (crear, listar, duplicar, anular) y
  `/api/fee-expense-settings` siguen funcionando igual.

## Commit

`refactor: complete fee receipts and fee expense settings via repository/use-case/router pattern`
