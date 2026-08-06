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
- Consecuencia: cualquier test o script que importe
  '@personal-tax-ledger/local-app' o '@personal-tax-ledger/sqlite-adapter'
  sin fijar DB_PATH antes puede tocar la base real del usuario.
- server/index.mjs ya usa localComposition.createIncomeRouter(...)
  (A11 corregido, commit f0ea953); este prompt no revierte eso, solo
  cambia CUÁNDO se crea la composición.

Alcance:

apps/local/src/index.mjs, packages/sqlite-adapter/src/index.mjs,
server/index.mjs (solo el punto de arranque), y los tests que importan
estos paquetes.

Restricciones:

- No cambies el comportamiento observable de server/index.mjs en
  producción: debe seguir levantando el servidor exactamente igual.
- No agregues un contenedor de inyección de dependencias nuevo; una
  función factory simple es suficiente.

Pasos detallados:

1. En packages/sqlite-adapter/src/index.mjs, elimina el
   `export const sqliteIncomeRepository = createSqliteIncomeRepository();`
   de nivel de módulo. Deja solo la función exportada
   `createSqliteIncomeRepository(delegate)`.
2. En apps/local/src/index.mjs, elimina
   `export const localComposition = createLocalComposition();` de nivel
   de módulo. Deja solo `createLocalComposition(dependencies)`.
3. En server/index.mjs, invoca
   `const localComposition = createLocalComposition();` explícitamente
   en el punto donde hoy se usa `localComposition.createIncomeRouter(...)`,
   después de que el módulo haya podido leer DB_PATH desde el entorno
   (esto ya ocurre porque server/index.mjs es el entrypoint real).
4. Revisa todos los tests que importan estos paquetes
   (server/test/local-composition.test.mjs,
   server/test/sqlite-adapter-contract.test.mjs,
   server/test/application-use-case.test.mjs si aplica,
   server/test/http-contract.test.mjs) y confirma que:
   - los que prueban la fábrica (no el servidor real) inyectan un
     repositorio falso y nunca tocan SQLite;
   - los que sí necesitan SQLite real (contract test del adaptador)
     fijan DB_PATH a un directorio temporal ANTES de importar el
     paquete (puede requerir mover el import dentro de la función de
     test con import() dinámico si hoy es un import estático de nivel
     de módulo).
5. Documenta en un comentario breve en apps/local/src/index.mjs por qué
   ya no hay export de instancia por defecto (para que nadie lo
   reintroduzca).

Criterios de aceptación:

- Ni packages/sqlite-adapter ni apps/local ejecutan I/O de SQLite como
  efecto secundario de ser importados (verificable importando el
  paquete sin fijar DB_PATH y confirmando que no se crea ningún archivo
  .sqlite).
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
