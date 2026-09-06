# Desktop distribution

Esta carpeta concentra la documentación técnica de autoridad para la distribución desktop de Personal Tax Ledger.

## Documentos

- [Configuración final](final-configuration.md): composición Electron, staging, ASAR, empaquetado, Squirrel.Windows, paths de datos y comandos finales.
- [Perfil local, workspace y startup](local-profile-workspace-startup.md): implementación del bootstrap local, selector de workspace, onboarding, splash y comportamiento post-upgrade.
- [Diagnóstico Windows Application Control 2026-09-06](windows-application-control-diagnostic-2026-09-06.md): evidencia del bloqueo de `PersonalTaxLedger.exe` 0.1.4 por Smart App Control / Code Integrity y consecuencias para la estrategia de firma.
- [Firma de código Windows](windows-code-signing.md): contrato de signing, variables de entorno, integración con Packager/Squirrel y gate de cierre bajo Smart App Control.
- [Lecciones aprendidas](lessons-learned.md): decisiones, fallos reproducidos, causas raíz y correcciones permanentes.
- [Evidencia UAT técnica 2026-09-04](uat-evidence-2026-09-04.md): gates observados en Windows nativo.
- [Ruta Electron](../desktop-electron.md): evolución histórica del wrapper y de los gates de empaquetado.

## Autoridad

GitHub es la autoridad técnica. Google Drive conserva framing, lifecycle y evidencia humana complementaria. La web del repo es una proyección de lectura y no sustituye estos documentos.

Los diagramas de arquitectura se expresan en Mermaid en la documentación Markdown canónica.