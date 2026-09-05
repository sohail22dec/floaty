class SettingsManager {
  constructor() {
    this.settings = this.getDefaultSettings();
    this.storageKey = 'floating-cam-settings';
    this.listeners = new Map();

    this.loadSettings();
  }

  getDefaultSettings() {
    return {
      // Window settings
      window: {
        width: 320,
        height: 240,
        rectWidth: 320,
        rectHeight: 240,
        alwaysOnTop: true,
        opacity: 1.0,
        borderRadius: 16
      },

      // Camera settings
      camera: {
        deviceId: null,
        isFlipped: true,
        isCircle: false,
        autoStart: true
      },

      // UI settings
      ui: {
        theme: 'dark',
        showToolbar: true,
        animationsEnabled: true,
        compactMode: false
      },

      // Keyboard shortcuts
      shortcuts: {
        toggleControls: 'Space',
        toggleFlip: 'F',
        toggleCircle: 'C',
        cycleOpacity: 'O',
        toggleSize: 'S'
      },

      // Privacy settings
      privacy: {
        saveSnapshots: false,
        snapshotLocation: null
      },

      // Advanced settings
      advanced: {
        hardwareAcceleration: true,
        debugMode: false,
        updateChannel: 'stable'
      }
    };
  }

  loadSettings() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        this.settings = this.mergeSettings(this.getDefaultSettings(), parsedSettings);
        // Sanitize window dimensions to prevent oversized window on Linux
        if (this.settings.window) {
          if (!this.settings.window.width || this.settings.window.width > 500) {
            this.settings.window.width = 320;
          }
          if (!this.settings.window.height || this.settings.window.height > 500) {
            this.settings.window.height = 240;
          }
          if (!this.settings.window.rectWidth || this.settings.window.rectWidth > 500) {
            this.settings.window.rectWidth = this.settings.window.width;
          }
          if (!this.settings.window.rectHeight || this.settings.window.rectHeight > 500) {
            this.settings.window.rectHeight = this.settings.window.height;
          }
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = this.getDefaultSettings();
    }

    this.emit('settings-loaded', this.settings);
  }

  saveSettings() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
      this.emit('settings-saved', this.settings);
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.emit('settings-error', error);
      return false;
    }
  }

  // Deep merge settings to preserve structure
  mergeSettings(defaultSettings, userSettings) {
    const merged = { ...defaultSettings };

    for (const [key, value] of Object.entries(userSettings)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged[key] = { ...defaultSettings[key], ...value };
      } else {
        merged[key] = value;
      }
    }

    return merged;
  }

  // Get setting value
  get(path) {
    const keys = path.split('.');
    let current = this.settings;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return current;
  }

  // Set setting value
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = this.settings;

    // Navigate to the parent object
    for (const key of keys) {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    // Set the value
    const oldValue = current[lastKey];
    current[lastKey] = value;

    // Save and emit change
    this.saveSettings();
    this.emit('setting-changed', { path, value, oldValue });

    return true;
  }

  // Update multiple settings at once
  update(updates) {
    let changed = false;

    for (const [path, value] of Object.entries(updates)) {
      const oldValue = this.get(path);
      if (oldValue !== value) {
        this.set(path, value);
        changed = true;
      }
    }

    if (changed) {
      this.saveSettings();
      this.emit('settings-updated', updates);
    }

    return changed;
  }

  // Reset to defaults
  reset(section = null) {
    if (section) {
      this.settings[section] = this.getDefaultSettings()[section];
    } else {
      this.settings = this.getDefaultSettings();
    }

    this.saveSettings();
    this.emit('settings-reset', { section });
  }

  // Export settings
  export() {
    return JSON.stringify(this.settings, null, 2);
  }

  // Import settings
  import(settingsJson) {
    try {
      const importedSettings = JSON.parse(settingsJson);
      this.settings = this.mergeSettings(this.getDefaultSettings(), importedSettings);
      this.saveSettings();
      this.emit('settings-imported', this.settings);
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      this.emit('settings-error', error);
      return false;
    }
  }

  // Apply settings to the application
  async applySettings() {
    try {
      // Apply window settings
      const windowSettings = this.get('window');
      if (windowSettings) {
        await this.applyWindowSettings(windowSettings);
      }

      // Apply camera settings
      const cameraSettings = this.get('camera');
      if (cameraSettings) {
        this.applyCameraSettings(cameraSettings);
      }

      // Apply UI settings
      const uiSettings = this.get('ui');
      if (uiSettings) {
        this.applyUISettings(uiSettings);
      }

      this.emit('settings-applied', this.settings);
      return true;
    } catch (error) {
      console.error('Failed to apply settings:', error);
      this.emit('settings-error', error);
      return false;
    }
  }

  async applyWindowSettings(settings) {
    if (window.floatingCam) {
      // Apply window size
      if (settings.width && settings.height) {
        const w = Math.min(Math.max(settings.width, 160), 500);
        const h = Math.min(Math.max(settings.height, 160), 500);
        await window.floatingCam.setWindowSize(w, h);
      }

      // Apply always on top
      if (typeof settings.alwaysOnTop === 'boolean') {
        if (window.floatingCam.setAlwaysOnTop) {
          await window.floatingCam.setAlwaysOnTop(settings.alwaysOnTop);
        }
      }
    }

    // Apply opacity
    if (settings.opacity && window.uiController) {
      const video = document.getElementById('video');
      if (video) {
        video.style.opacity = settings.opacity;
      }
    }

    // Apply border radius
    if (settings.borderRadius && window.uiController) {
      window.uiController.updateBorderRadius(settings.borderRadius);
    }
  }

  applyCameraSettings(settings) {
    if (window.cameraManager) {
      // Apply flip state
      if (typeof settings.isFlipped === 'boolean') {
        const currentFlip = window.cameraManager.getFlipState();
        if (currentFlip !== settings.isFlipped) {
          window.cameraManager.toggleFlip();
        }
      }

      // Apply device selection
      if (settings.deviceId) {
        window.cameraManager.switchCamera(settings.deviceId);
      }
    }

    // Apply circle mode
    if (typeof settings.isCircle === 'boolean' && window.uiController) {
      const isCurrentlyCircle = document.body.classList.contains('circle');
      if (isCurrentlyCircle !== settings.isCircle) {
        if (window.uiController.setCircle) {
          window.uiController.setCircle(settings.isCircle, false);
        } else {
          window.uiController.toggleCircle();
        }
      }
    }
  }

  applyUISettings(settings) {
    // Apply theme
    if (settings.theme) {
      document.body.setAttribute('data-theme', settings.theme);
    }

    // Apply toolbar visibility
    if (typeof settings.showToolbar === 'boolean') {
      const toolbar = document.querySelector('.toolbar');
      if (toolbar) {
        toolbar.style.display = settings.showToolbar ? 'flex' : 'none';
      }
    }

    // Apply animations
    if (typeof settings.animationsEnabled === 'boolean') {
      document.body.classList.toggle('no-animations', !settings.animationsEnabled);
    }

    // Apply compact mode
    if (typeof settings.compactMode === 'boolean') {
      document.body.classList.toggle('compact', settings.compactMode);
    }
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in settings event listener for ${event}:`, error);
        }
      });
    }
  }

  // Convenience methods for common settings
  getWindowSize() {
    return {
      width: this.get('window.width'),
      height: this.get('window.height')
    };
  }

  setWindowSize(width, height) {
    this.update({
      'window.width': width,
      'window.height': height
    });
  }

  getCameraDevice() {
    return this.get('camera.deviceId');
  }

  setCameraDevice(deviceId) {
    this.set('camera.deviceId', deviceId);
  }

  getTheme() {
    return this.get('ui.theme');
  }

  setTheme(theme) {
    this.set('ui.theme', theme);
    this.applyUISettings({ theme });
  }

  // Settings validation
  validateSettings(settings = this.settings) {
    const errors = [];

    // Validate window settings
    if (settings.window) {
      const { width, height, opacity, borderRadius } = settings.window;

      if (width && (width < 160 || width > 3840)) {
        errors.push('Window width must be between 160 and 3840 pixels');
      }

      if (height && (height < 160 || height > 2160)) {
        errors.push('Window height must be between 160 and 2160 pixels');
      }

      if (opacity && (opacity < 0.1 || opacity > 1)) {
        errors.push('Opacity must be between 0.1 and 1.0');
      }

      if (borderRadius && (borderRadius < 0 || borderRadius > 50)) {
        errors.push('Border radius must be between 0 and 50 percent');
      }
    }

    return errors;
  }
}

window.SettingsManager = SettingsManager;
