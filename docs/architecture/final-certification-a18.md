# Certificación Final A14-A18

## Veredicto

`CLEAN_HEXAGONAL_READY`

Un host externo puede consumir los packages públicos sin importar ni copiar `server/`, `web/`, `sqlite-adapter/` ni `apps/local`.

## Superficie pública

- `@personal-tax-ledger/core`: cálculos puros.
- `@personal-tax-ledger/contracts`: ports, contextos y contratos.
- `@personal-tax-ledger/api-contracts`: DTOs y transporte serializable.
- `@personal-tax-ledger/application`: casos de uso con repositorios inyectados.
- `@personal-tax-ledger/http-api`: routers HTTP inyectables.
- `@personal-tax-ledger/frontend-application`: services y coordinación frontend reusable.
- `@personal-tax-ledger/shared-ui`: componentes React presentacionales.

## Hosts

- `apps/local`: composition root, SQLite, HTTP server y React local en `apps/local/web`.
- `apps/external-consumer`: smoke de consumo público desde tarballs.
- `apps/cloud`: reservado para una implementación futura; no se crea en esta serie.

## Reglas verificadas

- `core` y `contracts` no dependen de packages internos.
- `application` no depende de SQLite, HTTP ni UI.
- `http-api` recibe casos de uso y helpers por inyección.
- `frontend-application`, `shared-ui` y `api-contracts` no importan `apps/local`.
- No existen roots `server/` ni `web/`.
- No existen ciclos de packages internos.
- `sqlite-adapter` y `local-app` permanecen locales y no son superficie cloud.

## CI y portabilidad

`.github/workflows/ci.yml` ejecuta gates bloqueantes en Ubuntu y Windows:

- lint, typecheck y architecture check;
- tests raíz y tests de workspaces;
- builds de packages;
- external consumer;
- package smoke y runtime smoke;
- build del frontend local.

La validación local equivalente ejecutada en Linux fue:

```text
npm ci
npm run lint
npm run typecheck
npm run architecture:check
npm test
npm run test:workspaces
npm run build:packages
npm run test:external-consumer
npm run pack:dry-run
npm run pack:smoke
npm run smoke:local
cd apps/local/web && npx --no-install vite build
```

La estrategia Windows queda cubierta por la matriz `windows-latest`, `npmCommand('win32')`, paths portables y el mismo conjunto de gates bloqueantes.

## Commits de cierre

- `5584b62`: contracts por vertical slices.
- `94c8ac4`: application por vertical slices.
- `939444f`: certificación del inner hexagon.
- `8e11095`: package `frontend-application`.
- `12d7c74`: migración de frontend services.
- `353e804`: coordinación frontend reusable.
- `a77b5be`: movimiento de `web` a `apps/local/web`.
- `eca8bc7`: certificación host/reuse.
- `4f12530`: consumer cloud-readiness.
- `681c07c`: eliminación de fachadas transitorias.
- `0efdac4`: CI y architecture gates finales.

## Deuda residual

- La implementación cloud concreta, persistencia cloud y despliegue cloud quedan fuera de alcance.
- Los documentos históricos de `docs/gaps/` y `docs/architecture/pack-a-final-report.md` se conservan como trazabilidad; no representan necesariamente el estado actual.
- Las reglas tributarias futuras requieren fuentes oficiales y nuevos parámetros versionados antes de implementarse.
