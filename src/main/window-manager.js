const { BrowserWindow, app } = require('electron');
const path = require('path');

class WindowManager {
  constructor() {
    this.window = null;
    this.isQuitting = false;
  }

  createWindow() {
    this.window = new BrowserWindow({
      width: 320,
      height: 240,
      minWidth: 160,
      minHeight: 160,
      maxWidth: 600,
      maxHeight: 600,
      maximizable: false,
      fullscreenable: false,
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
    this.setAlwaysOnTop(true);
    
    // Hide dock icon on macOS for cleaner experience
    if (process.platform === 'darwin') {
      app.dock.hide();
    }

    // Forward renderer console logs
    this.window.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`[Renderer] ${message}`);
    });

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

  setAlwaysOnTop(flag) {
    if (!this.window) return;
    const shouldBeOnTop = Boolean(flag);
    if (process.platform === 'darwin') {
      this.window.setAlwaysOnTop(shouldBeOnTop, 'screen-saver');
      this.window.setVisibleOnAllWorkspaces(shouldBeOnTop, { visibleOnFullScreen: true });
    } else {
      // On Linux/Windows, 'floating' or normal always-on-top
      this.window.setAlwaysOnTop(shouldBeOnTop, 'floating');
      this.window.setVisibleOnAllWorkspaces(shouldBeOnTop);
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