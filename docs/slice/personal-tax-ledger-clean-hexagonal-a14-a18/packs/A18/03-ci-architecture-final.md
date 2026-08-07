# Pack A18.3 — CI final de Clean/Hexagonal

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

Hacer que CI certifique arquitectura final y portabilidad.

## Dependencias

- `packs/A18/02-remove-transitional-roots-and-facades.md`

## Tareas

Hacer bloqueantes lint, typecheck, architecture, workspace tests, package builds, external consumer, package smoke y local runtime smoke. Ejecutar Linux y Windows según estrategia ya adoptada. Añadir checks de ausencia de `server/` y root `web/`. Verificar ciclos.

## Fuera de alcance

No agregar despliegue cloud.

## Validaciones obligatorias

CI local equivalente, revisar workflow y confirmar ausencia de `continue-on-error` para gates críticos.

## Definition of Done

CI verde significa que Clean/Hexagonal, packages reusable y host local están íntegros.

## Siguiente MD

`packs/A18/04-final-certification.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
