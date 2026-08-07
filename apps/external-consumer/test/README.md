# Tests del consumidor

`consumer.test.mjs` importa los exports públicos y renderiza un componente. `consumer.mjs` también puede ejecutarse directamente como smoke.

`inner-hexagon.test.mjs` ejecuta casos de uso de `@personal-tax-ledger/application` contra repositorios fakes en memoria, demostrando que el inner hexagon corre sin SQLite, HTTP, web ni `apps/local`. `inner-hexagon.mjs` también puede ejecutarse directamente como smoke.

Si se cambia `exports` o `dist` de un paquete, estos tests deben fallar antes de aceptar una API pública rota.
