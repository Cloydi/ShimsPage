/* ── BLOSSOM PARTICLES ────────────────────────── */
const blossomCanvas = document.getElementById('blossom-canvas');
const bCtx = blossomCanvas.getContext('2d');
function resize() { blossomCanvas.width = window.innerWidth; blossomCanvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

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
    alpha: 0.45 + Math.random() * 0.35,
    hue: 328 + Math.random() * 22
  };
}
const petals = Array.from({ length: 120 }, () => { const p = randomPetal(); p.y = Math.random() * window.innerHeight; return p; });

function animatePetals(t) {
  bCtx.clearRect(0, 0, blossomCanvas.width, blossomCanvas.height);
  for (const p of petals) {
    p.sway += p.swaySpeed; p.angle += p.spin;
    p.x += p.speedX + Math.sin(p.sway) * p.swayAmp; p.y += p.speedY;
    if (p.y > window.innerHeight + 20 || p.x < -60 || p.x > window.innerWidth + 60) Object.assign(p, randomPetal());
    bCtx.save();
    bCtx.translate(p.x, p.y); bCtx.rotate(p.angle); bCtx.globalAlpha = p.alpha;
    bCtx.beginPath(); bCtx.ellipse(0, 0, p.size * 0.55, p.size, 0, 0, Math.PI * 2);
    const g = bCtx.createRadialGradient(0, -p.size * 0.3, 0, 0, 0, p.size);
    g.addColorStop(0,   `hsla(${p.hue},85%,88%,1)`);
    g.addColorStop(0.5, `hsla(${p.hue},75%,72%,0.9)`);
    g.addColorStop(1,   `hsla(${p.hue},65%,60%,0)`);
    bCtx.fillStyle = g; bCtx.fill();
    bCtx.beginPath(); bCtx.moveTo(0, -p.size * 0.9); bCtx.lineTo(0, p.size * 0.5);
    bCtx.strokeStyle = `hsla(${p.hue},60%,55%,0.2)`; bCtx.lineWidth = 0.6; bCtx.stroke();
    bCtx.restore();
  }
  requestAnimationFrame(animatePetals);
}
requestAnimationFrame(animatePetals);

/* ── MEMORY DATA (read-only, no add) ─────────── */
const ALL_MEMORIES = [
  {
    id: 1,
    title: 'Online Biga',
    date: '2022',
    tag: 'biga',
    caption: 'Random ass moment caught online',
    mood: '🌸',
    imgSrc: 'assets/moment1.jpeg',
    mediaType: 'image',
    fav: false,
  },
  {
    id: 2,
    title: 'Our Little Escapes',
    date: '2026',
    tag: 'adventure',
    caption: 'Overtime got a litte less stressful because of our escapes',
    mood: '🌅',
    imgSrc: 'assets/moment2.webp',
    mediaType: 'image',
    fav: true,
  },
  {
    id: 3,
    title: 'Photobooth',
    date: '2025',
    tag: 'biga',
    caption: 'Rated-13 Photobooth. The best.',
    mood: '🍜',
    imgSrc: 'assets/video.mp4',
    mediaType: 'video',
    fav: true,
  },
  {
    id: 4,
    title: 'Party Party',
    date: '2023',
    tag: 'adventure',
    caption: 'Party with Komsai! A nice after party too',
    mood: '😉',
    imgSrc: 'assets/moment4.jpeg',
    mediaType: 'image',
    fav: true,
  },
  {
    id: 5,
    title: 'Theatrics',
    date: '2026',
    tag: 'adventure',
    caption: 'Good ass show with my pretty girl.',
    mood: '💕',
    imgSrc: 'assets/moment5.jpeg',
    mediaType: 'image',
    fav: false,
  },
  {
    id: 6,
    title: 'Batman: Solo Showing',
    date: '2022',
    tag: 'random',
    caption: 'Millionaire moment. Solo showing, unli touching. Overall good experience',
    mood: '☔',
    imgSrc: 'assets/moment6.jpeg',
    mediaType: 'image',
    fav: false,
  },
  {
    id: 7,
    title: 'Sleepover',
    date: '2019',
    tag: 'adventure',
    caption: 'Sleepover sa birthday ni Prima hehe',
    mood: '🎮',
    imgSrc: 'assets/moment7.jpeg',
    mediaType: 'image',
    fav: false,
  },
  {
    id: 8,
    title: 'Miagao WFH bahay-bahayan',
    date: '2024',
    tag: 'biga',
    caption: 'Get to fill you with kisses has always been the dream.',
    mood: '💋',
    imgSrc: 'assets/video3.mp4',
    mediaType: 'video',
    fav: true,
  },
  {
    id: 9,
    title: 'Sunday Morning',
    date: '2019',
    tag: 'random',
    caption: 'Kita ya ang highlights indi ang sport.',
    mood: '🏐',
    imgSrc: 'assets/moment8.jpeg',
    mediaType: 'image',
    fav: true,
  },
  {
    id: 10,
    title: 'Podcast',
    date: '2025',
    tag: 'random',
    caption: 'Random ass talks with my bb.',
    mood: '🎙️',
    imgSrc: 'assets/video2.mp4',
    mediaType: 'video',
    fav: true,
  },
  {
    id: 11,
    title: 'Big Step to College',
    date: '2023',
    tag: 'adventure',
    caption: 'So proud of my baby.',
    mood: '🎓',
    imgSrc: 'assets/moment9.jpeg',
    mediaType: 'image',
    fav: true,
  },
  {
    id: 12,
    title: 'Blurred Nights',
    date: '2019',
    tag: 'biga',
    caption: 'Blurred like the nights of fun.',
    mood: '⛈️',
    imgSrc: 'assets/moment10.jpeg',
    mediaType: 'image',
    fav: false,
  },
];

