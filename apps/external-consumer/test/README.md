# Tests del consumidor

`consumer.test.mjs` importa los exports públicos y renderiza un componente. `consumer.mjs` también puede ejecutarse directamente como smoke.

Si se cambia `exports` o `dist` de un paquete, este test debe fallar antes de aceptar una API pública rota.
