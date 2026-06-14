// ═══════════════════════════════════════════════════════════
// YEAR DATA
// ═══════════════════════════════════════════════════════════
const YEARS = [
  {
    num: 0,
    label: 'Year Zero · The Beginning',
    title: 'Where It All\nBegan',
    body: 'Every great story has its first page. This is ours — the moment before everything changed, the quiet instant where two worlds first brushed against each other and decided to stay.',
    photos: [
      { src: 'assets/year-0-A.jpeg', caption: 'Year Zero' },
      { src: 'assets/year-0-B.jpeg', caption: 'Year Zero' },
      { src: 'assets/year-0-C.jpeg', caption: 'Year Zero' }
      // Add more: { src: '../assets/year0b.jpg', caption: 'Early days' },
    ]
  },
  {
    num: 1,
    label: 'Year One · First Steps',
    title: 'Learning to\nWalk Together',
    body: 'The tentative firsts — first laughs shared, first inside jokes formed, first silences that felt comfortable rather than strange. The year of discovery.',
    photos: [
      { src: '../assets/year1.jpg', caption: 'Year One' },
    ]
  },
  {
    num: 2,
    label: 'Year Two · Deepening',
    title: 'Roots Taking\nHold',
    body: 'What was new became familiar. What was familiar became precious. The second year was a settling — not stagnation, but the way a tree sends its roots deeper into the earth.',
    photos: [
      { src: '../assets/year2.jpg', caption: 'Year Two' },
    ]
  },
  {
    num: 3,
    label: 'Year Three · Growth',
    title: 'Blooming in\nFull Season',
    body: 'The third year came in color. Every challenge faced together made the bond stronger; every celebration sweeter. This was the year that confirmed what had always been suspected.',
    photos: [
      { src: '../assets/year3.jpg', caption: 'Year Three' },
    ]
  },
  {
    num: 4,
    label: 'Year Four · Resilience',
    title: 'Through Every\nSeason',
    body: 'Not all chapters are soft. Some are forged in difficulty, in distance, in the effort it takes to choose each other again and again. This year tested and proved.',
    photos: [
      { src: '../assets/year4.jpg', caption: 'Year Four' },
    ]
  },
  {
    num: 5,
    label: 'Year Five · Milestone',
    title: 'Half a Decade\nof Us',
    body: 'Five years. Pause and feel the weight of that. Five complete rotations around the sun, woven together — every season shared, every year a new layer added to something extraordinary.',
    photos: [
      { src: '../assets/year5.jpg', caption: 'Year Five' },
    ]
  },
  {
    num: 6,
    label: 'Year Six · Abundance',
    title: 'Petals Still\nFalling',
    body: 'Some people search their whole lives for this — and here it is, right here, still in bloom. Year six was proof that the magic doesn\'t diminish; it deepens.',
    photos: [
      { src: '../assets/year6.jpg', caption: 'Year Six' },
    ]
  },
  {
    num: 7,
    label: 'Year Seven · Present',
    title: 'And Still,\nHere We Are',
    body: 'Seven years of choosing, building, laughing, holding on. This page is still being written — and every day, it gets better. Here is where the story stands, and here is where it continues.',
    photos: [
      { src: '../assets/year7.jpg', caption: 'Year Seven' },
    ]
  },
];

// ═══════════════════════════════════════════════════════════
// BUILD TIMELINE
// ═══════════════════════════════════════════════════════════
const root = document.getElementById('timeline-root');
const isSingle = n => n === 1;

