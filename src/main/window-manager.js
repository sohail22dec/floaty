const { BrowserWindow, app } = require('electron');
const path = require('path');

function getWindowShapeRects(width, height, isCircle, radiusVal = 16) {
  let radius = 16;
  if (isCircle) {
    radius = Math.floor(Math.min(width, height) / 2);
  } else {
    if (radiusVal > 0 && radiusVal <= 50) {
      radius = Math.round((radiusVal / 100) * Math.min(width, height));
    } else {
      radius = Number(radiusVal) || 16;
    }
  }

  radius = Math.min(radius, Math.floor(width / 2), Math.floor(height / 2));
  if (radius <= 0) return [];

  const rects = [];
  for (let y = 0; y < height; y++) {
    let dx = 0;
    if (y < radius) {
      const dy = radius - y;
      dx = Math.round(radius - Math.sqrt(radius * radius - dy * dy));
    } else if (y >= height - radius) {
      const dy = y - (height - radius - 1);
      dx = Math.round(radius - Math.sqrt(radius * radius - dy * dy));
    }

    const w = width - 2 * dx;
    if (w > 0) {
      rects.push({ x: dx, y: y, width: w, height: 1 });
    }
  }
  return rects;
}

class WindowManager {
  constructor() {
    this.window = null;
    this.isQuitting = false;
    this.isCircle = false;
    this.radius = 16;
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
      backgroundColor: '#00000000',
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
    this.window.setBackgroundColor('#00000000');

    // Window event handlers
    this.window.on('closed', () => {
      this.window = null;
    });

    // Prevent window from being destroyed when closed on macOS
    this.window.on('close', event => {
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

    // Apply window shape mask to eliminate black corner artifacts
    this.window.once('ready-to-show', () => {
      this.applyWindowShape();
    });

    this.window.on('resize', () => {
      this.applyWindowShape();
    });

    return this.window;
  }

  applyWindowShape() {
    if (!this.window || typeof this.window.setShape !== 'function') return;
    try {
      const [width, height] = this.window.getSize();
      const rects = getWindowShapeRects(width, height, this.isCircle, this.radius);
      this.window.setShape(rects);
    } catch (err) {
      console.warn('Could not apply window shape:', err);
    }
  }

  setShape(isCircle, radius) {
    if (typeof isCircle === 'boolean') {
      this.isCircle = isCircle;
    }
    if (radius !== undefined && radius !== null) {
      this.radius = radius;
    }
    this.applyWindowShape();
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
