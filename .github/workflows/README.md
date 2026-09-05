# Workflows

`ci.yml` certifica el proyecto en Ubuntu y Windows. Ejecuta instalación limpia, lint, TypeScript estricto, tests, arquitectura, builds, external consumer, package smoke y runtime smoke. Todos son gates bloqueantes.

`pages.yml` publica la superficie de conocimiento versionada en `site/` mediante GitHub Pages. Sólo se despliega desde `master` o por `workflow_dispatch`; `site/` es la fuente versionada y la publicación es output derivado.

Para cambiar la CI, verifica primero los comandos equivalentes en la raíz. No agregues comandos Bash que no funcionen en `windows-latest` cuando formen parte de `ci.yml`.

Para cambiar la web, mantén paridad semántica con `docs/`, usa Mermaid para diagramas y SVG para iconografía, y no publiques secretos ni datos tributarios personales.