# 03 — Agregado Execution Logs (bitácora)

## Objetivo

Tercer agregado completo: `ExecutionLogRepository` (append + lectura
paginada/filtrada, sin update/delete — la bitácora es de solo lectura
por diseño de negocio, igual que hoy).

## Alcance

- `packages/contracts`: `EXECUTION_LOG_REPOSITORY_METHODS = ['create', 'list']`,
  `assertExecutionLogRepositoryContract`, tipo `ExecutionLogRepository`.
- `packages/sqlite-adapter/src/execution-log-repository.mjs`:
  `createSqliteExecutionLogRepository(delegate)`, mismo patrón de
  `import()` diferido vía `database.mjs` (el helper compartido del
  paso 02).
- `packages/application/src/execution-log-use-cases.mjs`:
  `createExecutionLogUseCases({ repository })` con `createExecutionLog`
  y `listExecutionLogs`.
- `server/routes/execution-logs.mjs`: nuevo router para
  `GET/POST /api/logs`.
- `apps/local/src/execution-log-composition.mjs` +
  `createLocalComposition` lo agrega.
- `server/index.mjs`: usa el router nuevo, deja de importar
  `createExecutionLog`/`listExecutionLogs` de `database.mjs`
  directamente.

## Restricciones

- Mismo endpoint, mismo payload, misma paginación
  (`page`/`pageSize`/filtros `kind`/`status`/`operation`/`q`).
- Mismas validaciones de transporte (`kind` debe ser `SYNC`/`ASYNC`,
  `status` debe ser `OK`/`ERROR`, `operation` obligatorio) — quedan en
  el router (validación de transporte), igual que en ingresos.

## Criterios de aceptación

- Contrato propio, no reutiliza métodos de otros agregados.
- `npm test`, `architecture:check` y un `curl` a `POST`/`GET /api/logs`
  (con filtros) siguen funcionando igual.

## Commit

`refactor: complete execution logs via repository/use-case/router pattern`
