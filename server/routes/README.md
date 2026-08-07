# Routers HTTP

Cada archivo crea una función de routing inyectable que devuelve `true` si manejó la petición y `false` en otro caso. Recibe body reader, serializador y errores desde `apps/local/src/http`.

Los routers no deben importar SQLite ni acceder directamente a tablas. El host que los conecta está documentado en [`../../apps/local/src/http/README.md`](../../apps/local/src/http/README.md) y el catálogo completo en [`../../docs/architecture/http-route-catalog.md`](../../docs/architecture/http-route-catalog.md).
