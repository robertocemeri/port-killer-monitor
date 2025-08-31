const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  listProcesses: () => ipcRenderer.invoke('list-processes'),
  killProcess: (pid) => ipcRenderer.invoke('kill-process', pid),
  killAll: () => ipcRenderer.invoke('kill-all'),
  manualRefresh: () => ipcRenderer.invoke('manual-refresh'),
  onProcessUpdate: (callback) => ipcRenderer.on('process-update', (_, processes) => callback(processes))
});
