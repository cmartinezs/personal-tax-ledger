# Workflows

GitHub Actions no forma parte del modelo operativo de este repositorio. Por bypass financiero, las validaciones y publicaciones no dependen de runners de GitHub Actions.

## Validación

Los gates técnicos se ejecutan localmente y su evidencia se persiste en el repositorio/Drive cuando corresponde:

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

## Publicación web

La fuente versionada permanece en `site/` dentro de `master`. La publicación se realiza mediante GitHub Pages en modo **Deploy from a branch**, usando la rama `gh-pages` y `/ (root)`, sin Actions.

`gh-pages` es una proyección derivada de `site/`; no es autoridad documental ni debe editarse como fuente primaria.

Para cambiar la web, modifica primero `site/`, conserva paridad semántica con `docs/`, usa Mermaid para diagramas y SVG para iconografía, y no publiques secretos ni datos tributarios personales.