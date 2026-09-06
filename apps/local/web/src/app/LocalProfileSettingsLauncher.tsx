import { useState } from 'react';
import LocalProfileSettings from '../features/settings/LocalProfileSettings';
import { desktopBridge } from '../desktop-config';

export default function LocalProfileSettingsLauncher() {
  const [open, setOpen] = useState(false);
  if (!desktopBridge()) return null;

  return <>
    <button className="local-settings-launcher" onClick={() => setOpen(true)} title="Perfil local y workspace">⚙ Cuenta y workspace</button>
    {open && <div className="local-settings-modal" role="dialog" aria-modal="true" aria-label="Cuenta y workspace">
      <div className="local-settings-dialog">
        <div className="local-settings-dialog-head"><div><strong>Configuración local</strong><small>Cuenta personal, contexto tributario y workspace</small></div><button onClick={() => setOpen(false)} aria-label="Cerrar">×</button></div>
        <div className="local-settings-dialog-body"><LocalProfileSettings /></div>
      </div>
    </div>}
  </>;
}
