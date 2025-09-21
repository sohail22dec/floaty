const videoEl = document.getElementById('video');
const flipBtn = document.getElementById('flipBtn');
const circleBtn = document.getElementById('circleBtn');
const radiusRange = document.getElementById('radiusRange');
const radiusValue = document.getElementById('radiusValue');
const opacityBtn = document.getElementById('opacityBtn');
const settingsBtn = document.getElementById('settingsBtn');
const toggleBtn = document.getElementById('toggleBtn');
const closeOverlayBtn = document.getElementById('closeOverlayBtn');
const controlsOverlay = document.getElementById('controlsOverlay');
const sizePanel = document.getElementById('sizePanel');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const applySizeBtn = document.getElementById('applySizeBtn');
const resizeHandle = document.getElementById('resizeHandle');

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    videoEl.srcObject = stream;
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    // Removed automatic window resizing so manual user size is preserved.
  } catch (e) {
    console.error('Failed to access camera', e);
    document.body.innerHTML = '<div style="padding:16px;font:14px system-ui;color:#fff;background:#000;">Camera permission denied or unavailable.</div>';
  }
}

initCamera();

// Initialize radius value display
radiusValue.textContent = radiusRange.value + '%';

// Toggle controls overlay
toggleBtn.addEventListener('click', () => {
  controlsOverlay.removeAttribute('hidden');
});

// Close overlay
closeOverlayBtn.addEventListener('click', () => {
  controlsOverlay.setAttribute('hidden', '');
  sizePanel.setAttribute('hidden', '');
});

// Close overlay when clicking backdrop
controlsOverlay.addEventListener('click', (e) => {
  if (e.target === controlsOverlay) {
    controlsOverlay.setAttribute('hidden', '');
    sizePanel.setAttribute('hidden', '');
  }
});

let flipped = true; // default is mirrored
flipBtn.addEventListener('click', () => {
  flipped = !flipped;
  videoEl.style.transform = flipped ? 'scaleX(-1)' : 'scaleX(1)';
});

circleBtn.addEventListener('click', () => {
  document.body.classList.toggle('circle');
  if (!document.body.classList.contains('circle')) {
    // restore custom radius
    videoEl.style.borderRadius = radiusRange.value + '%';
  }
});

radiusRange.addEventListener('input', (e) => {
  if (!document.body.classList.contains('circle')) {
    videoEl.style.borderRadius = e.target.value + '%';
  }
  radiusValue.textContent = e.target.value + '%';
});

const opacities = [1, 0.9, 0.75, 0.6, 0.4];
let opacityIndex = 0;
opacityBtn.addEventListener('click', () => {
  opacityIndex = (opacityIndex + 1) % opacities.length;
  videoEl.style.opacity = opacities[opacityIndex];
});

// Prevent context menu (clean look)
window.addEventListener('contextmenu', e => e.preventDefault());

// Settings panel toggle (now within overlay)
settingsBtn.addEventListener('click', async () => {
  if (sizePanel.hasAttribute('hidden')) {
    const size = await window.floatingCam.getWindowSize();
    if (size) {
      widthInput.value = size.width;
      heightInput.value = size.height;
    }
    sizePanel.removeAttribute('hidden');
  } else {
    sizePanel.setAttribute('hidden', '');
  }
});

applySizeBtn.addEventListener('click', () => {
  const w = parseInt(widthInput.value, 10);
  const h = parseInt(heightInput.value, 10);
  if (w && h) window.floatingCam.setWindowSize(w, h);
});

// Preset buttons
sizePanel.querySelectorAll('.presets button').forEach(btn => {
  btn.addEventListener('click', async () => {
    const ratio = btn.dataset.preset; // e.g., 16:9
    const size = await window.floatingCam.getWindowSize();
    if (!size) return;
    const [rw, rh] = ratio.split(':').map(Number);
    if (!rw || !rh) return;
    const newWidth = size.width; // keep width constant; adjust height
    const newHeight = Math.round(newWidth * (rh / rw));
    window.floatingCam.setWindowSize(newWidth, newHeight);
    heightInput.value = newHeight;
  });
});

// Drag resize handle (bottom-right)
let resizing = false;
let startX, startY, startW, startH;
resizeHandle.addEventListener('mousedown', async (e) => {
  e.preventDefault();
  const size = await window.floatingCam.getWindowSize();
  if (!size) return;
  resizing = true;
  startX = e.screenX;
  startY = e.screenY;
  startW = size.width;
  startH = size.height;
  document.body.classList.add('resizing');
});

window.addEventListener('mouseup', () => {
  if (resizing) {
    resizing = false;
    document.body.classList.remove('resizing');
  }
});

window.addEventListener('mousemove', (e) => {
  if (!resizing) return;
  const dx = e.screenX - startX;
  const dy = e.screenY - startY;
  const newW = Math.max(160, startW + dx);
  const newH = Math.max(160, startH + dy);
  window.floatingCam.setWindowSize(newW, newH);
  widthInput.value = newW;
  heightInput.value = newH;
});

// Close size panel when clicking outside of it within the overlay
controlsOverlay.addEventListener('click', (e) => {
  if (e.target === controlsOverlay) {
    controlsOverlay.setAttribute('hidden', '');
    sizePanel.setAttribute('hidden', '');
  } else if (!sizePanel.contains(e.target) && e.target !== settingsBtn && !sizePanel.hasAttribute('hidden')) {
    sizePanel.setAttribute('hidden', '');
  }
});
