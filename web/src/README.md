# Código del frontend

`App.tsx` es el shell mínimo. La orquestación de la vista vive en `app/WorkspaceView.tsx`; los módulos funcionales están en `features/`; `api.ts` es el cliente HTTP y `services.ts` contiene factories inyectables.

Los componentes deben usar DTOs de `@personal-tax-ledger/api-contracts`, no inventar formas paralelas si el contrato compartido ya existe. Consulta [`app/README.md`](app/README.md), [`features/README.md`](features/README.md) y [`../../packages/api-contracts/README.md`](../../packages/api-contracts/README.md).
