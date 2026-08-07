# Paquetes internos

Librerías del monorepo. Sus límites son intencionales: `core` y `contracts` son de dominio/contratos, `application` coordina casos de uso, `api-contracts` define transporte, `http-api` adapta HTTP, `frontend-application` reutiliza coordinación frontend, `sqlite-adapter` persiste y `shared-ui` presenta.

Cada paquete debe tener exports explícitos, tests propios y un build independiente cuando su formato lo requiera.

## Índice

- [`core/README.md`](core/README.md)
- [`contracts/README.md`](contracts/README.md)
- [`application/README.md`](application/README.md)
- [`api-contracts/README.md`](api-contracts/README.md)
- [`http-api/README.md`](http-api/README.md)
- [`frontend-application/README.md`](frontend-application/README.md)
- [`sqlite-adapter/README.md`](sqlite-adapter/README.md)
- [`shared-ui/README.md`](shared-ui/README.md)

Las reglas de dependencias están en [`../docs/architecture/target-state.md`](../docs/architecture/target-state.md).
