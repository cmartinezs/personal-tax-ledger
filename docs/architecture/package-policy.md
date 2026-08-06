# Política de paquetes

## Superficie inicial

| Paquete | Superficie estable inicial | Público futuro |
|---|---|---|
| `@personal-tax-ledger/core` | Cálculos puros, parámetros y utilidades exportados explícitamente. | Sí |
| `@personal-tax-ledger/contracts` | `WorkspaceContext`, contratos de repositorio y validadores. | Sí |
| `@personal-tax-ledger/api-contracts` | DTOs serializables de ingresos y `ApiError`. | Sí |
| `@personal-tax-ledger/application` | Casos de uso de ingresos (`createIncomeUseCases`) que coordinan `contracts` y un repositorio. | No por defecto |
| `@personal-tax-ledger/shared-ui` | Sección React de ingresos, presentacional (recibe datos y callbacks por props). | Sí |
| `@personal-tax-ledger/sqlite-adapter` | Adaptador local de SQLite. | No por defecto |
| `@personal-tax-ledger/local-app` | Composition root local (`createLocalComposition`) consumido por `server/index.mjs`. | No |

`@personal-tax-ledger/application` y `@personal-tax-ledger/local-app` no forman parte del diagrama original del paquete A (`docs/slice/personal-tax-ledger-migration-prompt-a.md`), que sólo anticipaba `core`, `contracts`, `api-contracts`, `shared-ui` y `sqlite-adapter`. Se agregaron en A07/A11 porque los casos de uso y el ensamblaje local necesitaban un lugar propio fuera de `server/`; quedan documentados aquí como una decisión de la migración, no como paquetes públicos.

Los paquetes no publican automáticamente. El consumidor debe instalar tarballs producidos localmente y no depender de rutas internas `src/`.

La decisión vigente es que `application` forma parte de la superficie pública
futura: el repositorio cloud debe poder inyectar sus propios repositorios y
reutilizar los mismos casos de uso. `sqlite-adapter` y `local-app` siguen
siendo paquetes locales y no forman parte de la publicación pública.

`npm run pack:dry-run` inspecciona el contenido de los cinco paquetes públicos
y `npm run pack:smoke` instala los tarballs en un consumidor temporal,
importa `application`, ejecuta un caso de uso con un fake, y renderiza
`shared-ui` desde su build compilado.
