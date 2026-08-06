# Prompt 05 — A11: composition root sin efectos secundarios al importar

```text
Objetivo:

Eliminar los singletons de apps/local/src/index.mjs y
packages/sqlite-adapter/src/index.mjs que hoy abren/migran la base
SQLite real en cuanto alguien importa el módulo, y reemplazarlos por
factories explícitas invocadas solo al arrancar la aplicación.

Contexto:

- apps/local/src/index.mjs hace
  `export const localComposition = createLocalComposition();` a nivel
  de módulo.
- packages/sqlite-adapter/src/index.mjs hace
  `export const sqliteIncomeRepository = createSqliteIncomeRepository();`
  a nivel de módulo, que a su vez importa funciones de
  server/lib/database.mjs. Ese archivo, al importarse, resuelve
  DB_PATH (con fallback a server/data/apv-chile.sqlite), crea el
  directorio, abre la base, activa WAL y corre migraciones.
- IMPORTANTE (encontrado al ejecutar este prompt): eliminar solo esos
  dos `export const ...` NO alcanza. La causa real es el `import
  { createIncomeSource, ... } from '../../../server/lib/database.mjs'`
  ESTÁTICO al inicio de packages/sqlite-adapter/src/index.mjs: ese
  import por sí solo ya ejecuta el cuerpo de database.mjs (abre/migra
  la base) apenas alguien importa el paquete, exista o no el singleton.
  La corrección debe volver DINÁMICO ese import
  (`await import('../../../server/lib/database.mjs')`), invocado solo
  la primera vez que se llama un método real del repositorio, no al
  cargar el módulo.
- Consecuencia observable antes de corregir: correr `npm test` recreaba
  `server/data/apv-chile.sqlite` (verificado borrando el archivo, corriendo
  la suite y comprobando que reaparecía), porque
  server/test/local-composition.test.mjs importa
  '@personal-tax-ledger/local-app' sin fijar DB_PATH.
- server/index.mjs ya usa localComposition.createIncomeRouter(...)
  (A11 corregido, commit f0ea953); este prompt no revierte eso, solo
  cambia CUÁNDO y CÓMO se crea la composición y se resuelve la base.

Alcance:

apps/local/src/index.mjs, packages/sqlite-adapter/src/index.mjs,
server/index.mjs (solo el punto de arranque), y los tests que importan
estos paquetes.

Restricciones:

- No cambies el comportamiento observable de server/index.mjs en
  producción: debe seguir levantando el servidor exactamente igual.
- No agregues un contenedor de inyección de dependencias nuevo; una
  función factory simple es suficiente.
- No refactorices server/lib/database.mjs en este prompt (lo usan
  fee-receipts.mjs, mortgages.mjs y server/index.mjs directamente; ese
  refactor es de mayor alcance y no es necesario para este fix
  puntual). Basta con importarlo de forma diferida desde
  sqlite-adapter.

Pasos detallados:

1. En packages/sqlite-adapter/src/index.mjs, elimina el `import {...}
   from '../../../server/lib/database.mjs'` ESTÁTICO del encabezado.
   Reemplázalo por una función `resolveDefaultDelegate()` que haga
   `await import('../../../server/lib/database.mjs')` y memorice la
   promesa (`??=`) para no reabrir la conexión en cada llamada.
2. Cada método del repositorio (list/get/create/update/remove) pasa a
   resolver el delegate (el explícito recibido por parámetro, o el
   default diferido) recién en su propio cuerpo `async`, nunca al
   crear el objeto repositorio.
3. Elimina `export const sqliteIncomeRepository = ...` de nivel de
   módulo. Deja solo la función exportada
   `createSqliteIncomeRepository(delegate)`.
4. En apps/local/src/index.mjs, elimina
   `export const localComposition = createLocalComposition();` de nivel
   de módulo y cambia el import de `sqliteIncomeRepository` por
   `createSqliteIncomeRepository` (invocado dentro de
   `createLocalComposition`, no a nivel de módulo).
5. En server/index.mjs, invoca
   `const localComposition = createLocalComposition();` explícitamente
   en el punto donde hoy se usa `localComposition.createIncomeRouter(...)`.
   Esto es seguro porque server/index.mjs ya es el entrypoint real y ya
   importa server/lib/database.mjs directamente para sus otras rutas.
6. Revisa todos los tests que importan estos paquetes
   (server/test/local-composition.test.mjs,
   server/test/sqlite-adapter-contract.test.mjs,
   server/test/application-use-case.test.mjs si aplica,
   server/test/http-contract.test.mjs) y confirma que:
   - los que prueban la fábrica (no el servidor real) inyectan un
     repositorio falso y nunca tocan SQLite;
   - los que sí necesitan SQLite real (contract test del adaptador)
     fijan DB_PATH a un directorio temporal ANTES del primer uso real
     del repositorio.
7. Agrega un test que verifique, en un subproceso aislado (no en el
   mismo proceso que ya importó estos paquetes de forma estática;
   ES modules cachean por especificador y no reevalúan el módulo), que
   importar '@personal-tax-ledger/local-app' y
   '@personal-tax-ledger/sqlite-adapter' con un DB_PATH temporal nunca
   crea el archivo, mientras nadie invoque un método del repositorio.
8. Corre `npm test` completo borrando antes `server/data/` y confirma
   que el directorio no reaparece.

Criterios de aceptación:

- Ni packages/sqlite-adapter ni apps/local ejecutan I/O de SQLite como
  efecto secundario de ser importados (verificado con un subproceso
  aislado que importa ambos paquetes con un DB_PATH temporal y confirma
  que el archivo nunca se crea).
- `server/data/apv-chile.sqlite` ya no reaparece solo por correr
  `npm test`.
- server/index.mjs sigue funcionando igual (verificado con curl contra
  /api/health y /api/incomes con un DB_PATH temporal).
- npm test pasa.

Checklist de revisión:

docs/slice/pack-a5-fix/docs/review-checklist.md, sección "Ningún módulo
de infraestructura ejecuta I/O real al ser importado".

Instrucciones de commit:

Un commit: `fix(a11): remove eager sqlite side effects from the composition root`.

Instrucciones de PR:

Título: "A11 fix: no side effects on import for local-app/sqlite-adapter".
Incluye en la descripción cómo verificaste que ya no se abre la base al
importar (por ejemplo, un script temporal que importa el paquete con
DB_PATH apuntando a una ruta inexistente y confirma que no se crea).

Condiciones de detención:

Si algún consumidor legítimo depende de la instancia por defecto
exportada (revisa con grep en todo el repo antes de eliminarla), migra
ese consumidor en el mismo PR; no dejes el singleton "por si acaso".
```
