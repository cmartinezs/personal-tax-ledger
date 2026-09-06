import { useEffect, useState } from 'react';
import { desktopBridge, type DesktopBootstrapConfig, type LocalTaxProfile, type WorkspaceMode } from '../../desktop-config';

const AFP_OPTIONS = ['', 'CAPITAL', 'CUPRUM', 'HABITAT', 'MODELO', 'PLANVITAL', 'PROVIDA', 'UNO'];

export default function LocalProfileSettings() {
  const bridge = desktopBridge();
  const [config, setConfig] = useState<DesktopBootstrapConfig | null>(null);
  const [profile, setProfile] = useState<LocalTaxProfile | null>(null);
  const [workspaceName, setWorkspaceName] = useState('Principal');
  const [workspacePath, setWorkspacePath] = useState('');
  const [workspaceHasDb, setWorkspaceHasDb] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('OPEN_EXISTING');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bridge) return;
    bridge.getBootstrapConfig().then(value => {
      setConfig(value);
      setProfile({ ...value.profile });
      setWorkspaceName(value.activeWorkspace.name);
      setWorkspacePath(value.activeWorkspace.path);
      setWorkspaceHasDb(value.activeWorkspaceStatus.hasDatabase);
    }).catch(e => setError(String(e)));
  }, [bridge]);

  if (!bridge) return <section className="card"><h2>Perfil local y workspace</h2><p>Esta configuración está disponible en la aplicación de escritorio.</p></section>;
  if (!config || !profile) return <section className="card"><h2>Perfil local y workspace</h2><p>Cargando configuración local…</p></section>;

  const chooseWorkspace = async () => {
    const selected = await bridge.chooseWorkspace();
    if (!selected) return;
    setWorkspacePath(selected.path);
    setWorkspaceHasDb(selected.hasDatabase);
    setWorkspaceMode(selected.hasDatabase ? 'OPEN_EXISTING' : 'ADOPT_CURRENT');
    setMessage('');
  };

  const save = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await bridge.updateBootstrapConfig({
        profile,
        workspace: { name: workspaceName.trim() || 'Principal', path: workspacePath },
        workspaceMode
      });
      setConfig(result);
      if (result.restartRequired) {
        setMessage('Configuración guardada. El cambio de workspace requiere reiniciar PTL.');
      } else {
        setMessage('Perfil local guardado.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const workspaceChanged = workspacePath !== config.activeWorkspace.path;

  return <section className="card settings-profile-card">
    <h2>Perfil local y workspace</h2>
    <p className="card-hint">Define bajo qué contexto personal opera esta instalación y dónde se guardan los datos de PTL.</p>

    <h3>Perfil personal tributario</h3>
    <div className="form-grid">
      <label><span>Nombre o alias</span><input value={profile.displayName} onChange={e => setProfile({ ...profile, displayName: e.target.value })}/></label>
      <label><span>RUT</span><input value={profile.taxId} onChange={e => setProfile({ ...profile, taxId: e.target.value })}/></label>
      <label><span>Residencia tributaria</span><select value={profile.taxResidenceCountry} onChange={e => setProfile({ ...profile, taxResidenceCountry: e.target.value })}><option value="CL">Chile</option><option value="OTHER">Otra / revisar manualmente</option></select></label>
      <label><span>Tipo de actividad</span><select value={profile.taxpayerMode} onChange={e => setProfile({ ...profile, taxpayerMode: e.target.value as LocalTaxProfile['taxpayerMode'] })}><option value="DEPENDENT">Dependiente</option><option value="INDEPENDENT">Independiente</option><option value="MIXED">Mixta</option></select></label>
      <label><span>Año comercial preferido</span><input type="number" min="2024" value={profile.preferredTaxYear} onChange={e => setProfile({ ...profile, preferredTaxYear: Number(e.target.value) })}/></label>
      <label><span>AFP por defecto</span><select value={profile.defaultAfpName} onChange={e => setProfile({ ...profile, defaultAfpName: e.target.value })}>{AFP_OPTIONS.map(value => <option key={value} value={value}>{value || 'Sin preferencia'}</option>)}</select></label>
      <label><span>Salud por defecto</span><select value={profile.defaultHealthSystem} onChange={e => setProfile({ ...profile, defaultHealthSystem: e.target.value as LocalTaxProfile['defaultHealthSystem'] })}><option value="">Sin preferencia</option><option value="FONASA">Fonasa</option><option value="ISAPRE">Isapre</option><option value="NONE">Sin descuento</option></select></label>
      <label><span>APV preferido</span><select value={profile.defaultApvRegime} onChange={e => setProfile({ ...profile, defaultApvRegime: e.target.value as LocalTaxProfile['defaultApvRegime'] })}><option value="NONE">Sin preferencia</option><option value="A">Régimen A</option><option value="B">Régimen B</option></select></label>
      <label className="wide"><span>Notas tributarias personales</span><textarea value={profile.notes} onChange={e => setProfile({ ...profile, notes: e.target.value })}/></label>
    </div>

    <h3>Workspace activo</h3>
    <div className="form-grid">
      <label><span>Nombre</span><input value={workspaceName} onChange={e => setWorkspaceName(e.target.value)}/></label>
      <label className="wide"><span>Carpeta</span><div className="path-picker"><input value={workspacePath} readOnly/><button onClick={chooseWorkspace}>Elegir carpeta…</button></div></label>
      <div className="workspace-status wide">Base local actual: {config.activeWorkspaceStatus.databasePath}</div>
      {workspaceChanged && <label className="wide"><span>Acción al cambiar</span><select value={workspaceMode} onChange={e => setWorkspaceMode(e.target.value as WorkspaceMode)}>
        {workspaceHasDb && <option value="OPEN_EXISTING">Abrir workspace existente</option>}
        {!workspaceHasDb && <option value="ADOPT_CURRENT">Copiar mis datos actuales al nuevo workspace</option>}
        {!workspaceHasDb && <option value="CREATE_NEW">Crear workspace vacío</option>}
      </select><small>El cambio se aplicará de forma segura en el próximo arranque, antes de abrir la base SQLite.</small></label>}
    </div>

    {message && <div className="alert success">{message}</div>}
    {error && <div className="alert error">{error}</div>}
    <div className="actions">
      <button className="primary" disabled={busy || !workspacePath} onClick={save}>{busy ? 'Guardando…' : 'Guardar configuración local'}</button>
      {message.includes('reiniciar') && <button onClick={() => bridge.restart()}>Reiniciar PTL ahora</button>}
    </div>
  </section>;
}
