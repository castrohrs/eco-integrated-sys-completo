
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
    getSites: () => ipcRenderer.invoke('get-sites'),
    saveSites: (data) => ipcRenderer.invoke('save-sites', data),
    openExternal: (url) => ipcRenderer.send('open-external', url)
});
