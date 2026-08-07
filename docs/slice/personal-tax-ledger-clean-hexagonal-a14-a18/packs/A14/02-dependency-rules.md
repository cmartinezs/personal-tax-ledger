# Pack A14.2 — Reglas de dependencias y fronteras

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

Convertir el ADR en reglas verificables de imports.

## Dependencias

- `packs/A14/01-architecture-decision.md`

## Tareas

1. Formalizar dependencias permitidas.
2. Prohibir `application -> sqlite-adapter`, Domain/Core -> infraestructura, `shared-ui -> web/server/apps/local`, y nuevos packages reusable -> roots legacy.
3. Mantener detección de ciclos.
4. Registrar excepciones transitorias necesarias para A15-A17.

## Fuera de alcance

No mover routers ni frontend.

## Validaciones obligatorias

`npm run architecture:check`. Introducir temporalmente una dependencia prohibida para comprobar que el guard falla y revertirla antes del commit.

## Definition of Done

Las reglas Clean/Hexagonal están automatizadas y las excepciones legacy están acotadas.

## Siguiente MD

`packs/A14/03-target-package-map.md`

Antes de ejecutar el siguiente MD, el agente debe validar que las dependencias anteriores estén realmente implementadas.
