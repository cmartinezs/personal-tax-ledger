# `@personal-tax-ledger/frontend-application`

Capa reusable entre hosts web y `shared-ui`: servicios frontend, coordinación de
features, hooks de estado independientes del host y orchestration de
loading/error. No conoce `local`, `cloud`, Vite, Firebase, routing específico,
SQLite ni env del host.

## API pública

- `client.ts`: `FrontendClient`, contrato abstracto del cliente HTTP que el host
  debe implementar.
- `feedback.tsx`: `FeedbackProvider`, `useFeedback`, `LoadingModal` y `LOG` para
  orchestration de loading/error/toasts/confirm/logging.
- `hooks.ts`: `useAsyncAction` para orquestar acciones asíncronas con busy/error.

## Verificación

```bash
npm run build --workspace @personal-tax-ledger/frontend-application
npm test --workspace @personal-tax-ledger/frontend-application
```
