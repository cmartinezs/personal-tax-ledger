# Consumidor externo

Workspace mínimo que prueba la API pública empaquetada de `core`, `contracts`, `api-contracts` y `shared-ui`. Simula una app externa: no importa `src` privado, `server` ni `web`.

```bash
npm run build --workspace @personal-tax-ledger/external-consumer
npm test --workspace @personal-tax-ledger/external-consumer
```
