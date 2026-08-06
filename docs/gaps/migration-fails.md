# Revisión externa del Paquete A — hallazgos y veredicto

**Alcance**: auditoría independiente de las iteraciones A00–A13 de
`docs/slice/personal-tax-ledger-migration-prompt-a.md`, basada en la
inspección de commits y archivos del repositorio.

> **Nota de estado (2026-08-06)**: esta revisión se hizo antes de la
> corrección registrada en `docs/gaps/2026-08-06-paquete-a-verificacion.md`
> (commits `f79fdae`, `b503317`, `f0ea953`, `c5934d9`), que ya resolvió:
> la desconexión de `income-service`/`IncomesSection` respecto de
> `App.tsx` (A09/A10), el composition root huérfano de `apps/local`
> (A11) y la ausencia de `architecture:check` en CI (A13). Los hallazgos
> de A05–A08, A10 (tipado y build), A11 (efectos secundarios al
> importar), A12 y A13 (smoke real, cobertura de CI) descritos abajo
> siguen vigentes. El plan para corregirlos de forma incremental está en
> [`docs/slice/pack-a5-fix/`](../slice/pack-a5-fix/README.md).

## Veredicto

No se puede considerar el Paquete A correctamente terminado. La
implementación reproduce A00–A13 mediante commits diferenciados y
establece una base arquitectónica útil, pero varias iteraciones son solo
esqueletos o pruebas nominales. Hay incumplimientos que bloquearían el
inicio seguro del repositorio cloud (Paquete B).

Además, el pack exigía un PR pequeño por iteración, con revisión y fusión
antes de continuar. El conector de GitHub no encontró pull requests: los
cambios se incorporaron directamente en `master`, por lo que no se
respetó el proceso de ejecución definido.

## Evaluación por iteración

| Iteración | Estado | Evaluación |
|---|---|---|
| A00 | ✅ PASS | Se crearon `current-state.md`, `target-state.md`, `migration-sequence.md` y el mapa de módulos. La documentación coincide razonablemente con la estructura original. |
| A01 | ⚠️ PASS con observaciones | Los tests originales ya cubrían APV, honorarios, hipotecario e integración. Se añadieron caracterizaciones HTTP y persistencia básica de ingresos. La cobertura de persistencia esencial sigue concentrada en un solo agregado. |
| A02 | ✅ PASS | Se configuraron workspaces y esqueletos privados para `core`, `contracts` y `api-contracts`. Los comandos raíz se conservaron. |
| A03 | ⚠️ PASS parcial | Los cálculos puros fueron movidos realmente a `core`, manteniendo reexports desde `server/lib`. Los tests importan y ejecutan el nuevo paquete. Falta documentar expresamente qué quedó fuera y por qué. |
| A04 | ⚠️ PARTIAL | Solo se migró ingresos, lo cual era admisible, pero el contrato compartido no representa el DTO real: omite AFP, salud, APV, retención, notas y otros campos que el frontend todavía define localmente. Por tanto, no elimina realmente la duplicación ni la ambigüedad. |
| A05 | ❌ FAIL / BLOCKER | El repositorio está tipado como síncrono (`list(): IncomeSourceRecord[]`, `create(): IncomeSourceRecord`, etc.). Ese contrato no es adecuado para PostgreSQL/Supabase, donde las operaciones serán asíncronas. Los "contract tests reutilizables" solo comprueban que existan cinco métodos; no verifican CRUD, errores, aislamiento, actualización ni idempotencia. |
| A06 | ⚠️ PARTIAL | Existe un adaptador SQLite y una prueba contra base temporal, pero la prueba no reutiliza una suite contractual exportada desde `contracts`; es un test ad hoc. El adaptador aún depende físicamente de `server/lib/database.mjs`, aceptable solo como transición. |
| A07 | ⚠️ PARTIAL | Los casos de uso no conocen HTTP ni SQLite, pero son simples *pass-through* síncronos. La operación de copiar ingresos continúa fuera del caso de uso y del repositorio contractual. |
| A08 | ⚠️ PARTIAL | Se extrajo el router de ingresos, pero recibe directamente `copyIncomeSources`, una función concreta de persistencia. Eso contradice la regla de que el router dependa de casos de uso o servicios, no de SQLite. Tampoco se añadió una comparación automática del catálogo de rutas. |
| A09 | ❌ FAIL *(corregido; ver nota de estado)* | Se crearon `income-service.ts` e `incomes-section.tsx`, pero `App.tsx` no importaba ni utilizaba ninguno. La aplicación seguía administrando ingresos mediante `api` y estado local: código desconectado, no una sección vertical migrada. Tampoco se habían agregado pruebas del cliente o componente. |
| A10 | ❌ FAIL | `shared-ui` contiene el componente, pero usa `any[]` en vez del contrato compartido, y su "test" solo busca palabras prohibidas en el archivo fuente; no renderiza ni prueba el componente. Además, el paquete exporta directamente `src/index.tsx`, sin build distribuible. |
| A11 | ❌ FAIL / RIESGO | El composition root solo ensambla ingresos y no era utilizado por `server/index.mjs` *(corregido; ver nota de estado)*. Además, sigue importando el adaptador SQLite y creando un singleton al cargar el módulo, lo que puede abrir o migrar la base real solo por importar el paquete. |
| A12 | ❌ FAIL | Existe versionado y `npm pack`, pero el smoke test solo instala los tarballs: nunca importa una función, ejecuta un cálculo ni carga/renderiza `shared-ui`. No demuestra que un consumidor externo pueda usar los paquetes. `shared-ui` tampoco tiene build a JavaScript y declaraciones. |
| A13 | ⚠️ FAIL parcial | CI ejecuta `npm ci`, tests, build web y el smoke incompleto. No ejecutaba `architecture:check` *(corregido; ver nota de estado)*, no construye todos los paquetes, no valida ciclos de forma independiente del test unitario, no verifica imports reales desde los tarballs y no tiene una comprobación explícita de arranque local. |

