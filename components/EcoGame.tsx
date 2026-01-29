
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';

const EcoGame: React.FC = () => {
    const { activeTab } = useAppStore();
    const [isGameLoaded, setIsGameLoaded] = useState(false);

    useEffect(() => {
        if (activeTab === 'eco-game') {
            const timer = setTimeout(() => setIsGameLoaded(true), 100);
            return () => clearTimeout(timer);
        } else {
            setIsGameLoaded(false);
        }
    }, [activeTab]);

    if (!isGameLoaded) return <div className="h-full w-full flex items-center justify-center text-primary"><i className="fas fa-circle-notch fa-spin text-3xl"></i></div>;

    const gameSourceDoc = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Eco.Game - Tetris Operational</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
:root {
  --primary: #14b8a6;
  --secondary: #3b82f6;
  --bg-dark: #05070a;
  --mec-red: #e10600;
}

* { user-select: none; -webkit-tap-highlight-color: transparent; box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg-dark);
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  overflow: hidden;
}

#game-wrapper {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: rgba(255,255,255,0.02);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 0 50px rgba(0,0,0,0.5);
}

canvas {
  background: #000;
  border: 4px solid #1e293b;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0,0,0,0.8);
}

#side-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 180px;
}

.stat-box {
  background: rgba(255,255,255,0.05);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  text-align: center;
}

.stat-label {
  font-size: 10px;
  font-weight: 900;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 20px;
  font-weight: 900;
  color: #fff;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.btn-ctrl {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  color: white;
  padding: 12px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-ctrl:active {
  background: var(--primary);
  transform: scale(0.9);
}

.btn-large {
  grid-column: span 3;
  font-weight: 800;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-accent {
  background: var(--mec-red);
  border-color: rgba(255,255,255,0.3);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  #game-wrapper { flex-direction: column; scale: 0.8; }
  #side-panel { width: 240px; }
}
</style>
</head>
<body>

<div id="game-wrapper">
  <canvas id="tetris" width="240" height="400"></canvas>

  <div id="side-panel">
    <div class="stat-box">
      <div class="stat-label">Pontos</div>
      <div id="score" class="stat-value">0</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Fase</div>
      <div id="level" class="stat-value">1 / 30</div>
    </div>

    <div class="controls-grid">
      <button class="btn-ctrl" onclick="rotate()"><i class="fas fa-redo"></i></button>
      <button class="btn-ctrl" onclick="move(0, -1)"><i class="fas fa-arrow-up" style="opacity:0"></i></button> <!-- Spacer -->
      <button class="btn-ctrl" onclick="move(-1, 0)"><i class="fas fa-arrow-left"></i></button>
      <button class="btn-ctrl" onclick="drop()"><i class="fas fa-arrow-down"></i></button>
      <button class="btn-ctrl" onclick="move(1, 0)"><i class="fas fa-arrow-right"></i></button>
      <button class="btn-ctrl btn-large btn-accent" onclick="accelerate()">⚡ Acelerar</button>
      <button class="btn-ctrl btn-large" onclick="toggleMode()">🔁 Orientação</button>
    </div>
  </div>
</div>

<script>
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
ctx.scale(20, 20);

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');

let score = 0;
let level = 1;
let dropInterval = 1000;
let lastTime = 0;
let modeVertical = true;

const colors = [
  null, '#2dd4bf', '#3b82f6', '#fb923c',
  '#facc15', '#4ade80', '#a855f7', '#f87171'
];

function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function createPiece(type) {
  if (type === 'T') return [[0,0,0],[1,1,1],[0,1,0]];
  if (type === 'O') return [[2,2],[2,2]];
  if (type === 'L') return [[0,3,0],[0,3,0],[0,3,3]];
  if (type === 'J') return [[0,4,0],[0,4,0],[4,4,0]];
  if (type === 'I') return [[0,5,0,0],[0,5,0,0],[0,5,0,0],[0,5,0,0]];
  if (type === 'S') return [[0,6,6],[6,6,0],[0,0,0]];
  if (type === 'Z') return [[7,7,0],[0,7,7],[0,0,0]];
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
        
        // Block effect
        ctx.lineWidth = 0.05;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, {x:0,y:0});
  drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function arenaSweep() {
  let rowCount = 0;
  outer: for (let y = arena.length - 1; y >= 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) continue outer;
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;
    rowCount++;
    score += 100 * rowCount;
  }
  
  if (score >= level * 500 && level < 30) {
    level++;
    dropInterval = Math.max(100, 1000 - (level * 30));
  }
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (m[y][x] !== 0 &&
         (arena[y + o.y] &&
          arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function rotateMatrix(matrix) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      [matrix[x][y], matrix[y][x]] =
      [matrix[y][x], matrix[x][y]];
    }
  }
  matrix.forEach(row => row.reverse());
}

function rotate() {
  const pos = player.pos.x;
  let offset = 1;
  rotateMatrix(player.matrix);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotateMatrix(player.matrix);
      player.pos.x = pos;
      return;
    }
  }
}

function move(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) player.pos.x -= dir;
}

function drop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    resetPlayer();
    arenaSweep();
  }
}

function accelerate() {
  drop();
}

function resetPlayer() {
  const pieces = 'TJLOSZI';
  player.matrix = createPiece(pieces[Math.random() * pieces.length | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
                 (player.matrix[0].length / 2 | 0);
                 
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    score = 0;
    level = 1;
    dropInterval = 1000;
  }
}

function toggleMode() {
  modeVertical = !modeVertical;
  if (modeVertical) {
      canvas.width = 240;
      canvas.height = 400;
  } else {
      canvas.width = 400;
      canvas.height = 240;
  }
  ctx.scale(20, 20);
}

function update(time = 0) {
  const delta = time - lastTime;
  if (delta > dropInterval) {
    drop();
    lastTime = time;
  }
  draw();
  scoreEl.textContent = score;
  levelEl.textContent = level + ' / 30';
  requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') move(-1);
  if (event.key === 'ArrowRight') move(1);
  if (event.key === 'ArrowDown') drop();
  if (event.key === 'ArrowUp') rotate();
});

const arena = createMatrix(12, 20);
const player = { pos: {x:0,y:0}, matrix: null };

resetPlayer();
update();
</script>
</body>
</html>
    `;

    return (
        <div className="w-full h-[100vh] flex flex-col bg-[#05070a] overflow-hidden fixed inset-0 z-[5000]">
            <header className="px-6 py-2 bg-bg-card/20 border-b border-border-color/30 flex items-center justify-between backdrop-blur-xl shrink-0 absolute top-0 left-0 right-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(20,184,166,0.15)]">
                        <i className="fas fa-gamepad text-xl"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-light tracking-tighter uppercase">ECO.<span className="text-primary">GAME</span></h2>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Protocolo Tetris Operational v5.2</span>
                    </div>
                </div>
                <button 
                    onClick={() => window.location.reload()} 
                    className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                >
                   Sair <i className="fas fa-times text-xl"></i>
                </button>
            </header>

            <div className="flex-1 relative w-full h-full">
                <iframe
                    title="EcoGame Viewport"
                    srcDoc={gameSourceDoc}
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-same-origin allow-modals"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
};

export default EcoGame;
