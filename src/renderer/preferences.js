// Floaty Preferences Controller
document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  const cameraSelect = document.getElementById('cameraSelect');
  const refreshCamerasBtn = document.getElementById('refreshCamerasBtn');
  const flipSwitch = document.getElementById('flipSwitch');

  const presetButtons = document.querySelectorAll('.preset-btn');
  const widthInput = document.getElementById('prefWidthInput');
  const heightInput = document.getElementById('prefHeightInput');
  const applyDimsBtn = document.getElementById('applyDimsBtn');

  const shapeCircleBtn = document.getElementById('shapeCircleBtn');
  const shapeRectBtn = document.getElementById('shapeRectBtn');
  const radiusCard = document.getElementById('radiusCard');
  const radiusSlider = document.getElementById('prefRadiusSlider');
  const radiusBadge = document.getElementById('radiusBadge');

  const opacitySlider = document.getElementById('prefOpacitySlider');
  const opacityBadge = document.getElementById('opacityBadge');

  const alwaysOnTopSwitch = document.getElementById('alwaysOnTopSwitch');
  const autoHideBarSwitch = document.getElementById('autoHideBarSwitch');
  const snapshotBtn = document.getElementById('prefSnapshotBtn');

  // Tab Switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = document.getElementById(`tab-${targetTab}`);
      if (pane) pane.classList.add('active');
    });
  });

  // Populate Cameras
  async function loadCameras() {
    try {
      cameraSelect.innerHTML = '<option value="">Loading cameras...</option>';
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');

      cameraSelect.innerHTML = '';
      if (videoDevices.length === 0) {
        cameraSelect.innerHTML = '<option value="">No cameras detected</option>';
        return;
      }

      const savedDeviceId = localStorage.getItem('floaty_camera_id') || '';

      videoDevices.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.textContent = device.label || `Camera ${index + 1}`;
        if (device.deviceId === savedDeviceId || (!savedDeviceId && index === 0)) {
          option.selected = true;
        }
        cameraSelect.appendChild(option);
      });
    } catch (err) {
      console.error('Failed to enumerate cameras:', err);
      cameraSelect.innerHTML = '<option value="">Permission denied or unavailable</option>';
    }
  }

  cameraSelect.addEventListener('change', e => {
    const deviceId = e.target.value;
    if (deviceId) {
      localStorage.setItem('floaty_camera_id', deviceId);
      window.floatingCam?.syncSetting('camera-device', deviceId);
    }
  });

  refreshCamerasBtn?.addEventListener('click', () => {
    loadCameras();
  });

  // Mirror / Flip
  const savedFlip = localStorage.getItem('floaty_flip');
  flipSwitch.checked = savedFlip !== null ? savedFlip === 'true' : true;

  flipSwitch.addEventListener('change', e => {
    const isFlipped = e.target.checked;
    localStorage.setItem('floaty_flip', isFlipped);
    window.floatingCam?.syncSetting('flip', isFlipped);
  });

  // Aspect Ratio & Sizes
  const presetMap = {
    '1:1': { w: 240, h: 240 },
    '4:3': { w: 320, h: 240 },
    '16:9': { w: 384, h: 216 },
    '9:16': { w: 216, h: 384 }
  };

  function saveSize(w, h) {
    localStorage.setItem('floaty_width', w);
    localStorage.setItem('floaty_height', h);
    try {
      const raw = localStorage.getItem('floating-cam-settings');
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.window = parsed.window || {};
      parsed.window.width = w;
      parsed.window.height = h;
      parsed.window.rectWidth = w;
      parsed.window.rectHeight = h;
      localStorage.setItem('floating-cam-settings', JSON.stringify(parsed));
    } catch (e) {
      console.warn('Could not persist size to floating-cam-settings', e);
    }
  }

  async function syncCurrentSizeInputs() {
    try {
      const size = await window.floatingCam?.getWindowSize();
      let w = size?.width;
      let h = size?.height;

      if (!w || !h || (w >= 480 && h >= 480)) {
        const savedW = parseInt(localStorage.getItem('floaty_width'), 10);
        const savedH = parseInt(localStorage.getItem('floaty_height'), 10);
        if (savedW && savedH && savedW < 480 && savedH < 480) {
          w = savedW;
          h = savedH;
        } else {
          w = 240;
          h = 240;
        }
      }

      widthInput.value = w;
      heightInput.value = h;
      highlightActivePreset(w, h);
    } catch (e) {
      console.warn('Could not read window size', e);
    }
  }

  function highlightActivePreset(w, h) {
    presetButtons.forEach(btn => {
      const p = presetMap[btn.dataset.preset];
      if (p && Math.abs(p.w - w) < 4 && Math.abs(p.h - h) < 4) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  presetButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const preset = presetMap[btn.dataset.preset];
      if (preset) {
        widthInput.value = preset.w;
        heightInput.value = preset.h;
        highlightActivePreset(preset.w, preset.h);
        saveSize(preset.w, preset.h);

        await window.floatingCam?.setWindowSize(preset.w, preset.h);
        window.floatingCam?.syncSetting('size', { width: preset.w, height: preset.h });
      }
    });
  });

  applyDimsBtn?.addEventListener('click', async () => {
    const w = Math.max(160, Math.min(600, parseInt(widthInput.value, 10) || 240));
    const h = Math.max(160, Math.min(600, parseInt(heightInput.value, 10) || 240));
    widthInput.value = w;
    heightInput.value = h;
    highlightActivePreset(w, h);
    saveSize(w, h);

    await window.floatingCam?.setWindowSize(w, h);
    window.floatingCam?.syncSetting('size', { width: w, height: h });
  });

  // Shape Mode (Circle vs Rect)
  let isCircleMode = localStorage.getItem('floaty_shape') === 'circle';

  function updateShapeUI(isCircle) {
    isCircleMode = isCircle;
    if (isCircle) {
      shapeCircleBtn.classList.add('active');
      shapeRectBtn.classList.remove('active');
      if (radiusCard) radiusCard.style.opacity = '0.45';
      radiusSlider.disabled = true;
    } else {
      shapeCircleBtn.classList.remove('active');
      shapeRectBtn.classList.add('active');
      if (radiusCard) radiusCard.style.opacity = '1';
      radiusSlider.disabled = false;
    }
  }

  updateShapeUI(isCircleMode);

  shapeCircleBtn?.addEventListener('click', () => {
    updateShapeUI(true);
    localStorage.setItem('floaty_shape', 'circle');
    window.floatingCam?.syncSetting('shape', { isCircle: true });
  });

  shapeRectBtn?.addEventListener('click', () => {
    updateShapeUI(false);
    localStorage.setItem('floaty_shape', 'rect');
    const radius = parseInt(radiusSlider.value, 10) || 16;
    window.floatingCam?.syncSetting('shape', { isCircle: false, radius });
  });

  function saveRadius(val) {
    localStorage.setItem('floaty_radius', val);
    try {
      const raw = localStorage.getItem('floating-cam-settings');
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.window = parsed.window || {};
      parsed.window.borderRadius = val;
      localStorage.setItem('floating-cam-settings', JSON.stringify(parsed));
    } catch (e) {
      console.warn('Could not persist radius to floating-cam-settings', e);
    }
  }

  // Radius Slider
  const savedRadius = localStorage.getItem('floaty_radius') || '16';
  radiusSlider.value = savedRadius;
  radiusBadge.textContent = `${savedRadius}%`;

  radiusSlider.addEventListener('input', e => {
    const val = Math.max(0, Math.min(50, parseInt(e.target.value, 10) || 0));
    radiusBadge.textContent = `${val}%`;
    saveRadius(val);
    if (!isCircleMode) {
      window.floatingCam?.syncSetting('radius', val);
    }
  });

  // Opacity Slider
  const savedOpacity = localStorage.getItem('floaty_opacity') || '100';
  opacitySlider.value = savedOpacity;
  opacityBadge.textContent = `${savedOpacity}%`;

  opacitySlider.addEventListener('input', e => {
    const val = parseInt(e.target.value, 10);
    opacityBadge.textContent = `${val}%`;
    localStorage.setItem('floaty_opacity', val);
    window.floatingCam?.syncSetting('opacity', val / 100);
  });

  // Always on Top
  async function initAlwaysOnTop() {
    try {
      const isTop = await window.floatingCam?.isAlwaysOnTop();
      alwaysOnTopSwitch.checked = isTop !== false;
    } catch {
      alwaysOnTopSwitch.checked = true;
    }
  }

  alwaysOnTopSwitch.addEventListener('change', async e => {
    const checked = e.target.checked;
    await window.floatingCam?.setAlwaysOnTop(checked);
    localStorage.setItem('floaty_always_on_top', checked);
    window.floatingCam?.syncSetting('alwaysOnTop', checked);
  });

  // Auto-hide toolbar switch
  const savedAutoHide = localStorage.getItem('floaty_autohide_bar');
  autoHideBarSwitch.checked = savedAutoHide !== null ? savedAutoHide === 'true' : true;

  autoHideBarSwitch.addEventListener('change', e => {
    const checked = e.target.checked;
    localStorage.setItem('floaty_autohide_bar', checked);
    window.floatingCam?.syncSetting('autoHideBar', checked);
  });

  // Snapshot
  snapshotBtn?.addEventListener('click', () => {
    const originalText = snapshotBtn.innerHTML;
    snapshotBtn.innerHTML = '✨ Saved!';
    window.floatingCam?.syncSetting('snapshot', true);
    setTimeout(() => {
      snapshotBtn.innerHTML = originalText;
    }, 1500);
  });

  // Listen for sync events from Camera window (e.g. keyboard shortcuts pressed on camera)
  window.floatingCam?.onSettingSynced(data => {
    if (!data) return;
    const { key, value } = data;

    if (key === 'shape') {
      updateShapeUI(Boolean(value.isCircle));
    } else if (key === 'radius') {
      radiusSlider.value = value;
      radiusBadge.textContent = `${value}%`;
    } else if (key === 'flip') {
      flipSwitch.checked = Boolean(value);
    } else if (key === 'opacity') {
      const pct = Math.round(value * 100);
      opacitySlider.value = pct;
      opacityBadge.textContent = `${pct}%`;
    } else if (key === 'alwaysOnTop') {
      alwaysOnTopSwitch.checked = Boolean(value);
    } else if (key === 'size') {
      if (value.width && value.height) {
        widthInput.value = value.width;
        heightInput.value = value.height;
        highlightActivePreset(value.width, value.height);
        saveSize(value.width, value.height);
      }
    }
  });

  async function syncCurrentShape() {
    try {
      const shape = await window.floatingCam?.getShape?.();
      if (shape) {
        if (typeof shape.radius === 'number') {
          radiusSlider.value = shape.radius;
          radiusBadge.textContent = `${shape.radius}%`;
          saveRadius(shape.radius);
        }
        updateShapeUI(Boolean(shape.isCircle));
      }
    } catch (e) {
      console.warn('Could not sync current shape in preferences:', e);
    }
  }

  // Initial runs
  await loadCameras();
  await syncCurrentSizeInputs();
  await syncCurrentShape();
  await initAlwaysOnTop();
});
