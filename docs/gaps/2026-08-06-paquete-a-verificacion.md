# Verificación y re-implementación del Paquete A (migración incremental)

**Tipo**: técnico

**Descripción**: al verificar la ejecución previa de las iteraciones A00-A13
(`docs/slice/personal-tax-ledger-migration-prompt-a.md`) se encontró que
A09 (cliente/servicio de ingresos), A10 (`shared-ui`), A11 (composition
root `apps/local`) y A13 (CI de límites arquitectónicos) habían creado los
archivos y tests unitarios pedidos, pero **no estaban conectados a la
aplicación real**:

- `web/src/income-service.ts` e `IncomesSection` de `packages/shared-ui`
  existían pero `App.tsx` seguía llamando `api.listIncomes/createIncome/...`
  directamente y renderizando su propio JSX inline; ambos módulos eran
  código muerto solo ejercitado por sus propios tests.
- `apps/local/src/index.mjs` exportaba `createLocalComposition`, pero
  `server/index.mjs` volvía a ensamblar `createIncomeUseCases` +
  `sqliteIncomeRepository` por su cuenta, duplicando la lógica y dejando el
  composition root sin consumidores reales.
- `scripts/architecture-check.mjs` existía y funcionaba de forma aislada,
  pero `.github/workflows/ci.yml` nunca lo invocaba, y el script no
  detectaba ciclos entre paquetes (solo prohibía imports de infraestructura
  dentro de `core`).
- A06 pedía documentar el patrón de migración para el siguiente agregado
  después de validar `incomes`; nunca se escribió.

**Impacto**: la suite verde (`npm test` con 55/55 pasando) daba una falsa
sensación de que la migración incremental estaba completa. En realidad
`App.tsx` seguía siendo el único punto de verdad para ingresos y
`server/index.mjs` el único punto de ensamblaje real, contradiciendo el
objetivo explícito de A09/A10/A11 ("reducir App.tsx", "sección reutilizada
por local y cloud", "composition root"). El chequeo de arquitectura de A13
tampoco se ejecutaba en CI, por lo que una futura regresión (p. ej. `core`
importando SQLite) no habría sido detectada automáticamente.

**Acción requerida** (ya ejecutada en esta sesión, un commit por
corrección):

1. `fix(a09)`: `App.tsx` ahora usa `incomeService` para todas las
   operaciones de ingresos.
2. `fix(a10)`: `IncomesSection` de `shared-ui` es un componente
   presentacional real, renderizado por `App.tsx` para la lista de
   ingresos, con paridad exacta de comportamiento/markup.
3. `fix(a11)`: `server/index.mjs` consume
   `localComposition.createIncomeRouter(...)` en vez de reensamblar sus
   propias dependencias; verificado con `curl` contra el servidor real.
4. `fix(a13)`: CI corre `npm run architecture:check`; el script reescrito
   construye el grafo real de dependencias entre `packages/*` y `apps/*` y
   detecta ciclos (probado manualmente introduciendo y removiendo un ciclo
   real).
5. `docs(a06)`: se agregó `docs/architecture/aggregate-migration-pattern.md`
   con el patrón para migrar `fee-receipts`/`mortgages` sin repetir el
   mismo error (crear paquetes sin conectarlos a la app real).

Cada corrección quedó cubierta por un test estático (lectura de archivo,
mismo estilo ya usado en el repo) que falla si la integración real vuelve a
romperse — no solo un test unitario del módulo aislado.

**Pendiente** (no resuelto en esta sesión, prioridad menor): los tests de
caracterización HTTP de A01 (`server/test/http-contract.test.mjs`) cubren
`/api/health`, `/api/simulate`, `/api/incomes`, `/api/fee-receipt-calc`,
`/api/article-55-bis` y `/api/scenarios`, pero no ejercitan a nivel HTTP el
CRUD completo de `/api/fee-receipts` ni `/api/mortgages` (sí están
cubiertos por tests de módulo y por `integration.test.mjs` a nivel de
`simulatePortfolio`). Cuando se migren esos agregados siguiendo
`aggregate-migration-pattern.md`, agregar esa cobertura HTTP como parte del
mismo PR.

**Prioridad**: alta (los cuatro puntos ya corregidos representaban el
riesgo principal); **media** para la cobertura HTTP pendiente de
fee-receipts/mortgages.
