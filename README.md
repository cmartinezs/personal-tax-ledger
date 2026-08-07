# Personal Tax Ledger

Estimador local de impuestos personales para Chile. Modela remuneraciones, múltiples empleadores, boletas de honorarios, gastos, APV, créditos hipotecarios y una reliquidación anual explicable.

Este repositorio es un monorepo Node.js. La aplicación ejecutable es `apps/local`; los paquetes internos contienen el dominio, los contratos, los casos de uso, la persistencia SQLite y los componentes React reutilizables.

## Navegación

- [Arquitectura actual](docs/architecture/current-state.md)
- [Arquitectura objetivo](docs/architecture/target-state.md)
- [Mapa de paquetes y destinos](docs/architecture/module-destination-map.md)
- [Catálogo HTTP](docs/architecture/http-route-catalog.md)
- [Política de paquetes](docs/architecture/package-policy.md)
- [Guía de Windows](docs/windows-local.md)
- [Gaps conocidos](docs/gaps/README.md)
- [Serie de trabajo A.6-A.13](docs/slice/personal-tax-ledger-packs-a6-a13/README.md)

## Mapa del repositorio

| Carpeta | Propósito | Guía |
|---|---|---|
| `apps/local` | Composition root y host HTTP local | [`apps/local/README.md`](apps/local/README.md) |
| `apps/external-consumer` | Consumidor de prueba de exports públicos | [`apps/external-consumer/README.md`](apps/external-consumer/README.md) |
| `packages/core` | Cálculos y reglas puras | [`packages/core/README.md`](packages/core/README.md) |
| `packages/contracts` | Puertos, contextos y asserts | [`packages/contracts/README.md`](packages/contracts/README.md) |
| `packages/application` | Casos de uso | [`packages/application/README.md`](packages/application/README.md) |
| `packages/api-contracts` | DTOs y transporte HTTP | [`packages/api-contracts/README.md`](packages/api-contracts/README.md) |
| `packages/sqlite-adapter` | SQLite, migraciones y repositorios | [`packages/sqlite-adapter/README.md`](packages/sqlite-adapter/README.md) |
| `packages/shared-ui` | Componentes React presentacionales | [`packages/shared-ui/README.md`](packages/shared-ui/README.md) |
| `packages/frontend-application` | Servicios frontend, hooks y orchestration reutilizables | [`packages/frontend-application/README.md`](packages/frontend-application/README.md) |
| `packages/http-api` | Inbound adapter HTTP reutilizable | [`packages/http-api/README.md`](packages/http-api/README.md) |
| `web` | Aplicación React local | [`web/README.md`](web/README.md) |
| `scripts` | Automatización verificable y portable | [`scripts/README.md`](scripts/README.md) |
| `docs` | Decisiones, procedimientos y gaps | [`docs/README.md`](docs/README.md) |

## Flujo de una petición

```text
web/src/features
  -> web/src/api.ts
  -> apps/local/src/http/router.mjs
  -> packages/http-api/src/*.mjs
  -> packages/application
  -> packages/contracts
  -> packages/sqlite-adapter
  -> node:sqlite
```

Los cálculos no siguen ese camino: `packages/core` recibe datos y devuelve resultados puros. La UI no contiene SQL y los routers no acceden directamente a tablas.

## Requisitos

- Node.js `24.15+`.
- npm incluido con Node.
- `node:sqlite`, incluido en Node 24.15+.

No se requiere Docker, un ORM, Firebase, Supabase ni una base externa.

## Instalación y ejecución

```bash
npm ci
npm start
```

La aplicación completa queda en `http://localhost:3001`. Para desarrollo con frontend Vite y API en watch:

```bash
npm run dev
```

Para compilar únicamente el frontend:

```bash
npm run build
```

Variables de ejecución:

| Variable | Default | Descripción |
|---|---:|---|
| `PORT` | `3001` | Puerto del host HTTP local. |
| `DB_PATH` | `data/apv-chile.sqlite` | Ruta de la base SQLite. Se resuelve desde el directorio de ejecución. |

## Verificación completa

```bash
npm run lint
npm run typecheck
npm run architecture:check
npm test
npm run test:workspaces
npm run build:packages
npm run pack:smoke
npm run smoke:local
cd web && npx --no-install vite build
```

`npm run pack:smoke` empaqueta e instala los exports públicos en un consumidor temporal. `npm run smoke:local` arranca un servidor real con SQLite temporal y prueba endpoints HTTP.

## Principios para contribuidores

1. Mantén los cálculos en `packages/core` y no introduzcas I/O allí.
2. Define contratos antes de agregar una implementación de repositorio.
3. Inyecta repositorios y clientes en `application` y servicios frontend.
4. Usa DTOs de `packages/api-contracts` en vez de duplicar formas locales.
5. Mantén `shared-ui` libre de `fetch`, SQLite, `process.env` y URLs de despliegue.
6. Agrega tests junto al workspace afectado y conserva los tests de integración en `test/`.
7. Actualiza el README de la carpeta cuando cambie su responsabilidad o API.
8. Documenta en [`docs/gaps/`](docs/gaps/README.md) cualquier decisión funcional, técnica o prerrequisito no resuelto.

## Estado

El veredicto histórico `PACK_A_PARTIAL` permanece en [`docs/architecture/pack-a-final-report.md`](docs/architecture/pack-a-final-report.md). La serie posterior A.6-A.13 implementó el host local, SQLite por factory, DTOs compartidos, frontend modular, shared UI, tests por workspace, TypeScript estricto, CI Windows y runtime portable. Revisa el historial de commits para el detalle de cada bloque.
