# Prompt 01 — A05: contrato de repositorio asíncrono

```text
Objetivo:

Convertir el contrato de repositorio de ingresos (packages/contracts,
packages/application, packages/sqlite-adapter) de síncrono a
asíncrono (basado en Promise), porque una futura implementación cloud
sobre PostgreSQL/Supabase no puede satisfacer un contrato síncrono.

Contexto:

- packages/contracts/src/index.mjs define INCOME_REPOSITORY_METHODS y
  assertRepositoryContract, pero no fuerza que los métodos retornen
  Promise; el .d.ts tampoco lo tipa así.
- packages/application/src/index.mjs (createIncomeUseCases) llama al
  repositorio de forma síncrona.
- packages/sqlite-adapter/src/index.mjs (createSqliteIncomeRepository)
  envuelve funciones síncronas de node:sqlite (vía server/lib/database.mjs)
  sin devolver Promise.
- server/routes/incomes.mjs ya es un handler async, pero no usa await al
  invocar los casos de uso porque hoy no hace falta (todo es síncrono).
- Ver docs/gaps/migration-fails.md, hallazgo 1, para el detalle exacto
  del contrato esperado.

Alcance:

Solo el agregado de ingresos (income). No toques fee-receipts ni
mortgages en este prompt.

Restricciones:

- No es necesario que node:sqlite se vuelva realmente asíncrono por
  dentro (su API es síncrona); basta con envolver cada método del
  adaptador en una función async que resuelva con el valor síncrono.
- No cambies las URLs ni las respuestas HTTP observables.
- No agregues una librería de promesas ni cambies node:sqlite por otro
  driver.
- Conserva assertWorkspaceContext y assertRepositoryContract tal como
  están si siguen siendo válidos para validar forma (no dependen de
  sync/async).

Pasos detallados:

1. Actualiza el tipo del contrato en packages/contracts/src/index.d.ts
   para que list/get/create/update/remove retornen Promise<...>.
2. Actualiza packages/sqlite-adapter/src/index.mjs: cada método del
   objeto repository pasa a ser `async (context, ...) => {...}` y
   retorna el valor ya calculado (sin cambiar la lógica interna).
3. Actualiza packages/application/src/index.mjs: cada método de
   createIncomeUseCases pasa a ser async y usa `await repository.X(...)`.
4. Actualiza server/routes/incomes.mjs para usar `await
   useCases.X(...)` en cada llamada (ya está dentro de un handler
   async).
5. Actualiza apps/local/src/index.mjs si expone tipos o wrappers que
   asuman valores síncronos.
6. Actualiza todos los tests afectados
   (server/test/application-use-case.test.mjs,
   server/test/repository-contracts.test.mjs,
   server/test/sqlite-adapter-contract.test.mjs,
   server/test/local-composition.test.mjs) para usar async/await al
   llamar al repositorio o a los casos de uso.
7. Verifica que web/src/income-service.ts siga siendo compatible (ya
   retorna Promise porque delega en fetch, no debería requerir cambios).

Criterios de aceptación:

- Los 5 métodos de IncomeSourceRepository están tipados y implementados
  como funciones que retornan Promise, de punta a punta (contrato,
  adaptador, caso de uso, router).
- Todos los tests que invocan el repositorio o los casos de uso usan
  await y siguen pasando.
- npm test y npm run architecture:check pasan sin regresiones.
- Prueba manual con curl contra /api/incomes (GET/POST/PUT/DELETE)
  sigue funcionando igual que antes.

Checklist de revisión:

Aplica docs/slice/pack-a5-fix/docs/review-checklist.md completo, con
énfasis en la sección "si el PR toca contratos de persistencia".

Instrucciones de commit:

Un commit: `feat(a05): make the income repository contract async`.
Incluye en el cuerpo del commit qué capas cambiaron (contracts,
application, sqlite-adapter, router, tests).

Instrucciones de PR:

Título: "A05 fix: async income repository contract". Descripción:
motivo (compatibilidad con cloud), capas tocadas, resultado de
npm test y npm run architecture:check, y confirmación de la prueba
manual con curl.

Condiciones de detención:

Si conviertes el contrato a async y algún consumidor externo (por
ejemplo un script de smoke test) depende de que las llamadas sean
síncronas, detente y documenta la migración de ese consumidor como
parte de este mismo PR (es pequeña) en vez de dejarlo roto.
```
