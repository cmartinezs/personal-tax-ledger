# Validación y publicación

## Validación

Los gates técnicos están definidos como comandos reproducibles del repositorio:

```text
npm ci
npm audit
npm run lint
npm run typecheck
npm run architecture:check
npm test
npm run test:workspaces
npm run build:packages
npm run test:external-consumer
npm run pack:smoke
npm run smoke:local
npm run desktop:check
npm run desktop:package:win
npm run desktop:installer:win
```

La evidencia se persiste en el repositorio o en las superficies documentales correspondientes cuando aplica.

## Publicación web

La fuente versionada permanece en `site/` dentro de `master`. GitHub Pages publica la proyección de lectura desde la rama `gh-pages`, `/ (root)`.

`gh-pages` es un read model derivado; no es autoridad documental ni debe editarse como fuente primaria.

Para cambiar la web, modifica primero `site/`, conserva paridad semántica con `docs/`, usa Mermaid para diagramas y SVG para iconografía, y no publiques secretos, datos tributarios personales ni información operativa privada.