# Estado actual

Este documento describe el código que existe hoy. Para el objetivo de diseño, consulta [`target-state.md`](target-state.md). Para seguir responsabilidades concretas, consulta [`module-destination-map.md`](module-destination-map.md) y los README locales enlazados desde la [guía raíz](../../README.md).

## Diagrama de ejecución

```text
apps/local/src/main.mjs
  -> apps/local/src/create-local-app.mjs
  -> apps/local/src/http/router.mjs
  -> server/routes/*.mjs
  -> packages/application/src/*-use-cases.mjs
  -> packages/sqlite-adapter/src/*-repository.mjs
  -> packages/sqlite-adapter/src/database/*
  -> node:sqlite
```

La aplicación React ejecuta este flujo para cada interacción:

```text
apps/local/web/src/main.tsx
  -> apps/local/web/src/app/App.tsx
  -> apps/local/web/src/app/WorkspaceView.tsx
  -> apps/local/web/src/features/*
  -> apps/local/web/src/api.ts
  -> /api/*
```

## Responsabilidades por carpeta

| Carpeta | Responsabilidad | Guía de contribución |
|---|---|---|
| `packages/core` | Cálculos deterministas y parámetros de dominio. | [`packages/core/README.md`](../../packages/core/README.md) |
| `packages/contracts` | Puertos de repositorio y contexto. | [`packages/contracts/README.md`](../../packages/contracts/README.md) |
| `packages/application` | Casos de uso con dependencias inyectadas. | [`packages/application/README.md`](../../packages/application/README.md) |
| `packages/api-contracts` | Requests, responses, filtros y errores serializables. | [`packages/api-contracts/README.md`](../../packages/api-contracts/README.md) |
| `packages/sqlite-adapter` | Factory SQLite, migraciones, seeds y repositorios. | [`packages/sqlite-adapter/README.md`](../../packages/sqlite-adapter/README.md) |
| `packages/shared-ui` | Componentes React sin transporte ni persistencia. | [`packages/shared-ui/README.md`](../../packages/shared-ui/README.md) |
| `apps/local` | Composition root, host HTTP y runtime multiplataforma. | [`apps/local/README.md`](../../apps/local/README.md) |
| `server/routes` | Routers HTTP inyectables. | [`server/routes/README.md`](../../server/routes/README.md) |
| `apps/local/web/src/features` | Módulos de UI y servicios frontend. | [`apps/local/web/src/features/README.md`](../../apps/local/web/src/features/README.md) |

## Fronteras verificadas

- `core` no importa infraestructura ni otros paquetes internos.
- `contracts` no importa infraestructura ni otros paquetes internos.
- `shared-ui` no importa `apps/local/web/src`, `server`, SQLite, `process.env` ni proveedores cloud.
- `apps/local` no importa `server/index.mjs`; `server/index.mjs` es la dirección inversa y actúa como fachada.
- La base SQLite no se abre al importar `@personal-tax-ledger/local-app` o `@personal-tax-ledger/sqlite-adapter`.
- Los paquetes y el consumidor externo tienen tests propios; la integración adicional vive en `server/test`.

La comprobación automática está en [`scripts/architecture-check.mjs`](../../scripts/architecture-check.mjs) y se ejecuta con `npm run architecture:check`.

## Lifecycle y persistencia

`createLocalComposition()` crea una conexión compartida mediante `createSqliteDatabase()`. `createLocalApp().stop()` cierra primero el servidor y luego la conexión. `DB_PATH` se resuelve desde el directorio de ejecución; consulta [`packages/sqlite-adapter/src/database/README.md`](../../packages/sqlite-adapter/src/database/README.md).

## Deuda conocida

Los documentos históricos en `docs/gaps/` conservan hallazgos de sesiones anteriores. No todos describen el estado actual: cada uno debe leerse junto con su fecha y la evidencia posterior en el historial de Git. Los gaps abiertos de negocio y producto siguen indexados en [`docs/gaps/README.md`](../gaps/README.md).
