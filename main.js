const { app, BrowserWindow, globalShortcut, nativeTheme, Menu, ipcMain } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
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
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    }
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  win.loadFile('renderer/index.html');

  win.on('closed', () => {
    win = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Simple toggle devtools shortcut
  globalShortcut.register('CommandOrControl+Alt+I', () => {
    if (win) {
      if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools();
      else win.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Refresh camera / reload
  globalShortcut.register('CommandOrControl+Alt+R', () => {
    if (win) win.webContents.reloadIgnoringCache();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Remove default menu (keep minimal on Windows/Linux)
Menu.setApplicationMenu(null);

// IPC handlers for sizing
ipcMain.handle('get-window-size', () => {
  if (!win) return null;
  const [w, h] = win.getSize();
  return { width: w, height: h };
});

ipcMain.handle('set-window-size', (e, { width, height }) => {
  if (!win) return false;
  const w = Math.max(160, Math.min(1600, parseInt(width, 10)) || 0);
  const h = Math.max(160, Math.min(1600, parseInt(height, 10)) || 0);
  if (w && h) win.setSize(w, h, true);
  return true;
});
