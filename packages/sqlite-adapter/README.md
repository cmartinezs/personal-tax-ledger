# `@personal-tax-ledger/sqlite-adapter`

Adaptador de persistencia local basado en `node:sqlite`. Este paquete es el dueño de la conexión, el esquema, las migraciones idempotentes, los seeds y las implementaciones concretas de los contratos definidos en [`@personal-tax-ledger/contracts`](../contracts/README.md).

## Responsabilidades

- Crear una conexión mediante `createSqliteDatabase({ path })`.
- Activar `WAL` y `foreign_keys`.
- Crear/migrar tablas sin ORM.
- Persistir entidades como columnas SQLite y JSON TEXT cuando la forma es variable.
- Convertir filas a objetos de la API de repositorio.
- Permitir delegates para tests unitarios y una conexión compartida en producción.

## API pública

```js
import {
  createSqliteDatabase,
  createSqliteIncomeRepository
} from '@personal-tax-ledger/sqlite-adapter';

const database = createSqliteDatabase({ path: './data/ledger.sqlite' });
const incomes = createSqliteIncomeRepository(undefined, database);

const context = { workspaceId: 'local-workspace', actorId: 'local-user' };
const rows = await incomes.list(context, 2026);

database.close();
```

Si se omite la conexión, un repositorio puede crear una conexión lazy usando `DB_PATH`. En la aplicación local se recomienda siempre inyectar una única conexión desde la composición para controlar el lifecycle.

## Estructura

- [`src/database/README.md`](src/database/README.md): conexión, migraciones y SQL por agregado.
- [`src/*-repository.mjs`](src/README.md): adaptadores que cumplen los puertos de contracts.
- [`test/README.md`](test/README.md): pruebas con bases temporales.

## Reglas de extensión

1. Agrega primero o confirma el contrato en `packages/contracts`.
2. Mantén el SQL y el mapping dentro de `src/database/`.
3. No abras SQLite en el top-level de un módulo importable.
4. Conserva compatibilidad con bases existentes mediante migraciones aditivas.
5. Cierra siempre la conexión en tests y composition roots.
6. Prueba CRUD, filtros, migración y aislamiento con una base temporal.

## Verificación

```bash
npm run build --workspace @personal-tax-ledger/sqlite-adapter
npm test --workspace @personal-tax-ledger/sqlite-adapter
npm test
```

La integración completa se verifica también con [`npm run smoke:local`](../../README.md#verificación-completa).
