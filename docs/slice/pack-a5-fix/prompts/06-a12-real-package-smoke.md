# Prompt 06 — A12: smoke test de paquetes que ejecuta código real

```text
Objetivo:

Hacer que scripts/package-smoke.mjs no solo instale los tarballs de los
paquetes internos, sino que importe y ejecute código real desde ellos,
para detectar exports rotos, builds incompletos o dependencias faltantes
que "npm install" por sí solo no revela.

Contexto:

- scripts/package-smoke.mjs hoy hace `npm pack` de core, contracts,
  api-contracts y shared-ui, los instala en un directorio temporal con
  `npm install --ignore-scripts` y solo confirma que la instalación no
  falla.
- Este prompt depende de que packages/shared-ui ya tenga build a dist/
  (prompt 04), para poder incluir su tarball en un smoke real (un
  paquete que exporta .tsx crudo no se puede importar y ejecutar desde
  un consumidor Node plano).

Alcance:

scripts/package-smoke.mjs y, si hace falta, un pequeño script auxiliar
dentro del directorio temporal que el propio script genere.

Restricciones:

- No agregues un framework de test nuevo para esto; es un script
  standalone, igual que hoy.
- El script debe seguir sin publicar nada ni requerir acceso a un
  registro npm remoto.

Pasos detallados:

1. Después de instalar los tarballs en el directorio temporal, genera
   ahí mismo un archivo smoke.mjs con contenido equivalente a:

   import { simulatePortfolio } from '@personal-tax-ledger/core';
   import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
   import { incomeSourceRequest } from '@personal-tax-ledger/api-contracts';

   const result = simulatePortfolio([], { year: 2026 });
   if (typeof result.totals.annualTax !== 'number') process.exit(1);
   if (LOCAL_WORKSPACE_CONTEXT.workspaceId !== 'local-workspace') process.exit(2);
   const dto = incomeSourceRequest({ name: 'x', kind: 'SALARY', amount: 1, taxYear: 2026 });
   if (dto.name !== 'x') process.exit(3);
   console.log('smoke ok');

2. Ejecuta ese archivo con `execFileSync('node', ['--input-type=module',
   'smoke.mjs'], { cwd: temp })` (o guardándolo como archivo real) y
   verifica el código de salida.
3. Si packages/shared-ui ya tiene build (prompt 04), agrega su tarball
   al smoke: importa IncomesSection desde
   '@personal-tax-ledger/shared-ui' y usa react-dom/server
   (renderToStaticMarkup) para confirmar que renderiza sin lanzar,
   con un peer dependency de react/react-dom instalado en el
   directorio temporal (agrégalos a la instalación del smoke).
4. Si algún import falla, el script debe terminar con código de salida
   distinto de 0 y un mensaje claro de cuál paquete falló.

Criterios de aceptación:

- npm run pack:smoke ejecuta código real de cada paquete empaquetado
  (no solo `npm install`) y falla si el resultado no es el esperado.
- El smoke incluye el tarball de shared-ui renderizando el componente.
- Verificado localmente: si rompes deliberadamente un export (por
  ejemplo, renombras una función en core) el smoke falla; al
  restaurarlo, vuelve a pasar.

Checklist de revisión:

docs/slice/pack-a5-fix/docs/review-checklist.md completo.

Instrucciones de commit:

Un commit: `test(a12): make the package smoke test execute real code from the tarballs`.

Instrucciones de PR:

Título: "A12 fix: real package smoke test". Incluye en la descripción
el experimento de "romper un export a propósito" y su resultado.

Condiciones de detención:

Si renderizar shared-ui en el smoke requiere jsdom u otra dependencia
de DOM completa (en vez de renderToStaticMarkup, que no la necesita),
detente y documenta por qué antes de agregarla; probablemente no haga
falta.
```
