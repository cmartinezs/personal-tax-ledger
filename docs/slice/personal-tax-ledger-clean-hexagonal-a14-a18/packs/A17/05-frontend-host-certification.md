# Pack A17.5 — Certificar separación frontend host/reuse

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

Demostrar que cloud puede construir su host consumiendo packages sin copiar frontend local.

## Dependencias

- `packs/A17/04-move-local-web-under-app.md`

## Tareas

Verificar que frontend-application, shared-ui y api-contracts no importan apps/local. Añadir smoke externo que renderice componentes y ejecute servicios con fake client.

## Fuera de alcance

No crear todavía el repo cloud.

## Validaciones obligatorias

External consumer, package smoke, typecheck y architecture.

## Definition of Done

La reutilización frontend no depende de la aplicación local.

## Siguiente MD

`packs/A18/01-cloud-readiness-consumer.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
