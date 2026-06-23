/* ── BLOSSOM PARTICLES ───────────────────────────────────── */
const blossomCanvas = document.getElementById('blossom-canvas');
const bCtx = blossomCanvas.getContext('2d');
function resizeBC() { blossomCanvas.width = innerWidth; blossomCanvas.height = innerHeight; }
resizeBC(); window.addEventListener('resize', resizeBC);
function mkPetal() {
  return { x: Math.random()*innerWidth, y: Math.random()*-innerHeight,
    size: 5+Math.random()*12, vy: 0.4+Math.random()*1.2, vx: -0.3+Math.random()*0.6,
    angle: Math.random()*Math.PI*2, spin: (Math.random()-.5)*0.04,
    sway: Math.random()*Math.PI*2, swayS: 0.007+Math.random()*0.012, swayA: 1+Math.random()*2.5,
    alpha: 0.35+Math.random()*0.35, hue: 328+Math.random()*22 };
}
const petals = Array.from({length:80},()=>{ const p=mkPetal(); p.y=Math.random()*innerHeight; return p; });
(function loop(){
  bCtx.clearRect(0,0,blossomCanvas.width,blossomCanvas.height);
  for(const p of petals){
    p.sway+=p.swayS; p.angle+=p.spin; p.x+=p.vx+Math.sin(p.sway)*p.swayA; p.y+=p.vy;
    if(p.y>innerHeight+20||p.x<-60||p.x>innerWidth+60) Object.assign(p,mkPetal());
    bCtx.save(); bCtx.translate(p.x,p.y); bCtx.rotate(p.angle); bCtx.globalAlpha=p.alpha;
    bCtx.beginPath(); bCtx.ellipse(0,0,p.size*.52,p.size,0,0,Math.PI*2);
    const g=bCtx.createRadialGradient(0,-p.size*.3,0,0,0,p.size);
    g.addColorStop(0,'hsla('+p.hue+',85%,88%,1)');
    g.addColorStop(.5,'hsla('+p.hue+',75%,72%,.9)');
    g.addColorStop(1,'hsla('+p.hue+',65%,60%,0)');
    bCtx.fillStyle=g; bCtx.fill();
    bCtx.restore();
  }
  requestAnimationFrame(loop);
})();

/* ══════════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════════ */
let gridSize    = 3;
let sourceImg   = null;
let pieces      = [];   // array of piece objects
let moves       = 0;
let startTime   = null;
let timerHandle = null;
let solved      = false;

// Drag state
let dragging    = null;  // { piece, offX, offY }

// Jigsaw edge arrays
let hEdges = [], vEdges = [];

/* ══════════════════════════════════════════════════════════
   JIGSAW SHAPE ENGINE
   hEdges[r][c] → direction of tab on horizontal boundary BELOW row r
   vEdges[r][c] → direction of tab on vertical boundary RIGHT of col c
   +1 = tab protrudes down/right, -1 = blank (neighbour has tab)
══════════════════════════════════════════════════════════ */
function generateEdges(n) {
  hEdges = []; vEdges = [];
  for (let r = 0; r < n-1; r++) {
    hEdges[r] = [];
    for (let c = 0; c < n; c++) hEdges[r][c] = Math.random() < 0.5 ? 1 : -1;
  }
  for (let r = 0; r < n; r++) {
    vEdges[r] = [];
    for (let c = 0; c < n-1; c++) vEdges[r][c] = Math.random() < 0.5 ? 1 : -1;
  }
}

