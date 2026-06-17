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
const petals = Array.from({length:80},()=>{const p=mkPetal();p.y=Math.random()*innerHeight;return p;});
(function loop(){
  bCtx.clearRect(0,0,blossomCanvas.width,blossomCanvas.height);
  for(const p of petals){
    p.sway+=p.swayS; p.angle+=p.spin; p.x+=p.vx+Math.sin(p.sway)*p.swayA; p.y+=p.vy;
    if(p.y>innerHeight+20||p.x<-60||p.x>innerWidth+60) Object.assign(p,mkPetal());
    bCtx.save(); bCtx.translate(p.x,p.y); bCtx.rotate(p.angle); bCtx.globalAlpha=p.alpha;
    bCtx.beginPath(); bCtx.ellipse(0,0,p.size*.52,p.size,0,0,Math.PI*2);
    const g=bCtx.createRadialGradient(0,-p.size*.3,0,0,0,p.size);
    g.addColorStop(0,`hsla(${p.hue},85%,88%,1)`);
    g.addColorStop(.5,`hsla(${p.hue},75%,72%,.9)`);
    g.addColorStop(1,`hsla(${p.hue},65%,60%,0)`);
    bCtx.fillStyle=g; bCtx.fill();
    bCtx.beginPath(); bCtx.moveTo(0,-p.size*.85); bCtx.lineTo(0,p.size*.45);
    bCtx.strokeStyle=`hsla(${p.hue},60%,55%,.15)`; bCtx.lineWidth=0.5; bCtx.stroke();
    bCtx.restore();
  }
  requestAnimationFrame(loop);
})();

/* ── STATE ─────────────────────────────────────────────────── */
let gridSize    = 3;
let sourceImg   = null;   // HTMLImageElement
let pieces      = [];     // array of piece objects {id, correctCell, placed}
let moves       = 0;
let startTime   = null;
let timerHandle = null;
let dragPieceId = null;   // piece id being dragged
let solved      = false;

/* Piece object:
   id          : number (0-based, row-major)
   correctCell : number (which board cell it belongs to)
   placed      : boolean
   el          : DOM element (.piece)
*/

/* ── DEFAULT SAKURA IMAGE (drawn on canvas, no external file needed) ── */
function makeDefaultImage() {
  const size = 600;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');

  // soft gradient background
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#fce8f0');
  bg.addColorStop(0.5, '#fdf3fb');
  bg.addColorStop(1, '#f8e0ee');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // draw sakura petals
  function drawSakuraPetal(x, y, r, rotation, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.ellipse(0, -r*.6, r*.45, r, 0, 0, Math.PI*2);
    const g = ctx.createRadialGradient(0, -r*.5, 0, 0, 0, r);
    g.addColorStop(0, '#ffd5e8');
    g.addColorStop(0.6, '#f4a0c4');
    g.addColorStop(1, '#e8679a');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  function drawFlower(x, y, r, rot, alpha) {
    for (let i = 0; i < 5; i++) drawSakuraPetal(x, y, r, rot + (i * Math.PI * 2) / 5, alpha);
    // center
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.arc(x, y, r*.18, 0, Math.PI*2);
    ctx.fillStyle = '#ffd700'; ctx.fill();
    ctx.restore();
  }

  // draw many flowers
  const flowers = [
    [300,300,80,0,0.9],[100,120,55,0.5,0.75],[500,80,45,1,0.7],
    [80,450,60,0.3,0.72],[520,420,70,1.2,0.8],[200,500,50,0.8,0.65],
    [450,200,40,0.4,0.6],[150,280,35,1.5,0.55],[400,480,45,0.6,0.68],
    [50,250,30,2,0.5],[550,300,38,1.8,0.58],[320,120,42,0.9,0.62],
  ];
  flowers.forEach(([x,y,r,rot,a]) => drawFlower(x,y,r,rot,a));

  // scatter petals
  for (let i = 0; i < 30; i++) {
    const x = Math.random()*size, y = Math.random()*size;
    const r = 8+Math.random()*18;
    drawSakuraPetal(x,y,r,Math.random()*Math.PI*2, 0.3+Math.random()*0.4);
  }

  // text
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#c9933a';
  ctx.font = 'italic bold 36px "Cormorant Garamond", serif';
  ctx.textAlign = 'center';
  ctx.fillText('Chronicles of Us', size/2, size-48);
  ctx.restore();

  const img = new Image();
  img.src = c.toDataURL();
  return img;
}

/* ── DOM ──────────────────────────────────────────────────── */
const tray       = document.getElementById('tray');
const board      = document.getElementById('board');
const boardGhost = document.getElementById('board-ghost');
const statMoves  = document.getElementById('stat-moves');
const statTime   = document.getElementById('stat-time');
const statLeft   = document.getElementById('stat-left');
const boardLabel = document.getElementById('board-label');

/* ── INIT (build default puzzle on load) ──────────────────── */
window.addEventListener('load', () => {
  const img = makeDefaultImage();
  img.onload = () => { sourceImg = img; buildPuzzle(); };
});

/* ── FILE PICK ────────────────────────────────────────────── */
document.getElementById('img-file').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById('file-pick-label').textContent = file.name.slice(0, 18);
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => { sourceImg = img; buildPuzzle(); };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

/* ── DIFFICULTY ───────────────────────────────────────────── */
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    gridSize = parseInt(btn.dataset.grid);
    buildPuzzle();
  });
});

