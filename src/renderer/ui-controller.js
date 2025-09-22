class UIController {
  constructor() {
    this.elements = this.initializeElements();
    this.state = {
      controlsVisible: false,
      sizePanelVisible: false,
      isCircle: false,
      opacity: 1,
      borderRadius: 16
    };

    this.opacities = [1, 0.9, 0.75, 0.6, 0.4];
    this.opacityIndex = 0;

    this.initializeEventListeners();
    this.setupKeyboardShortcuts();
  }

  initializeElements() {
    return {
      // Main elements
      app: document.getElementById('app'),
      video: document.getElementById('video'),
      toolbar: document.querySelector('.toolbar'),
      contentArea: document.getElementById('contentArea'),

      // Controls
      toggleBtn: document.getElementById('toggleBtn'),
      controlsOverlay: document.getElementById('controlsOverlay'),
      closeOverlayBtn: document.getElementById('closeOverlayBtn'),

      // Action buttons
      flipBtn: document.getElementById('flipBtn'),
      circleBtn: document.getElementById('circleBtn'),
      opacityBtn: document.getElementById('opacityBtn'),
      settingsBtn: document.getElementById('settingsBtn'),

      // Radius control
      radiusRange: document.getElementById('radiusRange'),
      radiusValue: document.getElementById('radiusValue'),

      // Size panel
      sizePanel: document.getElementById('sizePanel'),
      widthInput: document.getElementById('widthInput'),
      heightInput: document.getElementById('heightInput'),
      applySizeBtn: document.getElementById('applySizeBtn'),

      // Resize handle
      resizeHandle: document.getElementById('resizeHandle'),

      // Quick action buttons
      snapshotBtn: document.getElementById('snapshotBtn'),
      preferencesBtn: document.getElementById('preferencesBtn'),

      // Device selection
      deviceSelect: document.getElementById('deviceSelect'),
      deviceSelection: document.getElementById('deviceSelection'),

      // Loading overlay
      loadingOverlay: null // Will be created dynamically
    };
  }

  initializeEventListeners() {
    // Toggle controls overlay
    this.elements.toggleBtn?.addEventListener('click', () => {
      this.toggleControls();
    });

    // Close overlay
    this.elements.closeOverlayBtn?.addEventListener('click', () => {
      this.hideControls();
    });

    // Close overlay when clicking backdrop
    this.elements.controlsOverlay?.addEventListener('click', e => {
      if (e.target === this.elements.controlsOverlay) {
        this.hideControls();
      }
    });

    // Camera controls
    this.elements.flipBtn?.addEventListener('click', () => {
      window.cameraManager?.toggleFlip();
    });

    this.elements.circleBtn?.addEventListener('click', () => {
      this.toggleCircle();
    });

    this.elements.opacityBtn?.addEventListener('click', () => {
      this.cycleOpacity();
    });

    // Radius control
    this.elements.radiusRange?.addEventListener('input', e => {
      this.updateBorderRadius(e.target.value);
    });

    // Size panel
    this.elements.settingsBtn?.addEventListener('click', () => {
      this.toggleSizePanel();
    });

    this.elements.applySizeBtn?.addEventListener('click', () => {
      this.applySize();
    });

    // Preset buttons
    this.elements.sizePanel?.querySelectorAll('.presets button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyPreset(btn.dataset.preset);
      });
    });

    // Quick action buttons
    this.elements.snapshotBtn?.addEventListener('click', () => {
      this.takeSnapshot();
    });

    this.elements.preferencesBtn?.addEventListener('click', () => {
      this.showPreferences();
    });

    // Device selection
    this.elements.deviceSelect?.addEventListener('change', (e) => {
      if (e.target.value && window.cameraManager) {
        window.cameraManager.switchCamera(e.target.value);
      }
    });

    // Resize handle
    this.setupResizeHandle();

    // Listen for camera events
    this.setupCameraEventListeners();

    // Listen for IPC events
    this.setupIPCEventListeners();

    // Prevent context menu
    window.addEventListener('contextmenu', e => e.preventDefault());
  }

  setupCameraEventListeners() {
    window.addEventListener('camera-loading', e => {
      this.showLoading(e.detail.isLoading);
    });

    window.addEventListener('camera-started', e => {
      this.hideError();
    });

    window.addEventListener('camera-error', e => {
      this.showError(`Camera Error: ${e.detail.error}`);
    });

    window.addEventListener('camera-flipped', e => {
      this.updateFlipButton(e.detail.isFlipped);
    });
  }

  setupIPCEventListeners() {
    // Listen for IPC events from main process
    window.addEventListener('message', event => {
      if (event.data.type === 'show-controls') {
        this.showControls();
      } else if (event.data.type === 'reload-camera') {
        window.cameraManager?.initialize();
      } else if (event.data.type === 'toggle-flip') {
        window.cameraManager?.toggleFlip();
      } else if (event.data.type === 'toggle-circle') {
        this.toggleCircle();
      }
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      // Only handle shortcuts when not in input fields
      if (e.target.tagName === 'INPUT') return;

      switch (e.key) {
        case 'Escape':
          this.hideControls();
          break;
        case ' ':
        case 'Enter':
          if (this.state.controlsVisible) {
            e.preventDefault();
            this.hideControls();
          } else {
            this.showControls();
          }
          break;
        case 'f':
        case 'F':
          window.cameraManager?.toggleFlip();
          break;
        case 'c':
        case 'C':
          this.toggleCircle();
          break;
        case 'o':
        case 'O':
          this.cycleOpacity();
          break;
        case 's':
        case 'S':
          this.toggleSizePanel();
          break;
      }
    });
  }

  // Control methods
  showControls() {
    this.state.controlsVisible = true;
    this.elements.controlsOverlay?.removeAttribute('hidden');
    this.elements.app?.classList.add('controls-open');
  }

  hideControls() {
    this.state.controlsVisible = false;
    this.elements.controlsOverlay?.setAttribute('hidden', '');
    this.elements.sizePanel?.setAttribute('hidden', '');
    this.state.sizePanelVisible = false;
    this.elements.app?.classList.remove('controls-open');
  }

  toggleControls() {
    if (this.state.controlsVisible) {
      this.hideControls();
    } else {
      this.showControls();
    }
  }

  toggleCircle() {
    this.state.isCircle = !this.state.isCircle;
    document.body.classList.toggle('circle', this.state.isCircle);

    if (!this.state.isCircle) {
      // Restore custom radius
      this.updateBorderRadius(this.state.borderRadius);
    }

    this.updateCircleButton();
  }

  cycleOpacity() {
    this.opacityIndex = (this.opacityIndex + 1) % this.opacities.length;
    this.state.opacity = this.opacities[this.opacityIndex];

    if (this.elements.video) {
      this.elements.video.style.opacity = this.state.opacity;
    }

    this.updateOpacityButton();
  }

  updateBorderRadius(value) {
    this.state.borderRadius = value;

    if (!this.state.isCircle && this.elements.video) {
      this.elements.video.style.borderRadius = `${value}%`;
    }

    if (this.elements.radiusValue) {
      this.elements.radiusValue.textContent = `${value}%`;
    }

    if (this.elements.radiusRange) {
      this.elements.radiusRange.value = value;
    }
  }

  // Size panel methods
  toggleSizePanel() {
    if (this.state.sizePanelVisible) {
      this.hideSizePanel();
    } else {
      this.showSizePanel();
    }
  }

  async showSizePanel() {
    this.state.sizePanelVisible = true;

    // Get current window size
    try {
      const size = await window.floatingCam?.getWindowSize();
      if (size) {
        if (this.elements.widthInput) this.elements.widthInput.value = size.width;
        if (this.elements.heightInput) this.elements.heightInput.value = size.height;
      }
    } catch (error) {
      console.error('Failed to get window size:', error);
    }

    this.elements.sizePanel?.removeAttribute('hidden');
  }

  hideSizePanel() {
    this.state.sizePanelVisible = false;
    this.elements.sizePanel?.setAttribute('hidden', '');
  }

  async applySize() {
    const width = parseInt(this.elements.widthInput?.value, 10);
    const height = parseInt(this.elements.heightInput?.value, 10);

    if (width && height) {
      try {
        await window.floatingCam?.setWindowSize(width, height);
      } catch (error) {
        console.error('Failed to set window size:', error);
        this.showToast('Failed to resize window');
      }
    }
  }

  async applyPreset(ratio) {
    try {
      const size = await window.floatingCam?.getWindowSize();
      if (!size) return;

      const [rw, rh] = ratio.split(':').map(Number);
      if (!rw || !rh) return;

      const newWidth = size.width;
      const newHeight = Math.round(newWidth * (rh / rw));

      await window.floatingCam?.setWindowSize(newWidth, newHeight);

      if (this.elements.heightInput) {
        this.elements.heightInput.value = newHeight;
      }
    } catch (error) {
      console.error('Failed to apply preset:', error);
      this.showToast('Failed to apply preset');
    }
  }

  // Resize handle
  setupResizeHandle() {
    if (!this.elements.resizeHandle) return;

    let resizing = false;
    let startX, startY, startW, startH;

    this.elements.resizeHandle.addEventListener('mousedown', async e => {
      e.preventDefault();

      try {
        const size = await window.floatingCam?.getWindowSize();
        if (!size) return;

        resizing = true;
        startX = e.screenX;
        startY = e.screenY;
        startW = size.width;
        startH = size.height;

        document.body.classList.add('resizing');
      } catch (error) {
        console.error('Failed to start resize:', error);
      }
    });

    window.addEventListener('mouseup', () => {
      if (resizing) {
        resizing = false;
        document.body.classList.remove('resizing');
      }
    });

    window.addEventListener('mousemove', async e => {
      if (!resizing) return;

      const dx = e.screenX - startX;
      const dy = e.screenY - startY;
      const newW = Math.max(160, startW + dx);
      const newH = Math.max(160, startH + dy);

      try {
        await window.floatingCam?.setWindowSize(newW, newH);

        if (this.elements.widthInput) this.elements.widthInput.value = newW;
        if (this.elements.heightInput) this.elements.heightInput.value = newH;
      } catch (error) {
        console.error('Failed to resize:', error);
      }
    });
  }

  // UI feedback methods
  updateFlipButton(isFlipped) {
    if (this.elements.flipBtn) {
      this.elements.flipBtn.classList.toggle('active', isFlipped);
    }
  }

  updateCircleButton() {
    if (this.elements.circleBtn) {
      this.elements.circleBtn.classList.toggle('active', this.state.isCircle);
    }
  }

  updateOpacityButton() {
    if (this.elements.opacityBtn) {
      const opacityPercent = Math.round(this.state.opacity * 100);
      this.elements.opacityBtn.title = `Opacity: ${opacityPercent}%`;
    }
  }

  // Loading and error states
  showLoading(show) {
    if (show) {
      if (!this.elements.loadingOverlay) {
        this.createLoadingOverlay();
      }
      this.elements.loadingOverlay.style.display = 'flex';
    } else {
      if (this.elements.loadingOverlay) {
        this.elements.loadingOverlay.style.display = 'none';
      }
    }
  }

  createLoadingOverlay() {
    this.elements.loadingOverlay = document.createElement('div');
    this.elements.loadingOverlay.className = 'loading-overlay';
    this.elements.loadingOverlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">Starting camera...</div>
      </div>
    `;
    this.elements.contentArea?.appendChild(this.elements.loadingOverlay);
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  hideError() {
    // Remove any error messages
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.remove());
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Initialize UI state
  initialize() {
    // Set initial values
    this.updateBorderRadius(this.state.borderRadius);
    this.updateOpacityButton();
    
    // Initialize camera manager reference
    if (window.cameraManager) {
      this.updateFlipButton(window.cameraManager.getFlipState());
    }

    // Setup device selection
    this.setupDeviceSelection();
  }

  // Snapshot functionality
  async takeSnapshot() {
    try {
      if (!window.cameraManager || !window.cameraManager.isActive()) {
        this.showToast('Camera not available for snapshot', 'error');
        return;
      }

      this.showToast('Taking snapshot...', 'info');
      
      const blob = await window.cameraManager.takeSnapshot();
      if (blob) {
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `floating-cam-snapshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Snapshot saved!', 'success');
      } else {
        this.showToast('Failed to take snapshot', 'error');
      }
    } catch (error) {
      console.error('Snapshot error:', error);
      this.showToast('Failed to take snapshot', 'error');
    }
  }

  // Preferences functionality
  showPreferences() {
    if (window.app && typeof window.app.showPreferences === 'function') {
      window.app.showPreferences();
    } else {
      this.showToast('Preferences not available', 'error');
    }
  }

  // Device selection setup
  async setupDeviceSelection() {
    try {
      if (window.cameraManager) {
        // Listen for device updates
        window.addEventListener('camera-devices-updated', (e) => {
          this.updateDeviceList(e.detail.devices);
        });

        // Try to get initial devices
        const devices = window.cameraManager.getDevices();
        if (devices && devices.length > 0) {
          this.updateDeviceList(devices);
        }
      }
    } catch (error) {
      console.error('Failed to setup device selection:', error);
    }
  }

  // Update device list
  updateDeviceList(devices) {
    if (!this.elements.deviceSelect || !this.elements.deviceSelection) return;

    // Clear existing options
    this.elements.deviceSelect.innerHTML = '<option value="">Select camera...</option>';

    if (devices && devices.length > 0) {
      devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.textContent = device.label || `Camera ${devices.indexOf(device) + 1}`;
        this.elements.deviceSelect.appendChild(option);
      });

      // Show device selection if multiple devices
      if (devices.length > 1) {
        this.elements.deviceSelection.style.display = 'block';
      }

      // Select current device
      if (window.cameraManager && window.cameraManager.currentDeviceId) {
        this.elements.deviceSelect.value = window.cameraManager.currentDeviceId;
      }
    } else {
      this.elements.deviceSelection.style.display = 'none';
    }
  }
}window.UIController = UIController;
