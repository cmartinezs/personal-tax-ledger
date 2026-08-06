# Prompt 09 — Validación final del paquete de corrección

```text
Objetivo:

Ejecutar una validación integral de todos los prompts 01-08 ya
fusionados, actualizar docs/acceptance-matrix.md con el estado real de
cada criterio, y dejar evidencia consolidada de que el repositorio está
listo para el prompt de cierre (10).

Contexto:

Este prompt no agrega funcionalidad nueva; es una auditoría de cierre,
igual en espíritu a la que originó este paquete
(docs/gaps/migration-fails.md).

Alcance:

Todo el repositorio, en modo solo verificación. Cambios de código
permitidos únicamente para corregir inconsistencias menores detectadas
durante la validación (por ejemplo, un criterio marcado como resuelto
que en realidad no lo está).

Restricciones:

- No implementes funcionalidad nueva aquí; si encuentras un criterio
  pendiente, créalo como su propio prompt/PR de seguimiento en vez de
  resolverlo de paso dentro de esta validación.

Pasos detallados:

1. Ejecuta, en una sola sesión, y registra el resultado exacto de cada
   uno:
   - npm test
   - npm run architecture:check
   - npm run typecheck (o su equivalente documentado en el prompt 07)
   - npm run build
   - npm run build --workspaces --if-present
   - npm run test --workspaces --if-present
   - npm run pack:smoke
   - npm run smoke:local
   - npx --no-install vite build (desde web/)
2. Para cada fila de docs/acceptance-matrix.md, confirma con evidencia
   concreta (no de memoria) si el criterio está resuelto: lee el
   archivo relevante, corre el test asociado, o repite la prueba manual
   descrita en el prompt correspondiente.
3. Actualiza docs/acceptance-matrix.md con el estado final y el commit
   de cierre de cada fila.
4. Si encuentras un criterio que se marcó como resuelto en un PR
   anterior pero ya no lo está (regresión), documenta un gap en
   docs/gaps/ con prioridad alta y detente: no se puede continuar al
   prompt 10 con una regresión sin resolver.
5. Si encuentras un criterio que sigue genuinamente pendiente y no fue
   cubierto por ningún prompt anterior, documenta un gap con prioridad
   acorde (alta si bloquea B00 según el hallazgo original, media/baja
   si no) y decide si amerita un prompt 11 adicional antes del cierre.

Criterios de aceptación:

- Todas las filas de docs/acceptance-matrix.md quedan en RESUELTO o con
  un gap documentado y priorizado en docs/gaps/ si no lo están.
- Los ocho comandos de verificación del paso 1 se ejecutaron y sus
  resultados están registrados en el PR.

Checklist de revisión:

docs/slice/pack-a5-fix/docs/review-checklist.md completo, aplicado a
todo el repositorio, no solo a un diff pequeño.

Instrucciones de commit:

Un commit: `chore(a5-fix): final validation of the correction package`.

Instrucciones de PR:

Título: "Pack A5 fix: final validation". Incluye la salida resumida de
los ocho comandos y la tabla de acceptance-matrix.md actualizada.

Condiciones de detención:

Si cualquier comando del paso 1 falla, detente aquí: no continúes al
prompt 10 hasta resolver la falla o documentarla explícitamente como
gap bloqueante.
```
