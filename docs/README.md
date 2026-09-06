# Documentación del proyecto

Esta carpeta documenta arquitectura, decisiones, procedimientos operativos, evidencia y trabajo pendiente. La documentación debe describir el código actual, incluir enlaces relativos y distinguir hechos verificados de decisiones futuras.

## Autoridad documental

- GitHub: autoridad técnica para implementación, contratos, configuración final, runbooks, backlog técnico y evidencia reproducible.
- Google Drive: framing/lifecycle/evidencia humana complementaria bajo gobierno ADÜMÜN.
- `site/`: read model web derivado para consumo humano; no constituye una autoridad paralela.

## Índice

- [`architecture/README.md`](architecture/README.md): mapa de módulos, límites, HTTP y decisiones técnicas.
- [`backlog/README.md`](backlog/README.md): backlog activo de la iniciativa con slices, gates, dependencias y criterios de aceptación.
- [`backlog/desktop-lifecycle-and-distribution.md`](backlog/desktop-lifecycle-and-distribution.md): secuencia extendida de lifecycle desktop, upgrade, datos, UAT y distribución futura.
- [`desktop/README.md`](desktop/README.md): índice de distribución desktop.
- [`desktop/final-configuration.md`](desktop/final-configuration.md): configuración final Electron/ASAR/staging/Squirrel.Windows.
- [`desktop/lessons-learned.md`](desktop/lessons-learned.md): lecciones aprendidas y decisiones que no deben revertirse sin nueva evidencia.
- [`desktop/uat-evidence-2026-09-04.md`](desktop/uat-evidence-2026-09-04.md): evidencia manual de Windows y lifecycle del instalador.
- [`desktop-electron.md`](desktop-electron.md): evolución histórica de la ruta Electron y sus gates.
- [`gaps/README.md`](gaps/README.md): pendientes clasificados por tipo, impacto y prioridad.
- [`slice/README.md`](slice/README.md): instrucciones históricas y series de ejecución.
- [`windows-local.md`](windows-local.md): instalación y operación desde PowerShell y CMD.

## Cómo mantenerla

- Enlaza código con rutas relativas, por ejemplo [`apps/local/README.md`](../apps/local/README.md).
- Usa Mermaid para diagramas en Markdown canónico.
- Si una decisión cambia el flujo de dependencias, actualiza `architecture/current-state.md`, `target-state.md` y el mapa correspondiente.
- Si cambia la distribución desktop, actualiza conjuntamente `desktop/`, `desktop-electron.md`, backlog/gaps y la proyección `site/`.
- Si algo no puede resolverse por falta de información, registra un gap o backlog item en vez de inventar comportamiento.
- No uses documentación histórica como descripción del estado actual sin marcarla como histórica.
- Mantén paridad semántica entre GitHub, Drive y web sin copiar secretos ni datos personales a superficies públicas.