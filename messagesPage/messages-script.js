/* ── BLOSSOM PARTICLES ───────────────────────── */
const blossomCanvas = document.getElementById('blossom-canvas');
const bCtx = blossomCanvas.getContext('2d');
function resize() { blossomCanvas.width = window.innerWidth; blossomCanvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

function randomPetal() {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * -window.innerHeight,
    size: 6 + Math.random() * 14,
    speedY: 0.5 + Math.random() * 1.4,
    speedX: -0.4 + Math.random() * 0.8,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.045,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.007 + Math.random() * 0.013,
    swayAmp: 1.2 + Math.random() * 3,
    alpha: 0.4 + Math.random() * 0.38,
    hue: 328 + Math.random() * 22
  };
}
const petals = Array.from({ length: 110 }, () => { const p = randomPetal(); p.y = Math.random() * window.innerHeight; return p; });

(function animatePetals() {
  bCtx.clearRect(0, 0, blossomCanvas.width, blossomCanvas.height);
  for (const p of petals) {
    p.sway += p.swaySpeed; p.angle += p.spin;
    p.x += p.speedX + Math.sin(p.sway) * p.swayAmp; p.y += p.speedY;
    if (p.y > window.innerHeight + 20 || p.x < -60 || p.x > window.innerWidth + 60) Object.assign(p, randomPetal());
    bCtx.save();
    bCtx.translate(p.x, p.y); bCtx.rotate(p.angle); bCtx.globalAlpha = p.alpha;
    bCtx.beginPath(); bCtx.ellipse(0, 0, p.size * 0.52, p.size, 0, 0, Math.PI * 2);
    const g = bCtx.createRadialGradient(0, -p.size * 0.3, 0, 0, 0, p.size);
    g.addColorStop(0,   `hsla(${p.hue},85%,88%,1)`);
    g.addColorStop(0.5, `hsla(${p.hue},75%,72%,0.9)`);
    g.addColorStop(1,   `hsla(${p.hue},65%,60%,0)`);
    bCtx.fillStyle = g; bCtx.fill();
    bCtx.beginPath(); bCtx.moveTo(0, -p.size * 0.85); bCtx.lineTo(0, p.size * 0.45);
    bCtx.strokeStyle = `hsla(${p.hue},60%,55%,0.18)`; bCtx.lineWidth = 0.55; bCtx.stroke();
    bCtx.restore();
  }
  requestAnimationFrame(animatePetals);
})();

/* ── MESSAGE DATA ────────────────────────────── */
// Edit the messages array below to customize content.
// Each scroll has: title, from, date, seal (emoji), body (message text), signature
const MESSAGES = [
  {
    title: "The Very First",
    from: "The Stairs",
    date: "2017",
    seal: "🌸",
    signature: "Forever yours,",
    body: `Descending from the stairs, I saw you for the first time.
    We made acquaintances to friends very quickly, like puzzles fitting.
    I just didn\'t expect us to be lovers.
    Funny how life works.`
  },
  {
    title: "I miss you",
    from: "C.Y.",
    date: "July 24, 2026",
    seal: "💌",
    signature: "Your other half",
    body: `I miss/     every bit of you
    you/    define every bit of me
    I feel incomplete/     without you
    because you are/     my missing piece
    my other half/    disappears`
  },
  {
    title: "A Tourist",
    from: "C.Y.",
    date: "June 25, 2026",
    seal: "🌆",
    signature: "",
    body: `I am an outcast
    Visited this pretty town
    Settled in like home`
  },
  {
    title: "A Letter",
    from: "the heart",
    date: "August 11, 2026",
    seal: "🗺️",
    signature: "Sincerely yours,",
    body: `We got lost four times.

Once on purpose, twice by accident, and once because neither of us wanted to admit we had no idea where we were going.

But every wrong turn led somewhere I would have never found alone.

That's what adventures with you feel like. Worth every detour.`
  },
  {
    title: "What I Hate About You",
    from: "C.Y.",
    date: "February 14, 2024",
    seal: "💕",
    signature: "With all of me,",
    body: `One year of choosing you.

Three hundred and sixty-five days of "good morning" and "are you okay" and "tell me everything."

If I had to do it again — the waiting, the uncertainty, the slow fall — I would.

A thousand times, I would.

Happy anniversary, my love.`
  },
  {
    title: "What I Miss About You",
    from: "C.Y.",
    date: "November 2, 2023",
    seal: "🌙",
    signature: "From the sleepless corner of my heart,",
    body: `It's late and I should be asleep.

But my mind keeps circling back to you — the way it always does when the world gets quiet and there's nothing left to distract me from what matters.

You matter.

You matter in the kind of way that keeps me awake in the best possible sense.

Goodnight. Dream of something good. I'll be here.`
  },
  {
    title: "What I Love About You",
    from: "Light Dispatch",
    date: "July 20, 2023",
    seal: "🎮",
    signature: "The one who definitely won,",
    body: `Okay fine. You won.

But only because I let you. (I didn't let you.)

This is a formal written record that the game was unfair, the rules were unclear, and your victory celebration was excessive.

I also want to formally note that I had a wonderful time and would lose to you again any day of the week.`
  },
  {
    title: "everything I like about you",
    from: "A Simple Truth",
    date: "May 11, 2024",
    seal: "🏡",
    signature: "everything i like about you",
    body: `your eyes, your smiles, your bosom
    your cheeks, your lips, your buttocks
    your hands on mine, the jitters
    all your physical features
    
    your laugh, cries, every nuance
    you\'re everything i dreamed once
    a giver, carer, lover
    with you, everything's better
    
    your neck, my lips harmonize
    its smell got me hypnotize
    unfazed contact of our eyes
    your soft skin i memorize
    
    every little bit of me
    longs every bit of you cause
    everything about you is`
  },
];

