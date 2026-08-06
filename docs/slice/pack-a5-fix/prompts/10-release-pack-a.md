# Prompt 10 — Cierre del Paquete A y desbloqueo de B00

```text
Objetivo:

Cerrar formalmente el Paquete A (incluida su corrección A5), actualizar
la documentación de arquitectura al estado final real, y registrar
explícitamente la decisión de desbloquear (o no) el inicio del Paquete
B (repositorio cloud).

Contexto:

Depende de que el prompt 09 (validación final) haya quedado sin filas
pendientes de alta prioridad en docs/acceptance-matrix.md.

Alcance:

docs/architecture/current-state.md, docs/architecture/target-state.md,
docs/gaps/migration-fails.md, y un documento de decisión nuevo o una
sección en docs/architecture/migration-sequence.md.

Restricciones:

- No inicies ningún trabajo del Paquete B en este prompt; su alcance es
  solo cerrar A y su corrección, y decidir si B puede empezar.

Pasos detallados:

1. Actualiza docs/architecture/current-state.md para reflejar la
   estructura final real (packages/core, contracts, api-contracts,
   application, sqlite-adapter, shared-ui con build propio, apps/local
   como composition root real y sin efectos secundarios al importar).
2. Actualiza docs/architecture/target-state.md si algo del estado
   objetivo cambió durante la corrección (por ejemplo, la ubicación
   final de la suite de contract tests reutilizable).
3. En docs/gaps/migration-fails.md, agrega una nota de cierre (similar
   a la "Nota de estado" ya presente) indicando qué commits resolvieron
   cada hallazgo crítico (1-5) y marca el documento como histórico
   resuelto.
4. Registra explícitamente la decisión de desbloqueo: si
   docs/acceptance-matrix.md no tiene filas PENDIENTE en A05, A06 o
   A12 (los criterios que el veredicto original marcó como bloqueantes
   para B00), documenta "Paquete B: DESBLOQUEADO" con fecha y los
   commits de cierre. Si aún queda alguna fila bloqueante pendiente,
   documenta "Paquete B: sigue BLOCKED" y qué falta exactamente.
5. No elimines docs/slice/pack-a5-fix/; déjalo como referencia
   histórica de cómo se corrigió, igual que
   docs/slice/personal-tax-ledger-migration-prompt-a.md queda como
   referencia del paquete original.

Criterios de aceptación:

- La documentación de arquitectura describe el estado real verificado,
  no el estado aspiracional.
- Existe una decisión explícita y fechada sobre si el Paquete B puede
  empezar.
- docs/gaps/migration-fails.md queda marcado como resuelto/histórico,
  con referencias a los commits de cierre.

Checklist de revisión:

docs/slice/pack-a5-fix/docs/review-checklist.md, secciones "Alcance y
proceso" y "Cierre".

Instrucciones de commit:

Un commit: `docs: close paquete A5 fix and record the B00 unblock decision`.

Instrucciones de PR:

Título: "Pack A5 fix: close-out and B00 decision". Incluye la decisión
final (desbloqueado o no) de forma destacada en la descripción del PR.

Condiciones de detención:

Si decides desbloquear B00 pero alguno de los criterios A05/A06/A12 no
tiene evidencia verificable (no solo "se hizo en el prompt X"),
detente: no marques el desbloqueo hasta confirmar la evidencia con los
comandos del prompt 09.
```
