# Secuencia de migración

El repositorio conserva la historia de una migración incremental. El código actual se entiende mejor leyendo [`current-state.md`](current-state.md); esta secuencia explica qué frontera se atacó en cada bloque.

| Bloque | Resultado actual | Evidencia |
|---|---|---|
| A.0-A.5 | Extracción inicial de core, contracts, application, API contracts, shared-ui y primer adapter. | Historial previo a `c88811e`. |
| A.6 | Host HTTP real en `apps/local`, fachada compatible en `server/index.mjs`. | Commit `c88811e`. |
| A.7 | Factory SQLite, migraciones, repositorios por agregado y eliminación de persistencia legacy. | Commit `9383538`. |
| A.8 | DTOs de todos los agregados, errores y paginación. | Commit `725fda7`. |
| A.9 | Shell React, features y services por módulo. | Commit `a620489`. |
| A.10 | Primitives y componentes reutilizables de shared-ui. | Commit `ac1c1b2`. |
| A.11 | Tests propios por workspace y consumidor externo. | Commit `bd01cf0`. |
| A.12-A.13 | TypeScript estricto, CI bloqueante, runtime portable y documentación Windows. | Commit `26c40db`. |

## Cómo extender la arquitectura

Para un nuevo agregado, sigue [`aggregate-migration-pattern.md`](aggregate-migration-pattern.md), adaptando sus pasos al estado actual. Debes añadir contrato, adapter, application, router, DTO, servicio UI y tests antes de marcarlo completo.

## Rollback conceptual

- Revertir un cambio de dominio en `core` sin tocar adapters.
- Revertir una migración de persistencia solo con un plan de compatibilidad de base.
- Revertir UI sin eliminar el DTO compartido si ya lo consume otro módulo.
- No restaurar módulos legacy como segunda fuente de verdad.
