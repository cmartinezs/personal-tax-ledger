import { useEffect, useMemo, useState } from 'react';
import {
  applicabilityProfileClient,
  type ApplicabilityAnswer,
  type ApplicabilityProfileReview
} from './applicability-profile-client';

const LABELS: Record<string, { label: string; reviewTarget?: string }> = {
  DEPENDENT_INCOME: { label: 'Renta dependiente / empleador', reviewTarget: 'Ingresos laborales' },
  DOMESTIC_FEE_INCOME: { label: 'Honorarios / BHE nacionales', reviewTarget: 'Boletas de honorarios' },
  FOREIGN_SERVICE_INCOME: { label: 'Pagador o cliente extranjero' },
  APV_CONTRIBUTIONS: { label: 'APV', reviewTarget: 'Ingresos laborales / APV' },
  MORTGAGE_INTEREST: { label: 'Crédito hipotecario relevante', reviewTarget: 'Créditos hipotecarios' }
};

const OPTIONS: Array<{ value: ApplicabilityAnswer; label: string }> = [
  { value: 'YES', label: 'Sí' },
  { value: 'NO', label: 'No' },
  { value: 'UNKNOWN', label: 'Aún no sé' }
];

export default function ApplicabilityProfileSection({ commercialYear }: { commercialYear: number }) {
  const [review, setReview] = useState<ApplicabilityProfileReview | null>(null);
  const [answers, setAnswers] = useState<Record<string, ApplicabilityAnswer>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setReview(null);
    setSaved(false);
    setError('');
    applicabilityProfileClient.get().then(value => {
      setReview(value);
      setAnswers({ ...value.profile.answers });
    }).catch(error => setError(error instanceof Error ? error.message : String(error)));
  }, [commercialYear]);

  const dimensions = useMemo(() => review?.dimensions || [], [review]);

  const save = async () => {
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      const next = await applicabilityProfileClient.save(answers);
      setReview(next);
      setAnswers({ ...next.profile.answers });
      setSaved(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  return <section className="annual-applicability-profile" aria-labelledby="annual-applicability-title">
    <div className="annual-applicability-heading">
      <div>
        <h2 id="annual-applicability-title">Perfil del año</h2>
        <p>Define qué situaciones esperas tener este año. Esto no registra montos ni confirma que hayan ocurrido; sirve para preparar PTL y detectar información pendiente.</p>
      </div>
      {review && <div className="annual-applicability-summary" aria-live="polite">
        <span>{review.pendingCount} pendiente{review.pendingCount === 1 ? '' : 's'}</span>
        <span>{review.needsReviewCount} por revisar</span>
      </div>}
    </div>

    {error && <div className="annual-applicability-error">{error}</div>}
    {!review ? <p>Cargando perfil del año…</p> : <div className="annual-applicability-list">
      {dimensions.map(item => {
        const meta = LABELS[item.dimension] || { label: item.dimension };
        const current = answers[item.dimension] || 'UNKNOWN';
        return <div key={item.dimension} className={`annual-applicability-row ${item.state === 'NEEDS_REVIEW' ? 'needs-review' : ''}`}>
          <div className="annual-applicability-situation">
            <strong>{meta.label}</strong>
            {item.state === 'NEEDS_REVIEW' && <div className="annual-applicability-conflict" role="status">
              <strong>NEEDS_REVIEW</strong>
              <span>Declaraste “No”, pero PTL ya tiene hechos canónicos de esta categoría. El perfil no se modifica automáticamente y los datos existentes no se eliminan.</span>
              {meta.reviewTarget && <small>Revisa los datos en: {meta.reviewTarget}.</small>}
            </div>}
            {item.factPresence === 'UNAVAILABLE' && <small>PTL aún no dispone de una fuente canónica para contrastar esta categoría.</small>}
          </div>
          <div className="annual-applicability-options" role="radiogroup" aria-label={meta.label}>
            {OPTIONS.map(option => <label key={option.value}>
              <input
                type="radio"
                name={`applicability-${item.dimension}`}
                value={option.value}
                checked={current === option.value}
                disabled={busy}
                onChange={() => {
                  setSaved(false);
                  setAnswers(previous => ({ ...previous, [item.dimension]: option.value }));
                }}
              />
              {option.label}
            </label>)}
          </div>
        </div>;
      })}
    </div>}

    <div className="annual-applicability-actions">
      {saved && <span role="status">Perfil guardado.</span>}
      <button className="primary" disabled={busy || !review} onClick={save}>{busy ? 'Guardando…' : 'Guardar perfil'}</button>
    </div>
  </section>;
}
