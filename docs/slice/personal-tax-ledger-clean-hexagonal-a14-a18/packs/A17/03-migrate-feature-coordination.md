# Pack A17.3 — Extraer coordinación reusable de features

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

Mover fuera del host local la lógica de feature también necesaria para cloud.

## Dependencias

- `packs/A17/02-migrate-frontend-services.md`

## Tareas

Identificar lógica no visual en `web/src/features`; mover coordinación reusable a `frontend-application`; mantener componentes presentacionales en `shared-ui`; mantener glue específico en el host.

## Fuera de alcance

No convertir todo en shared-ui.

## Validaciones obligatorias

Feature tests, shared-ui render tests, typecheck y arquitectura.

## Definition of Done

Las features reutilizables pueden ensamblarse desde otro host sin copiar lógica local.

## Siguiente MD

`packs/A17/04-move-local-web-under-app.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
