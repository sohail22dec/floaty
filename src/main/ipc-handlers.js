const { ipcMain } = require('electron');

class IPCHandlers {
  constructor(windowManager) {
    this.windowManager = windowManager;
    this.setupHandlers();
  }

  setupHandlers() {
    // Window management handlers
    ipcMain.handle('get-window-size', () => {
      const window = this.windowManager.getWindow();
      if (!window) return null;
      const [width, height] = window.getSize();
      return { width, height };
    });

    ipcMain.handle('set-window-size', (event, { width, height }) => {
      const window = this.windowManager.getWindow();
      if (!window) return false;
      
      const w = Math.max(160, Math.min(600, parseInt(width, 10)) || 0);
      const h = Math.max(160, Math.min(600, parseInt(height, 10)) || 0);
      
      if (w && h) {
        window.setSize(w, h, true);
        return true;
      }
      return false;
    });

    ipcMain.handle('get-window-position', () => {
      const window = this.windowManager.getWindow();
      if (!window) return null;
      const [x, y] = window.getPosition();
      return { x, y };
    });

    ipcMain.handle('set-window-position', (event, { x, y }) => {
      const window = this.windowManager.getWindow();
      if (!window) return false;
      
      window.setPosition(x, y);
      return true;
    });

    // Window state handlers
    ipcMain.handle('toggle-always-on-top', () => {
      const window = this.windowManager.getWindow();
      if (!window) return false;
      
      const nextState = !window.isAlwaysOnTop();
      this.windowManager.setAlwaysOnTop(nextState);
      return nextState;
    });

    ipcMain.handle('set-always-on-top', (event, flag) => {
      const window = this.windowManager.getWindow();
      if (!window) return false;
      
      this.windowManager.setAlwaysOnTop(Boolean(flag));
      return window.isAlwaysOnTop();
    });

    ipcMain.handle('is-always-on-top', () => {
      const window = this.windowManager.getWindow();
      if (!window) return false;
      return window.isAlwaysOnTop();
    });

    ipcMain.handle('minimize-window', () => {
      const window = this.windowManager.getWindow();
      if (window) {
        window.minimize();
      }
    });

    ipcMain.handle('hide-window', () => {
      this.windowManager.hideWindow();
    });

    ipcMain.handle('show-window', () => {
      this.windowManager.showWindow();
    });

    // App control handlers
    ipcMain.handle('quit-app', () => {
      const { app } = require('electron');
      this.windowManager.setQuitting(true);
      app.quit();
    });

    ipcMain.handle('get-app-version', () => {
      const { app } = require('electron');
      return app.getVersion();
    });

    // Settings handlers (will be expanded)
    ipcMain.handle('get-settings', () => {
      // TODO: Implement settings storage
      return {};
    });

    ipcMain.handle('save-settings', (event, settings) => {
      // TODO: Implement settings storage
      return true;
    });

    // Camera handlers
    ipcMain.handle('get-camera-devices', async () => {
      // This will be handled by the renderer's navigator.mediaDevices
      // But we can provide a fallback or additional device info here
      return [];
    });
  }
}

module.exports = IPCHandlers;