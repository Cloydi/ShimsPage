// ── CHERRY BLOSSOM (same physics as mainMenu) ─────────────────────────
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
  p.y = Math.random() * window.innerHeight;
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
      Object.assign(p, randomPetal());
    }
    drawPetal(bCtx, p);
  }
  requestAnimationFrame(animatePetals);
}
requestAnimationFrame(animatePetals);

// ── PIN LOGIC ─────────────────────────────────────────────────────────
// ⚠️  Change this to your real PIN. For better security, replace the
//     plain-text comparison below with a hashed check (e.g. SHA-256).
const CORRECT_PIN = '081319';
const PIN_LENGTH  = 6;
const MAX_ATTEMPTS = 5;

let entered   = '';
let attempts  = 0;
let locked    = false;
let lockTimer = null;

const prompt   = document.getElementById('pin-prompt');
const lockIcon = document.getElementById('lock-icon');
const hint     = document.getElementById('pin-hint');
const overlay  = document.getElementById('success-overlay');

function getDots() {
  return Array.from(document.querySelectorAll('.pin-dot'));
}

function updateDots() {
  getDots().forEach((dot, i) => {
    dot.classList.toggle('filled', i < entered.length);
    dot.classList.remove('error');
  });
  lockIcon.classList.toggle('unlocking', entered.length > 0);
  lockIcon.classList.remove('error-shake');
}

function clearError() {
  prompt.classList.remove('error', 'success');
  getDots().forEach(d => d.classList.remove('error'));
  lockIcon.classList.remove('error-shake');
}

function triggerError(msg) {
  prompt.textContent = msg;
  prompt.classList.add('error');
  prompt.classList.remove('success');

  getDots().forEach(d => {
    d.classList.remove('filled');
    d.classList.add('error');
  });

  lockIcon.classList.add('error-shake');
  lockIcon.classList.remove('unlocking');

  // Remove shake class after animation completes
  setTimeout(() => {
    lockIcon.classList.remove('error-shake');
  }, 500);

  entered = '';

  // Reset dots and prompt after a moment
  setTimeout(() => {
    if (!locked) {
      getDots().forEach(d => d.classList.remove('error'));
      prompt.classList.remove('error');
      prompt.textContent = 'Enter your PIN';
    }
  }, 1400);
}

function triggerSuccess() {
  prompt.textContent = 'Correct';
  prompt.classList.add('success');
  lockIcon.classList.add('unlocking');

  // Swap lock → unlock icon
  document.getElementById('lock-svg').innerHTML = `
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  `;

  setTimeout(() => {
    overlay.classList.add('active');
    // Navigate to main menu after the success animation
    setTimeout(() => {
      window.location.href = 'mainMenu.html';
    }, 1600);
  }, 400);
}

function applyLockout(secondsLeft) {
  locked = true;
  document.querySelectorAll('.num-btn:not(.btn-empty)').forEach(b => b.disabled = true);

  function tick() {
    prompt.textContent = `Locked · try again in ${secondsLeft}s`;
    prompt.classList.add('error');
    hint.textContent = `Too many attempts · ${attempts}/${MAX_ATTEMPTS} used`;
    if (secondsLeft <= 0) {
      locked = false;
      attempts = 0;
      document.querySelectorAll('.num-btn:not(.btn-empty)').forEach(b => b.disabled = false);
      prompt.textContent = 'Enter your PIN';
      prompt.classList.remove('error');
      hint.textContent = 'Protected · 4-digit PIN required';
      getDots().forEach(d => d.classList.remove('error'));
      return;
    }
    secondsLeft--;
    lockTimer = setTimeout(tick, 1000);
  }
  tick();
}

function handleDigit(digit) {
  if (locked || entered.length >= PIN_LENGTH) return;
  entered += digit;
  updateDots();

  if (entered.length === PIN_LENGTH) {
    // Small delay so the last dot fills visibly before check
    setTimeout(() => {
      if (entered === CORRECT_PIN) {
        triggerSuccess();
      } else {
        attempts++;
        const remaining = MAX_ATTEMPTS - attempts;
        if (attempts >= MAX_ATTEMPTS) {
          triggerError('Access denied');
          setTimeout(() => applyLockout(30), 500);
        } else {
          triggerError(remaining === 1 ? 'Wrong PIN · 1 attempt left' : `Wrong PIN · ${remaining} left`);
        }
      }
    }, 80);
  }
}

function handleDelete() {
  if (locked) return;
  if (entered.length === 0) return;
  clearError();
  entered = entered.slice(0, -1);
  updateDots();
  if (entered.length === 0) {
    lockIcon.classList.remove('unlocking');
    prompt.textContent = 'Enter your PIN';
  }
}

// ── NUMPAD BUTTON EVENTS ───────────────────────────────────────────────
document.querySelectorAll('.num-btn[data-digit]').forEach(btn => {
  btn.addEventListener('click', function(e) {
    if (locked) return;
    // Ripple effect
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(this.offsetWidth, this.offsetHeight);
    ripple.style.cssText = `
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
    `;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 520);

    handleDigit(this.dataset.digit);
  });
});

document.getElementById('btn-del').addEventListener('click', handleDelete);

// ── KEYBOARD SUPPORT ──────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (locked) return;
  if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
  if (e.key === 'Backspace' || e.key === 'Delete') handleDelete();
});