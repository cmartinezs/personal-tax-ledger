# @personal-tax-ledger/http-api

Inbound adapter HTTP reusable. Traduce peticiones HTTP a llamadas de casos de uso
(application) sin conocer persistencia ni hosts.

## Contrato

- No importa `web/`, `apps/local` ni `sqlite-adapter`.
- Depende de `application`, `contracts`, `api-contracts` y `core`.
- Los routers reciben casos de uso inyectados y helpers HTTP como dependencias.

## Exports

| Export | Responsabilidad |
|---|---|
| `json(res, status, body)` | Respuesta JSON con headers y no-store. |
| `apiError(res, status, code, message, fieldErrors)` | Respuesta de error estructurada. |
| `handleRequestError(res, error)` | Mapea `ApiValidationError` y `ValidationError` a 400. |
| `readJsonBody(req)` | Lee y valida el cuerpo JSON con límite de tamaño. |
| `queryYear(url, fallback)` / `queryParam` / `queryInt` | Parsing de query params. |

## Uso

```js
import { handleRequestError, json, readJsonBody } from '@personal-tax-ledger/http-api';

const route = async ({ req, res, path }) => {
  if (path === '/api/x' && req.method === 'GET') {
    json(res, 200, await useCases.list(context));
    return true;
  }
  return false;
};
```

## Verificación

```bash
npm --workspace @personal-tax-ledger/http-api test
npm run architecture:check
```