/* ── SHUFFLE ──────────────────────────────────────────────── */
document.getElementById('btn-shuffle').addEventListener('click', shufflePieces);

/* ── SOLVE ────────────────────────────────────────────────── */
document.getElementById('btn-solve').addEventListener('click', solvePuzzle);

/* ── PEEK ─────────────────────────────────────────────────── */
const peekOverlay = document.getElementById('peek-overlay');
const peekImg     = document.getElementById('peek-img');
document.getElementById('btn-peek').addEventListener('click', () => {
  if (!sourceImg) return;
  peekImg.src = sourceImg.src;
  peekOverlay.classList.add('show');
});
peekOverlay.addEventListener('click', () => peekOverlay.classList.remove('show'));

/* ── WIN OVERLAY ──────────────────────────────────────────── */
document.getElementById('win-play-again').addEventListener('click', () => {
  document.getElementById('win-overlay').classList.remove('show');
  buildPuzzle();
});

/* ═══════════════════════════════════════════════════════════
   BUILD PUZZLE
═══════════════════════════════════════════════════════════ */
function buildPuzzle() {
  if (!sourceImg) return;
  clearTimer(); solved = false; moves = 0; startTime = null;
  statMoves.textContent = '0';
  statTime.textContent  = '0:00';
  statLeft.textContent  = gridSize * gridSize;
  pieces = [];

  // --- BOARD GRID ---
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  board.style.gridTemplateRows    = `repeat(${gridSize}, 1fr)`;

  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement('div');
    cell.className = 'board-cell';
    cell.dataset.cellIndex = i;
    setupCellDrop(cell);
    board.appendChild(cell);
  }

  // --- GHOST ---
  boardGhost.innerHTML = '';
  const ghostImg = document.createElement('img');
  ghostImg.src = sourceImg.src;
  boardGhost.appendChild(ghostImg);

  // --- PIECES ---
  // Draw each piece onto its own canvas using the source image
  const n   = gridSize;
  const SRC = 512; // logical source resolution (square)
  const pw  = Math.floor(SRC / n);
  const ph  = Math.floor(SRC / n);

  // Create a square version of the source image
  const squareCanvas = document.createElement('canvas');
  squareCanvas.width = squareCanvas.height = SRC;
  const sqCtx = squareCanvas.getContext('2d');
  // center-crop to square
  const imgMin = Math.min(sourceImg.naturalWidth, sourceImg.naturalHeight);
  const sx = (sourceImg.naturalWidth  - imgMin) / 2;
  const sy = (sourceImg.naturalHeight - imgMin) / 2;
  sqCtx.drawImage(sourceImg, sx, sy, imgMin, imgMin, 0, 0, SRC, SRC);

  const order = shuffle([...Array(n*n).keys()]);

  order.forEach((id, slotIdx) => {
    const row = Math.floor(id / n);
    const col = id % n;

    // canvas for this piece
    const pc = document.createElement('canvas');
    pc.width  = pw;
    pc.height = ph;
    const pCtx = pc.getContext('2d');
    pCtx.drawImage(squareCanvas, col*pw, row*ph, pw, ph, 0, 0, pw, ph);

    const el = document.createElement('div');
    el.className  = 'piece';
    el.dataset.id = id;
    el.appendChild(pc);

    // tray sizing
    const traySize = Math.max(40, Math.min(120, Math.floor(140 / n)));
    el.style.width  = traySize + 'px';
    el.style.height = traySize + 'px';

    setupPieceDrag(el);
    tray.appendChild(el);

    pieces.push({ id, correctCell: id, placed: false, el });
  });

  tray.innerHTML = '';
  pieces.forEach(p => tray.appendChild(p.el));
}

