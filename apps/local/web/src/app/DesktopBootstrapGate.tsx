import { useEffect, useState } from 'react';
import WorkspaceView from './WorkspaceView';
import LocalProfileSettingsLauncher from './LocalProfileSettingsLauncher';
import { desktopBridge, type DesktopBootstrapConfig, type LocalTaxProfile, type WorkspaceMode } from '../desktop-config';
import './desktop-startup.css';

const AFP_OPTIONS = ['', 'CAPITAL', 'CUPRUM', 'HABITAT', 'MODELO', 'PLANVITAL', 'PROVIDA', 'UNO'];

export default function DesktopBootstrapGate() {
  const bridge = desktopBridge();
  const [config, setConfig] = useState<DesktopBootstrapConfig | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bridge) return;
    bridge.getBootstrapConfig().then(setConfig).catch(error => setError(String(error)));
  }, [bridge]);

  if (!bridge) return <WorkspaceView />;
  if (error) return <div className="startup-screen"><div className="startup-card"><h1>Personal Tax Ledger</h1><p className="alert error">{error}</p></div></div>;
  if (!config) return <div className="startup-screen"><div className="startup-card"><h1>Personal Tax Ledger</h1><p>Preparando tu espacio personal…</p></div></div>;
  if (!config.firstRunCompleted) return <FirstRunOnboarding initial={config} onCompleted={setConfig} />;
  return <><WorkspaceView /><LocalProfileSettingsLauncher /></>;
}

