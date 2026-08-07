# Pack A15.1 — Crear inbound adapter `http-api`

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

Crear el package reusable que reemplazará el rol arquitectónico de `server/routes`.

## Dependencias

- `packs/A14/04-architecture-guardrails.md`

## Tareas

1. Crear `packages/http-api`.
2. Depender solo de `application`, ports/contracts y `api-contracts` según corresponda.
3. Mover/recrear errores HTTP, JSON response, body parsing y query parsing común.
4. Añadir tests propios del workspace.
5. No conectar todavía todos los routers.

## Fuera de alcance

No mover aún todos los routers.

## Validaciones obligatorias

Build/test del package, architecture check, y confirmar ausencia de SQLite, `server/`, `web/`, `apps/local`.

## Definition of Done

Existe un inbound adapter HTTP independiente y consumible por cualquier host.

## Siguiente MD

`packs/A15/02-migrate-http-routes-core-features.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
