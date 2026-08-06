export const defaultSettings = {
  year: 2026,
  currency: 'CLP',
  ufValue: 40844.79,
  utmValue: 71649,
  pensionRate: 0.10,
  healthRate: 0.07,
  afpCapUf: 90,
  afcCapUf: 135.2,
  honorariosRetentionRate: 0.1525,
  honorariosExpenseMethod: 'PRESUMED',
  honorariosPresumedExpenseRate: 0.30,
  honorariosPresumedExpenseCapUta: 15,
  honorariosActualAnnualExpenses: 0,
  apvABonusRate: 0.15,
  apvABonusCapUtm: 6,
  apvBAnnualCapUf: 600,
  apvBMonthlyCapUf: 50,
  annualUnitMode: 'CURRENT_UTM_PROJECTION',
  disclaimerAccepted: false,
  // Boletas recognition policy used by the annual tax engine when consolidating
  // fee receipts coming from the new fee_receipts module.
  // 'ISSUE_DATE' includes every ACTIVE boleta issued in the tax year.
  // 'PAID_ONLY' includes only boletas whose paymentStatus === 'PAID'.
  feeRecognitionMode: 'ISSUE_DATE',
  // Article 55 bis LIR mortgage parameters (kept in sync with tax_parameters table).
  // Settings remain here for back-compat with the original API; the canonical source
  // is the tax_parameters table, but settings are mirrored to keep client code stable.
  mortgageInterestMaxUta: 8,
  mortgageFullBenefitIncomeMaxUta: 90,
  mortgagePartialBenefitIncomeMaxUta: 150,
  mortgagePartialFormulaConstant: 250,
  mortgagePartialFormulaFactor: 1.667
};

export const afpCommissionRates = {
  CAPITAL: 0.0144,
  CUPRUM: 0.0144,
  HABITAT: 0.0127,
  MODELO: 0.0058,
  PLANVITAL: 0.0116,
  PROVIDA: 0.0145,
  UNO: 0.0046
};

export const officialReferences = [
  {
    authority: 'SII',
    title: 'Impuesto Único de Segunda Categoría 2026',
    url: 'https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm',
    appliesTo: 'Tramos mensuales de IUSC y UTM'
  },
  {
    authority: 'SII',
    title: 'Guía Práctica de Declaración de Renta 2026',
    url: 'https://www.sii.cl/servicios_online/renta/guia_practica_renta_2026.pdf',
    appliesTo: 'APV A/B, topes y declaración anual'
  },
  {
    authority: 'SII',
    title: 'Boleta de Honorarios 2026',
    url: 'https://www.sii.cl/destacados/boletas_honorarios/',
    appliesTo: 'Retención de honorarios 15,25%'
  },
  {
    authority: 'SII',
    title: 'Valores de la UF 2026',
    url: 'https://www.sii.cl/valores_y_fechas/uf/uf2026.htm',
    appliesTo: 'UF diaria utilizada en topes previsionales'
  },
  {
    authority: 'Superintendencia de Pensiones',
    title: 'Topes imponibles definitivos 2026',
    url: 'https://www.spensiones.cl/portal/institucional/594/w3-article-16921.html',
    appliesTo: '90 UF AFP/salud y 135,2 UF AFC'
  },
  {
    authority: 'Superintendencia de Pensiones',
    title: 'Comisiones vigentes de AFP',
    url: 'https://www.spensiones.cl/portal/institucional/594/w3-article-2810.html',
    appliesTo: 'Comisión porcentual por AFP'
  },
  {
    authority: 'Fonasa',
    title: 'Afiliación y cotización',
    url: 'https://www.fonasa.cl/sites/fonasa/afiliacion',
    appliesTo: 'Cotización legal de salud del 7%'
  },
  {
    authority: 'Biblioteca del Congreso Nacional',
    title: 'Ley sobre Impuesto a la Renta, artículo 55 bis',
    url: 'https://www.bcn.cl/leychile/navegar?idNorma=1095855&idParte=&idVersion=2026-01-01',
    appliesTo: 'Rebaja por intereses hipotecarios pagados en el año'
  },
  {
    authority: 'SII',
    title: 'Interés hipotecario en Declaración de Renta',
    url: 'https://www.sii.cl/destacados/interes_hipotecario/',
    appliesTo: 'Tope 8 UTA y tabla de porcentaje por nivel de renta'
  }
];
