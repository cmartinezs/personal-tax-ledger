# Patrón para agregar un agregado

Este patrón sirve para incorporar una entidad nueva sin romper las fronteras descritas en [`target-state.md`](target-state.md).

## Secuencia

1. **Dominio**: agrega cálculos puros a `packages/core` si existen.
2. **Contrato**: define métodos específicos y asserts en `packages/contracts`.
3. **Persistencia**: agrega SQL/mapping/migraciones en `packages/sqlite-adapter/src/database/` y un repository adapter.
4. **Application**: crea casos de uso que reciban el repositorio por inyección.
5. **HTTP**: crea un router en `server/routes` que reciba dependencias y delegue.
6. **Composición**: registra repositorio, casos de uso y router en `apps/local/src/composition`.
7. **DTOs**: define requests, responses, filtros y errores en `packages/api-contracts`.
8. **Frontend**: crea feature, service factory y componentes; usa `shared-ui` si son presentacionales.
9. **Tests**: agrega tests propios al workspace y tests de integración en `server/test`.
10. **Validación**: ejecuta lint, typecheck, architecture, tests, builds, package smoke y runtime smoke.

## No hacer

- No importar SQLite desde routers o React.
- No usar tipos locales de `web/src/types.ts` si existe un DTO compartido.
- No abrir la base al importar un paquete.
- No copiar reglas tributarias entre frontend y core.
- No crear una aplicación específica para Windows/cloud.

## Referencias

- [`packages/sqlite-adapter/README.md`](../../packages/sqlite-adapter/README.md)
- [`packages/application/README.md`](../../packages/application/README.md)
- [`packages/api-contracts/README.md`](../../packages/api-contracts/README.md)
- [`web/src/features/README.md`](../../web/src/features/README.md)
