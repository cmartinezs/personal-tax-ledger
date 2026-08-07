# Frontend web

Aplicación React 19 + TypeScript estricto + Vite. `src/app` contiene el shell y `src/features` contiene módulos funcionales; `shared-ui` contiene componentes presentacionales reutilizables.

## Navegación del código

- [`src/README.md`](src/README.md): mapa de imports y responsabilidades.
- [`src/app/README.md`](src/app/README.md): shell, providers, servicios y workspace.
- [`src/features/README.md`](src/features/README.md): reglas de módulos funcionales.
- [`../../../packages/api-contracts/README.md`](../../../packages/api-contracts/README.md): formas HTTP compartidas.
- [`../../../packages/shared-ui/README.md`](../../../packages/shared-ui/README.md): componentes reutilizables.

## Comandos

```bash
npm run dev --workspace @personal-tax-ledger/local-web
npm run typecheck --workspace @personal-tax-ledger/local-web
npx --no-install vite build
```

El frontend consume la API local mediante el proxy de Vite. No colocar persistencia, reglas tributarias ni credenciales aquí.
