// ══════════════════════════════════════════════════════
//  PERSISTENT AUDIO
//  Include this script on EVERY page (as early in <body> as
//  possible) so a track keeps playing across navigation until
//  it finishes. Exposes window.PersistentAudio.
// ══════════════════════════════════════════════════════
(function () {
  const STORAGE_KEY = 'vinylPlayerState';
  const SAVE_INTERVAL_MS = 1000;
  const STALE_MS = 6 * 60 * 60 * 1000; // ignore saved state older than 6h

  function readState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }
  function writeState(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function clearState() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  // ── shared <audio> element (created once, survives via localStorage across page loads) ──
  const audio = document.createElement('audio');
  audio.id = 'pa-shared-audio';
  audio.preload = 'metadata';
  audio.style.display = 'none';
  (document.body || document.documentElement).appendChild(audio);

  let track = null; // { id, title, artist, src }
  const listeners = [];

  function getPublicState() {
    return {
      track,
      playing: !!track && !audio.paused && !audio.ended,
      currentTime: audio.currentTime,
      duration: audio.duration,
    };
  }
  function notify() {
    const s = getPublicState();
    listeners.forEach(fn => { try { fn(s); } catch (e) {} });
  }
  function persist() {
    if (!track) { clearState(); return; }
    writeState({
      id: track.id, title: track.title, artist: track.artist, src: track.src,
      currentTime: audio.currentTime || 0,
      playing: !audio.paused,
      savedAt: Date.now(),
    });
  }

  function load(t, autoplay = true, startAt = 0) {
    track = t;
    audio.src = t.src;
    audio.currentTime = startAt || 0;
    audio.load();
    if (autoplay) doPlay(); else { notify(); persist(); }
  }
  function doPlay() {
    if (!track) return;
    const p = audio.play();
    if (p && p.catch) p.catch(() => notify()); // autoplay may be blocked; UI reflects real state
    notify(); persist();
  }
  function doPause() { audio.pause(); persist(); notify(); }
  function toggle() { if (!track) return; audio.paused ? doPlay() : doPause(); }
  function eject() {
    audio.pause();
    audio.removeAttribute('src'); audio.load();
    track = null; clearState(); notify();
  }

  audio.addEventListener('timeupdate', notify);
  audio.addEventListener('play', notify);
  audio.addEventListener('pause', () => { persist(); notify(); });
  audio.addEventListener('ended', () => { track = null; clearState(); notify(); });

  setInterval(() => { if (track && !audio.paused) persist(); }, SAVE_INTERVAL_MS);
  window.addEventListener('pagehide', persist);
  window.addEventListener('beforeunload', persist);

  // ── resume whatever was playing, on whatever page loads next ──
  const saved = readState();
  if (saved && saved.src && (Date.now() - (saved.savedAt || 0)) < STALE_MS) {
    track = { id: saved.id, title: saved.title, artist: saved.artist, src: saved.src };
    audio.src = saved.src;
    audio.currentTime = saved.currentTime || 0;
    if (saved.playing) {
      const p = audio.play();
      if (p && p.catch) p.catch(() => notify()); // blocked until a user gesture on this page
    }
  } else if (saved) {
    clearState();
  }

  window.PersistentAudio = {
    audio, load, play: doPlay, pause: doPause, toggle, eject,
    getState: getPublicState,
    subscribe(fn) { listeners.push(fn); fn(getPublicState()); return () => { const i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1); }; },
  };

  // ── floating mini-player (skipped on the page that has the full turntable) ──
  if (document.getElementById('platter-well')) return;

  function fmt(s) { if (!isFinite(s)) return '0:00'; return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; }

  const style = document.createElement('style');
  style.textContent = `
    #pa-mini { position:fixed; right:22px; bottom:22px; z-index:99999;
      display:flex; align-items:center; gap:12px; padding:10px 16px 10px 10px;
      background:rgba(42,14,30,0.86); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
      border:1px solid rgba(217,79,135,0.28); border-radius:14px;
      box-shadow:0 12px 30px rgba(42,14,30,0.35);
      font-family:'Lato', sans-serif; color:#f6dbe8;
      transform:translateY(120%); opacity:0; pointer-events:none;
      transition:transform .45s cubic-bezier(.22,1,.36,1), opacity .4s;
      max-width:min(320px, calc(100vw - 44px));
    }
    #pa-mini.show { transform:translateY(0); opacity:1; pointer-events:auto; }
    #pa-mini .pa-disc { width:38px; height:38px; border-radius:50%; flex-shrink:0;
      background:radial-gradient(circle at 35% 32%, #d94f87, #4a1226 70%);
      display:flex; align-items:center; justify-content:center; }
    #pa-mini .pa-disc::after { content:''; width:9px; height:9px; border-radius:50%; background:#1a0810; }
    #pa-mini.playing .pa-disc { animation: pa-spin 2.4s linear infinite; }
    @keyframes pa-spin { to { transform:rotate(360deg); } }
    #pa-mini .pa-info { flex:1; min-width:0; }
    #pa-mini .pa-title { font-size:.68rem; letter-spacing:.05em; font-weight:700; color:#fff;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #pa-mini .pa-artist { font-size:.58rem; letter-spacing:.05em; color:rgba(246,219,232,.65);
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:1px; }
    #pa-mini .pa-bar { width:100%; height:2px; background:rgba(217,79,135,.2); border-radius:1px; margin-top:6px; overflow:hidden; cursor:pointer; }
    #pa-mini .pa-fill { height:100%; width:0%; background:linear-gradient(to right,#d94f87,#e8679a); }
    #pa-mini .pa-btn { width:28px; height:28px; border-radius:50%; flex-shrink:0; cursor:pointer;
      background:rgba(217,79,135,.12); border:1px solid rgba(217,79,135,.3);
      display:flex; align-items:center; justify-content:center; transition:background .2s; }
    #pa-mini .pa-btn:hover { background:rgba(217,79,135,.24); }
    #pa-mini .pa-btn svg { width:12px; height:12px; fill:#f6a8c8; stroke:#f6a8c8; }
    #pa-mini .pa-close { width:18px; height:18px; cursor:pointer; opacity:.5; flex-shrink:0; transition:opacity .2s; }
    #pa-mini .pa-close:hover { opacity:1; }
    #pa-mini .pa-close svg { width:100%; height:100%; stroke:#f6dbe8; fill:none; stroke-width:1.6; }
    @media (max-width:480px) { #pa-mini { left:14px; right:14px; } }
  `;
  document.head.appendChild(style);

  const el = document.createElement('div');
  el.id = 'pa-mini';
  el.innerHTML = `
    <div class="pa-disc"></div>
    <div class="pa-info">
      <div class="pa-title">—</div>
      <div class="pa-artist">—</div>
      <div class="pa-bar"><div class="pa-fill"></div></div>
    </div>
    <div class="pa-btn" title="Play / Pause">
      <svg viewBox="0 0 24 24" class="pa-icon"><polygon points="5 3 19 12 5 21"/></svg>
    </div>
    <div class="pa-close" title="Stop">
      <svg viewBox="0 0 24 24"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>
    </div>`;

  function mount() {
    document.body.appendChild(el);
    const titleEl = el.querySelector('.pa-title');
    const artistEl = el.querySelector('.pa-artist');
    const fillEl = el.querySelector('.pa-fill');
    const barEl = el.querySelector('.pa-bar');
    const btnEl = el.querySelector('.pa-btn');
    const iconEl = el.querySelector('.pa-icon');
    const closeEl = el.querySelector('.pa-close');

    function render(s) {
      if (!s.track) { el.classList.remove('show'); return; }
      el.classList.add('show');
      titleEl.textContent = s.track.title;
      artistEl.textContent = s.track.artist;
      el.classList.toggle('playing', s.playing);
      iconEl.innerHTML = s.playing
        ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
        : '<polygon points="5 3 19 12 5 21"/>';
      if (isFinite(s.duration) && s.duration > 0) fillEl.style.width = (s.currentTime / s.duration * 100) + '%';
    }

    btnEl.addEventListener('click', () => window.PersistentAudio.toggle());
    closeEl.addEventListener('click', () => window.PersistentAudio.eject());
    barEl.addEventListener('click', e => {
      const a = window.PersistentAudio.audio;
      if (!a.duration) return;
      const r = barEl.getBoundingClientRect();
      a.currentTime = ((e.clientX - r.left) / r.width) * a.duration;
    });

    window.PersistentAudio.subscribe(render);
  }

  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();