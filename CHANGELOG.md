# Changelog

## Unreleased

- Preparación de paquetes internos reutilizables para la migración incremental.
- La superficie pública inicial se limita a los exports declarados en cada `package.json`.

## Política de compatibilidad

- Cambios incompatibles requieren incrementar la versión mayor antes de publicar.
- Nuevos exports compatibles incrementan la versión menor.
- Correcciones internas sin cambio de contrato incrementan la versión de parche.
- Estos paquetes permanecen privados durante la migración; `npm pack` se usa solo como validación local.
