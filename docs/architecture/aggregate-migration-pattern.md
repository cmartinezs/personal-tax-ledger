# Patrón para migrar el siguiente agregado

El agregado `incomes` (A05-A11) es la referencia. Para migrar `fee-receipts`,
`mortgages` u otro agregado de `server/lib/*.mjs` hacia el mismo patrón,
repite estos pasos incrementales, cada uno en su propio PR pequeño:

1. **Contrato de repositorio** (`packages/contracts`): agrega el listado de
   métodos del agregado (p. ej. `FEE_RECEIPT_REPOSITORY_METHODS`) y, si
   corresponde, un `assertXRepositoryContract`. No reemplaces
   `INCOME_REPOSITORY_METHODS`; cada agregado tiene su propio contrato.
2. **Adaptador SQLite** (`packages/sqlite-adapter`): agrega
   `createSqliteFeeReceiptRepository(delegate)` que envuelva las funciones ya
   existentes de `server/lib/fee-receipts.mjs` (mismo patrón que
   `createSqliteIncomeRepository`: recibe un `delegate` opcional para poder
   inyectar dobles de prueba, exige `assertWorkspaceContext` en cada método).
   No muevas el SQL todavía.
3. **Casos de uso** (`packages/application`): agrega
   `createFeeReceiptUseCases({ repository })` con la misma forma que
   `createIncomeUseCases` (recibe `WorkspaceContext` explícito en cada
   método, no conoce HTTP ni SQLite).
4. **Router HTTP** (`server/routes/fee-receipts.mjs`): sigue la forma de
   `server/routes/incomes.mjs` — recibe sus dependencias por parámetro,
   devuelve `true`/`false` según si manejó la ruta, mapea errores con
   `apiError`.
5. **Composition root** (`apps/local/src/index.mjs`): agrega el repositorio,
   los casos de uso y `createXRouter` a `createLocalComposition`, junto a los
   ya existentes de `incomes`. **`server/index.mjs` debe consumir
   `localComposition.createXRouter(...)`, nunca reensamblar sus propias
   dependencias en paralelo** (ese fue exactamente el defecto detectado y
   corregido en la revisión de A11: ver "Corrección posterior" en
   `migration-sequence.md`).
6. **Frontend**: si el agregado tiene una sección de UI candidata a
   compartirse, exporta un componente presentacional (props y callbacks, sin
   `fetch` propio) desde `packages/shared-ui`, expón un service en
   `web/src/api.ts` (`createXService`, mismo patrón que `incomeService`) y
   **verifica que `App.tsx` (o el módulo correspondiente) importe y use
   ambos de verdad** antes de dar por cerrada la iteración. Un archivo nuevo
   que ningún componente real importa no cuenta como completado.
7. **Tests obligatorios por paso**: contract test del repositorio contra una
   base temporal real, test del caso de uso con un repositorio doble, y al
   menos un test estático (lectura de archivo) que falle si el paso 5 o 6
   vuelve a quedar huérfano — son baratos de escribir y son la única red que
   detectó los defectos de la primera implementación del paquete A.
8. **Verificación de cierre de cada paso**: `npm test`,
   `npm run architecture:check`, `npx --no-install vite build` desde `web/`
   y, si el paso tocó HTTP, una prueba manual con `curl` contra
   `server/index.mjs` levantado con un `DB_PATH` temporal.

## Por qué este documento existe

A06 pedía documentar el patrón después de validar el primer agregado; no se
hizo en la implementación original. Se agrega ahora, junto con la
corrección de A09/A10/A11/A13, para que la próxima sesión que migre
`fee-receipts` o `mortgages` no repita el mismo error: crear los paquetes y
los tests unitarios sin conectarlos a la aplicación real.
