# 13 — CI y documentación final

## Objetivo

Hacer que CI verifique todas las fronteras que el Pack A declara, y dejar
documentadas las fachadas transitorias restantes y las dependencias reales.

## Alcance

- Añadir `validate:pack-a` como comando agregado reproducible.
- Ejecutar en CI instalación, tests, arquitectura, builds, smoke de paquetes,
  smoke local y validación Pack A.
- Validar imports prohibidos en routers/application/shared-ui.
- Validar que los routers no importen persistencia concreta.
- Crear `docs/architecture/transitional-facades.md`.
- Completar la matriz de completitud con el estado real.

## Restricciones

- No ocultar el fallo conocido de `tsc -b`; mantenerlo como paso informativo
  según `docs/gaps/2026-08-06-tsc-web.md`.
- No declarar Pack A completo si quedan capacidades funcionales con contratos
  o routers pendientes.

## Criterios de aceptación

- `npm run validate:pack-a` ejecuta verificaciones agregadas.
- CI ejecuta dicho comando.
- Existe inventario de fachadas con condición de eliminación.
- Tests de arquitectura fallan ante router → `database.mjs`, application →
  SQLite y shared-ui → `web/src`.
- Todos los comandos verdes, excepto el typecheck conocido e informativo.

## Commit

`ci: enforce complete Pack A validation and document transitional facades`
