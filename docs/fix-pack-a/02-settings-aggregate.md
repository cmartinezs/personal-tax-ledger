# 02 — Agregado Settings

## Objetivo

Demostrar que el patrón A05–A08 se puede repetir con un segundo
agregado real, distinto de ingresos: `Settings` (fila única, sin CRUD
por id). De paso, renombrar el `assertRepositoryContract` genérico
existente a `assertIncomeRepositoryContract` para dejar de tener una
función con nombre genérico que en realidad solo valida el contrato de
ingresos (`packages/contracts` no debe tener una interfaz "universal";
cada agregado declara su propio contrato y su propio assert).

## Alcance

- `packages/contracts`: renombrar `assertRepositoryContract` →
  `assertIncomeRepositoryContract` (actualizar los 4 consumidores).
  Agregar `SETTINGS_REPOSITORY_METHODS`, `assertSettingsRepositoryContract`
  y el tipo `SettingsRepository` (`get`/`update`, asíncronos,
  `WorkspaceContext`).
- `packages/sqlite-adapter`: `createSqliteSettingsRepository(delegate)`,
  mismo patrón de `import()` diferido que el repositorio de ingresos.
- `packages/application`: `createSettingsUseCases({ repository })` con
  `getSettings(context)` / `updateSettings(context, data)`.
- `server/routes/settings.mjs`: nuevo router, recibe los casos de uso,
  no conoce `database.mjs`.
- `apps/local/src/index.mjs`: agrega el agregado de settings a
  `createLocalComposition` (repositorio + casos de uso + router),
  siguiendo el mismo patrón que ingresos.
- `server/index.mjs`: usa `localComposition.createSettingsRouter(...)`
  para `PUT /api/settings`; dejar de leer `updateSettings` de
  `database.mjs` directamente para esa ruta (pero `getSettings` de
  lectura directa sigue usándose en muchas otras rutas de
  `server/index.mjs` que todavía no se migran — eso es aceptable en
  este paso, se documenta como transición).

## Restricciones

- Mismo endpoint, mismo payload (`PUT /api/settings` recibe un objeto
  parcial y lo mezcla con el actual), misma respuesta.
- El caso de uso NO valida campos de negocio de settings (eso ya no
  existía antes tampoco); solo coordina contexto + repositorio.
- No se toca el esquema de la tabla `settings` ni sus datos semilla.

## Criterios de aceptación

- Existe `SettingsRepository` con contrato propio (no reutiliza
  `INCOME_REPOSITORY_METHODS`).
- `assertRepositoryContract` ya no existe con ese nombre genérico;
  todos los consumidores usan `assertIncomeRepositoryContract`.
- El router de settings no importa `server/lib/database.mjs`.
- `npm test`, `architecture:check` y un `curl` a `PUT /api/settings`
  siguen funcionando igual.

## Commit

`refactor: complete settings via repository/use-case/router pattern`
