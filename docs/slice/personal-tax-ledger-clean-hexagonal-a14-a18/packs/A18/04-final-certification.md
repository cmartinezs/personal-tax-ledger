# Pack A18.4 — Certificación final y cierre

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

Cerrar la migración con evidencia explícita de arquitectura reusable y readiness cloud.

## Dependencias

- `packs/A18/03-ci-architecture-final.md`

## Tareas

Actualizar arquitectura actual/objetivo, estructura final, packages públicos/privados y ejecutar suite completa. Crear informe final con commits, packages, apps, reglas de dependencia, CI, Windows, external consumer y deuda residual. Veredicto:
```text
CLEAN_HEXAGONAL_READY
CLEAN_HEXAGONAL_PARTIAL
CLEAN_HEXAGONAL_BLOCKED
```
Solo usar READY si un host externo no necesita `server/`, `web/`, `sqlite-adapter` ni `apps/local`.

## Fuera de alcance

No iniciar implementación cloud dentro de este MD.

## Validaciones obligatorias

Suite completa: architecture, typecheck, tests, builds, package smoke, external consumer, local smoke y Windows CI/equivalente.

## Definition of Done

Arquitectura Clean/Hexagonal terminada y plataforma lista para iniciar cloud sin copiar código local.

## Siguiente MD

`NONE`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
