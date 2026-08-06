import { useEffect, useMemo, useState } from 'react';
import { ApiRequestError } from '../../api';
import { sourceService } from '../../services';
import { useFeedback } from '../../feedback';
import type { TaxRuleSource, Reference } from '../../types';

type Props = { references: Reference[] };

type ModalState =
  | { kind: 'reference'; ref: Reference }
  | { kind: 'source'; source: TaxRuleSource }
  | null;

const emptyDraft: TaxRuleSource = {
  id: '', ruleKey: 'fee_withholding_rate', taxYear: 2026, institution: '', title: '', sourceUrl: '', retrievedAt: '', notes: ''
};

export default function SourcesModule({ references }: Props) {
  const [sources, setSources] = useState<TaxRuleSource[]>([]);
  const [draft, setDraft] = useState<TaxRuleSource>(emptyDraft);
  const [modal, setModal] = useState<ModalState>(null);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [sourceQuery, setSourceQuery] = useState('');
  const [error, setError] = useState('');
  const { confirm } = useFeedback();

  const refresh = async () => {
    try {
      setSources(await sourceService.list({}));
    } catch (e) { setError(errMsg(e)); }
  };

  useEffect(() => { refresh().catch(() => {}); }, []);

  const save = async () => {
    if (!draft.ruleKey || !draft.institution || !draft.title || !draft.sourceUrl || !draft.taxYear || !draft.retrievedAt) {
      setError('Completa ruleKey, institution, title, sourceUrl, taxYear y retrievedAt');
      return;
    }
    try {
      await sourceService.create(draft);
      setDraft(emptyDraft);
      await refresh();
    } catch (e) { setError(errMsg(e)); }
  };

  const remove = async (id: string) => {
    const ok = await confirm({ message: '¿Eliminar la fuente consultada?', confirmLabel: 'Eliminar', cancelLabel: 'Cancelar', danger: true });
    if (!ok) return;
    try {
      await sourceService.remove(id);
      await refresh();
    } catch (e) { setError(errMsg(e)); }
  };

  const filteredCatalog = useMemo(() => {
    const q = catalogQuery.trim().toLowerCase();
    if (!q) return references;
    return references.filter(r => r.authority.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.appliesTo.toLowerCase().includes(q));
  }, [references, catalogQuery]);

  const filteredSources = useMemo(() => {
    const q = sourceQuery.trim().toLowerCase();
    if (!q) return sources;
    return sources.filter(s => s.ruleKey.toLowerCase().includes(q) || s.institution.toLowerCase().includes(q) || (s.title || '').toLowerCase().includes(q));
  }, [sources, sourceQuery]);

  return (
    <div className="module">
      <Card title="Catálogo oficial">
        <p className="hint">Normativa de referencia consultada para los parámetros del simulador. Presiona una tarjeta para ver el detalle y abrir la fuente.</p>
        <Filter label="Buscar por institución, título o tema" value={catalogQuery} onChange={setCatalogQuery} />
        {filteredCatalog.length === 0 ? <Empty text="Sin coincidencias." /> :
          <div className="sources-grid">
            {filteredCatalog.map(ref => (
              <button key={ref.id} className="source-tile" onClick={() => setModal({ kind: 'reference', ref })}>
                <span className="badge">{ref.authority}</span>
                <strong className="tile-title">{ref.title}</strong>
                <small className="tile-sub">{ref.appliesTo}</small>
              </button>
            ))}
          </div>}
      </Card>

      <Card title="Reglas tributarias individualizadas y trazabilidad">
        <p className="hint">Cada regla versionada por año tributario con su fuente oficial asociada. Presiona una tarjeta para el detalle completo.</p>
        <Filter label="Buscar por regla, institución o título" value={sourceQuery} onChange={setSourceQuery} />
        {filteredSources.length === 0 ? <Empty text="No hay reglas registradas todavía." /> :
          <div className="sources-grid">
            {filteredSources.map(s => (
              <article key={s.id} className="source-tile" onClick={() => setModal({ kind: 'source', source: s })}>
                <div className="tile-top">
                  <code className="rule-key">{s.ruleKey}</code>
                  <span className="badge">{s.institution}</span>
                </div>
                <strong className="tile-title">{s.title}</strong>
                <small className="tile-sub">{s.taxYear} · consultado {s.retrievedAt}</small>
                {s.notes && <small className="tile-sub tile-notes">{s.notes}</small>}
                <div className="tile-actions">
                  <a href={s.sourceUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>Abrir fuente</a>
                  <button className="danger-text" onClick={e => { e.stopPropagation(); remove(s.id); }}>Eliminar</button>
                </div>
              </article>
            ))}
          </div>}
        <Card title="Registrar regla consultada" asSub>
          <div className="form-grid two-rows">
            <Field label="Regla (ruleKey)"><input value={draft.ruleKey} onChange={e => setDraft({ ...draft, ruleKey: e.target.value })} /></Field>
            <Field label="Año"><input type="number" min={2000} max={2100} value={draft.taxYear} onChange={e => setDraft({ ...draft, taxYear: Number(e.target.value) })} /></Field>
            <Field label="Institución"><input value={draft.institution} onChange={e => setDraft({ ...draft, institution: e.target.value })} /></Field>
            <Field label="Título"><input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></Field>
            <Field label="URL fuente" wide><input value={draft.sourceUrl} onChange={e => setDraft({ ...draft, sourceUrl: e.target.value })} /></Field>
            <Field label="Consultado en"><input type="date" value={draft.retrievedAt} onChange={e => setDraft({ ...draft, retrievedAt: e.target.value })} /></Field>
            <Field label="Notas" wide><textarea value={draft.notes || ''} onChange={e => setDraft({ ...draft, notes: e.target.value })} /></Field>
          </div>
          <div className="actions"><button className="primary" onClick={save}>Guardar fuente consultada</button></div>
          {error && <div className="alert error">{error}<button onClick={() => setError('')}>×</button></div>}
        </Card>
      </Card>

      {modal && <Modal
        title={modal.kind === 'reference' ? modal.ref.title : modal.source.title}
        onClose={() => setModal(null)}>
        {modal.kind === 'reference' ? (
          <ReferenceDetail ref={modal.ref} />
        ) : (
          <SourceDetail source={modal.source} onDelete={remove} />
        )}
      </Modal>}
    </div>
  );
}

function ReferenceDetail({ ref }: { ref: Reference }) {
  return (
    <dl className="modal-fields">
      <div><dt>Institución</dt><dd>{ref.authority}</dd></div>
      <div><dt>Alcance</dt><dd>{ref.appliesTo}</dd></div>
      <div><dt>Fuente</dt><dd><a className="url-wrap" href={ref.url} target="_blank" rel="noreferrer">{ref.url}</a></dd></div>
    </dl>
  );
}

function SourceDetail({ source, onDelete }: { source: TaxRuleSource; onDelete: (id: string) => void }) {
  const { confirm } = useFeedback();
  return (
    <>
      <dl className="modal-fields">
        <div><dt>Regla (ruleKey)</dt><dd><code>{source.ruleKey}</code></dd></div>
        <div><dt>Año tributario</dt><dd>{source.taxYear}</dd></div>
        <div><dt>Institución</dt><dd>{source.institution}</dd></div>
        <div><dt>Consultado en</dt><dd>{source.retrievedAt}</dd></div>
        {source.notes && <div><dt>Notas</dt><dd>{source.notes}</dd></div>}
        <div><dt>URL fuente</dt><dd><a className="url-wrap" href={source.sourceUrl} target="_blank" rel="noreferrer">{source.sourceUrl}</a></dd></div>
      </dl>
      <div className="modal-footer">
        <button className="danger-text" onClick={async () => { const ok = await confirm({ message: '¿Eliminar la fuente consultada?', confirmLabel: 'Eliminar', cancelLabel: 'Cancelar', danger: true }); if (ok) onDelete(source.id); }}>Eliminar</button>
        <a className="btn-link" href={source.sourceUrl} target="_blank" rel="noreferrer">Abrir fuente</a>
      </div>
    </>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: any }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function Filter({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="filter-bar">
      <label>{label}<input value={value} onChange={e => onChange(e.target.value)} placeholder="Filtrar…" /></label>
    </div>
  );
}

function Card({ title, children, asSub }: { title: string; children: any; asSub?: boolean }) {
  return asSub
    ? <section className="sub-card"><h3>{title}</h3>{children}</section>
    : <section className="card"><h2>{title}</h2>{children}</section>;
}
function Field({ label, children, wide }: { label: string; children: any; wide?: boolean }) { return <label className={wide ? 'wide' : ''}><span>{label}</span>{children}</label>; }
function Empty({ text }: { text: string }) { return <div className="empty">{text}</div>; }
function errMsg(e: any) { return e instanceof ApiRequestError ? `[${e.code}] ${e.message}` : e instanceof Error ? e.message : 'Error inesperado'; }
