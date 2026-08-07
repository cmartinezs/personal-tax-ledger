# Pack A17.1 — Crear `frontend-application`

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

Crear la capa reusable entre hosts web y `shared-ui`.

## Dependencias

- `packs/A16/05-inner-hexagon-certification.md`

## Tareas

Crear `packages/frontend-application` para servicios, coordinación reusable, estado/controladores/hooks independientes del host y loading/error orchestration. Prohibir Vite, Firebase, routing específico, SQLite y env del host.

## Fuera de alcance

No mover todavía todo `web/`.

## Validaciones obligatorias

Build/test workspace, architecture check y consumer smoke.

## Definition of Done

Existe un package reusable que no conoce local/cloud.

## Siguiente MD

`packs/A17/02-migrate-frontend-services.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