YEARS.forEach((year, idx) => {
  const photoLeft = idx % 2 === 0;
  const n = year.photos.length;

  // --- Gallery HTML ---
  const slidesHtml = year.photos.map(p => `
    <div class="gallery-slide" data-src="${p.src}">
      <img src="${p.src}" alt="${p.caption || ''}"
           draggable="false"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <div class="photo-placeholder" style="display:none;">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <span>${p.src.split('/').pop()}</span>
      </div>
    </div>
  `).join('');

  const dotsHtml = year.photos.map((_, i) =>
    `<div class="dot${i === 0 ? ' active' : ''}" data-i="${i}"></div>`
  ).join('');

  const captionLabel = year.photos.length === 1
    ? (year.photos[0].caption || `Year ${year.num}`)
    : `Year ${year.num} · ${n} Photos`;

  const galleryHtml = `
    <div class="photo-block">
      <div class="gallery" id="gallery-${year.num}">
        <div class="gallery-track">${slidesHtml}</div>
        <div class="photo-count ${isSingle(n) ? 'single' : ''}" id="count-${year.num}">1 / ${n}</div>
        <button class="gallery-arrow prev ${isSingle(n) ? 'hidden' : ''}" aria-label="Previous">
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="gallery-arrow next ${isSingle(n) ? 'hidden' : ''}" aria-label="Next">
          <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div class="ph-corner ph-corner-tl"><svg viewBox="0 0 30 30"><path d="M2 28 L2 2 L28 2"/></svg></div>
        <div class="ph-corner ph-corner-br"><svg viewBox="0 0 30 30"><path d="M2 28 L2 2 L28 2"/></svg></div>
      </div>
      <div class="gallery-dots ${isSingle(n) ? 'single' : ''}" id="dots-${year.num}">${dotsHtml}</div>
      <div class="photo-caption ${photoLeft ? '' : 'flip'}">
        <div class="cap-line"></div>
        <span>${captionLabel}</span>
      </div>
    </div>
  `;

  // --- Text HTML ---
  const titleLines = year.title.split('\n').join('<br>');
  const textHtml = `
    <div class="text-block ${photoLeft ? '' : 'align-right'}">
      <div class="year-label">${year.label}</div>
      <div class="accent-line"></div>
      <h2>${titleLines}</h2>
      <p>${year.body}</p>
    </div>
  `;

  // --- Node ---
  const isLast = year.num === 7;
  const nodeHtml = `
    <div class="year-node">
      <div class="node-dot" ${isLast ? 'style="border-color:var(--sakura);background:rgba(217,79,135,0.1);box-shadow:0 0 0 6px rgba(217,79,135,0.12),0 0 28px rgba(217,79,135,0.3);"' : ''}></div>
      <div class="node-year" ${isLast ? 'style="color:var(--deep-pink);font-weight:700;"' : ''}>Y · ${year.num}</div>
    </div>
  `;

  // --- Assemble entry ---
  const entry = document.createElement('div');
  entry.className = 'year-entry';
  entry.id = `y${year.num}`;
  entry.innerHTML = `
    <div class="year-left">${photoLeft ? galleryHtml : textHtml}</div>
    ${nodeHtml}
    <div class="year-right">${photoLeft ? textHtml : galleryHtml}</div>
  `;
  root.appendChild(entry);
});

// ═══════════════════════════════════════════════════════════
// GALLERY LOGIC
// ═══════════════════════════════════════════════════════════
const galleries = {}; // { yearNum: { current, total, track, dots, countEl, photos } }

YEARS.forEach(year => {
  const g = document.getElementById(`gallery-${year.num}`);
  if (!g) return;

  const track  = g.querySelector('.gallery-track');
  const dotsEl = document.getElementById(`dots-${year.num}`);
  const countEl= document.getElementById(`count-${year.num}`);
  const prevBtn= g.querySelector('.gallery-arrow.prev');
  const nextBtn= g.querySelector('.gallery-arrow.next');
  const n = year.photos.length;

  const state = { current: 0, total: n, track, dotsEl, countEl, photos: year.photos };
  galleries[year.num] = state;

  function goTo(i, opening = false) {
    if (i < 0 || i >= n) return;
    state.current = i;
    track.style.transform = `translateX(-${i * 100}%)`;
    // dots
    dotsEl.querySelectorAll('.dot').forEach((d, di) => d.classList.toggle('active', di === i));
    // count
    countEl.textContent = `${i + 1} / ${n}`;
    // arrows visibility
    if (prevBtn) prevBtn.classList.toggle('hidden', n <= 1);
    if (nextBtn) nextBtn.classList.toggle('hidden', n <= 1);
  }

  if (prevBtn) prevBtn.addEventListener('click', e => { e.stopPropagation(); goTo(state.current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', e => { e.stopPropagation(); goTo(state.current + 1); });

  dotsEl.querySelectorAll('.dot').forEach((dot, i) => {
    dot.addEventListener('click', e => { e.stopPropagation(); goTo(i); });
  });

  // open lightbox on slide click
  g.querySelector('.gallery-track').addEventListener('click', () => {
    openLightbox(year.num, state.current);
  });

  // swipe
  let touchStartX = 0;
  g.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  g.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? state.current + 1 : state.current - 1);
  });

  goTo(0);
});

// ═══════════════════════════════════════════════════════════
// LIGHTBOX
// ═══════════════════════════════════════════════════════════
let lbYearNum = null, lbIdx = 0;

