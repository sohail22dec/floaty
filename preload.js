const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('floatingCam', {
  ping: () => ipcRenderer.invoke('ping'),
  setWindowSize: (width, height) => ipcRenderer.invoke('set-window-size', { width, height }),
  getWindowSize: () => ipcRenderer.invoke('get-window-size'),
  getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
  setWindowPosition: (x, y) => ipcRenderer.invoke('set-window-position', { x, y }),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  setAlwaysOnTop: (flag) => ipcRenderer.invoke('set-always-on-top', flag),
  isAlwaysOnTop: () => ipcRenderer.invoke('is-always-on-top'),
  updateShape: (isCircle, radius) => ipcRenderer.invoke('update-shape', { isCircle, radius }),
  openPreferences: () => ipcRenderer.invoke('open-preferences'),
  syncSetting: (key, value) => ipcRenderer.invoke('sync-setting', { key, value }),
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  onSettingSynced: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('setting-synced', handler);
    return () => ipcRenderer.removeListener('setting-synced', handler);
  },
});

