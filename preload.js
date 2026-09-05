const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('floatingCam', {
  ping: () => ipcRenderer.invoke('ping'),
  setWindowSize: (width, height) => ipcRenderer.invoke('set-window-size', { width, height }),
  getWindowSize: () => ipcRenderer.invoke('get-window-size'),
  updateShape: (isCircle, radius) => ipcRenderer.invoke('update-shape', { isCircle, radius }),
});
