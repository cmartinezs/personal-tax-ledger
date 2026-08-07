# Pack A16.5 — Certificar el inner hexagon

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

Demostrar que Domain + Ports + Application funcionan sin adapters concretos.

## Dependencias

- `packs/A16/04-organize-application-by-feature.md`

## Tareas

Extender `apps/external-consumer` o equivalente para importar inner hexagon y ejecutar casos de uso con fakes en memoria.

## Fuera de alcance

No iniciar cloud.

## Validaciones obligatorias

Package smoke, external consumer, architecture checks e import graph.

## Definition of Done

El inner hexagon es ejecutable y testeable sin SQLite, HTTP, web ni apps/local.

## Siguiente MD

`packs/A17/01-create-frontend-application-package.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
