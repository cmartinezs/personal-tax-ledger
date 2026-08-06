# Prompt 08 — A04: DTO de ingresos completo en api-contracts

```text
Objetivo:

Ampliar incomeSourceRequest/incomeSourceResponse en
packages/api-contracts para representar el DTO real de IncomeSource
(AFP, salud, APV, retención, notas, etc.), eliminando la duplicación de
tipos entre el frontend (web/src/types.ts) y el servidor.

Contexto:

- packages/api-contracts/src/index.mjs hoy solo mapea un subconjunto:
  name, kind, amount, inputMode, frequency, months, taxYear.
- web/src/types.ts define IncomeSource con muchos más campos: active,
  taxable, withholdingRate, afpName, afpCommissionRate, healthSystem,
  healthPlanAmount, contractType, apvRegime, apvPaymentMethod,
  apvMonthly, notes.
- server/index.mjs valida estos campos por su cuenta en la función
  validateSource, que hoy vive fuera de api-contracts.
- Este prompt depende de 01 (contrato async) solo si decides que el DTO
  ampliado también necesita ejemplos async en sus tests; no es un
  requisito estricto.

Alcance:

packages/api-contracts/src/index.mjs, packages/api-contracts/src/index.d.ts,
web/src/api.ts, server/index.mjs (la función validateSource puede
empezar a delegar en el DTO ampliado en vez de duplicar reglas).

Restricciones:

- No dupliques reglas de negocio tributario (por ejemplo, cálculo de
  retención por defecto) dentro de api-contracts; ese cálculo sigue
  siendo responsabilidad de core/server. api-contracts solo normaliza
  forma y tipos del DTO.
- Conserva compatibilidad con los payloads HTTP existentes: los campos
  ya soportados deben seguir aceptando los mismos valores.

Pasos detallados:

1. Amplía incomeSourceRequest en packages/api-contracts/src/index.mjs
   para incluir todos los campos de IncomeSource, con la misma
   normalización que hoy hace validateSource en server/index.mjs donde
   sea puramente de forma (trim, coerción a número, enum con default).
2. Amplía incomeSourceResponse de forma simétrica.
3. Actualiza packages/api-contracts/src/index.d.ts con los tipos
   completos.
4. En server/index.mjs, evalúa si validateSource puede delegar en
   incomeSourceRequest para la parte de forma, dejando allí solo las
   reglas que dependen de estado del servidor (por ejemplo, el default
   de withholdingRate que lee getSettings().honorariosRetentionRate).
   Si mezclar ambas responsabilidades complica el diff, dócumenta
   explícitamente qué queda en cada lado y por qué.
5. Actualiza web/src/api.ts para construir el payload de creación/
   actualización usando el DTO ampliado en vez de solo el subconjunto
   actual.
6. Actualiza server/test/api-contracts.test.mjs para cubrir los campos
   nuevos (al menos afpName, healthSystem, apvRegime, apvMonthly,
   notes).

Criterios de aceptación:

- incomeSourceRequest/incomeSourceResponse representan todos los campos
  reales de IncomeSource.
- server/index.mjs y web/src/api.ts usan el DTO ampliado sin duplicar
  la normalización de forma.
- npm test pasa; prueba manual con curl creando un ingreso con todos
  los campos (AFP, salud, APV) confirma que se guarda y se lista
  correctamente.

Checklist de revisión:

docs/slice/pack-a5-fix/docs/review-checklist.md completo.

Instrucciones de commit:

Un commit: `refactor(a04): expand the shared income DTO to match the real model`.

Instrucciones de PR:

Título: "A04 fix: complete income DTO in api-contracts". Incluye qué
reglas quedaron en server/index.mjs (justificando por qué no se movieron)
y cuáles se movieron a api-contracts.

Condiciones de detención:

Si mover toda la normalización a api-contracts obliga a que ese paquete
conozca getSettings() u otro estado del servidor, detente: eso violaría
la frontera de api-contracts (no debe depender de infraestructura).
Documenta la división de responsabilidad en vez de acoplar el paquete.
```