## Hallazgos críticos

### 1. El contrato de persistencia no sirve todavía para cloud

El Paquete A exige contratos reutilizables para que SQLite y la futura
implementación cloud satisfagan el mismo comportamiento. Actualmente el
contrato es síncrono. Debe cambiarse antes de B00 a una interfaz basada en
promesas:

```ts
interface IncomeSourceRepository {
  list(context: WorkspaceContext, taxYear?: number): Promise<IncomeSourceRecord[]>;
  get(context: WorkspaceContext, id: number): Promise<IncomeSourceRecord | null>;
  create(context: WorkspaceContext, input: NewIncomeSource): Promise<IncomeSourceRecord>;
  update(context: WorkspaceContext, id: number, input: UpdateIncomeSource): Promise<IncomeSourceRecord | null>;
  remove(context: WorkspaceContext, id: number): Promise<boolean>;
}
```

Los casos de uso, routers y tests también deben pasar a `async`/`await`.
Debe existir además una función de contract test reutilizable, por
ejemplo:

```ts
export function incomeSourceRepositoryContract(
  createRepository: () => Promise<IncomeSourceRepository>,
  createContext: () => WorkspaceContext
): void
```

La misma suite tendría que ejecutarse contra SQLite y, más adelante,
contra PostgreSQL.

### 2. Los tests pueden tocar la base local real

`apps/local/src/index.mjs` importa `sqliteIncomeRepository` y crea
`localComposition` inmediatamente al cargar el módulo. Ese import termina
cargando `database.mjs`, que:

- resuelve `DB_PATH` con fallback a `server/data/apv-chile.sqlite`;
- crea el directorio;
- abre la base;
- activa WAL;
- ejecuta esquema y migraciones durante el import.

Por eso, importar `@personal-tax-ledger/local-app` en
`local-composition.test.mjs` puede abrir o modificar la base normal del
usuario, aunque después se inyecte un repositorio falso. La composición
creada en A11 evidencia el singleton y los imports anticipados.

