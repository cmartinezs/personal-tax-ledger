# Tests de frontend-application

`frontend-application.test.mjs` importa el `dist` compilado, renderiza
`FeedbackProvider` con un `FrontendClient` fake y verifica el contrato del hook
`useAsyncAction`. Ejecutar tras `npm run build` del paquete.
