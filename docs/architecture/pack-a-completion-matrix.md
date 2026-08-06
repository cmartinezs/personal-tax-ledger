# Matriz de completitud del Pack A

Actualizada en cada paso de `docs/fix-pack-a/`. Estados válidos: `NOT_STARTED`,
`PARTIAL`, `TRANSITIONAL`, `COMPLETE`, `BLOCKED`, `NOT_APPLICABLE`.

No se marca `COMPLETE` si el router o la UI dependen directamente de SQLite.

| Capacidad | Core | Contrato | Adaptador SQLite | Caso de uso | Router | API contract | Servicio UI | Shared UI | Tests | Estado |
|---|---|---|---|---|---|---|---|---|---|---|
| Ingresos (CRUD) | N/A | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE |
| Copia de ingresos entre años | N/A | COMPLETE | COMPLETE | COMPLETE | COMPLETE | N/A | PARTIAL (usa `api.copyIncomes`) | NOT_APPLICABLE | COMPLETE | COMPLETE (backend); servicio frontend pendiente del paso 10 |
| Simulación anual | COMPLETE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | PARTIAL (ruta en `server/index.mjs`) | NOT_STARTED | PARTIAL | NOT_APPLICABLE | COMPLETE (core) | PARTIAL |
| APV A / B directo / por planilla | COMPLETE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | N/A (vía `/api/simulate`, `/api/compare-apv`) | NOT_STARTED | PARTIAL | NOT_APPLICABLE | COMPLETE (core) | PARTIAL |
| Boletas de honorarios | COMPLETE (cálculo) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | NOT_STARTED | PARTIAL | NOT_STARTED | COMPLETE | COMPLETE (backend); DTO/servicio frontend/UI compartida pendientes |
| Configuración de gastos de honorarios | N/A | COMPLETE | COMPLETE | COMPLETE | COMPLETE | NOT_STARTED | PARTIAL | NOT_APPLICABLE | COMPLETE | COMPLETE (backend); DTO/servicio frontend pendientes |
| Créditos hipotecarios | COMPLETE (cálculo art. 55 bis) | COMPLETE | COMPLETE | COMPLETE | COMPLETE | NOT_STARTED | PARTIAL | NOT_STARTED | COMPLETE | COMPLETE (backend); DTO/servicio frontend/UI compartida pendientes |
| Registros hipotecarios anuales | N/A | COMPLETE | COMPLETE | COMPLETE | COMPLETE | NOT_STARTED | PARTIAL | NOT_APPLICABLE | COMPLETE | COMPLETE (backend); DTO/servicio frontend pendientes |
| Artículo 55 bis (endpoint de cálculo) | COMPLETE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | PARTIAL | NOT_STARTED | PARTIAL | NOT_APPLICABLE | COMPLETE (core) | PARTIAL |
| Escenarios | COMPLETE (cálculo) | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | PARTIAL | NOT_STARTED | PARTIAL | NOT_STARTED | COMPLETE (core) | PARTIAL |
| Snapshots | N/A | NOT_STARTED | NOT_STARTED | NOT_STARTED | PARTIAL | NOT_STARTED | N/A (no hay UI de lectura) | NOT_APPLICABLE | NOT_STARTED | PARTIAL |
| Settings | N/A | COMPLETE | COMPLETE | COMPLETE | COMPLETE | NOT_STARTED | PARTIAL | NOT_APPLICABLE | COMPLETE | COMPLETE (backend); DTO/servicio frontend pendientes |
| Parámetros tributarios | N/A | NOT_STARTED | NOT_STARTED | NOT_STARTED | PARTIAL | NOT_STARTED | PARTIAL | NOT_APPLICABLE | PARTIAL | PARTIAL |
| Fuentes oficiales (tax rule sources) | N/A | NOT_STARTED | NOT_STARTED | NOT_STARTED | PARTIAL | NOT_STARTED | PARTIAL | NOT_STARTED | PARTIAL | PARTIAL |
| Años disponibles | N/A | NOT_STARTED | NOT_STARTED | NOT_STARTED | PARTIAL | NOT_STARTED | PARTIAL | NOT_APPLICABLE | NOT_STARTED | PARTIAL |
| Execution logs / bitácora | N/A | COMPLETE | COMPLETE | COMPLETE | COMPLETE | NOT_STARTED | PARTIAL | NOT_APPLICABLE | COMPLETE | COMPLETE (backend); DTO/servicio frontend pendientes |
| Referencias oficiales (catálogo) | N/A | NOT_STARTED | NOT_STARTED | NOT_STARTED | PARTIAL | NOT_STARTED | PARTIAL | NOT_APPLICABLE | NOT_STARTED | PARTIAL |
| Bootstrap / health | N/A | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | PARTIAL | NOT_APPLICABLE | PARTIAL | NOT_APPLICABLE | COMPLETE (http-contract) | PARTIAL |
| Archivos estáticos | N/A | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | TRANSITIONAL (`serveStatic` en `server/index.mjs`) | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_STARTED | TRANSITIONAL |

## Notas

- "Core" se marca `N/A` cuando la capacidad no tiene cálculo tributario propio (es persistencia pura).
- "COMPLETE (core)" indica que el cálculo puro ya vive en `packages/core` y está probado, aunque el resto de la cadena (contrato/adaptador/router/DTO) no exista todavía para esa capacidad.
- El estado global de cada fila es el mínimo razonable entre sus columnas: una fila con cualquier columna aplicable en `NOT_STARTED` no puede ser `COMPLETE`. Cuando el backend (contrato/adaptador/caso de uso/router/DTO) está completo pero el servicio frontend dedicado todavía no existe (paso 10 de `docs/fix-pack-a/`), se anota explícitamente "COMPLETE (backend); servicio frontend pendiente" en vez de marcar la fila `COMPLETE` sin más.

Este documento se actualiza fila por fila a medida que se ejecuta cada paso de
`docs/fix-pack-a/`.
