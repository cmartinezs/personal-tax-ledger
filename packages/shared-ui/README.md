# @personal-tax-ledger/shared-ui

Componentes React reutilizables entre la aplicación local y el futuro
repositorio cloud. Reciben datos y callbacks por props (sin `fetch`
propio, sin SQLite, sin variables de entorno).

## Build

Este paquete se compila con `tsc` (ver `tsconfig.json`) a `dist/index.js`
+ `dist/index.d.ts`. El `package.json` exporta desde `dist`, no desde
`src/index.tsx`, para que cualquier consumidor (incluida `web/`, que solo
corre `vite build` sin pasar por un orquestador de builds del monorepo)
pueda importarlo sin necesitar un pipeline propio de JSX/TSX.

A diferencia de `web/dist` (ignorado en `.gitignore`, se regenera en cada
build de la app), **`packages/shared-ui/dist` se versiona en git**. Es la
forma más simple de garantizar que `cd web && npx --no-install vite
build` funcione de forma aislada, sin depender de que se haya corrido un
build previo del monorepo. La contraparte: quien modifique
`src/index.tsx` debe correr `npm run build --workspace
@personal-tax-ledger/shared-ui` (o `npx tsc` dentro de este directorio) y
commitear el `dist/` actualizado en el mismo cambio.

`server/test/shared-ui-boundary.test.mjs` falla si el `package.json` deja
de apuntar a `dist/`, y `server/test/shared-ui-render.test.mjs` renderiza
el componente compilado con `react-dom/server` para detectar si el build
quedó desactualizado respecto del código fuente.
