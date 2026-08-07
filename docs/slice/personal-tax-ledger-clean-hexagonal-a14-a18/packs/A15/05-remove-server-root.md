# Pack A15.5 — Eliminar `server/` como root arquitectónico

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

Eliminar `server/` después de mover lo reusable y reubicar tests/fachadas.

## Dependencias

- `packs/A15/04-migrate-http-routes-support-features.md`

## Tareas

Inventariar `server/`, reubicar tests de integración, mover cualquier utilidad reusable al package correcto, eliminar código sin consumidores, corregir scripts/docs/CI y eliminar `server/` si queda sin responsabilidad legítima.

## Fuera de alcance

No mover todavía root `web/`.

## Validaciones obligatorias

Búsqueda de referencias productivas a `server/`, suite completa y smoke local.

## Definition of Done

No existe `server/` como root productivo y ningún package/host depende de él.

## Siguiente MD

`packs/A16/01-domain-and-ports-decision.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
