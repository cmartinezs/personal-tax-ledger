# Prompt 07 — A13: CI completo por workspace y smoke de arranque local

```text
Objetivo:

Completar el workflow de CI para que ejecute typecheck, build y test
por workspace, y agregar un smoke de arranque local (servidor real +
healthcheck HTTP) como paso explícito, no solo implícito dentro de
npm test.

Contexto:

- .github/workflows/ci.yml hoy ejecuta: npm ci, npm test,
  npm run architecture:check, npm run build, npm run pack:smoke
  (ya corregido respecto de la versión original, ver
  docs/gaps/2026-08-06-paquete-a-verificacion.md, commit c5934d9).
- Sigue faltando: typecheck/build/test por workspace
  (--workspaces --if-present) y un paso explícito de "smoke local" que
  levante server/index.mjs igual que server/test/http-contract.test.mjs
  pero como comando de CI independiente, útil para depuración manual.
- Este prompt depende de 05 (composition root sin efectos secundarios)
  y 06 (smoke de paquetes real) ya fusionados.

Alcance:

.github/workflows/ci.yml, package.json (scripts raíz) y, si hace falta,
un script nuevo scripts/smoke-local.mjs.

Restricciones:

- No dupliques lo que ya hace server/test/http-contract.test.mjs; si
  smoke-local.mjs termina siendo casi idéntico, evalúa si conviene que
  CI simplemente ejecute ese test de forma aislada
  (`node --test server/test/http-contract.test.mjs`) en vez de un
  script nuevo, y documenta la decisión.
- No agregues jobs de CI que tarden desproporcionadamente (evita
  reinstalar dependencias por workspace si npm ci en la raíz ya las deja
  listas).

Pasos detallados:

1. Agrega a package.json raíz:
   "typecheck": "npm run typecheck --workspaces --if-present"
   (o el nombre que uses) y confirma qué workspaces ya tienen un script
   "typecheck" (probablemente solo web/, vía tsc -b) para no fallar por
   ausencia en los demás.
2. Agrega "build:packages":
   "npm run build --workspaces --if-present" (aprovecha el build de
   shared-ui agregado en el prompt 04; los demás paquetes sin build
   simplemente no tienen el script y --if-present los omite).
3. Agrega "test:workspaces": "npm run test --workspaces --if-present"
   (cada packages/*/package.json ya tiene "test": "node --test"; hoy no
   hay archivos *.test.mjs dentro de packages/*, así que esto puede no
   encontrar nada — confírmalo y decide si mover algún test específico
   de paquete allí o dejarlo como no-op documentado).
4. Agrega "smoke:local" que levante server/index.mjs con un DB_PATH
   temporal y un PORT libre, espere /api/health, haga un par de
   peticiones (GET /api/incomes, POST /api/simulate) y salga con el
   código correcto, apagando el proceso al final. Puedes reutilizar el
   patrón de server/test/http-contract.test.mjs extrayéndolo a un
   script compartido si prefieres no duplicar código.
5. Actualiza .github/workflows/ci.yml agregando los pasos
   `npm run typecheck`, `npm run build:packages`,
   `npm run test:workspaces`, `npm run smoke:local` después de los
   pasos existentes.
6. Ten en cuenta docs/gaps/2026-08-06-tsc-web.md: tsc -b en web/ tiene
   errores preexistentes documentados como gap. Si agregar
   "npm run typecheck" hace fallar CI por esos errores preexistentes,
   NO los corrijas en este PR (fuera de alcance); en su lugar decide
   explícitamente y documenta si typecheck corre en modo informativo
   (continue-on-error) hasta que se resuelva ese gap, o si se excluye
   web/ del typecheck agregado aquí.
7. HALLAZGO adicional al ejecutar este prompt: web/package.json tenía
   `"build": "tsc -b && vite build"`, por lo que el `npm run build` que
   YA corría en CI (paso agregado desde el commit inicial de A13,
   786073c) estaba roto por el mismo gap preexistente, sin que nadie lo
   notara porque la verificación documentada en AGENTS.md
   (`cd web && npx --no-install vite build`) nunca pasa por `tsc -b`.
   Corrige esto separando los scripts de web/package.json en
   `"build": "vite build"` y `"typecheck": "tsc -b"`; así `npm run
   build` (raíz, usado también por el flujo documentado en README
   "npm run build && npm start") vuelve a funcionar de verdad.

Criterios de aceptación:

- CI ejecuta, en este orden razonable: install, test, architecture:check,
  typecheck (informativo, continue-on-error), build:packages (build por
  workspace, incluye web y shared-ui), test por workspace, pack:smoke,
  smoke:local.
- `npm run build` (raíz) y `npm run build:packages` terminan en verde
  sin invocar tsc -b.
- npm run smoke:local se puede ejecutar localmente y confirma que el
  servidor real responde correctamente.
- La decisión sobre el gap preexistente de tsc -b en web/ queda
  documentada explícitamente en el PR y en
  docs/gaps/2026-08-06-tsc-web.md (no en silencio).

Checklist de revisión:

docs/slice/pack-a5-fix/docs/review-checklist.md completo.

Instrucciones de commit:

Un commit: `ci(a13): run typecheck/build/test per workspace and a local smoke check`.

Instrucciones de PR:

Título: "A13 fix: complete CI coverage". Incluye el run de CI (o su
equivalente local) mostrando cada paso nuevo pasando.

Condiciones de detención:

Si "npm run typecheck --workspaces --if-present" falla de forma
bloqueante por el gap preexistente de web/ y no hay una forma limpia de
hacerlo informativo sin herramientas nuevas, detente y decide con el
equipo (documentando la alternativa) en vez de silenciar el error o
arreglar el gap preexistente fuera de alcance.
```
