import { useEffect, useState } from 'react';
import type { IncomeSource } from './types';
import type { IncomeService } from './income-service';

type Props = { service: IncomeService; taxYear: number };

export default function IncomesSection({ service, taxYear }: Props) {
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let active = true;
    setState('loading');
    service.list(taxYear).then(next => {
      if (!active) return;
      setSources(next);
      setState('ready');
    }).catch(() => {
      if (active) setState('error');
    });
    return () => { active = false; };
  }, [service, taxYear]);

  if (state === 'loading') return <div className="empty">Cargando ingresos…</div>;
  if (state === 'error') return <div className="alert error">No se pudieron cargar los ingresos.</div>;
  return <div className="source-list">{sources.length === 0 ? <div className="empty">No hay ingresos para este año.</div> : sources.map(source => <article className="source-card" key={source.id}><div><span className="kind">{source.kind}</span><h3>{source.name}</h3><p>{source.amount} · {source.frequency}</p></div></article>)}</div>;
}
