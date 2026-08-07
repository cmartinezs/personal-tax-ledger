# Workflows

`ci.yml` certifica el proyecto en Ubuntu y Windows. Ejecuta instalación limpia, lint, TypeScript estricto, tests, arquitectura, builds, package smoke y runtime smoke.

Para cambiar la CI, verifica primero los comandos equivalentes en la raíz. No agregues comandos Bash que no funcionen en `windows-latest`.
