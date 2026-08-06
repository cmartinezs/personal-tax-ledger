# Prompt 02 — A06: suite de contract tests reutilizable

```text
Objetivo:

Reemplazar el test ad hoc del adaptador SQLite por una suite de
contract tests reutilizable, exportada desde packages/contracts, que
cualquier implementación de IncomeSourceRepository (SQLite, un fake en
memoria, o en el futuro un adaptador cloud) deba satisfacer.

Contexto:

- server/test/sqlite-adapter-contract.test.mjs hoy hace spawnSync de un
  script inline que llama manualmente create/get/list/remove. Es un
  test específico de SQLite, no una suite reutilizable.
- Este prompt depende del prompt 01 (contrato asíncrono) ya fusionado.

Alcance:

Solo el agregado de ingresos. No migres fee-receipts ni mortgages.

Restricciones:

- No dupliques la lógica de aserciones entre packages/contracts y el
  test de server/test; la suite debe vivir en un solo lugar
  (packages/contracts) e importarse desde los tests.
- La suite debe ser agnóstica de la implementación: recibe factories,
  no importa SQLite directamente.

Pasos detallados:

1. En packages/contracts/src/index.mjs (o un módulo nuevo
   packages/contracts/src/testing.mjs si prefieres separar código de
   test de código de producción), agrega:

   export async function incomeSourceRepositoryContract(
     createRepository, // () => Promise<IncomeSourceRepository>
     createContext      // () => WorkspaceContext
   ) { ... }

   La función debe ejercitar, como mínimo: create + get devuelve lo
   mismo; list refleja lo creado y filtra por taxYear; update cambia
   los campos y se refleja en get/list; remove hace que get devuelva
   null y list ya no incluya el registro; llamar con un context
   inválido lanza el error esperado (reusa assertWorkspaceContext).
2. Si agregar la suite a packages/contracts como código de producción
   te preocupa por tamaño de paquete publicado, expórtala desde un
   subpath separado en package.json (por ejemplo
   "./testing": "./src/testing.mjs") y documenta la decisión.
3. Reescribe server/test/sqlite-adapter-contract.test.mjs para usar
   esta suite contra un repositorio SQLite real en un directorio
   temporal (mismo patrón de DB_PATH temporal que ya existe).
4. Crea un repositorio fake en memoria (puede vivir en el mismo archivo
   de test o en server/test/fixtures/) que implemente
   IncomeSourceRepository y pásalo por la misma suite, demostrando que
   es reutilizable con una segunda implementación real.

Criterios de aceptación:

- Existe incomeSourceRepositoryContract exportado desde contracts y
  reutilizado por al menos dos implementaciones distintas en los
  tests.
- El test de SQLite ya no depende de spawnSync ni de un script inline
  duplicado; usa la suite.
- npm test pasa con la misma o mayor cobertura efectiva (create, get,
  list, update, remove, error de contexto inválido).

Checklist de revisión:

docs/slice/pack-a5-fix/docs/review-checklist.md completo.

Instrucciones de commit:

Un commit: `test(a06): reuse a shared repository contract suite for the sqlite adapter`.

Instrucciones de PR:

Título: "A06 fix: reusable contract test suite". Incluye en la
descripción qué dos implementaciones pasan la suite y el resultado de
npm test.

Condiciones de detención:

Si la suite reutilizable requiere que el fake en memoria implemente
comportamiento que SQLite no replica exactamente (por ejemplo,
ordenamiento no garantizado), documenta la diferencia explícitamente en
el PR en vez de forzar una aserción frágil.
```
