# Pack A15.4 — Migrar routers de tax, snapshots, years y simulación

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

Completar la migración de routers restantes.

## Dependencias

- `packs/A15/03-migrate-http-routes-financial-features.md`

## Tareas

Migrar tax parameters, rule sources, snapshots, years/references, bootstrap/system y simulation/scenarios. Eliminar cualquier `apps/local -> server/routes`. Reubicar el mapping de `ValidationError` para no depender de `server/lib/util.mjs`.

## Fuera de alcance

No borrar tests de integración solo por estar en `server/test`.

## Validaciones obligatorias

`rg "server/" apps/local packages/http-api packages/application`, catálogo HTTP, tests y smoke local.

## Definition of Done

`apps/local` no importa nada productivo desde `server/`.

## Siguiente MD

`packs/A15/05-remove-server-root.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
