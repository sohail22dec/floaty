const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('floatingCam', {
  // Window management
  getWindowSize: () => ipcRenderer.invoke('get-window-size'),
  setWindowSize: (width, height) => ipcRenderer.invoke('set-window-size', { width, height }),
  getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
  setWindowPosition: (x, y) => ipcRenderer.invoke('set-window-position', { x, y }),

  // Window state
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  setAlwaysOnTop: flag => ipcRenderer.invoke('set-always-on-top', flag),
  isAlwaysOnTop: () => ipcRenderer.invoke('is-always-on-top'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  showWindow: () => ipcRenderer.invoke('show-window'),

  // App control
  quitApp: () => ipcRenderer.invoke('quit-app'),
  getVersion: () => ipcRenderer.invoke('get-app-version'),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: settings => ipcRenderer.invoke('save-settings', settings),

  // Camera
  getCameraDevices: () => ipcRenderer.invoke('get-camera-devices')
});

// Expose a limited API for receiving messages from main process
contextBridge.exposeInMainWorld('electronAPI', {
  onMessage: callback => {
    ipcRenderer.on('message', (event, data) => callback(data));
  },

  // Remove listeners
  removeAllListeners: channel => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Expose system information
contextBridge.exposeInMainWorld('systemInfo', {
  platform: process.platform,
  arch: process.arch,
  versions: process.versions
});

// Development helpers (only in development)
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('devTools', {
    openDevTools: () => ipcRenderer.invoke('open-dev-tools'),
    reload: () => ipcRenderer.invoke('reload-window'),

    // Console methods for debugging
    log: (...args) => console.log('[DEV]', ...args),
    error: (...args) => console.error('[DEV]', ...args),
    warn: (...args) => console.warn('[DEV]', ...args)
  });
}
