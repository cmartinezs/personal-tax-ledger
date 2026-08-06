# Personal Tax Ledger — paquetes de prompts de migración y Cloud

Versión: 1.0  
Fecha: 2026-08-06  
Repositorios objetivo:

- Público existente: `cmartinezs/personal-tax-ledger`
- Privado futuro: `personal-tax-ledger-cloud`

## Cómo usar este documento

Ejecuta los prompts de cada paquete en orden y en sesiones separadas. Cada prompt debe producir un PR pequeño. No entregues al agente todos los prompts como una orden de implementación única.

Antes de cada prompt, pega el **Contrato general de ejecución**. Después agrega solo el prompt correspondiente a la iteración.

No avances automáticamente a la siguiente iteración. Primero revisa y fusiona el PR actual.

---

# Contrato general de ejecución

```text
Trabaja únicamente en el alcance de esta iteración.

Reglas obligatorias:

1. Antes de modificar, inspecciona el repositorio, sus instrucciones, estado Git, scripts, tests, estructura y dependencias. Resume brevemente los hallazgos relevantes.
2. Conserva el comportamiento observable y la compatibilidad de la aplicación, salvo que esta iteración indique expresamente un cambio.
3. No hagas refactorizaciones oportunistas ni cambios masivos de formato.
4. No reemplaces tecnologías ni agregues frameworks sin necesidad demostrable.
5. Mantén los cálculos tributarios independientes de HTTP, React, SQLite, Supabase, Firebase y variables de entorno.
6. Todo cambio estructural debe estar cubierto por tests de caracterización, unitarios, contractuales o de integración según corresponda.
7. Los tests existentes deben continuar pasando. Ejecuta también build, lint y typecheck si existen.
8. No borres ni reescribas migraciones ya aplicadas. Las migraciones nuevas deben ser incrementales.
9. No introduzcas secretos, tokens, datos personales reales ni información financiera real en código, fixtures, logs o documentación.
10. Si descubres que el alcance exige una decisión arquitectónica no definida, detente y documenta alternativas; no inventes una expansión importante.
11. Entrega un solo PR cohesivo y pequeño. Si el cambio resulta demasiado grande, implementa solo la primera porción segura y deja el resto como próximos pasos explícitos.
12. Al finalizar informa: archivos relevantes, decisiones tomadas, pruebas ejecutadas, resultado, riesgos y siguiente iteración recomendada.

Definición global de terminado:

- El repositorio queda ejecutable.
- No hay regresiones conocidas.
- El diff corresponde únicamente al objetivo.
- Las fronteras arquitectónicas nuevas se verifican automáticamente cuando sea razonable.
- La documentación afectada queda actualizada.
```