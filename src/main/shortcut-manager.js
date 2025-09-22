const { globalShortcut, systemPreferences } = require('electron');

class ShortcutManager {
  constructor(windowManager) {
    this.windowManager = windowManager;
    this.shortcuts = new Map();
  }

  registerShortcuts() {
    // Development shortcuts
    this.registerShortcut('CommandOrControl+Alt+I', () => {
      const window = this.windowManager.getWindow();
      if (window) {
        if (window.webContents.isDevToolsOpened()) {
          window.webContents.closeDevTools();
        } else {
          window.webContents.openDevTools({ mode: 'detach' });
        }
      }
    }, 'Toggle Developer Tools');

    // Refresh camera / reload
    this.registerShortcut('CommandOrControl+Alt+R', () => {
      const window = this.windowManager.getWindow();
      if (window) {
        window.webContents.reloadIgnoringCache();
      }
    }, 'Reload Camera');

    // Toggle window visibility
    this.registerShortcut('CommandOrControl+Alt+H', () => {
      this.windowManager.toggleWindow();
    }, 'Toggle Window Visibility');

    // Toggle always on top
    this.registerShortcut('CommandOrControl+Alt+T', () => {
      const window = this.windowManager.getWindow();
      if (window) {
        const isAlwaysOnTop = window.isAlwaysOnTop();
        window.setAlwaysOnTop(!isAlwaysOnTop, 'screen-saver');
      }
    }, 'Toggle Always On Top');

    // Quick size presets
    this.registerShortcut('CommandOrControl+Alt+1', () => {
      this.setWindowPreset(300, 300); // 1:1
    }, 'Set 1:1 Aspect Ratio');

    this.registerShortcut('CommandOrControl+Alt+2', () => {
      this.setWindowPreset(400, 300); // 4:3
    }, 'Set 4:3 Aspect Ratio');

    this.registerShortcut('CommandOrControl+Alt+3', () => {
      this.setWindowPreset(400, 225); // 16:9
    }, 'Set 16:9 Aspect Ratio');
  }

  registerShortcut(accelerator, callback, description = '') {
    try {
      const success = globalShortcut.register(accelerator, callback);
      if (success) {
        this.shortcuts.set(accelerator, { callback, description });
        console.log(`Registered shortcut: ${accelerator} - ${description}`);
      } else {
        console.warn(`Failed to register shortcut: ${accelerator}`);
      }
    } catch (error) {
      console.error(`Error registering shortcut ${accelerator}:`, error);
    }
  }

  unregisterShortcut(accelerator) {
    globalShortcut.unregister(accelerator);
    this.shortcuts.delete(accelerator);
  }

  unregisterAll() {
    globalShortcut.unregisterAll();
    this.shortcuts.clear();
  }

  getShortcuts() {
    return Array.from(this.shortcuts.entries()).map(([accelerator, { description }]) => ({
      accelerator,
      description
    }));
  }

  setWindowPreset(width, height) {
    const window = this.windowManager.getWindow();
    if (window) {
      window.setSize(width, height, true);
    }
  }

  async checkPermissions() {
    if (process.platform === 'darwin') {
      // Check accessibility permissions on macOS
      const hasAccessibility = systemPreferences.isTrustedAccessibilityClient(false);
      if (!hasAccessibility) {
        console.warn('Accessibility permissions required for global shortcuts on macOS');
      }
      return hasAccessibility;
    }
    return true;
  }
}

module.exports = ShortcutManager;