function jigsawPath(ctx, row, col, pw, ph, n) {
  const TAB   = 0.22;
  const NECK  = 0.13;
  const BULGE = 0.28;

  const topDir    = (row > 0)   ? -hEdges[row-1][col] : 0;
  const bottomDir = (row < n-1) ?  hEdges[row][col]   : 0;
  const leftDir   = (col > 0)   ? -vEdges[row][col-1] : 0;
  const rightDir  = (col < n-1) ?  vEdges[row][col]   : 0;

  ctx.beginPath();

  // TOP: left → right
  ctx.moveTo(0, 0);
  if (topDir === 0) {
    ctx.lineTo(pw, 0);
  } else {
    const mx = pw/2, tabH = topDir * TAB * ph;
    ctx.lineTo(mx - BULGE*pw, 0);
    ctx.bezierCurveTo(mx-BULGE*pw, tabH*0.4, mx-NECK*pw, tabH, mx, tabH);
    ctx.bezierCurveTo(mx+NECK*pw, tabH, mx+BULGE*pw, tabH*0.4, mx+BULGE*pw, 0);
    ctx.lineTo(pw, 0);
  }
  // RIGHT: top → bottom
  if (rightDir === 0) {
    ctx.lineTo(pw, ph);
  } else {
    const my = ph/2, tabW = rightDir * TAB * pw;
    ctx.lineTo(pw, my - BULGE*ph);
    ctx.bezierCurveTo(pw+tabW*0.4, my-BULGE*ph, pw+tabW, my-NECK*ph, pw+tabW, my);
    ctx.bezierCurveTo(pw+tabW, my+NECK*ph, pw+tabW*0.4, my+BULGE*ph, pw, my+BULGE*ph);
    ctx.lineTo(pw, ph);
  }
  // BOTTOM: right → left
  if (bottomDir === 0) {
    ctx.lineTo(0, ph);
  } else {
    const mx = pw/2, tabH = bottomDir * TAB * ph;
    ctx.lineTo(mx + BULGE*pw, ph);
    ctx.bezierCurveTo(mx+BULGE*pw, ph+tabH*0.4, mx+NECK*pw, ph+tabH, mx, ph+tabH);
    ctx.bezierCurveTo(mx-NECK*pw, ph+tabH, mx-BULGE*pw, ph+tabH*0.4, mx-BULGE*pw, ph);
    ctx.lineTo(0, ph);
  }
  // LEFT: bottom → top
  if (leftDir === 0) {
    ctx.lineTo(0, 0);
  } else {
    const my = ph/2, tabW = leftDir * TAB * pw;
    ctx.lineTo(0, my + BULGE*ph);
    ctx.bezierCurveTo(-tabW*0.4, my+BULGE*ph, -tabW, my+NECK*ph, -tabW, my);
    ctx.bezierCurveTo(-tabW, my-NECK*ph, -tabW*0.4, my-BULGE*ph, 0, my-BULGE*ph);
    ctx.lineTo(0, 0);
  }
  ctx.closePath();
}

/* ── DEFAULT IMAGE ─────────────────────────────────────────── */
function makeDefaultImage() {
  const size = 600;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const bg = ctx.createLinearGradient(0,0,size,size);
  bg.addColorStop(0,'#fce8f0'); bg.addColorStop(0.5,'#fdf3fb'); bg.addColorStop(1,'#f8e0ee');
  ctx.fillStyle = bg; ctx.fillRect(0,0,size,size);
  function petal(x,y,r,rot,alpha) {
    ctx.save(); ctx.globalAlpha=alpha; ctx.translate(x,y); ctx.rotate(rot);
    ctx.beginPath(); ctx.ellipse(0,-r*.6,r*.45,r,0,0,Math.PI*2);
    const g=ctx.createRadialGradient(0,-r*.5,0,0,0,r);
    g.addColorStop(0,'#ffd5e8'); g.addColorStop(0.6,'#f4a0c4'); g.addColorStop(1,'#e8679a');
    ctx.fillStyle=g; ctx.fill(); ctx.restore();
  }
  function flower(x,y,r,rot,alpha) {
    for(let i=0;i<5;i++) petal(x,y,r,rot+i*Math.PI*2/5,alpha);
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.beginPath(); ctx.arc(x,y,r*.18,0,Math.PI*2);
    ctx.fillStyle='#ffd700'; ctx.fill(); ctx.restore();
  }
  [[300,300,80,0,0.9],[100,120,55,0.5,0.75],[500,80,45,1,0.7],
   [80,450,60,0.3,0.72],[520,420,70,1.2,0.8],[200,500,50,0.8,0.65],
   [450,200,40,0.4,0.6],[150,280,35,1.5,0.55],[400,480,45,0.6,0.68],
   [50,250,30,2,0.5],[550,300,38,1.8,0.58],[320,120,42,0.9,0.62]]
  .forEach(([x,y,r,rot,a])=>flower(x,y,r,rot,a));
  for(let i=0;i<30;i++)
    petal(Math.random()*size,Math.random()*size,8+Math.random()*18,Math.random()*Math.PI*2,0.3+Math.random()*0.4);
  ctx.save(); ctx.globalAlpha=0.18; ctx.fillStyle='#c9933a';
  ctx.font='italic bold 36px serif'; ctx.textAlign='center';
  ctx.fillText('Chronicles of Us',size/2,size-48); ctx.restore();
  const img=new Image(); img.src=c.toDataURL(); return img;
}

