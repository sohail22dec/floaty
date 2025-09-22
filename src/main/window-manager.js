const { BrowserWindow, app } = require('electron');
const path = require('path');

class WindowManager {
  constructor() {
    this.window = null;
    this.isQuitting = false;
  }

  createWindow() {
    this.window = new BrowserWindow({
      width: 360,
      height: 480,
      minWidth: 160,
      minHeight: 160,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      resizable: true,
      hasShadow: false,
      vibrancy: process.platform === 'darwin' ? 'under-window' : undefined,
      visualEffectState: process.platform === 'darwin' ? 'active' : undefined,
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      webPreferences: {
        preload: path.join(__dirname, '../preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        enableRemoteModule: false,
        webSecurity: true
      }
    });

    // Enhanced window properties for floating behavior
    this.window.setAlwaysOnTop(true, 'screen-saver');
    this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    
    // Hide dock icon on macOS for cleaner experience
    if (process.platform === 'darwin') {
      app.dock.hide();
    }

    // Load the renderer
    this.window.loadFile(path.join(__dirname, '../renderer/index.html'));

    // Window event handlers
    this.window.on('closed', () => {
      this.window = null;
    });

    // Prevent window from being destroyed when closed on macOS
    this.window.on('close', (event) => {
      if (process.platform === 'darwin' && !this.isQuitting) {
        event.preventDefault();
        this.window.hide();
      }
    });

    // Handle window blur/focus for better UX
    this.window.on('blur', () => {
      if (this.window) {
        this.window.webContents.send('window-blur');
      }
    });

    this.window.on('focus', () => {
      if (this.window) {
        this.window.webContents.send('window-focus');
      }
    });

    return this.window;
  }

  getWindow() {
    return this.window;
  }

  showWindow() {
    if (this.window) {
      this.window.show();
      this.window.focus();
    }
  }

  hideWindow() {
    if (this.window) {
      this.window.hide();
    }
  }

  toggleWindow() {
    if (this.window) {
      if (this.window.isVisible()) {
        this.hideWindow();
      } else {
        this.showWindow();
      }
    }
  }

  setQuitting(isQuitting) {
    this.isQuitting = isQuitting;
  }

  destroy() {
    if (this.window) {
      this.window.destroy();
      this.window = null;
    }
  }
}

module.exports = WindowManager;