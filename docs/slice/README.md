# Slices de trabajo

Las slices son instrucciones operativas para cambios grandes divididos en pasos verificables. No son la fuente de verdad del código: cada paso debe comprobar archivos, imports, tests y comportamiento.

## Índice

- [`personal-tax-ledger-packs-a6-a13/README.md`](personal-tax-ledger-packs-a6-a13/README.md): pasos ejecutados para A.6-A.13.
- [`personal-tax-ledger-migration-prompt-b.md`](personal-tax-ledger-migration-prompt-b.md): plan histórico posterior.

## Convención de ejecución

- Ejecutar un Markdown por vez.
- Confirmar sus dependencias con evidencia de código.
- No avanzar automáticamente al siguiente paso.
- Cerrar con `MD_EXECUTED`, `STATUS`, `DEPENDENCIES_VALIDATED`, `EVIDENCE` y `NEXT_MD`.
- Registrar gaps nuevos en [`../gaps/README.md`](../gaps/README.md).
