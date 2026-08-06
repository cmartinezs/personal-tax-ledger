# Prompt 03 — A09: cierre formal de la integración de ingresos

```text
Objetivo:

Cerrar formalmente A09 con evidencia ejecutable: agregar una prueba
unitaria real de web/src/income-service.ts (no solo una verificación
estática de que App.tsx importa el servicio) y confirmar que las 4
operaciones (list/create/update/remove) pasan efectivamente por él.

Contexto:

- La desconexión original de A09 (App.tsx llamando api.* directamente
  en vez de incomeService) ya se corrigió; ver
  docs/gaps/2026-08-06-paquete-a-verificacion.md y el commit f79fdae.
- server/test/frontend-integration.test.mjs hoy verifica esto con
  lectura de archivo (regex sobre el código fuente), que es una señal
  débil: detecta el patrón textual, no el comportamiento.
- Este prompt depende del prompt 01 si income-service.ts pasa a tipar
  contra el contrato ampliado de A08; si ese prompt aún no corrió,
  igual puedes avanzar con los tipos actuales.

Alcance:

Solo web/src/income-service.ts y su cobertura de test. No toques
App.tsx salvo que el test lo requiera indirectamente.

Restricciones:

- No introduzcas un framework de testing de componentes nuevo (no hay
  vitest/RTL configurado en web/). Usa node:test desde server/test/
  para probar income-service.ts como módulo TypeScript/JS puro
  (createIncomeService no depende de DOM ni de React).
- No cambies el comportamiento observable de la app.

Pasos detallados:

1. Agrega un test (por ejemplo
   server/test/income-service.test.mjs o dentro de
   server/test/frontend-integration.test.mjs) que importe
   createIncomeService y verifique, con un cliente falso (objeto con
   list/create/update/remove instrumentados), que cada método delega
   exactamente en la operación correspondiente del cliente y retorna
   su resultado.
2. Si TypeScript no se puede importar directamente con node --test,
   evalúa si ya existe un mecanismo de transpilación en el repo
   (revisa cómo se ejecutan hoy los demás tests que tocan .ts, si los
   hay) antes de agregar uno nuevo; si no existe, documenta como gap
   técnico la decisión de no ejecutar TS directamente en node:test y
   en su lugar deja el test estático existente reforzado con un
   comentario que explique la limitación, o usa
   `node --experimental-strip-types` si la versión de Node del repo
   lo soporta (ver "engines" en package.json raíz).
3. Mantén el test estático existente de
   server/test/frontend-integration.test.mjs (sigue siendo útil como
   red rápida), pero acláralo como complementario, no como única
   evidencia.

Criterios de aceptación:

- Existe un test que ejercita income-service.ts llamando sus 4 métodos
  contra un cliente falso y verificando la delegación real.
- npm test pasa.

Checklist de revisión:

docs/slice/pack-a5-fix/docs/review-checklist.md, sección "Ningún test
nuevo es una simple verificación de texto".

Instrucciones de commit:

Un commit: `test(a09): add real unit coverage for income-service`.

Instrucciones de PR:

Título: "A09 fix: close income-service integration with real tests".

Condiciones de detención:

Si ejecutar TypeScript de web/ directamente desde node --test no es
viable con la versión de Node del proyecto sin agregar una
dependencia nueva, detente, documenta el gap técnico en docs/gaps/ con
prioridad media, y deja el test estático como mitigación mínima en
vez de forzar una herramienta nueva.
```
