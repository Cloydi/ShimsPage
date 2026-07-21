// ══════════════════════════════════════════════════════
//  VINYL DATA
//  Add as many entries as you like.
//  src: relative path to .mp3 / .ogg
//  color1, color2: body gradient; labelColor: center circle
// ══════════════════════════════════════════════════════
const VINYLS = [
  {
    id: 'v0',
    title: 'About You',
    artist: 'The 1975',
    src: '../assets/music/The 1975 - About You (Official).mp3',
    color1: '#b03070', color2: '#6a0e38', grooveColor: 'rgba(200,60,110,.32)', labelColor: '#d94f87',
  },
  {
    id: 'v1',
    title: 'Our Song',
    artist: 'For Shim',
    src: '../assets/music/track1.mp3',
    color1: '#6a2e90', color2: '#30103e', grooveColor: 'rgba(140,60,190,.32)', labelColor: '#b070e0',
  },
  {
    id: 'v2',
    title: 'Puso Ko',
    artist: 'For Shim',
    src: '../assets/music/track2.mp3',
    color1: '#b83828', color2: '#6a1210', grooveColor: 'rgba(200,70,50,.32)', labelColor: '#e07060',
  },
  {
    id: 'v3',
    title: 'Ikaw',
    artist: 'For Shim',
    src: '../assets/music/track3.mp3',
    color1: '#286090', color2: '#0e2840', grooveColor: 'rgba(50,100,170,.32)', labelColor: '#5090c8',
  },
  {
    id: 'v4',
    title: 'Sayo',
    artist: 'For Shim',
    src: '../assets/music/track4.mp3',
    color1: '#307840', color2: '#10321a', grooveColor: 'rgba(60,140,70,.32)', labelColor: '#60b870',
  },
];