La corrección debería:

- eliminar `export const sqliteIncomeRepository = ...`;
- eliminar `export const localComposition = ...`;
- crear la conexión SQLite mediante una factory explícita;
- inyectar el módulo de base solamente cuando se arranque la aplicación;
- establecer siempre un `DB_PATH` temporal en tests de infraestructura.

### 3. A09 y A10 no migraron realmente la UI

El pack pide que una sección funcional quede consumida por local y luego
movida a `shared-ui`, preservando comportamiento y agregando pruebas. En
el momento de esta revisión:

- `App.tsx` seguía conteniendo el estado y flujo original de ingresos;
- no importaba `incomeService`;
- no importaba `IncomesSection`;
- el componente compartido solo listaba registros y no conservaba el CRUD existente;
- no existían pruebas de renderizado o interacción.

Por tanto, no se había demostrado reutilización funcional entre local y
cloud. *(La desconexión de `App.tsx` se corrigió después; el tipado con
`any[]` y la falta de build de `shared-ui` siguen pendientes.)*

### 4. El smoke de paquetes produce un falso positivo

La instalación satisfactoria de un tarball no garantiza que sus exports
funcionen. El consumidor temporal debería ejecutar, como mínimo:

```ts
import { simulatePortfolio } from '@personal-tax-ledger/core';
import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { incomeSourceRequest } from '@personal-tax-ledger/api-contracts';

const result = simulatePortfolio([], {});
if (result.totals.annualTax !== 0) process.exit(1);
```

Para `shared-ui`, debe compilarse primero:

```text
packages/shared-ui/
├── src/
├── dist/
│   ├── index.js
│   └── index.d.ts
└── package.json
```

El export debe apuntar a `dist`, no a un `.tsx` fuente. El proyecto `web`
sí posee un build TypeScript/Vite, pero ese build no es un build
independiente del paquete compartido.

### 5. CI no aplica las fronteras que afirma aplicar

El script `architecture:check` existía en el `package.json` raíz, pero CI
no lo invocaba *(corregido; ver nota de estado)*. Sigue faltando un
comando que ejecute test/build/typecheck por workspace. Como mínimo, CI
debería ejecutar:

```yaml
- run: npm ci
- run: npm run architecture:check
- run: npm test
- run: npm run typecheck --if-present
- run: npm run build
- run: npm run build --workspaces --if-present
- run: npm run test --workspaces --if-present
- run: npm run pack:smoke
- run: npm run smoke:local
```

## Decisión recomendada

**Estado global**: `BLOCKED` para iniciar B00.

El propio pack indica que Paquete B (cloud) debe comenzar solamente
cuando A03, A04, A05, A06 y un A12 mínimo hayan demostrado que `core` y
los contratos pueden instalarse y consumirse desde fuera.

- A03 está razonablemente implementado.
- A04 no representa el contrato real.
- A05 no es compatible con persistencia asíncrona.
- A06 no usa una suite contractual común.
- A12 no prueba consumo real.
- A09–A11 no estaban conectados a la aplicación *(A09/A10/A11 ya se
  conectaron; los defectos de tipado, build y efectos secundarios
  siguen abiertos, ver nota de estado)*.

No fue posible ejecutar independientemente `npm ci`, tests y build en el
momento de esta revisión porque el entorno no pudo clonar GitHub por
resolución DNS. La conclusión se basó en la inspección completa de
commits y archivos mediante el conector de GitHub, lo que no cambia los
incumplimientos estructurales señalados pero tampoco constituye una
verificación en runtime.

## Plan de corrección

Los hallazgos que siguen vigentes (sección "Hallazgos críticos" 1, 2, 4,
5, y la parte de tipado/build del hallazgo 3) se corrigen de forma
incremental, un PR pequeño por prompt, en
[`docs/slice/pack-a5-fix/`](../slice/pack-a5-fix/README.md).
