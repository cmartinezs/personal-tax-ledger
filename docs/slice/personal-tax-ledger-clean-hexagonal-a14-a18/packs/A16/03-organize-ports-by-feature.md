# Pack A16.3 — Organizar Ports por vertical slices

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

Reorganizar repositorios, contextos y contratos por feature.

## Dependencias

- `packs/A16/02-organize-domain-by-feature.md`

## Tareas

Organizar ports de income, fees, mortgages, settings, tax, snapshots, logs y shared workspace context. Evitar una interfaz genérica universal.

## Fuera de alcance

No introducir SQLite ni HTTP.

## Validaciones obligatorias

Contract tests, workspace tests y architecture check.

## Definition of Done

Todos los outbound ports están definidos hacia adentro y organizados por feature.

## Siguiente MD

`packs/A16/04-organize-application-by-feature.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
