# Pack A17.2 — Migrar servicios frontend reutilizables

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

Mover factories y servicios reutilizables fuera de `web/src/services.ts` y equivalentes.

## Dependencias

- `packs/A17/01-create-frontend-application-package.md`

## Tareas

Extraer servicios de fee receipts, mortgages, scenarios, sources, logs, settings e incomes cuando aplique. Depender de clientes abstractos y api-contracts. Mantener el cliente HTTP concreto en el host local.

## Fuera de alcance

No mover auth cloud ni routing.

## Validaciones obligatorias

Unit tests con fake client, verificar que frontend-application no importe `web/`, typecheck.

## Definition of Done

Los servicios reutilizables ya no están atrapados en el host local.

## Siguiente MD

`packs/A17/03-migrate-feature-coordination.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