// ══════════════════════════════════════════════════════
//  BUILD VINYL SVG
// ══════════════════════════════════════════════════════
function buildSVG(v, size = 148) {
  const c = size / 2;
  const rs = [.94,.86,.78,.70,.62,.54,.46];
  const rings = rs.map(r =>
    `<circle cx="${c}" cy="${c}" r="${c*r}" fill="none" stroke="${v.grooveColor}" stroke-width=".7"/>`).join('');
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg-${v.id}-${size}" cx="40%" cy="33%">
      <stop offset="0%" stop-color="${v.color1}"/>
      <stop offset="100%" stop-color="${v.color2}"/>
    </radialGradient>
    <radialGradient id="lb-${v.id}-${size}" cx="50%" cy="44%">
      <stop offset="0%" stop-color="${v.labelColor}" stop-opacity=".9"/>
      <stop offset="100%" stop-color="${v.color2}" stop-opacity=".7"/>
    </radialGradient>
  </defs>
  <circle cx="${c}" cy="${c}" r="${c}" fill="url(#bg-${v.id}-${size})"/>
  ${rings}
  <path d="M ${c*.28} ${c*.13} A ${c*.84} ${c*.84} 0 0 1 ${c*1.52} ${c*.54}"
        fill="none" stroke="rgba(255,255,255,0.055)" stroke-width="${size*.11}" stroke-linecap="round"/>
  <circle cx="${c}" cy="${c}" r="${c*.3}" fill="url(#lb-${v.id}-${size})"/>
  <circle cx="${c}" cy="${c}" r="${c*.045}" fill="#0e0508"/>
</svg>`;
}

// ══════════════════════════════════════════════════════
//  RENDER SHELF
// ══════════════════════════════════════════════════════
const shelfEl = document.getElementById('vinyl-stack');
VINYLS.forEach(v => {
  const row = document.createElement('div');
  row.className = 'vinyl-row';

  const disc = document.createElement('div');
  disc.className = 'vinyl';
  disc.id = v.id;
  disc.dataset.vid = v.id;
  disc.innerHTML = buildSVG(v, 148) +
    `<div class="vinyl-label-text"><div class="vtitle">${v.title}</div><div class="vartist">${v.artist}</div></div>`;

  const info = document.createElement('div');
  info.className = 'vinyl-info';
  info.innerHTML = `<div class="vi-title">${v.title}</div>
    <div class="vi-artist">${v.artist}</div>
    <div class="vi-hint"><svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>Drag to player</div>`;

  row.appendChild(disc);
  row.appendChild(info);
  shelfEl.appendChild(row);
});

// ══════════════════════════════════════════════════════
//  PLAYER STATE
// ══════════════════════════════════════════════════════
const audio   = document.getElementById('audio-el');
const tonearm = document.getElementById('tonearm');
const pVinyl  = document.getElementById('player-vinyl');
const dropRing  = document.getElementById('drop-ring');
const dropPrompt= document.getElementById('drop-prompt');
const nowPlaying= document.getElementById('now-playing');
const progWrap  = document.getElementById('progress-wrap');
const ctrlRow   = document.getElementById('ctrl-row');
const progFill  = document.getElementById('progress-fill');
const timeCur   = document.getElementById('time-cur');
const timeDur   = document.getElementById('time-dur');
const npTitle   = document.getElementById('np-title');
const npArtist  = document.getElementById('np-artist');
const btnPlay   = document.getElementById('btn-play');
const playIcon  = document.getElementById('play-icon');

let currentV = null, playing = false;

function fmt(s) {
  if (!isFinite(s)) return '0:00';
  return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
}

function setPlaying(on) {
  playing = on;
  if (on) {
    audio.play().catch(()=>{});
    pVinyl.classList.remove('slowing'); pVinyl.classList.add('spinning');
    tonearm.classList.remove('parked','landing'); tonearm.classList.add('playing');
    playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  } else {
    audio.pause();
    pVinyl.classList.remove('spinning'); pVinyl.classList.add('slowing');
    setTimeout(()=>{ if(!playing) pVinyl.classList.remove('slowing'); }, 3500);
    tonearm.classList.remove('playing'); tonearm.classList.add('landing');
    playIcon.innerHTML = '<polygon points="5 3 19 12 5 21"/>';
  }
}

function loadVinyl(v, autoplay = true) {
  // return previous to shelf
  if (currentV) document.getElementById(currentV.id).classList.remove('on-player');

  currentV = v;
  document.getElementById(v.id).classList.add('on-player');

  pVinyl.innerHTML = buildSVG(v, 200);
  pVinyl.classList.add('visible');
  dropPrompt.classList.add('hidden');

  npTitle.textContent  = v.title;
  npArtist.textContent = v.artist;
  nowPlaying.classList.add('visible');
  progWrap.classList.add('visible');
  ctrlRow.classList.add('visible');

  audio.src = v.src; audio.load();
  if (autoplay) setPlaying(true);
}

function eject() {
  if (!currentV) return;
  setPlaying(false);
  audio.src = '';
  const vid = currentV.id;
  currentV = null;
  setTimeout(() => {
    document.getElementById(vid).classList.remove('on-player');
    pVinyl.classList.remove('visible','spinning','slowing'); pVinyl.innerHTML = '';
    dropPrompt.classList.remove('hidden');
    nowPlaying.classList.remove('visible');
    progWrap.classList.remove('visible');
    ctrlRow.classList.remove('visible');
    tonearm.classList.remove('playing','landing'); tonearm.classList.add('parked');
    npTitle.textContent='—'; npArtist.textContent='—';
    progFill.style.width='0%'; timeCur.textContent='0:00'; timeDur.textContent='0:00';
  }, 380);
  toast('Vinyl ejected');
}

audio.addEventListener('timeupdate', () => {
  if (!isFinite(audio.duration)) return;
  progFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
  timeCur.textContent = fmt(audio.currentTime);
  timeDur.textContent = fmt(audio.duration);
});
audio.addEventListener('loadedmetadata', () => { timeDur.textContent = fmt(audio.duration); });
audio.addEventListener('ended', () => {
  progFill.style.width='0%'; setPlaying(false);
  tonearm.classList.remove('playing','landing'); tonearm.classList.add('parked');
});

document.getElementById('progress-bar').addEventListener('click', e => {
  if (!audio.duration) return;
  const r = e.currentTarget.getBoundingClientRect();
  audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
});
btnPlay.addEventListener('click', () => {
  if (!currentV) return toast('Drop a vinyl on the player first!');
  setPlaying(!playing);
});
document.getElementById('btn-eject').addEventListener('click', eject);
document.getElementById('btn-prev').addEventListener('click', () => {
  if (!currentV) return;
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  const idx = VINYLS.findIndex(v=>v.id===currentV.id);
  loadVinyl(VINYLS[(idx-1+VINYLS.length)%VINYLS.length], playing);
});
document.getElementById('spd33').addEventListener('click', () => {
  document.getElementById('spd33').classList.add('on');
  document.getElementById('spd45').classList.remove('on');
});
document.getElementById('spd45').addEventListener('click', () => {
  document.getElementById('spd45').classList.add('on');
  document.getElementById('spd33').classList.remove('on');
});

// ══════════════════════════════════════════════════════
//  DRAG & DROP
// ══════════════════════════════════════════════════════
const ghost = document.getElementById('drag-ghost');
const platterWell = document.getElementById('platter-well');
let dragging = null, dragV = null;

function platterCenter() {
  const r = platterWell.getBoundingClientRect();
  return { x: r.left + r.width/2, y: r.top + r.height/2 };
}
function distToPlatter(cx, cy) {
  const c = platterCenter(); return Math.hypot(cx-c.x, cy-c.y);
}

document.querySelectorAll('.vinyl').forEach(el => {
  el.addEventListener('pointerdown', e => {
    if (el.classList.contains('on-player')) return;
    e.preventDefault(); el.setPointerCapture(e.pointerId);
    dragging = el;
    dragV = VINYLS.find(v=>v.id===el.dataset.vid);
    ghost.innerHTML = buildSVG(dragV, 148);
    ghost.style.width = '148px'; ghost.style.height = '148px';
    ghost.classList.add('active');
    ghost.style.left = e.clientX+'px'; ghost.style.top = e.clientY+'px';
    el.classList.add('dragging');
  });
});

document.addEventListener('pointermove', e => {
  if (!dragging) return;
  ghost.style.left = e.clientX+'px'; ghost.style.top = e.clientY+'px';
  const r = platterWell.getBoundingClientRect().width / 2;
  dropRing.classList.toggle('active', distToPlatter(e.clientX,e.clientY) < r + 36);
});

document.addEventListener('pointerup', e => {
  if (!dragging) return;
  const r = platterWell.getBoundingClientRect().width / 2;
  const onTarget = distToPlatter(e.clientX, e.clientY) < r + 40;

  dragging.classList.remove('dragging');
  ghost.classList.remove('active');
  dropRing.classList.remove('active');

  if (onTarget) {
    if (!currentV || currentV.id !== dragV.id) {
      toast('♪ ' + dragV.title);
      loadVinyl(dragV, true);
    }
  }
  dragging = null; dragV = null;
});

// ══════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════
let toastT;
const toastEl = document.getElementById('toast');
function toast(msg) {
  toastEl.textContent = msg; toastEl.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(()=>toastEl.classList.remove('show'), 2500);
}

// ══════════════════════════════════════════════════════
//  CHERRY BLOSSOMS
// ══════════════════════════════════════════════════════
const bc = document.getElementById('blossom-canvas');
const bx = bc.getContext('2d');
function rsz() { bc.width=innerWidth; bc.height=innerHeight; }
rsz(); window.addEventListener('resize',rsz);
const pts=[]; function rpt(){return{x:Math.random()*innerWidth,y:Math.random()*-innerHeight,size:5+Math.random()*13,speedY:.45+Math.random()*1.3,speedX:-.4+Math.random()*.8,angle:Math.random()*Math.PI*2,spin:(Math.random()-.5)*.04,sway:Math.random()*Math.PI*2,swaySpeed:.007+Math.random()*.012,swayAmp:1+Math.random()*2.8,alpha:.4+Math.random()*.28,hue:328+Math.random()*22};}
for(let i=0;i<80;i++){const p=rpt();p.y=Math.random()*innerHeight;pts.push(p);}
function drwp(c,p){c.save();c.translate(p.x,p.y);c.rotate(p.angle);c.globalAlpha=p.alpha;c.beginPath();c.ellipse(0,0,p.size*.5,p.size,0,0,Math.PI*2);const g=c.createRadialGradient(0,-p.size*.3,0,0,0,p.size);g.addColorStop(0,`hsla(${p.hue},85%,88%,1)`);g.addColorStop(.5,`hsla(${p.hue},75%,72%,.9)`);g.addColorStop(1,`hsla(${p.hue},65%,60%,0)`);c.fillStyle=g;c.fill();c.restore();}
function anim(){bx.clearRect(0,0,bc.width,bc.height);for(const p of pts){p.sway+=p.swaySpeed;p.angle+=p.spin;p.x+=p.speedX+Math.sin(p.sway)*p.swayAmp;p.y+=p.speedY;if(p.y>innerHeight+20||p.x<-60||p.x>innerWidth+60)Object.assign(p,rpt());drwp(bx,p);}requestAnimationFrame(anim);}
requestAnimationFrame(anim);