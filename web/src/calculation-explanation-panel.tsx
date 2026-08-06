import { useEffect, useRef, useState } from 'react';
import type { CalculationExplanation } from './types';

type Props = { title?: string; explanations?: CalculationExplanation[]; defaultExpanded?: boolean; focusKey?: string | null; exportData?: unknown };

export default function CalculationExplanationPanel({ title = '¿Cómo se calculan estos valores?', explanations = [], defaultExpanded = false, focusKey, exportData }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [modalOpen, setModalOpen] = useState(false);
  const [technical, setTechnical] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const items = explanations.filter(Boolean);

  useEffect(() => {
    if (!focusKey) return;
    setExpanded(true);
    setModalOpen(true);
    setOpenKey(focusKey);
  }, [focusKey]);

  useEffect(() => {
    if (!modalOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModalOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [modalOpen]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(exportData || { explanations: items }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'detalle-calculo.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return <>
    <section className="explanation-panel">
      <button className="explanation-toggle" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
        <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>{title}
      </button>
      {expanded && <div className="explanation-content">
        <p className="explanation-intro">Consulta la explicación general, el cálculo aplicado, los valores usados y la trazabilidad técnica.</p>
        <button className="primary explanation-open" onClick={() => setModalOpen(true)} disabled={items.length === 0}>Abrir explicación de cálculos</button>
      </div>}
    </section>
    {modalOpen && <div className="explanation-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setModalOpen(false); }}>
      <section className="explanation-modal" role="dialog" aria-modal="true" aria-labelledby="calculation-explanation-title">
        <header className="explanation-modal-header">
          <div><h2 id="calculation-explanation-title">{title}</h2><p>La trazabilidad proviene del motor de cálculo.</p></div>
          <button ref={closeButtonRef} aria-label="Cerrar explicación" onClick={() => setModalOpen(false)}>×</button>
        </header>
        <div className="explanation-toolbar"><span>{items.length} cálculos disponibles</span><div><button onClick={exportJson}>Exportar JSON</button><button onClick={() => setTechnical(value => !value)}>{technical ? 'Explicación simple' : 'Detalle técnico'}</button></div></div>
        {items.length === 0 ? <p className="empty">No hay cálculos disponibles para explicar.</p> : <div className="explanation-list">
          {items.map(item => <article key={item.key} className={`explanation-item ${openKey === item.key ? 'highlighted' : ''}`}>
            <button className="explanation-item-toggle" aria-expanded={openKey === item.key} onClick={() => setOpenKey(openKey === item.key ? null : item.key)}><span>▸</span>{item.title}<strong>{item.result?.formattedValue || 'No calculado'}</strong></button>
            {openKey === item.key && <div className="explanation-detail">
              <p>{item.shortDescription}</p>
              {item.formulaLabel && <><h4>Explicación general</h4><p>{item.formulaLabel}: {item.formulaExpression || 'Regla configurada en el motor.'}</p></>}
              {item.appliedExpression && <><h4>Cálculo aplicado</h4><code>{item.appliedExpression}</code></>}
              {(item.inputs || []).length > 0 && <dl>{(item.inputs || []).map(input => <div key={input.key}><dt>{input.label}</dt><dd>{input.formattedValue}<small>{input.origin.replaceAll('_', ' ')}</small></dd></div>)}</dl>}
              {(item.steps || []).map(step => <div className="explanation-step" key={step.order}><strong>{step.order}. {step.label}</strong><code>{step.appliedExpression || step.expression}</code><span>{step.formattedResult || 'No calculado'}</span></div>)}
              {item.result?.interpretation && <p className="interpretation">{item.result.interpretation}</p>}
              {(item.warnings || []).map(warning => <p className="explanation-warning" key={warning}>⚠ {warning}</p>)}
              {(item.assumptions || []).map(assumption => <p className="explanation-assumption" key={assumption}>{assumption}</p>)}
              {technical && <pre>{JSON.stringify(item, null, 2)}</pre>}
            </div>}
          </article>)}
        </div>}
      </section>
    </div>}
  </>;
}
