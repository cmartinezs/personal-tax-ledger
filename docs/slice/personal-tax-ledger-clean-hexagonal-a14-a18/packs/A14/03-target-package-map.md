# Pack A14.3 — Mapa objetivo de packages y vertical slices

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

Definir dónde debe vivir cada responsabilidad antes de mover código.

## Dependencias

- `packs/A14/02-dependency-rules.md`

## Tareas

1. Documentar:
```text
packages/
├── domain/              # hoy core
├── ports/               # hoy contracts
├── application/
├── api-contracts/
├── http-api/
├── sqlite-adapter/
├── frontend-application/
└── shared-ui/
```
2. No forzar aún `core -> domain` ni `contracts -> ports`; registrar decisión para A16.
3. Mapear cada feature a Domain, Port, Use Case, HTTP adapter, persistence adapter, frontend application y shared UI.
4. Incluir ingresos, boletas, hipotecarios, escenarios/APV, settings, tax catalogs, snapshots, years y logs.

## Fuera de alcance

No mover archivos todavía.

## Validaciones obligatorias

Verificar cada destino contra archivos reales y no dejar módulos productivos sin destino.

## Definition of Done

Existe un mapa completo y accionable para los siguientes packs.

## Siguiente MD

`packs/A14/04-architecture-guardrails.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
