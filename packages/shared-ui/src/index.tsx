export type IncomesSectionSource = {
  id?: number;
  kind: string;
  name: string;
  amount: number;
  frequency: 'MONTHLY' | 'ANNUAL' | 'ONE_TIME';
  months: number;
};

export type IncomesSectionProps<T extends IncomesSectionSource = IncomesSectionSource> = {
  sources: T[];
  taxYear: number;
  prevYears: number[];
  busy: boolean;
  formatAmount: (value: number) => string;
  formatFrequencyLabel: (frequency: string) => string;
  sourceAnnual: (source: T) => number;
  sourceHint: (source: T) => string;
  onEdit: (source: T) => void;
  onRemove: (id?: number) => void;
  onCopyFromPrevious: () => void;
};

export function IncomesSection<T extends IncomesSectionSource>({
  sources,
  taxYear,
  prevYears,
  busy,
  formatAmount,
  formatFrequencyLabel,
  sourceAnnual,
  sourceHint,
  onEdit,
  onRemove,
  onCopyFromPrevious
}: IncomesSectionProps<T>) {
  const monthlyTotal = sources.filter(source => source.frequency === 'MONTHLY').reduce((acc, source) => acc + (Number(source.amount) || 0), 0);
  const annualTotal = sources.reduce((acc, source) => acc + sourceAnnual(source), 0);

  return <>
    <section className="metrics">
      <article className="metric"><small>Fuentes activas</small><strong>{String(sources.length)}</strong><span className="metric-hint">{`Cantidad de fuentes de ingreso guardadas para el año comercial ${taxYear}.`}</span></article>
      <article className="metric"><small>Total mensual recurrente</small><strong>{formatAmount(monthlyTotal)}</strong><span className="metric-hint">Suma de los montos mensuales de las fuentes con frecuencia mensual.</span></article>
      <article className="metric"><small>Proyección anual estimada</small><strong>{formatAmount(annualTotal)}</strong><span className="metric-hint">Monto mensual × meses (mensuales) más montos anuales o de una sola vez. Es nominal: los sueldos ingresados como líquidos se convierten a bruto en el motor.</span></article>
    </section>
    <div className="source-list">
      {sources.length === 0
        ? <div className="empty">
            {`Todavía no hay ingresos guardados para ${taxYear}.`}
            {prevYears.length > 0 && <>
              <button className="primary" onClick={onCopyFromPrevious} disabled={busy}>Copiar desde {prevYears[0]}</button>
              <small>Reutiliza los ingresos del año {prevYears[0]} como punto de partida. Cada año conserva sus propios ingresos.</small>
            </>}
          </div>
        : sources.map(source => <article className="source-card" key={source.id}>
            <div>
              <span className="kind">{source.kind}</span>
              <h3>{source.name}</h3>
              <p>{formatAmount(source.amount)} · {source.frequency === 'MONTHLY' ? `${source.months} meses` : formatFrequencyLabel(source.frequency)}</p>
              <span className="metric-hint">{sourceHint(source)}</span>
            </div>
            <div className="source-actions">
              <button onClick={() => onEdit(source)}>Editar</button>
              <button className="danger-text" onClick={() => onRemove(source.id)}>Eliminar</button>
            </div>
          </article>)}
    </div>
  </>;
}

export type SummaryMetric = {
  key: string;
  label: string;
  value: string;
  hint?: string;
  tone?: string;
};

export function SummaryMetrics({ metrics, onExplain }: { metrics: SummaryMetric[]; onExplain?: (key: string) => void }) {
  return <section className="metrics">
    {metrics.map(metric => <article className={`metric ${metric.tone || ''}`} key={metric.label}>
      <small>{metric.label}</small>
      <strong>{metric.value}</strong>
      {metric.hint && <span className="metric-hint">{metric.hint}</span>}
      {onExplain && <button className="metric-explain" onClick={() => onExplain(metric.key)}>Ver cálculo</button>}
    </article>)}
  </section>;
}
