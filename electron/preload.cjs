
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('system', {
  // Solicita que a janela principal seja mostrada
  showApp: () => ipcRenderer.send('show-app'),
  
  // Atualiza a configuração de inicialização automática
  setAutoStart: (enabled) => ipcRenderer.send('set-auto-start', enabled),
  
  // Informações de versão/ambiente
  platform: process.platform,
  version: process.env.npm_package_version
});