/* ── DRAG & DROP ─────────────────────────────────────────── */
function setupPieceDrag(el) {
  el.setAttribute('draggable', true);

  el.addEventListener('dragstart', e => {
    dragPieceId = parseInt(el.dataset.id);
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragPieceId);
    // tick timer on first interaction
    if (!startTime && !solved) {
      startTime = Date.now();
      startTimer();
    }
  });
  el.addEventListener('dragend', () => { el.classList.remove('dragging'); });

  // Touch drag support
  let touchStartX = 0, touchStartY = 0;
  let touchClone = null;

  el.addEventListener('touchstart', e => {
    const t = e.touches[0];
    touchStartX = t.clientX; touchStartY = t.clientY;
    dragPieceId = parseInt(el.dataset.id);
    if (!startTime && !solved) { startTime = Date.now(); startTimer(); }

    touchClone = el.cloneNode(true);
    touchClone.style.cssText = `position:fixed;z-index:9999;opacity:0.75;pointer-events:none;
      width:${el.offsetWidth}px;height:${el.offsetHeight}px;
      left:${t.clientX - el.offsetWidth/2}px;top:${t.clientY - el.offsetHeight/2}px;`;
    document.body.appendChild(touchClone);
  }, {passive:true});

  el.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches[0];
    if (touchClone) {
      touchClone.style.left = (t.clientX - el.offsetWidth/2) + 'px';
      touchClone.style.top  = (t.clientY - el.offsetHeight/2) + 'px';
    }
  }, {passive:false});

  el.addEventListener('touchend', e => {
    if (touchClone) { touchClone.remove(); touchClone = null; }
    const t = e.changedTouches[0];
    const target = document.elementFromPoint(t.clientX, t.clientY);
    const cell = target && target.closest('.board-cell');
    if (cell) dropOnCell(cell);
    dragPieceId = null;
  });
}

function setupCellDrop(cell) {
  cell.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    cell.classList.add('drag-over');
  });
  cell.addEventListener('dragleave', () => cell.classList.remove('drag-over'));
  cell.addEventListener('drop', e => {
    e.preventDefault();
    cell.classList.remove('drag-over');
    dropOnCell(cell);
  });
}

