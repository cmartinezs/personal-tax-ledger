import { useEffect, useMemo, useState } from 'react';
import WorkspaceView from './WorkspaceView';
import ApplicabilityProfileSection from './ApplicabilityProfileSection';
import { api, ApiRequestError, type AnnualWorkspaceList, type AnnualWorkspaceOption } from '../api';
import './annual-workspace.css';

function derivedTaxYearLabel(commercialYear: number) {
  return `AT${commercialYear + 1}`;
}

export default function AnnualWorkspaceGate() {
  const [catalog, setCatalog] = useState<AnnualWorkspaceList | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [candidateYear, setCandidateYear] = useState(new Date().getFullYear());

  const activeOption = useMemo(
    () => catalog?.workspaces.find(item => item.workspace.commercialYear === catalog.activeCommercialYear) || null,
    [catalog]
  );

  const reloadCatalog = async () => {
    const next = await api.listAnnualWorkspaces();
    setCatalog(next);
    return next;
  };

  useEffect(() => {
    reloadCatalog().catch(e => setError(errorMessage(e)));
  }, []);

  const selectWorkspace = async (option: AnnualWorkspaceOption) => {
    if (!catalog || option.workspace.commercialYear === catalog.activeCommercialYear) return;
    if (option.support.state === 'UNSUPPORTED') {
      setError(`El año comercial ${option.workspace.commercialYear} no tiene un rule set completo y no puede abrirse de forma segura.`);
      return;
    }
    const acceptWarnings = option.support.state === 'SUPPORTED_WITH_WARNINGS'
      ? window.confirm(`El año comercial ${option.workspace.commercialYear} tiene reglas operativas, pero su provenance no está completa. ¿Abrir de todas formas?`)
      : false;
    if (option.support.state === 'SUPPORTED_WITH_WARNINGS' && !acceptWarnings) return;

    setBusy(true);
    setError('');
    try {
      await api.selectAnnualWorkspace(option.workspace.commercialYear, acceptWarnings);
      await reloadCatalog();
    } catch (e) {
      if ((e as { code?: string })?.code !== 'workspace_transition_cancelled') setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const openCreate = () => {
    const activeYear = catalog?.activeCommercialYear || new Date().getFullYear();
    setCandidateYear(activeYear + 1);
    setError('');
    setCreateOpen(true);
  };

  const createWorkspace = async () => {
    if (!Number.isSafeInteger(candidateYear) || candidateYear <= 0) {
      setError('Ingresa un año comercial válido.');
      return;
    }
    const duplicate = catalog?.workspaces.find(item => item.workspace.commercialYear === candidateYear);
    if (duplicate) {
      setError(`El año comercial ${candidateYear} ya existe. Puedes abrir ese workspace desde el selector.`);
      return;
    }

    setBusy(true);
    setError('');
    try {
      await api.createAnnualWorkspace(candidateYear);
      await reloadCatalog();
      setCreateOpen(false);
    } catch (e) {
      if (e instanceof ApiRequestError && e.code === 'tax_year_support_warning_confirmation_required') {
        const accepted = window.confirm(`${e.message}\n\n¿Crear y abrir el año de todas formas?`);
        if (accepted) {
          try {
            await api.createAnnualWorkspace(candidateYear, true);
            await reloadCatalog();
            setCreateOpen(false);
            return;
          } catch (retryError) {
            setError(errorMessage(retryError));
          }
        }
      } else if ((e as { code?: string })?.code !== 'workspace_transition_cancelled') {
        setError(errorMessage(e));
      }
    } finally {
      setBusy(false);
    }
  };

  if (!catalog || !activeOption) {
    return <div className="annual-workspace-loading">{error || 'Cargando contexto anual…'}</div>;
  }

  return <div className="annual-workspace-gate">
    <section className="annual-workspace-header" aria-label="Contexto anual activo">
      <div className="annual-workspace-field">
        <small>Año comercial</small>
        <select
          value={catalog.activeCommercialYear}
          disabled={busy}
          onChange={event => {
            const option = catalog.workspaces.find(item => item.workspace.commercialYear === Number(event.target.value));
            if (option) selectWorkspace(option);
          }}
        >
          {catalog.workspaces.map(({ workspace, support }) => <option key={workspace.id} value={workspace.commercialYear}>
            {workspace.commercialYear}{support.state === 'UNSUPPORTED' ? ' · sin reglas compatibles' : support.state === 'SUPPORTED_WITH_WARNINGS' ? ' · revisar reglas' : ''}
          </option>)}
        </select>
      </div>
      <div className="annual-workspace-derived">
        <small>Operación Renta</small>
        <strong>{activeOption.workspace.derivedTaxYearLabel}</strong>
      </div>
      <div className="annual-workspace-derived">
        <small>Estado</small>
        <strong>En preparación</strong>
      </div>
      <button className="annual-workspace-create" disabled={busy} onClick={openCreate}>+ Crear año</button>
      {busy && <span className="annual-workspace-progress">Cambiando contexto…</span>}
    </section>

    {error && <div className="annual-workspace-error">{error}<button onClick={() => setError('')}>×</button></div>}

    {createOpen && <div className="annual-workspace-modal-backdrop" role="presentation">
      <section className="annual-workspace-modal" role="dialog" aria-modal="true" aria-labelledby="create-annual-workspace-title">
        <h2 id="create-annual-workspace-title">Crear año tributario</h2>
        <label>
          <span>Año comercial</span>
          <input type="number" value={candidateYear} onChange={e => setCandidateYear(Number(e.target.value))} />
        </label>
        <div className="annual-workspace-preview">
          <span>Operación Renta</span>
          <strong>{Number.isSafeInteger(candidateYear) && candidateYear > 0 ? derivedTaxYearLabel(candidateYear) : '—'}</strong>
          <small>Derivado automáticamente; no es editable.</small>
        </div>
        <fieldset>
          <legend>¿Cómo quieres comenzar?</legend>
          <label><input type="radio" checked readOnly /> Empezar vacío</label>
          <label className="disabled"><input type="radio" disabled /> Inicializar desde un año anterior <small>Disponible en el flujo AW-003.</small></label>
        </fieldset>
        <p className="annual-workspace-copy-note">Empezar vacío crea únicamente el contexto anual. No copia ingresos, boletas, hipotecas, APV, evidencia ni conciliaciones.</p>
        <div className="annual-workspace-modal-actions">
          <button disabled={busy} onClick={() => setCreateOpen(false)}>Cancelar</button>
          <button className="primary" disabled={busy} onClick={createWorkspace}>{busy ? 'Creando…' : 'Crear y abrir'}</button>
        </div>
      </section>
    </div>}

    <ApplicabilityProfileSection commercialYear={catalog.activeCommercialYear} />
    <WorkspaceView key={catalog.activeCommercialYear} />
  </div>;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}
