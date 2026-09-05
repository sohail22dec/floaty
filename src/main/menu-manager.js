const { app, Menu, shell } = require('electron');

class MenuManager {
  constructor(windowManager) {
    this.windowManager = windowManager;
  }

  createMenu() {
    if (process.platform === 'darwin') {
      this.createMacMenu();
    } else {
      // Keep minimal menu for Windows/Linux or remove entirely
      Menu.setApplicationMenu(null);
    }
  }

  createMacMenu() {
    const template = [
      {
        label: 'Floating Cam',
        submenu: [
          {
            label: 'About Floating Cam',
            click: () => {
              const window = this.windowManager.getWindow();
              if (window) {
                window.webContents.send('show-about');
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Preferences...',
            accelerator: 'Cmd+,',
            click: () => {
              const window = this.windowManager.getWindow();
              if (window) {
                window.webContents.send('show-preferences');
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Hide Floating Cam',
            accelerator: 'Cmd+H',
            click: () => {
              this.windowManager.hideWindow();
            }
          },
          {
            label: 'Hide Others',
            accelerator: 'Cmd+Alt+H',
            role: 'hideothers'
          },
          {
            label: 'Show All',
            role: 'unhide'
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: 'Cmd+Q',
            click: () => {
              this.windowManager.setQuitting(true);
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Window',
        submenu: [
          {
            label: 'Show/Hide Window',
            accelerator: 'Cmd+Alt+H',
            click: () => {
              this.windowManager.toggleWindow();
            }
          },
          {
            label: 'Toggle Always On Top',
            accelerator: 'Cmd+Alt+P',
            click: () => {
              const window = this.windowManager.getWindow();
              if (window) {
                const nextState = !window.isAlwaysOnTop();
                this.windowManager.setAlwaysOnTop(nextState);
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Minimize',
            accelerator: 'Cmd+M',
            click: () => {
              const window = this.windowManager.getWindow();
              if (window) {
                window.minimize();
              }
            }
          },
          {
            label: 'Close',
            accelerator: 'Cmd+W',
            click: () => {
              this.windowManager.hideWindow();
            }
          }
        ]
      },
      {
        label: 'Camera',
        submenu: [
          {
            label: 'Reload Camera',
            accelerator: 'Cmd+R',
            click: () => {
              const window = this.windowManager.getWindow();
              if (window) {
                window.webContents.send('reload-camera');
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Flip Horizontal',
            accelerator: 'Cmd+F',
            click: () => {
              const window = this.windowManager.getWindow();
              if (window) {
                window.webContents.send('toggle-flip');
              }
            }
          },
          {
            label: 'Toggle Circle Mode',
            accelerator: 'Cmd+C',
            click: () => {
              const window = this.windowManager.getWindow();
              if (window) {
                window.webContents.send('toggle-circle');
              }
            }
          }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Keyboard Shortcuts',
            click: () => {
              const window = this.windowManager.getWindow();
              if (window) {
                window.webContents.send('show-shortcuts');
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Report Issue',
            click: () => {
              shell.openExternal('https://github.com/akhshyganesh/floating-cam/issues');
            }
          },
          {
            label: 'GitHub Repository',
            click: () => {
              shell.openExternal('https://github.com/akhshyganesh/floating-cam');
            }
          }
        ]
      }
    ];

    // Add development menu in development
    if (process.env.NODE_ENV === 'development') {
      template.push({
        label: 'Development',
        submenu: [
          {
            label: 'Reload',
            accelerator: 'Cmd+Alt+R',
            click: () => {
              const window = this.windowManager.getWindow();
              if (window) {
                window.webContents.reloadIgnoringCache();
              }
            }
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: 'Cmd+Alt+I',
            click: () => {
              const window = this.windowManager.getWindow();
              if (window) {
                window.webContents.toggleDevTools();
              }
            }
          }
        ]
      });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  createContextMenu() {
    return Menu.buildFromTemplate([
      {
        label: 'Show Controls',
        click: () => {
          const window = this.windowManager.getWindow();
          if (window) {
            window.webContents.send('show-controls');
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Reload Camera',
        click: () => {
          const window = this.windowManager.getWindow();
          if (window) {
            window.webContents.send('reload-camera');
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Hide Window',
        click: () => {
          this.windowManager.hideWindow();
        }
      },
      {
        label: 'Quit',
        click: () => {
          this.windowManager.setQuitting(true);
          app.quit();
        }
      }
    ]);
  }
}

module.exports = MenuManager;