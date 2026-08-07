# Documentación del proyecto

Esta carpeta documenta arquitectura, decisiones, procedimientos operativos y trabajo pendiente. La documentación debe describir el código actual, incluir enlaces relativos y distinguir hechos verificados de decisiones futuras.

## Índice

- [`architecture/README.md`](architecture/README.md): mapa de módulos, límites, HTTP y decisiones técnicas.
- [`gaps/README.md`](gaps/README.md): pendientes clasificados por tipo, impacto y prioridad.
- [`slice/README.md`](slice/README.md): instrucciones históricas y series de ejecución.
- [`windows-local.md`](windows-local.md): instalación y operación desde PowerShell y CMD.

## Cómo mantenerla

- Enlaza código con rutas relativas, por ejemplo [`apps/local/README.md`](../apps/local/README.md).
- Si una decisión cambia el flujo de dependencias, actualiza `architecture/current-state.md`, `target-state.md` y el mapa correspondiente.
- Si algo no puede resolverse por falta de información, registra un gap en vez de inventar comportamiento.
- No uses documentación histórica como descripción del estado actual sin marcarla como histórica.
