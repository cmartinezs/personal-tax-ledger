# Consumidor externo

Workspace mínimo que prueba la API pública empaquetada de `core`, `contracts`, `application`, `api-contracts`, `shared-ui` y `frontend-application`. Simula una app externa: no importa `src` privado ni `web`.

`test/inner-hexagon.mjs` demuestra que el inner hexagon (Domain + Ports + Application) es ejecutable y testeable sin SQLite, HTTP, web ni `apps/local`, usando repositorios fakes en memoria.

```bash
npm run build --workspace @personal-tax-ledger/external-consumer
npm test --workspace @personal-tax-ledger/external-consumer
```
