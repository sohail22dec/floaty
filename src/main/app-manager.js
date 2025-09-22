const { app, BrowserWindow } = require('electron');
const WindowManager = require('./window-manager');
const IPCHandlers = require('./ipc-handlers');
const ShortcutManager = require('./shortcut-manager');
const MenuManager = require('./menu-manager');

class AppManager {
  constructor() {
    this.windowManager = new WindowManager();
    this.ipcHandlers = new IPCHandlers(this.windowManager);
    this.shortcutManager = new ShortcutManager(this.windowManager);
    this.menuManager = new MenuManager(this.windowManager);
    this.isReady = false;
  }

  async initialize() {
    // Handle app events
    app.whenReady().then(() => {
      this.onReady();
    });

    app.on('window-all-closed', () => {
      this.onWindowAllClosed();
    });

    app.on('activate', () => {
      this.onActivate();
    });

    app.on('before-quit', () => {
      this.onBeforeQuit();
    });

    app.on('will-quit', () => {
      this.onWillQuit();
    });

    // Security: Prevent new window creation
    app.on('web-contents-created', (event, contents) => {
      contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        console.log('Prevented new window creation:', navigationUrl);
      });
    });

    // Handle certificate errors
    app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
      // In development, ignore certificate errors for localhost
      if (process.env.NODE_ENV === 'development' && url.startsWith('https://localhost')) {
        event.preventDefault();
        callback(true);
      } else {
        callback(false);
      }
    });
  }

  async onReady() {
    this.isReady = true;
    
    // Create the main window
    this.windowManager.createWindow();
    
    // Setup menu
    this.menuManager.createMenu();
    
    // Register global shortcuts
    await this.shortcutManager.checkPermissions();
    this.shortcutManager.registerShortcuts();
    
    console.log('Floating Cam is ready!');
  }

  onWindowAllClosed() {
    // On macOS, keep the app running even when all windows are closed
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  onActivate() {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      this.windowManager.createWindow();
    } else {
      this.windowManager.showWindow();
    }
  }

  onBeforeQuit() {
    this.windowManager.setQuitting(true);
  }

  onWillQuit() {
    // Clean up global shortcuts
    this.shortcutManager.unregisterAll();
  }

  getWindowManager() {
    return this.windowManager;
  }

  getShortcutManager() {
    return this.shortcutManager;
  }

  getMenuManager() {
    return this.menuManager;
  }
}

module.exports = AppManager;
