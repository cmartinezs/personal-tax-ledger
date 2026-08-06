# Estado actual

> Este documento reemplaza el snapshot original de A00 (ver historial de
> git para esa versión). Refleja el estado real después de A00-A13 y de
> la corrección aplicada en `docs/gaps/2026-08-06-paquete-a-verificacion.md`
> y `docs/slice/pack-a5-fix/` (prompts 01-09).

## Estructura

El monorepo combina paquetes internos reutilizables con dos fachadas
ejecutables (`server/`, `web/`) que todavía concentran la mayoría de los
agregados no migrados (boletas, hipotecario, escenarios, parámetros
tributarios, fuentes oficiales, bitácora):

| Ubicación | Responsabilidad actual |
|---|---|
| `packages/core` | Cálculos puros (sueldos, honorarios, art. 55 bis, explicaciones, parámetros, utilidades). Sin dependencias internas. |
| `packages/contracts` | `WorkspaceContext`, contrato de repositorio de ingresos (asíncrono) y `packages/contracts/testing` con la suite `incomeSourceRepositoryContract` reutilizable. |
| `packages/api-contracts` | DTOs HTTP de ingresos (`incomeSourceRequest`/`incomeSourceResponse`, cobertura completa del modelo) y `ApiError`. |
| `packages/application` | Casos de uso de ingresos (`createIncomeUseCases`), asíncronos, reciben `WorkspaceContext` explícito. |
| `packages/sqlite-adapter` | Adaptador local del agregado de ingresos; importa `server/lib/database.mjs` de forma diferida (dinámica) para no tocar SQLite como efecto secundario de ser importado. |
| `packages/shared-ui` | `IncomesSection`, componente presentacional (props y callbacks, sin `fetch` propio). Se compila a `dist/` con `tsc`; el `package.json` exporta desde ahí. |
| `apps/local` | Composition root real: `createLocalComposition()` ensambla contexto, repositorio, casos de uso y router de ingresos. `server/index.mjs` lo invoca explícitamente en su propio arranque. |
| `server/index.mjs` | Entrypoint HTTP real. Usa el composition root de `apps/local` para ingresos; para el resto de los agregados (boletas, hipotecario, parámetros, fuentes, bitácora, simulación) sigue importando `server/lib/*.mjs` directamente. |
| `server/lib/{calculator,fee-calculator,mortgage-calculator,calculation-explanation,defaults,tax-parameters,util}.mjs` | Fachadas de una línea (`export * from '@personal-tax-ledger/core/...'`) que reexportan `packages/core`, preservando las rutas de import originales. |
| `server/lib/database.mjs` | Inicialización SQLite (WAL, esquema incremental, seeds), consultas de settings, ingresos, snapshots, parámetros, fuentes. Sigue sin migrar a un paquete propio salvo por el envoltorio diferido de `sqlite-adapter`. |
| `server/lib/fee-receipts.mjs`, `server/lib/mortgages.mjs` | Persistencia y validación de boletas y créditos; agregados aún no migrados a `contracts`/`sqlite-adapter`. |
| `web/src/App.tsx` | Composition root React. Para ingresos: delega en `web/src/income-service.ts` y renderiza `IncomesSection` (de `packages/shared-ui`, vía `web/src/incomes-section.tsx`) para la lista. El resto de las secciones (boletas, hipotecario, APV, escenarios, configuración, fuentes, bitácora) siguen implementadas directamente en `App.tsx` y sus `*-module.tsx`. |
| `web/src/api.ts` | Cliente HTTP tipado; usa `@personal-tax-ledger/api-contracts` para el DTO de ingresos. El resto de los endpoints usan tipos locales de `web/src/types.ts`. |
| `server/test/*`, `packages/*` (sin tests propios aún) | Tests unitarios, de contrato, de integración HTTP y estáticos (arquitectura, integración frontend). `scripts/architecture-check.mjs` valida en CI que no haya ciclos ni dependencias inversas hacia `core`/`contracts`. |

## Flujo principal (ingresos, agregado migrado)

1. `web/src/App.tsx` usa `incomeService` (de `web/src/api.ts`) para
   listar/crear/editar/eliminar ingresos, y `IncomesSection` para
   renderizar la lista.
2. `server/index.mjs` recibe `/api/incomes*`, delega en el router creado
   por `apps/local`'s `createLocalComposition().createIncomeRouter(...)`.
3. El router invoca los casos de uso de `packages/application`
   (asíncronos, con `WorkspaceContext`), que a su vez llaman al
   repositorio de `packages/sqlite-adapter`.
4. El repositorio resuelve `server/lib/database.mjs` de forma diferida
   (primera llamada real, no al importarse) y ejecuta la consulta SQLite.

## Flujo principal (resto de agregados, sin migrar)

1. `server/index.mjs` importa `server/lib/{fee-receipts,mortgages,database}.mjs`
   directamente para boletas, hipotecario, parámetros, fuentes y
   bitácora.
2. `/api/simulate` combina settings persistidos con el payload y llama a
   `simulatePortfolio` (reexportado desde `packages/core`).
3. `web/src/App.tsx` y sus `*-module.tsx` consumen estos endpoints vía
   `web/src/api.ts` con tipos locales de `web/src/types.ts` (sin DTO
   compartido todavía).

## Fronteras verificadas automáticamente

- `packages/core` y `packages/contracts` no importan Node HTTP, React,
  SQLite, Supabase, Firebase ni ningún otro paquete interno
  (`scripts/architecture-check.mjs`, corrido en CI).
- No hay ciclos de dependencias entre `packages/*`/`apps/*` (mismo
  script; probado deliberadamente introduciendo y removiendo un ciclo).
- `packages/shared-ui` no importa Firebase, Supabase, `node:sqlite`,
  `process.env` ni hace `fetch` propio (`server/test/shared-ui-boundary.test.mjs`).
- Importar `@personal-tax-ledger/local-app` o
  `@personal-tax-ledger/sqlite-adapter` no abre ni migra la base SQLite
  real (`server/test/local-composition.test.mjs`, verificado en un
  subproceso aislado).

## Riesgos y gaps conocidos (no bloqueantes para B00)

- Boletas, hipotecario, parámetros tributarios, fuentes oficiales y
  bitácora siguen sin repositorio/casos de uso/DTO propios; usan
  `server/lib/*.mjs` directamente. Seguir el patrón documentado en
  `docs/architecture/aggregate-migration-pattern.md` para migrarlos.
- `copyIncomeSources` sigue siendo una función concreta de persistencia
  inyectada al router de ingresos, en vez de pasar por el caso de uso o
  el repositorio (hallazgo A07/A08 de `docs/gaps/migration-fails.md`,
  fuera de alcance de `pack-a5-fix`; ver su matriz de aceptación).
- `tsc -b` en `web/` falla por tres problemas preexistentes
  (`docs/gaps/2026-08-06-tsc-web.md`); `npm run build` ya no depende de
  `tsc -b` (usa `vite build` directamente), y CI corre `npm run
  typecheck` en modo informativo.
- La base local sigue en `server/data/apv-chile.sqlite` salvo que
  `DB_PATH` la sobrescriba; no hay migración de ruta ni rollback
  documentado más allá de lo ya descrito en `target-state.md`.
- Los snapshots existentes almacenan payload y resultado; cualquier
  migración futura de ese agregado debe conservar compatibilidad de
  lectura.
