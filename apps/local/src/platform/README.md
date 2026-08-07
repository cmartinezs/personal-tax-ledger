# Runtime de plataforma

Helpers pequeños para ejecutar la misma aplicación en Windows, Linux y macOS.

- `paths.mjs`: file URLs, detección del módulo principal y rutas absolutas.
- `processes.mjs`: `process.execPath`, `npm.cmd` y terminación idempotente.

No crear una aplicación Windows separada. Si una necesidad de plataforma aparece, agrégala aquí y prueba al menos Linux; CI comprueba también Windows. La guía operativa está en [`../../../../docs/windows-local.md`](../../../../docs/windows-local.md).
