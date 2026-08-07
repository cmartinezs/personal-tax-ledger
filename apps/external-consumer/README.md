# Consumidor externo

Workspace mínimo que prueba la API pública empaquetada de `core`, `contracts`, `application`, `api-contracts`, `http-api`, `shared-ui` y `frontend-application`. Simula una app externa: no importa `src` privado, `server`, `web`, `sqlite-adapter` ni `apps/local`.

`test/inner-hexagon.mjs` demuestra que el inner hexagon (Domain + Ports + Application) es ejecutable y testeable sin SQLite, HTTP, web ni `apps/local`, usando repositorios fakes en memoria. `test/consumer.mjs` añade un router HTTP con dependencias fake, services frontend con fake client y render de `shared-ui`.

```bash
npm run build --workspace @personal-tax-ledger/external-consumer
npm test --workspace @personal-tax-ledger/external-consumer
```
