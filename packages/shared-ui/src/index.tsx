import { useEffect, useState } from 'react';

export function IncomesSection({ service, taxYear }: { service: { list(taxYear?: number): Promise<any[]> }; taxYear: number }) {
  const [sources, setSources] = useState<any[]>([]);
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