function FirstRunOnboarding({ initial, onCompleted }: { initial: DesktopBootstrapConfig; onCompleted: (value: DesktopBootstrapConfig) => void }) {
  const bridge = desktopBridge()!;
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<LocalTaxProfile>({ ...initial.profile });
  const [workspaceName, setWorkspaceName] = useState(initial.activeWorkspace.name || 'Principal');
  const [workspacePath, setWorkspacePath] = useState(initial.activeWorkspace.path);
  const [workspaceHasDb, setWorkspaceHasDb] = useState(initial.activeWorkspaceStatus.hasDatabase);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('ADOPT_CURRENT');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const chooseWorkspace = async () => {
    const selected = await bridge.chooseWorkspace();
    if (!selected) return;
    setWorkspacePath(selected.path);
    setWorkspaceHasDb(selected.hasDatabase);
    setWorkspaceMode(selected.hasDatabase ? 'OPEN_EXISTING' : 'ADOPT_CURRENT');
  };

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await bridge.updateBootstrapConfig({
        profile,
        firstRunCompleted: true,
        lastSeenVersion: initial.appVersion,
        workspace: { name: workspaceName.trim() || 'Principal', path: workspacePath },
        workspaceMode
      });
      if (result.restartRequired) {
        await bridge.restart();
        return;
      }
      onCompleted(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return <div className="startup-screen"><section className="startup-card onboarding-card">
    <div className="onboarding-progress">{['Bienvenida', 'Perfil', 'Workspace', 'Revisión'].map((label, index) => <span key={label} className={index <= step ? 'active' : ''}>{index + 1}. {label}</span>)}</div>

    {step === 0 && <>
      <div className="startup-mark">PTL</div>
      <h1>Bienvenido a Personal Tax Ledger</h1>
      <p>Antes de comenzar, configura el perfil local y el workspace bajo el que operará esta instalación. Tus datos permanecen en tu equipo.</p>
      <div className="callout callout-info"><strong>Versión {initial.appVersion}</strong><br/>El workspace actual ya apunta a la ubicación usada por las versiones anteriores, por lo que tus datos existentes se conservan.</div>
    </>}

    {step === 1 && <>
      <h1>Tu perfil local</h1>
      <p>Estos datos identifican el contexto tributario de la instalación y servirán como valores por defecto.</p>
      <div className="form-grid onboarding-form">
        <label><span>Nombre o alias</span><input value={profile.displayName} onChange={e => setProfile({ ...profile, displayName: e.target.value })} placeholder="Ej. Carlos"/></label>
        <label><span>RUT</span><input value={profile.taxId} onChange={e => setProfile({ ...profile, taxId: e.target.value })} placeholder="12.345.678-9"/></label>
        <label><span>Residencia tributaria</span><select value={profile.taxResidenceCountry} onChange={e => setProfile({ ...profile, taxResidenceCountry: e.target.value })}><option value="CL">Chile</option><option value="OTHER">Otra / revisar manualmente</option></select></label>
        <label><span>Tipo de actividad</span><select value={profile.taxpayerMode} onChange={e => setProfile({ ...profile, taxpayerMode: e.target.value as LocalTaxProfile['taxpayerMode'] })}><option value="DEPENDENT">Dependiente</option><option value="INDEPENDENT">Independiente</option><option value="MIXED">Mixta</option></select></label>
        <label><span>Año comercial preferido</span><input type="number" min="2024" value={profile.preferredTaxYear} onChange={e => setProfile({ ...profile, preferredTaxYear: Number(e.target.value) })}/></label>
        <label><span>AFP por defecto</span><select value={profile.defaultAfpName} onChange={e => setProfile({ ...profile, defaultAfpName: e.target.value })}>{AFP_OPTIONS.map(value => <option key={value} value={value}>{value || 'Sin preferencia'}</option>)}</select></label>
        <label><span>Salud por defecto</span><select value={profile.defaultHealthSystem} onChange={e => setProfile({ ...profile, defaultHealthSystem: e.target.value as LocalTaxProfile['defaultHealthSystem'] })}><option value="">Sin preferencia</option><option value="FONASA">Fonasa</option><option value="ISAPRE">Isapre</option><option value="NONE">Sin descuento</option></select></label>
        <label><span>APV preferido</span><select value={profile.defaultApvRegime} onChange={e => setProfile({ ...profile, defaultApvRegime: e.target.value as LocalTaxProfile['defaultApvRegime'] })}><option value="NONE">Sin preferencia</option><option value="A">Régimen A</option><option value="B">Régimen B</option></select></label>
        <label className="wide"><span>Notas tributarias personales</span><textarea value={profile.notes} onChange={e => setProfile({ ...profile, notes: e.target.value })} placeholder="Información estable que quieras recordar al revisar tus escenarios."/></label>
      </div>
    </>}

    {step === 2 && <>
      <h1>Workspace</h1>
      <p>El workspace contiene la base local y, más adelante, respaldos y exportaciones. Puedes mantener la ubicación actual o elegir otra carpeta.</p>
      <div className="workspace-choice">
        <label><span>Nombre</span><input value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} /></label>
        <label className="wide"><span>Carpeta</span><div className="path-picker"><input value={workspacePath} readOnly/><button onClick={chooseWorkspace}>Elegir carpeta…</button></div></label>
        <div className="workspace-status">{workspaceHasDb ? 'La carpeta contiene una base PTL existente.' : 'La carpeta no contiene todavía una base PTL.'}</div>
        {workspacePath !== initial.activeWorkspace.path && <label className="wide"><span>Qué hacer al cambiar</span><select value={workspaceMode} onChange={e => setWorkspaceMode(e.target.value as WorkspaceMode)}>
          {workspaceHasDb && <option value="OPEN_EXISTING">Abrir workspace existente</option>}
          {!workspaceHasDb && <option value="ADOPT_CURRENT">Mover una copia de mis datos actuales a esta carpeta</option>}
          {!workspaceHasDb && <option value="CREATE_NEW">Crear workspace vacío</option>}
        </select><small>El cambio de workspace se aplicará mediante un reinicio controlado de la aplicación.</small></label>}
      </div>
    </>}

    {step === 3 && <>
      <h1>Revisión</h1>
      <div className="review-list">
        <div><span>Perfil</span><strong>{profile.displayName || 'Sin alias'} {profile.taxId ? `· ${profile.taxId}` : ''}</strong></div>
        <div><span>Actividad</span><strong>{profile.taxpayerMode}</strong></div>
        <div><span>Año preferido</span><strong>{profile.preferredTaxYear}</strong></div>
        <div><span>Workspace</span><strong>{workspaceName || 'Principal'}</strong><small>{workspacePath}</small></div>
      </div>
      <p>Podrás modificar estos datos más adelante desde Cuenta y workspace.</p>
    </>}

    {error && <div className="alert error">{error}</div>}
    <div className="onboarding-actions">
      <button disabled={busy || step === 0} onClick={() => setStep(value => Math.max(0, value - 1))}>Atrás</button>
      {step < 3
        ? <button className="primary" disabled={busy} onClick={() => setStep(value => Math.min(3, value + 1))}>Continuar</button>
        : <button className="primary" disabled={busy || !workspacePath} onClick={save}>{busy ? 'Guardando…' : 'Guardar y comenzar'}</button>}
    </div>
  </section></div>;
}
