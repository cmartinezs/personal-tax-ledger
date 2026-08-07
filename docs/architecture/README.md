# Arquitectura

Documentación técnica para entender límites, dependencias y flujos del monorepo.

## Lectura recomendada

1. [`adr/0001-clean-hexagonal-architecture.md`](adr/0001-clean-hexagonal-architecture.md): decisión arquitectónica Clean/Hexagonal (objetivo).
2. [`current-state.md`](current-state.md): qué existe hoy y cómo se conecta.
3. [`target-state.md`](target-state.md): principios y límites que deben conservarse.
4. [`module-destination-map.md`](module-destination-map.md): ubicación de cada responsabilidad.
5. [`package-policy.md`](package-policy.md): superficie pública de paquetes.
6. [`http-route-catalog.md`](http-route-catalog.md): contrato operativo de endpoints.
7. [`migration-sequence.md`](migration-sequence.md): contexto histórico de la migración.
8. [`aggregate-migration-pattern.md`](aggregate-migration-pattern.md): procedimiento para migrar un agregado.

## Verificaciones

```bash
npm run architecture:check
npm run build:packages
npm run typecheck
```

El checker de arquitectura inspecciona imports de `packages/*` y `apps/*`, detecta ciclos y protege las fronteras de `core`/`contracts`.