/* ── RENDER SCROLLS ──────────────────────────── */
const grid = document.getElementById('scrolls-grid');

const SCROLL_PALETTES = [
  { bg: 'linear-gradient(160deg,#fdf3e3 0%,#f8e8cc 40%,#fdf0d8 100%)', border: 'rgba(201,147,58,0.35)' },
  { bg: 'linear-gradient(160deg,#fef0f4 0%,#fce0eb 40%,#fdf0f5 100%)', border: 'rgba(217,79,135,0.3)' },
  { bg: 'linear-gradient(160deg,#f0f5fd 0%,#ddeafc 40%,#eef4fd 100%)', border: 'rgba(80,130,220,0.25)' },
  { bg: 'linear-gradient(160deg,#f3fdf0 0%,#daf5d3 40%,#eefaeb 100%)', border: 'rgba(70,170,80,0.25)' },
  { bg: 'linear-gradient(160deg,#fdf8f0 0%,#f5e8d0 40%,#fdf5e8 100%)', border: 'rgba(180,110,40,0.3)' },
];

MESSAGES.forEach((msg, i) => {
  const palette = SCROLL_PALETTES[i % SCROLL_PALETTES.length];
  const item = document.createElement('div');
  item.className = 'scroll-item';
  item.innerHTML = `
    <div class="scroll-visual">
      <div class="scroll-rod left-knob"></div>
      <div class="scroll-parchment" style="border-color:${palette.border}"></div>
      <div class="scroll-rod"></div>
      <span class="scroll-open-hint">tap to open</span>
    </div>
    <div class="scroll-name">${msg.title}</div>
  `;
  item.addEventListener('click', () => openScroll(msg));
  grid.appendChild(item);
});

/* ── UNFURL ──────────────────────────────────── */
const overlay  = document.getElementById('unfurl-overlay');
const backdrop = document.getElementById('unfurl-backdrop');
const closeBtn = document.getElementById('unfurl-close');

function openScroll(msg) {
  document.getElementById('unfurl-seal').textContent      = msg.seal;
  document.getElementById('unfurl-from').textContent      = msg.from;
  document.getElementById('unfurl-title').textContent     = msg.title;
  document.getElementById('unfurl-body').textContent      = msg.body.trim();
  document.getElementById('unfurl-signature').textContent = msg.signature;
  document.getElementById('unfurl-date').textContent      = msg.date;

  // Re-trigger CSS animations by briefly removing and re-adding the class
  const inner = document.getElementById('unfurl-paper-inner');
  inner.classList.remove('animate-in');
  // Force reflow so the class removal registers before we add it back
  void inner.offsetWidth;
  inner.classList.add('animate-in');

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeScroll() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  // Remove animate-in so next open re-triggers all animations
  const inner = document.getElementById('unfurl-paper-inner');
  if (inner) inner.classList.remove('animate-in');
}

closeBtn.addEventListener('click', closeScroll);
backdrop.addEventListener('click', closeScroll);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeScroll(); });