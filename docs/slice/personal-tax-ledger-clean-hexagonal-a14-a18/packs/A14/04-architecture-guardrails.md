# Pack A14.4 — Guardrails de arquitectura objetivo

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

Proteger la arquitectura objetivo antes de las extracciones.

## Dependencias

- `packs/A14/03-target-package-map.md`

## Tareas

1. Añadir tests/checks de arquitectura.
2. Registrar dependencias transitorias actuales (`apps/local -> server/routes`, `apps/local -> server/lib/util`, root `web`).
3. Definir condición de eliminación de cada excepción.
4. Impedir nuevas dependencias legacy.

## Fuera de alcance

No eliminar `server/` ni `web/` todavía.

## Validaciones obligatorias

`npm run architecture:check`, `npm test` y prueba negativa de una dependencia legacy nueva.

## Definition of Done

A14 termina con arquitectura definida, mapeada y protegida.

## Siguiente MD

`packs/A15/01-create-http-api-package.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
