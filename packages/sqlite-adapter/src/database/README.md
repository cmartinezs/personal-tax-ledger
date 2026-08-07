# Persistencia SQLite

`database.mjs` crea la conexión, aplica WAL/foreign keys, crea tablas/migraciones y devuelve `close()`. Los módulos de agregado ejecutan SQL y convierten filas SQLite a objetos camelCase.

La ruta recibida por `createSqliteDatabase({ path })` se resuelve desde `process.cwd()`. Usa rutas absolutas o configura el cwd conscientemente en herramientas externas.

La implementación de repositorios que consume estas funciones está en [`../README.md`](../README.md); su composición local se describe en [`../../../../apps/local/src/composition/README.md`](../../../../apps/local/src/composition/README.md).
