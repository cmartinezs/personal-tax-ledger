# Guardrails de arquitectura objetivo

Guardrails automatizados que protegen la arquitectura Clean/Hexagonal (ADR-0001) durante la
migración A14-A18. Se ejecutan con `npm run architecture:check` y en CI.

## Reglas activas

1. **Ciclos:** no se permiten ciclos de dependencias entre paquetes internos.
2. **Domain/Ports sin dependencias internas:** `core` y `contracts` no dependen de otros
   paquetes internos ni de infraestructura.
3. **Application desacoplada de adapters:** `application` solo depende de `contracts` y `core`;
   no de `sqlite-adapter`, `shared-ui`, `http-api` ni `frontend-application`.
4. **Sin roots legacy en packages reusables:** ningún package bajo `packages/` puede importar
   `server/`, `web/` o `apps/local` productivos.
5. **Sin frameworks prohibidos:** react, react-dom, node:sqlite y node:http están prohibidos
   fuera de su paquete de infraestructura (con excepciones explícitas).
6. **Hosts acotados:** los hosts (`apps/local`, `apps/external-consumer`) no crean nuevas
   dependencias legacy.

## Excepciones transitorias

| Excepción | Razón | Condición de eliminación |
|---|---|---|
| `apps/local -> server/routes` | Los routers aún viven en `server/routes`; se migran en A15.2-A15.4. | Todos los routers migrados a `packages/http-api` (A15.5). |
| `apps/local -> server/lib/util` | `ValidationError` y utilidades viven en `server/lib`; se reubican. | `ValidationError` reubicado en `api-contracts` (A15.4). |
| Root `web/` | El frontend local aún vive en la raíz. | Frontend movido a `apps/local/web` (A17.4). |
| Root `server/` | Fachada transitoria de `apps/local`. | Eliminado en A15.5. |

## Prohibiciones permanentes

- `application -> sqlite-adapter` (persistencia concreta).
- `shared-ui -> web/server/apps/local`.
- Nuevos packages reusables -> roots legacy.
- Cualquier import no registrado como excepción transitoria.

## Validaciones

```bash
npm run architecture:check
npm test
```

- El checker introduce una prueba negativa en CI: se verifica que una dependencia prohibida
  (p. ej. `application -> sqlite-adapter`) haga fallar la comprobación.
- La verificación documental de links relativos debe permanecer verde tras cada cambio.

## Documentos relacionados

- [ADR-0001](adr/0001-clean-hexagonal-architecture.md)
- [Mapa objetivo](target-package-map.md)
- [Política de paquetes](package-policy.md)
