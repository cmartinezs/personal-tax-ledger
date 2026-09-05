# GitHub Pages source

Esta carpeta es la fuente versionada de la superficie web de conocimiento de Personal Tax Ledger.

La web es un **read model derivado**: resume material no confidencial del repositorio y de la evidencia humana complementaria, pero no reemplaza la autoridad técnica de `docs/`, `package.json`, `scripts/` ni la implementación.

## Cobertura actual

- estado funcional actual del producto;
- guía de uso y módulos disponibles;
- capacidades tributarias actualmente modeladas;
- arquitectura local/desktop;
- construcción del monorepo y comandos reproducibles;
- configuración final de distribución Windows;
- staging, ASAR, Packager, Squirrel.Windows y lifecycle de datos;
- evidencia de UAT técnica y reproducibilidad desde `npm ci` limpio;
- lecciones aprendidas y decisiones descartadas;
- camino futuro a Linux, marcado explícitamente como no implementado/no validado;
- pendientes posteriores: firma, update policy, backup/migraciones y UAT no técnico.

## Páginas

- `index.html`: estado y mapa del portal.
- `usage.html`: cómo se usa y qué puede hacer hoy la aplicación.
- `build.html`: cómo se construye desde el monorepo hasta los artefactos desktop.
- `architecture.html`: boundaries y runtime.
- `distribution.html`: configuración Windows y camino futuro Linux.
- `evidence.html`: gates y hechos observados.
- `lessons.html`: decisiones y errores que no deben reintroducirse.

## Reglas

- mantener paridad semántica con el estado real del código y `docs/`;
- separar siempre **actual/validado** de **próximo/planificado**;
- no copiar secretos, paths personales, datos tributarios reales, evidencia sensible ni información operativa privada;
- publicar sólo información necesaria para comprender el producto, su construcción y su uso;
- diagramas explicativos en Mermaid con labels seguros/entrecomillados cuando contengan caracteres especiales;
- iconografía web mediante SVG;
- `master/site/` es la fuente versionada;
- `gh-pages` es una proyección de publicación derivada de `master/site/`; no es autoridad documental.