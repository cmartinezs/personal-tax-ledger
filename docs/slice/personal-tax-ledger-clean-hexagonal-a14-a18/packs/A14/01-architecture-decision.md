# Pack A14.1 — Decisión arquitectónica Clean/Hexagonal

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

Formalizar la arquitectura objetivo usando Clean Architecture y Hexagonal Architecture, tomando `grade-ops-ai/api/src` solo como guía conceptual.

## Dependencias

- Ninguna dependencia de esta serie.

## Tareas

1. Revisar `apps/local`, `packages/*`, `server/` y `web/`.
2. Crear ADR con las responsabilidades: Domain, Application, Ports, inbound adapters, outbound adapters y Hosts.
3. Establecer como objetivo:
```text
apps/local ─┐
            ├── packages/*
apps/cloud ─┘
```
4. Declarar `server/` y `web/` como roots transitorios a eliminar.
5. Definir macroestructura por responsabilidad y microestructura por feature.
6. Documentar que Windows es plataforma de ejecución de `apps/local`, no otra app.

## Fuera de alcance

No renombrar packages ni mover `server/`/`web/` todavía.

## Validaciones obligatorias

Ejecutar arquitectura y tests documentales aplicables. El ADR debe distinguir claramente estado actual vs objetivo.

## Definition of Done

Existe un ADR inequívoco sobre dirección de dependencias y rol de hosts, ports y adapters.

## Siguiente MD

`packs/A14/02-dependency-rules.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
