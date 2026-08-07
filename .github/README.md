# GitHub

Configuración de automatización del repositorio. Los workflows deben tratar el proyecto como monorepo y ejecutar los mismos comandos que una persona ejecutaría localmente.

## Reglas

- No ocultar fallos con `continue-on-error`.
- Mantener Node 24 y las matrices de sistema operativo alineadas con `package.json`.
- Separar validaciones de frontend, arquitectura/tests, paquetes y runtime cuando facilite diagnosticar fallos.

El workflow principal está en `workflows/ci.yml`.