/* ══════════════════════════════════════════════════════════
   CANVAS BOARD SETUP
   The board div is now a single <canvas> that fills .board
══════════════════════════════════════════════════════════ */
const boardWrap  = document.querySelector('.board-wrap');
const boardDiv   = document.getElementById('board');
const boardGhost = document.getElementById('board-ghost');
const statMoves  = document.getElementById('stat-moves');
const statTime   = document.getElementById('stat-time');
const statLeft   = document.getElementById('stat-left');

// Replace the board div with a canvas
const gameCanvas = document.createElement('canvas');
gameCanvas.id = 'game-canvas';
gameCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;cursor:default;border-radius:6px;';
boardDiv.style.overflow = 'hidden';
boardDiv.appendChild(gameCanvas);
const gCtx = gameCanvas.getContext('2d');

// We need to keep track of board pixel size
let boardW = 0, boardH = 0;

function resizeGameCanvas() {
  const rect = boardDiv.getBoundingClientRect();
  boardW = rect.width;
  boardH = rect.height;
  gameCanvas.width  = boardW;
  gameCanvas.height = boardH;
  render();
}
window.addEventListener('resize', () => { resizeGameCanvas(); });

/* ══════════════════════════════════════════════════════════
   PIECE DATA
   Each piece: { id, row, col, canvas, snapX, snapY, x, y, snapped, zIndex }
   snapX/snapY = where it belongs (top-left of its cell, offset for PAD)
   x/y         = current top-left position on gameCanvas
══════════════════════════════════════════════════════════ */

/* ── RENDER ──────────────────────────────────────────────── */
function render() {
  if (!boardW || !boardH) return;
  gCtx.clearRect(0, 0, boardW, boardH);

  // Draw ghost grid lines
  if (pieces.length > 0) {
    const n = gridSize;
    const cellW = boardW / n;
    const cellH = boardH / n;
    gCtx.save();
    gCtx.strokeStyle = 'rgba(217,79,135,0.10)';
    gCtx.lineWidth = 1;
    for (let i = 1; i < n; i++) {
      gCtx.beginPath(); gCtx.moveTo(i*cellW,0); gCtx.lineTo(i*cellW,boardH); gCtx.stroke();
      gCtx.beginPath(); gCtx.moveTo(0,i*cellH); gCtx.lineTo(boardW,i*cellH); gCtx.stroke();
    }
    gCtx.restore();
  }

  // Draw pieces sorted by zIndex
  const sorted = [...pieces].sort((a,b) => a.zIndex - b.zIndex);
  for (const p of sorted) {
    gCtx.save();
    gCtx.translate(p.x, p.y);
    // Shadow
    gCtx.shadowColor = p.snapped ? 'rgba(217,79,135,0.55)' : 'rgba(42,14,30,0.28)';
    gCtx.shadowBlur  = p.snapped ? 14 : 8;
    gCtx.shadowOffsetX = 0; gCtx.shadowOffsetY = p.snapped ? 0 : 3;
    gCtx.drawImage(p.canvas, 0, 0);
    gCtx.restore();
  }
}

