export const navigation = [
  { key: 'dashboard', label: 'Resumen' },
  { key: 'incomes', label: 'Ingresos' },
  { key: 'fees', label: 'Boletas' },
  { key: 'mortgages', label: 'Hipotecario' },
  { key: 'scenarios', label: 'Escenarios' },
  { key: 'settings', label: 'Configuración' },
  { key: 'sources', label: 'Fuentes' },
  { key: 'logs', label: 'Bitácora' }
] as const;

export type ViewKey = typeof navigation[number]['key'];