const TAG_LABELS = { adventure: 'Adventure', random: 'Random', food: 'Food', biga: 'Biga' };
function fmtDate(str) {
  if (!str) return '';
  const match = String(str).match(/^\d{4}/);
  return match ? match[0] : str;
}

/* ── CAROUSEL STATE ───────────────────────────── */
let currentFilter = 'all';
let visibleMemories = [];
let currentIndex = 0;   // index of the ACTIVE (center) card

const track   = document.getElementById('carousel-track');
const dotsEl  = document.getElementById('carousel-dots');
const arrowL  = document.getElementById('arrow-left');
const arrowR  = document.getElementById('arrow-right');

/* ── BUILD CARD ───────────────────────────────── */
function makePlaceholder() {
  const d = document.createElement('div');
  d.className = 'c-placeholder';
  d.innerHTML = `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>Place your photo here</span>`;
  return d;
}

function buildCard(mem, idx) {
  const card = document.createElement('div');
  card.className = 'c-card';
  card.dataset.idx = idx;

  const inner = document.createElement('div');
  inner.className = 'c-card-inner';

  // Image wrap
  const imgWrap = document.createElement('div');
  imgWrap.className = 'c-img-wrap';

  // Always add a placeholder first, hidden until needed
  const ph = makePlaceholder();
  ph.style.display = 'none';
  imgWrap.appendChild(ph);

  if (mem.imgSrc && mem.mediaType === 'video') {
    const vid = document.createElement('video');
    vid.src = mem.imgSrc;
    vid.autoplay = true; vid.loop = true; vid.muted = true; vid.playsInline = true;
    vid.onerror = () => { vid.style.display = 'none'; ph.style.display = ''; };
    imgWrap.appendChild(vid);
    const badge = document.createElement('div');
    badge.className = 'c-video-badge';
    badge.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg> Video`;
    imgWrap.appendChild(badge);
  } else if (mem.imgSrc) {
    const img = document.createElement('img');
    img.alt = mem.title;
    img.onerror = () => { img.style.display = 'none'; ph.style.display = ''; };
    img.onload  = () => { ph.style.display = 'none'; };
    // Set src after attaching handlers
    img.src = mem.imgSrc;
    imgWrap.appendChild(img);
    // Show placeholder immediately; onload will hide it
    ph.style.display = '';
  } else {
    ph.style.display = '';
  }

  // Tag chip
  const tagEl = document.createElement('div');
  tagEl.className = 'c-tag';
  tagEl.textContent = TAG_LABELS[mem.tag] || mem.tag;
  imgWrap.appendChild(tagEl);

  // Fav star (display only)
  const favEl = document.createElement('div');
  favEl.className = 'c-fav' + (mem.fav ? ' starred' : '');
  favEl.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  imgWrap.appendChild(favEl);

  // Label strip
  const label = document.createElement('div');
  label.className = 'c-card-label';
  label.innerHTML = `<div class="c-card-title">${mem.title}</div><div class="c-card-date">${fmtDate(mem.date)}</div>`;

  inner.appendChild(imgWrap);
  inner.appendChild(label);
  card.appendChild(inner);

  // Click opens lightbox
  card.addEventListener('click', () => {
    goTo(idx);
    openLightbox(mem);
  });

  return card;
}

/* ── RENDER CAROUSEL (infinite loop via clones) ── */
// trackIndex = position in the full cloned track (starts at n, the first real card)
let trackIndex = 0;
let isTransitioning = false;

function renderCarousel() {
  visibleMemories = currentFilter === 'all'
    ? ALL_MEMORIES
    : ALL_MEMORIES.filter(m => m.tag === currentFilter);

  currentIndex = 0;
  track.innerHTML = '';
  dotsEl.innerHTML = '';

  if (visibleMemories.length === 0) {
    track.innerHTML = `<div style="width:100%;text-align:center;padding:60px 0;font-family:Lato,sans-serif;font-size:0.7rem;letter-spacing:0.3em;text-transform:uppercase;color:rgba(217,79,135,0.4);">No memories in this chapter yet</div>`;
    updateCaptionPanel(null);
    return;
  }

  const n = visibleMemories.length;

  // Build: [last clone] + [all real] + [first clone]
  // For seamless looping we clone the last card before and the first after
  const appendCard = (mem, realIdx, isClone) => {
    const card = buildCard(mem, realIdx);
    if (isClone) card.dataset.clone = '1';
    track.appendChild(card);
  };

  appendCard(visibleMemories[n - 1], n - 1, true); // leading clone (last item)
  visibleMemories.forEach((mem, i) => appendCard(mem, i, false));
  appendCard(visibleMemories[0], 0, true);          // trailing clone (first item)

  // trackIndex: 1 = first real card (index 0 in visibleMemories)
  trackIndex = 1 + currentIndex;

  // Build dots (one per real card)
  visibleMemories.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'c-dot' + (i === currentIndex ? ' active' : '');
    dot.setAttribute('aria-label', `Go to memory ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  applyPosition(false);
  updateCaptionPanel(visibleMemories[currentIndex]);
}

/* ── POSITION TRACK ───────────────────────────── */
function applyPosition(animate) {
  const CARD_W = 100 / 3; // each card = 33.333% of track

  // Mark active on all cards (match by realIdx == currentIndex, skip clones)
  track.querySelectorAll('.c-card').forEach(c => {
    const isClone  = c.dataset.clone === '1';
    const realIdx  = parseInt(c.dataset.idx, 10);
    c.classList.toggle('active', !isClone && realIdx === currentIndex);
  });

  // offset: trackIndex=0 → leading clone centered; trackIndex=1 → first real card centered
  const offset = trackIndex * CARD_W;
  track.style.transition = animate ? 'transform 0.55s cubic-bezier(.22,1,.36,1)' : 'none';
  track.style.transform  = `translateX(calc(-${offset}% + ${CARD_W}%))`;
  if (!animate) track.offsetHeight; // force reflow

  // Dots
  dotsEl.querySelectorAll('.c-dot').forEach((d, i) => d.classList.toggle('active', i === currentIndex));

  // Arrows never disabled in loop mode
  arrowL.disabled = false;
  arrowR.disabled = false;
}

/* ── GO TO REAL INDEX (from dots) ─────────────── */
function goTo(realIdx) {
  if (isTransitioning) return;
  currentIndex = ((realIdx % visibleMemories.length) + visibleMemories.length) % visibleMemories.length;
  trackIndex   = 1 + currentIndex;
  applyPosition(true);
  updateCaptionPanel(visibleMemories[currentIndex]);
}

/* ── STEP (arrows / keyboard / swipe) ────────── */
function step(dir) { // dir: +1 or -1
  if (isTransitioning) return;
  isTransitioning = true;

  trackIndex += dir;
  currentIndex = ((currentIndex + dir) % visibleMemories.length + visibleMemories.length) % visibleMemories.length;
  applyPosition(true);
  updateCaptionPanel(visibleMemories[currentIndex]);

  // After transition, silently jump to the real card if we landed on a clone
  track.addEventListener('transitionend', function onEnd() {
    track.removeEventListener('transitionend', onEnd);
    isTransitioning = false;
    const n = visibleMemories.length;
    if (trackIndex === 0) {
      // slid past leading clone → jump to last real card
      trackIndex = n;
      applyPosition(false);
    } else if (trackIndex === n + 1) {
      // slid past trailing clone → jump to first real card
      trackIndex = 1;
      applyPosition(false);
    }
  });
}

arrowL.addEventListener('click', () => step(-1));
arrowR.addEventListener('click', () => step(+1));

// Keyboard
document.addEventListener('keydown', e => {
  if (document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  step(-1);
  if (e.key === 'ArrowRight') step(+1);
});

// Touch / swipe
let touchStartX = 0;
document.getElementById('carousel-track-wrap').addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });
document.getElementById('carousel-track-wrap').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
});