/* ── BUILD PUZZLE ────────────────────────────────────────── */
function buildPuzzle() {
  if (!sourceImg) return;
  clearTimer(); solved=false; moves=0; startTime=null; dragging=null;
  statMoves.textContent='0'; statTime.textContent='0:00'; pieces=[];

  const n = gridSize;
  generateEdges(n);

  // Square-crop source
  const SRC = 600;
  const sq = document.createElement('canvas');
  sq.width = sq.height = SRC;
  const sqCtx = sq.getContext('2d');
  const imgMin = Math.min(sourceImg.naturalWidth, sourceImg.naturalHeight);
  const sx = (sourceImg.naturalWidth  - imgMin) / 2;
  const sy = (sourceImg.naturalHeight - imgMin) / 2;
  sqCtx.drawImage(sourceImg, sx, sy, imgMin, imgMin, 0, 0, SRC, SRC);

  // Ghost image
  boardGhost.innerHTML='';
  const gi=document.createElement('img');
  gi.src=sourceImg.src; boardGhost.appendChild(gi);

  requestAnimationFrame(()=>{
    resizeGameCanvas();
    const cellW = boardW / n;
    const cellH = boardH / n;
    const pw    = SRC / n;
    const ph    = SRC / n;
    const scale = cellW / pw;
    const TAB   = 0.22;
    const PAD   = Math.ceil(TAB * pw * scale) + 4;

    const order = shuffle([...Array(n*n).keys()]);

    order.forEach((id, zi) => {
      const row = Math.floor(id / n);
      const col = id % n;

      const cw = Math.ceil(cellW + PAD*2);
      const ch = Math.ceil(cellH + PAD*2);
      const pc = document.createElement('canvas');
      pc.width = cw; pc.height = ch;
      const pCtx = pc.getContext('2d');

      pCtx.save();
      pCtx.translate(PAD, PAD);
      jigsawPath(pCtx, row, col, cellW, cellH, n);
      pCtx.clip();

      const srcPad = PAD / scale;
      const srcX   = col * pw - srcPad;
      const srcY   = row * ph - srcPad;
      const csx    = Math.max(0, srcX);
      const csy    = Math.max(0, srcY);
      const cex    = Math.min(SRC, srcX + pw + srcPad*2);
      const cey    = Math.min(SRC, srcY + ph + srcPad*2);
      const cdx    = (csx - srcX) * scale;
      const cdy    = (csy - srcY) * scale;
      pCtx.drawImage(sq, csx, csy, cex-csx, cey-csy, cdx, cdy, (cex-csx)*scale, (cey-csy)*scale);
      pCtx.restore();

      // Outline
      pCtx.save();
      pCtx.translate(PAD, PAD);
      jigsawPath(pCtx, row, col, cellW, cellH, n);
      pCtx.strokeStyle='rgba(255,255,255,0.65)'; pCtx.lineWidth=2; pCtx.stroke();
      pCtx.strokeStyle='rgba(42,14,30,0.18)';    pCtx.lineWidth=1; pCtx.stroke();
      pCtx.restore();

      // Snap-to position (where piece top-left should be when placed correctly)
      const snapX = col * cellW - PAD;
      const snapY = row * cellH - PAD;

      // Scatter randomly — keep pieces inside the board with a margin
      const margin = 20;
      const rx = margin + Math.random() * Math.max(0, boardW - cw - margin*2);
      const ry = margin + Math.random() * Math.max(0, boardH - ch - margin*2);

      pieces.push({
        id, row, col,
        canvas: pc,
        snapX, snapY,
        x: rx, y: ry,
        snapped: false,
        zIndex: zi,
        pad: PAD,
        cellW, cellH,
        cw, ch
      });
    });

    updatePiecesLeft();
    render();
  });
}

/* ── SNAP THRESHOLD ─────────────────────────────────────── */
function snapThreshold() {
  const cellW = boardW / gridSize;
  return Math.max(22, cellW * 0.18);
}

/* ── MOUSE / TOUCH DRAG ──────────────────────────────────── */
function hitPiece(mx, my) {
  // top-most (highest zIndex) piece hit
  const sorted = [...pieces].filter(p => !p.snapped).sort((a,b) => b.zIndex - a.zIndex);
  for (const p of sorted) {
    if (mx >= p.x && mx <= p.x + p.cw && my >= p.y && my <= p.y + p.ch) {
      // pixel-level check: use clip path hit test
      const lx = mx - p.x - p.pad;
      const ly = my - p.y - p.pad;
      const hitCtx = document.createElement('canvas').getContext('2d');
      hitCtx.canvas.width = p.cw; hitCtx.canvas.height = p.ch;
      jigsawPath(hitCtx, p.row, p.col, p.cellW, p.cellH, gridSize);
      if (hitCtx.isPointInPath(lx, ly)) return p;
    }
  }
  return null;
}

function getCanvasPos(e) {
  const rect = gameCanvas.getBoundingClientRect();
  const scaleX = boardW / rect.width;
  const scaleY = boardH / rect.height;
  const src = e.touches ? e.touches[0] : e;
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top)  * scaleY
  };
}

function onPointerDown(e) {
  if (solved) return;
  const {x, y} = getCanvasPos(e);
  const p = hitPiece(x, y);
  if (!p) return;
  e.preventDefault();
  // Bring to top
  const maxZ = Math.max(...pieces.map(p=>p.zIndex));
  p.zIndex = maxZ + 1;
  dragging = { piece: p, offX: x - p.x, offY: y - p.y };
  if (!startTime) { startTime=Date.now(); startTimer(); }
  gameCanvas.style.cursor = 'grabbing';
}

function onPointerMove(e) {
  if (!dragging) return;
  e.preventDefault();
  const {x, y} = getCanvasPos(e);
  dragging.piece.x = x - dragging.offX;
  dragging.piece.y = y - dragging.offY;
  render();
}

