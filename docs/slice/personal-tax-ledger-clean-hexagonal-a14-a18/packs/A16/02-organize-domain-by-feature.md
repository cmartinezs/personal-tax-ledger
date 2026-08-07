# Pack A16.2 — Organizar Domain por vertical slices

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

Reorganizar reglas puras por feature sin cambiar resultados.

## Dependencias

- `packs/A16/01-domain-and-ports-decision.md`

## Tareas

Organizar income, fees, mortgages, apv, taxation, scenarios y shared. Solo modelos, value objects y cálculos puros.

## Fuera de alcance

No cambiar fórmulas tributarias.

## Validaciones obligatorias

Tests de cálculo, build, smoke y cero imports de I/O, HTTP, React o adapters.

## Definition of Done

El dominio es navegable por feature e independiente de infraestructura.

## Siguiente MD

`packs/A16/03-organize-ports-by-feature.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
