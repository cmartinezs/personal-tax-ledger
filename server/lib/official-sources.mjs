// Official sources consulted for tax rules. Stored in tax_rule_sources for traceability.
// No scraping at runtime. Edit seeds here when re-verifying against official sources.

export const TAX_RULE_SOURCES_SEEDS = [
  {
    ruleKey: 'fee_withholding_rate',
    taxYear: 2026,
    institution: 'SII',
    title: 'Retención en boletas de honorarios 2026',
    sourceUrl: 'https://www.sii.cl/destacados/boletas_honorarios/',
    retrievedAt: '2026-01-15',
    notes: 'Tasa de retención de honorarios vigente desde el 1 de enero de 2026.'
  },
  {
    ruleKey: 'fee_presumed_expense',
    taxYear: 2026,
    institution: 'SII',
    title: 'Gasto presunto en rentas de honorarios (art. 50 N°1 LIR)',
    sourceUrl: 'https://www.sii.cl/destacados/boletas_honorarios/',
    retrievedAt: '2026-01-15',
    notes: '30% con tope de 15 UTA según artículo 50 N°1 de la LIR.'
  },
  {
    ruleKey: 'mortgage_article_55_bis',
    taxYear: 2026,
    institution: 'Biblioteca del Congreso Nacional',
    title: 'Ley sobre Impuesto a la Renta, artículo 55 bis',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1095855&idParte=&idVersion=2026-01-01',
    retrievedAt: '2026-01-15',
    notes: 'Rebaja por intereses pagados en créditos hipotecarios con destino DFL2 vivienda DFL2.'
  },
  {
    ruleKey: 'mortgage_8uta_cap',
    taxYear: 2026,
    institution: 'SII',
    title: 'Tope de 8 UTA del artículo 55 bis LIR',
    sourceUrl: 'https://www.sii.cl/destacados/interes_hipotecario/',
    retrievedAt: '2026-01-15',
    notes: 'Limite máximo del monto de intereses a rebajar de la base imponible.'
  },
  {
    ruleKey: 'mortgage_partial_formula',
    taxYear: 2026,
    institution: 'SII',
    title: 'Tabla del artículo 55 bis LIR para rentas entre 90 y 150 UTA',
    sourceUrl: 'https://www.sii.cl/destacados/interes_hipotecario/',
    retrievedAt: '2026-01-15',
    notes: 'La fórma de rebaja lineal decreciente aplica el factor 1,667 y la constante 250.'
  }
];