function onPointerUp(e) {
  if (!dragging) return;
  const p = dragging.piece;
  dragging = null;
  gameCanvas.style.cursor = 'default';

  // Snap check
  const thresh = snapThreshold();
  const dx = p.x - p.snapX;
  const dy = p.y - p.snapY;
  if (Math.abs(dx) < thresh && Math.abs(dy) < thresh) {
    p.x = p.snapX;
    p.y = p.snapY;
    p.snapped = true;
    moves++;
    statMoves.textContent = moves;
    updatePiecesLeft();
    render();
    checkWin();
    return;
  }

  // Keep it inside board bounds loosely
  p.x = Math.max(-p.pad, Math.min(boardW - p.cw + p.pad, p.x));
  p.y = Math.max(-p.pad, Math.min(boardH - p.ch + p.pad, p.y));
  moves++;
  statMoves.textContent = moves;
  render();
}

gameCanvas.addEventListener('mousedown',  onPointerDown);
window.addEventListener('mousemove',      onPointerMove);
window.addEventListener('mouseup',        onPointerUp);
gameCanvas.addEventListener('touchstart', onPointerDown, {passive:false});
window.addEventListener('touchmove',      onPointerMove, {passive:false});
window.addEventListener('touchend',       onPointerUp);

/* ── SHUFFLE ─────────────────────────────────────────────── */
function shufflePieces() {
  pieces.forEach((p, i) => {
    p.snapped = false;
    const margin = 20;
    p.x = margin + Math.random() * Math.max(0, boardW - p.cw - margin*2);
    p.y = margin + Math.random() * Math.max(0, boardH - p.ch - margin*2);
    p.zIndex = i;
  });
  moves=0; solved=false;
  statMoves.textContent='0';
  clearTimer(); startTime=null; statTime.textContent='0:00';
  updatePiecesLeft();
  render();
}

/* ── SOLVE ───────────────────────────────────────────────── */
function solvePuzzle() {
  pieces.forEach(p => {
    p.x = p.snapX;
    p.y = p.snapY;
    p.snapped = true;
  });
  updatePiecesLeft();
  clearTimer();
  render();
  setTimeout(triggerWin, 300);
}

/* ── HELPERS ─────────────────────────────────────────────── */
function shuffle(arr) {
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function updatePiecesLeft() {
  const left = pieces.filter(p => !p.snapped).length;
  statLeft.textContent = left;
}

function checkWin() {
  if (pieces.length && pieces.every(p => p.snapped) && !solved) {
    clearTimer();
    triggerWin();
  }
}

function triggerWin() {
  solved = true;
  const elapsed = startTime ? Math.floor((Date.now()-startTime)/1000) : 0;
  const m = Math.floor(elapsed/60), s = elapsed%60;
  document.getElementById('win-moves').textContent = moves;
  document.getElementById('win-time').textContent  = m+':'+(s<10?'0':'')+s;
  document.getElementById('win-overlay').classList.add('show');
}

function startTimer() {
  timerHandle = setInterval(()=>{
    if (!startTime) return;
    const elapsed = Math.floor((Date.now()-startTime)/1000);
    const m = Math.floor(elapsed/60), s = elapsed%60;
    statTime.textContent = m+':'+(s<10?'0':'')+s;
  }, 1000);
}
function clearTimer() { clearInterval(timerHandle); timerHandle=null; }

/* ── DOM INIT ─────────────────────────────────────────────── */
const peekOverlay = document.getElementById('peek-overlay');
const peekImg     = document.getElementById('peek-img');

document.getElementById('btn-peek').addEventListener('click', ()=>{
  if (!sourceImg) return;
  peekImg.src = sourceImg.src;
  peekOverlay.classList.add('show');
});
peekOverlay.addEventListener('click', ()=> peekOverlay.classList.remove('show'));

document.getElementById('btn-shuffle').addEventListener('click', ()=>{
  if (pieces.length) shufflePieces(); else buildPuzzle();
});
document.getElementById('btn-solve').addEventListener('click', solvePuzzle);

document.getElementById('win-play-again').addEventListener('click', ()=>{
  document.getElementById('win-overlay').classList.remove('show');
  buildPuzzle();
});

document.getElementById('img-file').addEventListener('change', e=>{
  const file=e.target.files[0]; if(!file) return;
  document.getElementById('file-pick-label').textContent=file.name.slice(0,18);
  const reader=new FileReader();
  reader.onload=ev=>{
    const img=new Image();
    img.onload=()=>{ sourceImg=img; buildPuzzle(); };
    img.src=ev.target.result;
  };
  reader.readAsDataURL(file);
});

document.querySelectorAll('.diff-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.diff-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    gridSize=parseInt(btn.dataset.grid);
    buildPuzzle();
  });
});

/* ── START ───────────────────────────────────────────────── */
window.addEventListener('load', ()=>{
  const img = makeDefaultImage();
  img.onload = ()=>{ sourceImg=img; buildPuzzle(); };
});