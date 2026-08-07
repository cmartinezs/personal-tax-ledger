# Pack A15.2 — Migrar routers de ingresos, settings y logs

## Contrato de ejecución

Este MD corresponde a un único paso acotado. No continúes automáticamente con el siguiente MD.

Antes de modificar código:

1. Confirma que el working tree esté limpio.
2. Identifica rama y commit base.
3. Lee `README.md`, `AGENTS.md` si existe y la documentación arquitectónica vigente.
4. Valida concretamente todas las dependencias indicadas.
5. No confíes solo en nombres de commits o documentación: comprueba archivos, imports, scripts, tests y wiring real.
6. Si una dependencia requerida no está realmente implementada, detente y reporta `BLOCKED_DEPENDENCY`.
7. Conserva comportamiento observable, rutas HTTP, payloads, resultados tributarios y compatibilidad de datos salvo indicación expresa.
8. No implementes funcionalidades cloud.
9. Si encuentras un problema fuera de alcance, documéntalo como gap.

Al finalizar, informa:

```text
MD_EXECUTED: <archivo>
STATUS: PASS | BLOCKED
DEPENDENCIES_VALIDATED: YES | NO
COMMIT: <sha o N/A>
EVIDENCE:
- <comandos>
- <tests>
- <archivos clave>
- <validaciones arquitectónicas>
NEXT_MD: <archivo siguiente o NONE>
```

No avances automáticamente.


## Propósito

Mover el primer grupo de routers desde `server/routes` a `packages/http-api`.

## Dependencias

- `packs/A15/01-create-http-api-package.md`

## Tareas

Migrar ingresos, settings y execution logs por feature. Inyectar casos de uso y contexto. Mantener rutas, payloads, status codes y errores. Actualizar `apps/local`. Eliminar legacy solo sin consumidores.

## Fuera de alcance

No migrar boletas/hipotecarios/tax todavía.

## Validaciones obligatorias

Tests HTTP, `rg "server/routes" apps/local packages`, arquitectura y smoke local.

## Definition of Done

Estas tres features ya no requieren `server/routes`.

## Siguiente MD

`packs/A15/03-migrate-http-routes-financial-features.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
