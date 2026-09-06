const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ptlDesktop', {
  getBootstrapConfig: () => ipcRenderer.invoke('ptl:bootstrap:get'),
  updateBootstrapConfig: payload => ipcRenderer.invoke('ptl:bootstrap:update', payload),
  chooseWorkspace: () => ipcRenderer.invoke('ptl:bootstrap:choose-workspace'),
  inspectWorkspace: path => ipcRenderer.invoke('ptl:bootstrap:inspect-workspace', path),
  restart: () => ipcRenderer.invoke('ptl:bootstrap:restart')
});
