# Pack A18.1 — Consumer de readiness cloud

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

Convertir `apps/external-consumer` en prueba explícita de que cloud solo necesita packages públicos.

## Dependencias

- `packs/A17/05-frontend-host-certification.md`

## Tareas

El consumer debe usar domain/core, ports/contracts, application, api-contracts, http-api, frontend-application y shared-ui. Debe ejecutar use case con fake repository, inbound HTTP adapter con dependencias fake, frontend service con fake client y render shared-ui. Debe fallar si necesita `server`, `web`, `sqlite-adapter` o `apps/local`.

## Fuera de alcance

No implementar Postgres/Firebase.

## Validaciones obligatorias

Instalación desde tarballs, ejecución real, import graph y negative checks.

## Definition of Done

Existe evidencia ejecutable de que un host externo puede construir funcionalidad sin roots locales.

## Siguiente MD

`packs/A18/02-remove-transitional-roots-and-facades.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