/* ── CAPTION PANEL ────────────────────────────── */
function updateCaptionPanel(mem) {
  const panelEls = [
    document.getElementById('panel-date'),
    document.getElementById('panel-title'),
    document.getElementById('panel-tag'),
    document.getElementById('panel-caption'),
    document.getElementById('panel-mood'),
  ];
  // fade out
  panelEls.forEach(el => el.classList.add('caption-panel-fade'));
  setTimeout(() => {
    if (!mem) { panelEls.forEach(el => { el.textContent = ''; el.classList.remove('caption-panel-fade'); }); return; }
    document.getElementById('panel-date').textContent    = fmtDate(mem.date);
    document.getElementById('panel-title').textContent   = mem.title;
    document.getElementById('panel-tag').textContent     = TAG_LABELS[mem.tag] || mem.tag;
    document.getElementById('panel-caption').textContent = mem.caption || '';
    document.getElementById('panel-mood').textContent    = mem.mood || '';
    panelEls.forEach(el => el.classList.remove('caption-panel-fade'));
  }, 280);
}

/* ── FILTERS ──────────────────────────────────── */
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    currentIndex = 0;
    renderCarousel();
  });
});

/* ── LIGHTBOX ─────────────────────────────────── */
function openLightbox(mem) {
  const lb    = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbVid = document.getElementById('lightbox-video');

  // Reset both
  lbImg.style.display = 'none'; lbImg.src = '';
  lbVid.style.display = 'none'; lbVid.src = '';

  if (mem.imgSrc && mem.mediaType === 'video') {
    lbVid.style.display = 'block';
    lbVid.src = mem.imgSrc;
  } else if (mem.imgSrc) {
    lbImg.style.display = 'block';
    lbImg.onerror = () => { lbImg.style.display = 'none'; };
    lbImg.src = mem.imgSrc;
  }

  document.getElementById('lightbox-date').textContent    = fmtDate(mem.date);
  document.getElementById('lightbox-title').textContent   = mem.title;
  document.getElementById('lightbox-caption').textContent = mem.caption || '';

  lb.classList.add('open');
}

function closeLightbox() {
  const lb    = document.getElementById('lightbox');
  const lbVid = document.getElementById('lightbox-video');
  lb.classList.remove('open');
  lbVid.pause(); lbVid.src = '';
}

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
document.getElementById('lightbox').addEventListener('click', e => {
  if (e.target === document.getElementById('lightbox')) closeLightbox();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ── INIT ─────────────────────────────────────── */
renderCarousel();