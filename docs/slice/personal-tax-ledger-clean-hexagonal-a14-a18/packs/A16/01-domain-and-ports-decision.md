# Pack A16.1 — Normalizar `core/domain` y `contracts/ports`

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

Resolver de forma controlada naming y fronteras del inner hexagon.

## Dependencias

- `packs/A15/05-remove-server-root.md`

## Tareas

Evaluar costo de `core -> domain` y `contracts -> ports`. Renombrar solo si es seguro; si no, documentar roles equivalentes. Organizar internamente por feature y mantener compatibilidad de exports.

## Fuera de alcance

No mezclar adapters dentro del inner hexagon.

## Validaciones obligatorias

Package smoke, external consumer, architecture check, imports obsoletos.

## Definition of Done

La terminología Clean/Hexagonal es inequívoca sin romper consumidores.

## Siguiente MD

`packs/A16/02-organize-domain-by-feature.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
