# Composition root

Las factories de esta carpeta ensamblan contratos, casos de uso, adaptadores y routers para local. No deben abrir conexiones al importar el paquete: la conexión se crea explícitamente al crear la composición y se cierra durante `close()`.

Cada composición por módulo expone los casos de uso y la factory del router correspondiente. La composición no contiene JSX ni reglas tributarias.

Consulta [`../../../../docs/architecture/current-state.md`](../../../../docs/architecture/current-state.md) para el flujo completo y [`../http/README.md`](../http/README.md) para el siguiente límite.