function openLightbox(yearNum, idx) {
  lbYearNum = yearNum;
  lbIdx = idx;
  renderLightbox();
  document.getElementById('lightbox').classList.add('open');
}

function renderLightbox() {
  const state = galleries[lbYearNum];
  const photo = state.photos[lbIdx];
  document.getElementById('lightbox-img').src = photo.src;
  document.getElementById('lb-counter').textContent =
    state.total > 1 ? `${lbIdx + 1} of ${state.total}` : '';
  document.getElementById('lb-prev').classList.toggle('hidden', state.total <= 1 || lbIdx === 0);
  document.getElementById('lb-next').classList.toggle('hidden', state.total <= 1 || lbIdx === state.total - 1);
}

function lbStep(dir) {
  const state = galleries[lbYearNum];
  lbIdx = Math.max(0, Math.min(state.total - 1, lbIdx + dir));
  renderLightbox();
  // also sync carousel
  galleries[lbYearNum].track.style.transform = `translateX(-${lbIdx * 100}%)`;
  galleries[lbYearNum].dotsEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === lbIdx));
  galleries[lbYearNum].countEl.textContent = `${lbIdx + 1} / ${galleries[lbYearNum].total}`;
  galleries[lbYearNum].current = lbIdx;
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

document.getElementById('lightbox').addEventListener('click', e => {
  if (e.target === document.getElementById('lightbox')) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft')  lbStep(-1);
  if (e.key === 'ArrowRight') lbStep(1);
});

// lightbox swipe
let lbTouchX = 0;
document.getElementById('lightbox').addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
document.getElementById('lightbox').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - lbTouchX;
  if (Math.abs(dx) > 50) lbStep(dx < 0 ? 1 : -1);
});

// ═══════════════════════════════════════════════════════════
// SCROLL REVEAL
// ═══════════════════════════════════════════════════════════
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.year-entry').forEach(el => observer.observe(el));

// ═══════════════════════════════════════════════════════════
// CHERRY BLOSSOMS
// ═══════════════════════════════════════════════════════════
const blossomCanvas = document.getElementById('blossom-canvas');
const bCtx = blossomCanvas.getContext('2d');
function resize() { blossomCanvas.width = window.innerWidth; blossomCanvas.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);
const petals = [];
function randomPetal() {
  return { x: Math.random()*window.innerWidth, y: Math.random()*-window.innerHeight,
    size: 6+Math.random()*14, speedY: 0.5+Math.random()*1.4, speedX: -0.4+Math.random()*0.9,
    angle: Math.random()*Math.PI*2, spin: (Math.random()-0.5)*0.045,
    sway: Math.random()*Math.PI*2, swaySpeed: 0.007+Math.random()*0.013, swayAmp: 1.2+Math.random()*3,
    alpha: 0.45+Math.random()*0.35, hue: 328+Math.random()*22 };
}
for (let i = 0; i < 120; i++) { const p = randomPetal(); p.y = Math.random()*window.innerHeight; petals.push(p); }
function drawPetal(c,p) {
  c.save(); c.translate(p.x,p.y); c.rotate(p.angle); c.globalAlpha = p.alpha;
  c.beginPath(); c.ellipse(0,0,p.size*0.5,p.size,0,0,Math.PI*2);
  const g = c.createRadialGradient(0,-p.size*0.3,0,0,0,p.size);
  g.addColorStop(0,`hsla(${p.hue},85%,88%,1)`); g.addColorStop(0.5,`hsla(${p.hue},75%,72%,0.9)`); g.addColorStop(1,`hsla(${p.hue},65%,60%,0)`);
  c.fillStyle=g; c.fill();
  c.beginPath(); c.moveTo(0,-p.size*0.9); c.lineTo(0,p.size*0.5);
  c.strokeStyle=`hsla(${p.hue},60%,55%,0.18)`; c.lineWidth=0.5; c.stroke(); c.restore();
}
let lastT=0;
function animatePetals(t) {
  const dt=Math.min(t-lastT,50); lastT=t;
  bCtx.clearRect(0,0,blossomCanvas.width,blossomCanvas.height);
  for(const p of petals){
    p.sway+=p.swaySpeed; p.angle+=p.spin; p.x+=p.speedX+Math.sin(p.sway)*p.swayAmp; p.y+=p.speedY;
    if(p.y>window.innerHeight+20||p.x<-60||p.x>window.innerWidth+60) Object.assign(p,randomPetal());
    drawPetal(bCtx,p);
  }
  requestAnimationFrame(animatePetals);
}
requestAnimationFrame(animatePetals);