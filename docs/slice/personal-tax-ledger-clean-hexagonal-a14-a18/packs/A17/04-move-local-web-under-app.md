# Pack A17.4 — Mover React local a `apps/local/web`

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

Eliminar `web/` como root arquitectónico.

## Dependencias

- `packs/A17/03-migrate-feature-coordination.md`

## Tareas

Mover `web/` a `apps/local/web/`. Mantener allí entrypoint, shell, routing local, Vite, CSS global, composición de servicios y adapters HTTP browser. Corregir workspaces, scripts, Vite, paths y CI.

## Fuera de alcance

No agregar Firebase ni cloud UI.

## Validaciones obligatorias

Typecheck, Vite build, dev/start smoke, Windows paths y architecture check.

## Definition of Done

No existe `web/` como root y la app local vive bajo `apps/local`.

## Siguiente MD

`packs/A17/05-frontend-host-certification.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
