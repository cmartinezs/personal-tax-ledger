# Personal Tax Ledger

Estimador local de impuestos personales para Chile. Modela remuneraciones, múltiples empleadores, boletas de honorarios, gastos, APV, créditos hipotecarios y una reliquidación anual explicable.

Este repositorio es un monorepo Node.js. La aplicación ejecutable local vive en `apps/local`; la distribución desktop usa Electron como adaptador de entrega sobre esa misma composición, sin mover lógica tributaria fuera de los paquetes internos.

## Governance y relación con ADÜMÜN

Personal Tax Ledger es un **activo founder-personal gobernado bajo ADÜMÜN**. El ownership personal no lo deja fuera del gobierno ADÜMÜN: conserva lifecycle, documentación, evidencia y estándares comunes, pero no se clasifica como corporate-owned.

Además actúa como **active reference consumer / proving ground** para [`adumun/business-taxops`](https://github.com/adumun/business-taxops). Ambos comparten patrones y semántica tributaria reutilizable, pero mantienen bounded contexts y ownership distintos. Personal Tax Ledger no es legacy ni un alias de Business TaxOps.

Ver [ADÜMÜN governance and Business TaxOps relationship](docs/governance/adumun-governance-and-taxops-relationship.md).

## Navegación

- [ADÜMÜN governance y relación con Business TaxOps](docs/governance/adumun-governance-and-taxops-relationship.md)
- [Arquitectura actual](docs/architecture/current-state.md)
- [Arquitectura objetivo](docs/architecture/target-state.md)
- [Mapa de paquetes y destinos](docs/architecture/module-destination-map.md)
- [Catálogo HTTP](docs/architecture/http-route-catalog.md)
- [Política de paquetes](docs/architecture/package-policy.md)
- [Desktop distribution](docs/desktop/README.md)
- [Configuración final desktop](docs/desktop/final-configuration.md)
- [Lecciones aprendidas desktop](docs/desktop/lessons-learned.md)
- [Evidencia UAT técnica desktop](docs/desktop/uat-evidence-2026-09-04.md)
- [Guía de Windows](docs/windows-local.md)
- [Gaps conocidos](docs/gaps/README.md)
- [Serie de trabajo A.6-A.13](docs/slice/personal-tax-ledger-packs-a6-a13/README.md)

## Estado de distribución desktop

El gate funcional de Windows quedó validado el 2026-09-04:

```text
Electron wrapper                 PASS
Portable win32-x64               PASS
ASAR                             PASS
Pruning determinista             PASS
Build Squirrel desde WSL         PASS
Setup.exe Windows                PASS
Reinstall / install-over         PASS
Uninstall + reinstall            PASS
Persistencia de userData         PASS
```

La configuración final usa Electron `44.2.0`, `@electron/packager` `20.3.0`, `electron-winstaller` `5.4.4`, `asar: true`, `prune: false` y staging autocontenido en `.desktop-runtime`. Los datos desktop se almacenan bajo `app.getPath('userData')`, separados de los binarios instalados.

El siguiente slice de distribución es la firma de código y, después, la política formal de update/autoupdate y el UAT de usuario no técnico.

## Mapa del repositorio

| Carpeta | Propósito | Guía |
|---|---|---|
| `apps/local` | Composition root y host HTTP local | [`apps/local/README.md`](apps/local/README.md) |
| `apps/desktop` | Adaptador Electron y lifecycle Squirrel | [`docs/desktop/README.md`](docs/desktop/README.md) |
| `apps/external-consumer` | Consumidor de prueba de exports públicos | [`apps/external-consumer/README.md`](apps/external-consumer/README.md) |
| `packages/core` | Cálculos y reglas puras | [`packages/core/README.md`](packages/core/README.md) |
| `packages/contracts` | Puertos, contextos y asserts | [`packages/contracts/README.md`](packages/contracts/README.md) |
| `packages/application` | Casos de uso | [`packages/application/README.md`](packages/application/README.md) |
| `packages/api-contracts` | DTOs y transporte HTTP | [`packages/api-contracts/README.md`](packages/api-contracts/README.md) |
| `packages/sqlite-adapter` | SQLite, migraciones y repositorios | [`packages/sqlite-adapter/README.md`](packages/sqlite-adapter/README.md) |
| `packages/shared-ui` | Componentes React presentacionales | [`packages/shared-ui/README.md`](packages/shared-ui/README.md) |
| `packages/frontend-application` | Servicios frontend, hooks y orchestration reutilizables | [`packages/frontend-application/README.md`](packages/frontend-application/README.md) |
| `packages/http-api` | Inbound adapter HTTP reutilizable | [`packages/http-api/README.md`](packages/http-api/README.md) |
| `apps/local/web` | Aplicación React local | [`apps/local/web/README.md`](apps/local/web/README.md) |
| `scripts` | Automatización verificable y portable | [`scripts/README.md`](scripts/README.md) |
| `docs` | Decisiones, procedimientos y gaps | [`docs/README.md`](docs/README.md) |
| `site` | Fuente de la web de conocimiento del repo | [`site/README.md`](site/README.md) |

## Flujo de una petición

```text
apps/local/web/src/features
  -> apps/local/web/src/api.ts
  -> apps/local/src/http/router.mjs
  -> packages/http-api/src/*.mjs
  -> packages/application
  -> packages/contracts
  -> packages/sqlite-adapter
  -> node:sqlite
```

Los cálculos no siguen ese camino: `packages/core` recibe datos y devuelve resultados puros. La UI no contiene SQL y los routers no acceden directamente a tablas.

## Requisitos de desarrollo

- Node.js `24.15+`.
- npm incluido con Node.
- `node:sqlite`, incluido en Node 24.15+.

No se requiere Docker, un ORM, Firebase, Supabase ni una base externa.

Para construir el instalador Squirrel desde WSL/Linux se requieren además Mono y Wine; estos requisitos pertenecen al host de build, no al PC del usuario final.

## Instalación y ejecución local

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
| `DB_PATH` | `data/apv-chile.sqlite` | Ruta de la base SQLite en modo local no-Electron. |

## Build desktop

```bash
npm run desktop:check
npm run desktop:package:win
npm run desktop:installer:win
```

Artefacto final esperado:

```text
out/installer-win32-x64/PersonalTaxLedger-Setup.exe
```

## Verificación completa

```bash
npm run lint
npm run typecheck
npm run architecture:check
npm test
npm run test:workspaces
npm run build:packages
npm run test:external-consumer
npm run pack:smoke
npm run smoke:local
npm run desktop:check
npm run desktop:package:win
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
9. Mantén GitHub como autoridad técnica; Drive como framing/evidencia complementaria y `site/` como read model derivado.

## Estado arquitectónico

La serie A14-A18 está certificada como `CLEAN_HEXAGONAL_READY`. El informe final está en [`docs/architecture/final-certification-a18.md`](docs/architecture/final-certification-a18.md); el informe histórico `PACK_A_PARTIAL` se conserva en [`docs/architecture/pack-a-final-report.md`](docs/architecture/pack-a-final-report.md).