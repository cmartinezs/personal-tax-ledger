# Política de paquetes

Esta política complementa los README de [`packages/`](../../packages/README.md) y el mapa de [estado objetivo](target-state.md).

## Superficie inicial

| Paquete | Superficie estable inicial | Público futuro |
|---|---|---|
| `@personal-tax-ledger/core` | Cálculos puros, parámetros y utilidades exportados explícitamente. | Sí |
| `@personal-tax-ledger/contracts` | `WorkspaceContext`, contratos de repositorio y validadores. | Sí |
| `@personal-tax-ledger/api-contracts` | DTOs serializables, filtros, errores y paginación. | Sí |
| `@personal-tax-ledger/application` | Casos de uso que coordinan contracts y repositorios. | Sí, mediante inyección |
| `@personal-tax-ledger/http-api` | Routers HTTP inyectables y helpers de transporte. | Sí |
| `@personal-tax-ledger/frontend-application` | Services, coordinación frontend, hooks y feedback. | Sí |
| `@personal-tax-ledger/shared-ui` | Componentes React presentacionales y primitives. | Sí |
| `@personal-tax-ledger/sqlite-adapter` | Adaptador local de SQLite y lifecycle. | No |
| `@personal-tax-ledger/local-app` | Composition root y host HTTP local. | No |

`@personal-tax-ledger/application` y `@personal-tax-ledger/local-app` no formaban parte del diagrama inicial de la migración. Se agregaron porque los casos de uso y el ensamblaje local necesitan un lugar propio fuera de `server/`. `application` queda preparado para consumidores que inyecten otros repositorios; `local-app` permanece específico de la ejecución local.

Los paquetes no publican automáticamente. El consumidor debe instalar tarballs producidos localmente y no depender de rutas internas `src/`.

La decisión vigente es que `application` forma parte de la superficie pública futura: un consumidor debe poder inyectar sus propios repositorios y reutilizar los mismos casos de uso. `sqlite-adapter` y `local-app` son paquetes locales y no forman parte de la publicación pública.

`npm run pack:dry-run` inspecciona el contenido de los siete paquetes públicos
y `npm run pack:smoke` instala los tarballs en un consumidor temporal,
importa `application` y `http-api`, ejecuta casos con fakes, usa services de
`frontend-application` y renderiza `shared-ui` desde su build compilado.