function dropOnCell(cell) {
  if (dragPieceId === null) return;
  const cellIndex = parseInt(cell.dataset.cellIndex);
  const piece = pieces.find(p => p.id === dragPieceId);
  if (!piece || piece.placed) return;

  // Check if cell already occupied
  if (cell.querySelector('.piece')) {
    // swap: return existing piece to tray
    const existing = cell.querySelector('.piece');
    const existPiece = pieces.find(p => p.el === existing);
    if (existPiece) {
      existPiece.placed = false;
      const traySize = Math.max(40, Math.min(120, Math.floor(140 / gridSize)));
      existing.style.width  = traySize + 'px';
      existing.style.height = traySize + 'px';
      setupPieceDrag(existing);
      tray.appendChild(existing);
    }
  }

  // Place piece into cell
  cell.appendChild(piece.el);
  piece.el.style.width  = '100%';
  piece.el.style.height = '100%';

  // Check correctness
  const isCorrect = piece.correctCell === cellIndex;
  piece.placed = true;

  if (isCorrect) {
    cell.classList.add('correct');
    piece.el.style.border = '2px solid rgba(217,79,135,0.5)';
    piece.el.style.boxShadow = '0 0 12px rgba(217,79,135,0.3)';
    piece.el.setAttribute('draggable', false);
  } else {
    cell.classList.remove('correct');
    piece.el.style.border = '2px solid rgba(255,100,100,0.4)';
    piece.el.style.boxShadow = 'none';
    // still draggable from board
    setupPieceDrag(piece.el);
    // allow drag out of board cell
    piece.el.addEventListener('dragstart', () => {
      piece.placed = false;
      cell.classList.remove('correct');
    }, {once: true});
  }

  moves++;
  statMoves.textContent = moves;
  dragPieceId = null;

  updatePiecesLeft();
  checkWin();
}

/* ── SHUFFLE ──────────────────────────────────────────────── */
function shufflePieces() {
  // reset all placed pieces back to tray
  board.querySelectorAll('.piece').forEach(el => {
    const piece = pieces.find(p => p.el === el);
    if (piece) piece.placed = false;
    const traySize = Math.max(40, Math.min(120, Math.floor(140 / gridSize)));
    el.style.width  = traySize + 'px';
    el.style.height = traySize + 'px';
    el.style.border = '';
    el.style.boxShadow = '';
    el.setAttribute('draggable', true);
    setupPieceDrag(el);
    tray.appendChild(el);
  });
  board.querySelectorAll('.board-cell').forEach(c => c.classList.remove('correct'));

  // shuffle tray order
  const children = [...tray.children];
  shuffle(children).forEach(el => tray.appendChild(el));

  moves = 0; solved = false;
  statMoves.textContent = '0';
  updatePiecesLeft();
  clearTimer(); startTime = null; statTime.textContent = '0:00';
}

/* ── SOLVE (auto-complete) ────────────────────────────────── */
function solvePuzzle() {
  const cells = board.querySelectorAll('.board-cell');

  // clear board
  cells.forEach(c => { c.innerHTML = ''; c.classList.remove('correct'); });
  tray.innerHTML = '';

  pieces.forEach(piece => {
    const cell = cells[piece.correctCell];
    piece.el.style.width  = '100%';
    piece.el.style.height = '100%';
    piece.el.style.border = '2px solid rgba(217,79,135,0.4)';
    piece.el.style.boxShadow = '0 0 10px rgba(217,79,135,0.25)';
    piece.el.setAttribute('draggable', false);
    piece.placed = true;
    cell.appendChild(piece.el);
    cell.classList.add('correct');
  });

  updatePiecesLeft();
  clearTimer();
  setTimeout(() => triggerWin(), 400);
}

/* ── HELPERS ──────────────────────────────────────────────── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function updatePiecesLeft() {
  const placed = pieces.filter(p => p.placed).length;
  statLeft.textContent = pieces.length - placed;
}

function checkWin() {
  const allCorrect = pieces.every(p => {
    if (!p.placed) return false;
    const cell = p.el.closest('.board-cell');
    return cell && parseInt(cell.dataset.cellIndex) === p.correctCell;
  });
  if (allCorrect && !solved) { clearTimer(); triggerWin(); }
}

function triggerWin() {
  solved = true;
  const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const m = Math.floor(elapsed / 60), s = elapsed % 60;
  const timeStr = `${m}:${s.toString().padStart(2,'0')}`;
  document.getElementById('win-moves').textContent = moves;
  document.getElementById('win-time').textContent  = timeStr;
  document.getElementById('win-overlay').classList.add('show');
}

/* ── TIMER ────────────────────────────────────────────────── */
function startTimer() {
  timerHandle = setInterval(() => {
    if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const m = Math.floor(elapsed / 60), s = elapsed % 60;
    statTime.textContent = `${m}:${s.toString().padStart(2,'0')}`;
  }, 1000);
}
function clearTimer() { clearInterval(timerHandle); timerHandle = null; }