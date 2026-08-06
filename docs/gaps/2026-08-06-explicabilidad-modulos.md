# Explicabilidad específica de módulos

**Tipo**: técnico

**Descripción**: La primera integración genera una trazabilidad canónica completa para la simulación anual y la muestra en todas las pestañas. Los módulos de boletas, hipotecario y comparador APV todavía tienen previsualizaciones locales para sus formularios y no reciben un objeto `ExplainedCalculation` independiente desde sus endpoints especializados.

**Impacto**: El panel global es auditable para los resultados anuales, pero aún no expone todos los pasos específicos de una boleta en edición, de un dividendo mensual o de cada escenario APV como explicaciones independientes.

**Acción requerida**: Extender `computeFeeReceiptAmounts`, `computeArticle55BisBenefit` y `compareApv` para retornar resultado y trazabilidad, y reemplazar las previsualizaciones React por esos resultados del motor. Definir también los identificadores de fuentes oficiales que deben asociarse a cada regla.

**Prioridad**: media
