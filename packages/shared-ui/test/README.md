# Tests de shared-ui

Renderizan los componentes públicos desde el artefacto compilado. No deben importar componentes de `apps/local/web/src`; eso garantiza que una app externa pueda consumir el paquete.

Ejecutar: `npm run build --workspace @personal-tax-ledger/shared-ui && npm test --workspace @personal-tax-ledger/shared-ui`. El consumer externo está en [`../../../apps/external-consumer/README.md`](../../../apps/external-consumer/README.md).
