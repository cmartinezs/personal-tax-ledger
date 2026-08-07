# Código de local

Este directorio contiene el código ejecutable de la aplicación local. Los módulos de composición pueden importar paquetes internos y routers de `server/routes`, pero no deben crear una segunda aplicación ni duplicar reglas tributarias.

## Navegación

- [`composition/README.md`](composition/README.md): assembly de repositorios/casos de uso.
- [`http/README.md`](http/README.md): transporte HTTP.
- [`platform/README.md`](platform/README.md): diferencias de Windows/Unix.
- [`../README.md`](../README.md): operación de la app.

Al agregar un agregado, crea su composición aquí e inyéctale el repositorio desde `@personal-tax-ledger/sqlite-adapter`.
