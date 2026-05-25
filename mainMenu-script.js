// ── VIDEO FALLBACK─────────────────────────────────────────
const scene3Video = document.getElementById('scene-3-video');
const scene3Placeholder = document.getElementById('scene-3-placeholder');
if (scene3Video) {
  scene3Video.addEventListener('error', () => {
    scene3Video.style.display = 'none';
    scene3Placeholder.style.display = 'flex';
  });
  // If no sources loaded at all
  scene3Video.addEventListener('emptied', () => {
    if (scene3Video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      scene3Video.style.display = 'none';
      scene3Placeholder.style.display = 'flex';
    }
  });
}

// ── SHOW PLACEHOLDERS IF IMAGES FAIL TO LOAD ────────────────────────
document.querySelectorAll('.scene-art').forEach(img => {
  function showFallback() {
    img.style.display = 'none';
    const ph = img.nextElementSibling;
    if (ph) ph.style.display = 'flex';
  }
  if (img.complete && img.naturalWidth === 0) showFallback();
  img.addEventListener('error', showFallback);
});

// ── CHERRY BLOSSOM PHYSICS ──────────────────────────────────────────
const blossomCanvas = document.getElementById('blossom-canvas');
const bCtx = blossomCanvas.getContext('2d');

function resize() {
  blossomCanvas.width  = window.innerWidth;
  blossomCanvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const PETAL_COUNT = 180;
const petals = [];

function randomPetal() {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * -window.innerHeight,
    size: 7 + Math.random() * 16,
    speedY: 0.6 + Math.random() * 1.6,
    speedX: -0.5 + Math.random() * 1.0,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.05,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.008 + Math.random() * 0.014,
    swayAmp: 1.5 + Math.random() * 3.5,
    alpha: 0.55 + Math.random() * 0.4,
    hue: 328 + Math.random() * 22
  };
}

for (let i = 0; i < PETAL_COUNT; i++) {
  const p = randomPetal();
  p.y = Math.random() * window.innerHeight; // spread initial y
  petals.push(p);
}

function drawPetal(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.globalAlpha = p.alpha;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size * 0.55, p.size, 0, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(0, -p.size * 0.3, 0, 0, 0, p.size);
  grad.addColorStop(0,   `hsla(${p.hue}, 85%, 88%, 1)`);
  grad.addColorStop(0.5, `hsla(${p.hue}, 75%, 72%, 0.9)`);
  grad.addColorStop(1,   `hsla(${p.hue}, 65%, 60%, 0)`);
  ctx.fillStyle = grad;
  ctx.fill();
  // petal vein
  ctx.beginPath();
  ctx.moveTo(0, -p.size * 0.9);
  ctx.lineTo(0, p.size * 0.5);
  ctx.strokeStyle = `hsla(${p.hue}, 60%, 55%, 0.2)`;
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.restore();
}

let lastT = 0;
function animatePetals(t) {
  const dt = Math.min(t - lastT, 50);
  lastT = t;
  bCtx.clearRect(0, 0, blossomCanvas.width, blossomCanvas.height);

  for (const p of petals) {
    p.sway += p.swaySpeed;
    p.angle += p.spin;
    p.x += p.speedX + Math.sin(p.sway) * p.swayAmp;
    p.y += p.speedY;

    if (p.y > window.innerHeight + 20 || p.x < -60 || p.x > window.innerWidth + 60) {
      const np = randomPetal();
      Object.assign(p, np);
    }
    drawPetal(bCtx, p);
  }
  requestAnimationFrame(animatePetals);
}
requestAnimationFrame(animatePetals);

// ── SCENE SWITCHING ─────────────────────────────────────────────────
const scenes = document.querySelectorAll('.scene');
const caption = document.getElementById('scene-caption');
const capTitle = document.getElementById('caption-title');
const capSub   = document.getElementById('caption-sub');

const sceneData = [
  { title: 'The Kindling',      sub: 'Proximity to the flame' },
  { title: 'A Paved Path',    sub: 'A Walk to Remember' },
  { title: 'Passion Scrolls',     sub: 'Feelings in Scriptures' },
  { title: 'Life\'s a Game',      sub: 'Ano? Tara!' },
  { title: 'Baby! Baby! Baby!',        sub: 'Mwamwa ka saken' },
];

let currentScene = 0;
let hoverTimeout = null;

function showScene(idx) {
  if (idx === currentScene) return;
  scenes[currentScene].classList.remove('active');
  currentScene = idx;
  scenes[currentScene].classList.add('active');

  caption.classList.remove('visible');
  clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => {
    capTitle.textContent = sceneData[idx].title;
    capSub.textContent   = sceneData[idx].sub;
    caption.classList.add('visible');
  }, 120);
}

document.querySelectorAll('.menu-item').forEach((item) => {
  const idx = parseInt(item.dataset.scene, 10);
  item.addEventListener('mouseenter', () => showScene(idx));
});

// default caption
capTitle.textContent = sceneData[0].title;
capSub.textContent   = sceneData[0].sub;
setTimeout(() => caption.classList.add('visible'), 1200);

// ── CLICK RIPPLE ────────────────────────────────────────────────────
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', function(e) {
    const label = this.querySelector('.menu-label').textContent;
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute; left:${e.offsetX}px; top:${e.offsetY}px;
      width:4px; height:4px; background:rgba(244,168,192,0.8);
      border-radius:50%; pointer-events:none;
      animation: rippleOut 0.6s ease-out forwards;
      transform: translate(-50%,-50%);
    `;
    this.style.position = 'relative';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

const style = document.createElement('style');
style.textContent = `
  @keyframes rippleOut {
    to { transform: translate(-50%,-50%) scale(30); opacity: 0; }
  }
`;
document.head.appendChild(style);