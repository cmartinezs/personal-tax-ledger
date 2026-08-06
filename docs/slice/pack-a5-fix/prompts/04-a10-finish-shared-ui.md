# Prompt 04 — A10: build distribuible y prueba de render real para shared-ui

```text
Objetivo:

Dar a packages/shared-ui un build reproducible a JavaScript + tipos
(dist/index.js, dist/index.d.ts) y reemplazar el "test" de solo grep de
palabras prohibidas por al menos una prueba que verifique el
renderizado real del componente.

Contexto:

- El tipado con `any[]` ya se corrigió: IncomesSection es un componente
  genérico `<T extends IncomesSectionSource>` sin `any`
  (packages/shared-ui/src/index.tsx, commit b503317). Este prompt NO
  repite ese trabajo.
- packages/shared-ui/package.json hoy exporta directamente
  "./src/index.tsx", lo que obliga a cualquier consumidor externo (o al
  smoke test de A12) a tener un pipeline de JSX/TSX propio para poder
  importarlo.
- server/test/shared-ui-boundary.test.mjs valida con regex que el
  archivo fuente no importe módulos prohibidos y que exporte
  IncomesSection, pero nunca renderiza el componente.

Alcance:

Solo packages/shared-ui. No cambies App.tsx ni web/src/incomes-section.tsx
salvo que el nuevo export de shared-ui lo requiera (debería seguir
funcionando igual, ya que web/src/incomes-section.tsx re-exporta desde
'@personal-tax-ledger/shared-ui').

Restricciones:

- Usa tsc (ya es una dependencia del proyecto) para el build; no
  agregues tsup, rollup ni otro bundler nuevo salvo que documentes por
  qué tsc no alcanza para JSX (tsc sí puede emitir JSX con
  --jsx react-jsx).
- El build debe poder correr con `npm run build --workspace
  @personal-tax-ledger/shared-ui` o un script equivalente en su
  package.json, sin romper `npm run build` raíz (que sigue siendo solo
  el build de web/).
- No publiques nada; esto sigue siendo un paquete privado.

Pasos detallados:

1. Agrega packages/shared-ui/tsconfig.json (module: esnext o node16,
   jsx: react-jsx, declaration: true, outDir: dist, target compatible
   con el resto del monorepo).
2. Agrega un script "build": "tsc" en packages/shared-ui/package.json.
3. Cambia los exports de packages/shared-ui/package.json para apuntar a
   "./dist/index.js" (y "types": "./dist/index.d.ts"), en vez de
   "./src/index.tsx".
4. Verifica que web/src/incomes-section.tsx siga resolviendo
   IncomesSection sin cambios (Vite debe poder importar el paquete
   compilado o, si el build de shared-ui no está actualizado en dev, el
   dev workflow local puede seguir apuntando a src vía un campo
   "development"/condiciones de exports adicionales — documenta la
   decisión que tomes).
5. Agrega una prueba (server/test/shared-ui-render.test.mjs o similar)
   que use react-dom/server (renderToStaticMarkup) para renderizar
   <IncomesSection> con datos de ejemplo y afirme que el HTML resultante
   contiene los elementos esperados (p. ej. el nombre de una fuente de
   ingreso, el botón "Editar", el estado vacío con el botón de copiar).
   No necesitas agregar jsdom ni un test runner de componentes nuevo:
   renderToStaticMarkup no requiere DOM.
6. Actualiza server/test/shared-ui-boundary.test.mjs si ahora aplica
   sobre dist/ en vez de (o además de) src/.

Criterios de aceptación:

- `packages/shared-ui` tiene un script de build que genera dist/index.js
  y dist/index.d.ts.
- El package.json de shared-ui exporta desde dist, no desde src/index.tsx.
- Existe al menos un test que renderiza el componente real (no solo
  texto) y verifica su salida.
- npm test pasa; vite build (desde web/) sigue funcionando con el
  paquete compilado.

Checklist de revisión:

docs/slice/pack-a5-fix/docs/review-checklist.md, sección "Si el PR toca
packages/shared-ui".

Instrucciones de commit:

Un commit: `build(a10): compile shared-ui to dist and add a real render test`.

Instrucciones de PR:

Título: "A10 fix: shared-ui build + render test". Incluye en la
descripción el comando de build usado y el resultado de renderizar el
componente en el test nuevo.

Condiciones de detención:

Si compilar shared-ui rompe el flujo de desarrollo en caliente de
web/ (por ejemplo, Vite deja de reflejar cambios en shared-ui sin
recompilar manualmente), detente y documenta la alternativa evaluada
(por ejemplo, un script "dev" con --watch en shared-ui, o exports
condicionales) en vez de forzar un flujo incómodo sin explicarlo.
```
