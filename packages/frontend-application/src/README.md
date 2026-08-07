# Fuente de frontend-application

Capa reusable entre hosts web y `shared-ui`. Prohibidos Vite, Firebase, routing
específico, SQLite y env del host. `react`/`react-dom` están permitidos aquí por
excepción explícita (guardrail 5).

- `client.ts`: contrato abstracto del cliente HTTP (`FrontendClient`).
- `feedback.tsx`: orchestration de loading/error/toasts/confirm/logging.
- `hooks.ts`: hooks de estado y coordinación independientes del host.
- `index.ts` re-exporta el API público.
