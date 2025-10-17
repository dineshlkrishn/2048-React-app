# 2048 — Full Repository + Single-file Deploy + Tests + CI

This document contains a complete, ready-to-commit repository structure for the 2048 React implementation, a single-file deployable HTML (no build), Tailwind instructions + CSS, a GitHub Actions workflow for auto-deploy to GitHub Pages/Netlify/Vercel, Jest tests for the pure helpers, and improvements: multi-step Undo + settings panel (spawn probabilities and target value).

---

## Repository file tree

```
2048-react/
├── package.json
├── vite.config.js
├── index.html                # Vite entry (also included single-file version below)
├── README.md
├── tailwind.config.cjs
├── postcss.config.cjs
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles.css
│   └── utils.js              # pure helper functions (tested)
├── tests/
│   └── utils.test.js
├── .github/
│   └── workflows/
│       └── deploy.yml
└── single-file/
    └── 2048-standalone.html  # single-file deployable HTML (no build step)
```

---

## package.json

```json
{
  "name": "2048-react",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest --watchAll=false",
    "lint": "eslint . --ext .js,.jsx",
    "format": "prettier --write ."
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "babel-jest": "^29.0.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",
    "eslint": "^8.0.0",
    "prettier": "^2.0.0"
  }
}
```

Notes: versions are flexible; run `npm install` to install.

---

## vite.config.js

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
})
```

---

## tailwind.config.cjs (optional)

```js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: []
}
```

## postcss.config.cjs

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

---

## src/utils.js (pure helper functions — extracted for tests)

```js
// src/utils.js

export const createEmptyBoard = (n) => Array.from({ length: n }, () => Array(n).fill(0));

export const getEmptyCells = (board) => {
  const cells = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board.length; c++) {
      if (board[r][c] === 0) cells.push([r, c]);
    }
  }
  return cells;
};

export const spawnRandom = (board, rng = Math.random, prob4 = 0.1) => {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return board;
  const idx = Math.floor(rng() * empty.length);
  const [r, c] = empty[idx];
  const val = rng() < prob4 ? 4 : 2;
  const newBoard = board.map((row) => row.slice());
  newBoard[r][c] = val;
  return newBoard;
};

export const startBoard = (n, rng = Math.random, prob4 = 0.1) => {
  let b = createEmptyBoard(n);
  b = spawnRandom(b, rng, prob4);
  b = spawnRandom(b, rng, prob4);
  return b;
};

export const rotateClockwise = (board) => {
  const n = board.length;
  const nb = createEmptyBoard(n);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) nb[c][n - 1 - r] = board[r][c];
  return nb;
};

export const rotateTimes = (board, times) => {
  let b = board;
  for (let i = 0; i < ((times % 4) + 4) % 4; i++) b = rotateClockwise(b);
  return b;
};

export const slideAndMergeRow = (row) => {
  const n = row.length;
  const compressed = row.filter((v) => v !== 0);
  let scoreGain = 0;
  const merged = [];
  for (let i = 0; i < compressed.length; i++) {
    if (i + 1 < compressed.length && compressed[i] === compressed[i + 1]) {
      const newVal = compressed[i] * 2;
      merged.push(newVal);
      scoreGain += newVal;
      i++; // skip next
    } else {
      merged.push(compressed[i]);
    }
  }
  while (merged.length < n) merged.push(0);
  const changed = merged.some((v, idx) => v !== row[idx]);
  return { row: merged, scoreGain, changed };
};

export const moveBoard = (board, direction) => {
  const rotations = { left: 0, up: 1, right: 2, down: 3 };
  const times = rotations[direction] ?? 0;
  let b = rotateTimes(board, times);
  const n = b.length;
  let totalGain = 0;
  let moved = false;
  const newB = b.map((row) => {
    const { row: r, scoreGain, changed } = slideAndMergeRow(row);
    if (changed) moved = true;
    totalGain += scoreGain;
    return r;
  });
  const newBFinal = rotateTimes(newB, (4 - times) % 4);
  return { board: newBFinal, moved, scoreGain: totalGain };
};

export const canMove = (board) => {
  if (getEmptyCells(board).length > 0) return true;
  const n = board.length;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const v = board[r][c];
    if ((r + 1 < n && board[r + 1][c] === v) || (c + 1 < n && board[r][c + 1] === v)) return true;
  }
  return false;
};
```

Notes: helpers are pure and exported for testing.

---

## src/main.jsx

```jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')).render(<App />)
```

---

## src/styles.css

This file includes Tailwind directives (optional) and manual CSS for tile colors and animations.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root{
  --tile-bg: #eee4da;
}
body{ font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }

.board { display: inline-block; padding: 16px; border-radius: 12px; }
.board-row { display:flex; }
.tile { width: 72px; height:72px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:20px; box-shadow: inset 0 -2px 0 rgba(0,0,0,0.05); transition: transform 120ms ease, background 180ms ease; }
.tile-0 { background: rgba(238,228,218,0.35); }
.tile-2 { background: #eee4da; color: #776e65; }
.tile-4 { background: #ede0c8; color:#776e65 }
.tile-8 { background: #f2b179; color: #f9f6f2 }
.tile-16 { background: #f59563; color:#f9f6f2 }
.tile-32 { background: #f67c5f; color:#f9f6f2 }
.tile-64 { background: #f65e3b; color:#f9f6f2 }
.tile-128 { background: #edcf72; color:#f9f6f2 }
.tile-256 { background: #edcc61; color:#f9f6f2 }
.tile-512 { background: #edc850; color:#f9f6f2 }
.tile-1024 { background: #edc53f; color:#f9f6f2 }
.tile-2048 { background: #edc22e; color:#f9f6f2 }

.tile.new { transform: scale(1.12); }

.controls { display:flex; gap:8px; align-items:center }

/* responsive */
@media (max-width:480px){ .tile{ width:60px; height:60px; font-size:18px } }
```

Notes: Tailwind directives will work only if Tailwind is configured.

---

## src/App.jsx (complete UI + multi-step Undo + settings panel)

> This is a production-ready React component. It imports helpers from `./utils.js` and uses functional principles. Paste into `src/App.jsx`.

```jsx
import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  startBoard,
  spawnRandom,
  moveBoard,
  canMove,
  createEmptyBoard
} from './utils'

export default function App() {
  const DEFAULT_SIZE = 4
  const [size, setSize] = useState(DEFAULT_SIZE)
  const [board, setBoard] = useState(() => startBoard(DEFAULT_SIZE))
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('best') || 0))
  const [gameState, setGameState] = useState('playing')
  const [history, setHistory] = useState([]) // history entries: {board, score}
  const [maxUndo, setMaxUndo] = useState(10)
  const [prob4, setProb4] = useState(0.1) // spawn 4 prob
  const [targetValue, setTargetValue] = useState(2048)
  const containerRef = useRef(null)

  useEffect(() => { localStorage.setItem('best', String(best)) }, [best])

  const restart = useCallback((n = size) => {
    setSize(n)
    setBoard(startBoard(n, Math.random, prob4))
    setScore(0)
    setGameState('playing')
    setHistory([])
  }, [prob4, size])

  const pushHistory = useCallback((b, s) => {
    setHistory((h) => {
      const next = h.concat([{ board: b.map(r => r.slice()), score: s }])
      if (next.length > maxUndo) next.shift()
      return next
    })
  }, [maxUndo])

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h
      const last = h[h.length - 1]
      setBoard(last.board.map(r => r.slice()))
      setScore(last.score)
      setGameState('playing')
      return h.slice(0, -1)
    })
  }

  const performMove = (direction) => {
    if (gameState !== 'playing') return false
    const { board: nextBoard, moved, scoreGain } = moveBoard(board, direction)
    if (!moved) return false
    pushHistory(board, score)
    const withSpawn = spawnRandom(nextBoard, Math.random, prob4)
    const newScore = score + scoreGain
    setBoard(withSpawn)
    setScore(newScore)
    if (newScore > best) setBest(newScore)
    if (withSpawn.flat().some(v => v >= targetValue)) setGameState('won')
    else if (!canMove(withSpawn)) setGameState('lost')
    return true
  }

  useEffect(() => {
    const handler = e => {
      const k = e.key
      let moved = false
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') moved = performMove('left')
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') moved = performMove('right')
      else if (k === 'ArrowUp' || k === 'w' || k === 'W') moved = performMove('up')
      else if (k === 'ArrowDown' || k === 's' || k === 'S') moved = performMove('down')
      if (moved) e.preventDefault()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [board, score, gameState, best, prob4, targetValue])

  // touch
  useEffect(() => {
    let sx=0, sy=0
    const el = containerRef.current
    if (!el) return
    const onStart = e => { const t=e.touches[0]; sx=t.clientX; sy=t.clientY }
    const onEnd = e => {
      const t=e.changedTouches[0]
      const dx = t.clientX-sx, dy = t.clientY-sy
      const absX=Math.abs(dx), absY=Math.abs(dy)
      if (Math.max(absX,absY)<20) return
      if (absX>absY) dx>0?performMove('right'):performMove('left')
      else dy>0?performMove('down'):performMove('up')
    }
    el.addEventListener('touchstart', onStart, {passive:true})
    el.addEventListener('touchend', onEnd)
    return ()=>{ el.removeEventListener('touchstart', onStart); el.removeEventListener('touchend', onEnd) }
  }, [board, prob4, targetValue, gameState])

  const tileClass = v => `tile tile-${v} ${v!==0? 'filled':''}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6" ref={containerRef}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">2048 — React (Full Repo)</h1>
          <div className="flex gap-3 items-center">
            <div className="p-2 bg-white rounded shadow text-center">
              <div className="text-sm">Score</div>
              <div className="font-bold text-lg">{score}</div>
            </div>
            <div className="p-2 bg-white rounded shadow text-center">
              <div className="text-sm">Best</div>
              <div className="font-bold text-lg">{best}</div>
            </div>
            <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={()=>restart(size)}>Restart</button>
            <button className="px-3 py-2 bg-gray-200 rounded" onClick={undo} disabled={history.length===0}>Undo</button>
          </div>
        </div>

        <div className="mb-3 flex items-center gap-3">
          <label>Board size:</label>
          <select value={size} onChange={(e)=>restart(Number(e.target.value))}>
            {[3,4,5,6].map(n => <option key={n} value={n}>{n}×{n}</option>)}
          </select>

          <div className="ml-6 p-3 bg-white rounded shadow">
            <strong>Settings</strong>
            <div className="mt-2 text-sm">Spawn 4 probability: {Math.round(prob4*100)}%</div>
            <input type="range" min="0" max="0.5" step="0.01" value={prob4} onChange={(e)=>setProb4(Number(e.target.value))} />
            <div className="mt-2 text-sm">Target tile: {targetValue}</div>
            <select value={targetValue} onChange={(e)=>setTargetValue(Number(e.target.value))}>
              {[512,1024,2048,4096].map(v=> <option key={v} value={v}>{v}</option>)}
            </select>
            <div className="mt-2 text-sm">Max undo steps: {maxUndo}</div>
            <input type="range" min="0" max="50" step="1" value={maxUndo} onChange={(e)=>setMaxUndo(Number(e.target.value))} />
          </div>
        </div>

        <div className="board p-4 bg-[#bbada0] rounded-lg shadow-lg" style={{ width: size*90, height: size*90 }}>
          {board.map((row, r) => (
            <div key={r} className="board-row" style={{ display:'flex', gap:12, marginBottom:12 }}>
              {row.map((v,c) => (
                <div key={c} className={tileClass(v)} style={{ width:72, height:72, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:20, borderRadius:8 }}>
                  {v!==0? v : ''}
                </div>
              ))}
            </div>
          ))}
        </div>

        {gameState==='won' && (<div className="mt-4 p-4 bg-yellow-100 rounded"><strong>Congrats!</strong> You hit {targetValue}.</div>)}
        {gameState==='lost' && (<div className="mt-4 p-4 bg-red-100 rounded"><strong>Game Over.</strong> No moves left.</div>)}

        <div className="mt-6 text-sm text-gray-600">
          Use arrow keys or swipe. Settings persist while session lasts.
        </div>
      </div>
    </div>
  )
}
```

---

## index.html (Vite entry)

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>2048 React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## single-file/2048-standalone.html (no-build deploy)

A single HTML file that includes React via CDN and the full App in a single script tag — copy this file to GitHub Pages or any static host.

> NOTE: Because bundling isn't used, this file loads React from unpkg and uses plain CSS. It's suitable for quick hosting.

```html
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>2048 — Standalone</title>
<style>
/* minimal local styles (copied from src/styles.css) */
body{ font-family: Arial, sans-serif; background:#f3f3f3; padding:24px }
.board{ display:inline-block; padding:16px; border-radius:12px; background:#bbada0 }
.board-row{ display:flex; gap:12px; margin-bottom:12px }
.tile{ width:72px; height:72px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:20px }
.tile-0{ background: rgba(238,228,218,0.35) }
.tile-2{ background:#eee4da; color:#776e65 }
.tile-4{ background:#ede0c8; color:#776e65 }
.tile-8{ background:#f2b179; color:#f9f6f2 }
.tile-16{ background:#f59563; color:#f9f6f2 }
.tile-32{ background:#f67c5f; color:#f9f6f2 }
.tile-64{ background:#f65e3b; color:#f9f6f2 }
.tile-128{ background:#edcf72; color:#f9f6f2 }
.tile-256{ background:#edcc61; color:#f9f6f2 }
.tile-512{ background:#edc850; color:#f9f6f2 }
.tile-1024{ background:#edc53f; color:#f9f6f2 }
.tile-2048{ background:#edc22e; color:#f9f6f2 }
.button{ padding:8px 12px; border-radius:6px; cursor:pointer }
</style>
</head>
<body>
<div id="root"></div>

<!-- React and ReactDOM from CDN -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

<script>
// Minimal implementation reusing the same pure helpers (inlined) and component
const { useState, useEffect, useRef } = React

const createEmptyBoard = (n) => Array.from({ length: n }, () => Array(n).fill(0))
const getEmptyCells = (board) => {
  const cells = []
  for (let r=0;r<board.length;r++) for (let c=0;c<board.length;c++) if (board[r][c]===0) cells.push([r,c])
  return cells
}
const spawnRandom = (board, rng=Math.random, prob4=0.1) => {
  const empty=getEmptyCells(board); if(empty.length===0) return board
  const idx=Math.floor(rng()*empty.length); const [r,c]=empty[idx]; const val = rng()<prob4?4:2
  const nb = board.map(row=>row.slice()); nb[r][c]=val; return nb
}
const startBoard = (n, rng=Math.random, prob4=0.1)=>{let b=createEmptyBoard(n); b=spawnRandom(b,rng,prob4); b=spawnRandom(b,rng,prob4); return b}
const rotateClockwise = (board)=>{ const n=board.length; const nb=createEmptyBoard(n); for(let r=0;r<n;r++)for(let c=0;c<n;c++)nb[c][n-1-r]=board[r][c]; return nb }
const rotateTimes = (board,times)=>{ let b=board; for(let i=0;i<((times%4)+4)%4;i++) b=rotateClockwise(b); return b }
const slideAndMergeRow = (row)=>{ const n=row.length; const compressed=row.filter(v=>v!==0); let scoreGain=0; const merged=[]; for(let i=0;i<compressed.length;i++){ if(i+1<compressed.length && compressed[i]===compressed[i+1]){ const newVal=compressed[i]*2; merged.push(newVal); scoreGain+=newVal; i++ } else merged.push(compressed[i]) } while(merged.length<n) merged.push(0); const changed = merged.some((v,i)=> v!==row[i]); return { row: merged, scoreGain, changed } }
const moveBoard = (board, direction)=>{ const rotations={left:0,up:1,right:2,down:3}; const times=rotations[direction]||0; let b=rotateTimes(board,times); let totalGain=0; let moved=false; const newB=b.map(row=>{ const {row:r, scoreGain, changed}=slideAndMergeRow(row); if(changed) moved=true; totalGain+=scoreGain; return r }); const newBFinal=rotateTimes(newB,(4-times)%4); return { board:newBFinal, moved, scoreGain: totalGain } }
const canMove = (board)=>{ if (getEmptyCells(board).length>0) return true; const n=board.length; for(let r=0;r<n;r++) for(let c=0;c<n;c++){ const v=board[r][c]; if((r+1<n && board[r+1][c]===v) || (c+1<n && board[r][c+1]===v)) return true } return false }

function Game(){
  const [size,setSize]=useState(4)
  const [board,setBoard]=useState(()=>startBoard(4))
  const [score,setScore]=useState(0)
  const [state,setState]=useState('playing')
  useEffect(()=>{ const h=(e)=>{ if(e.key==='ArrowLeft') tryMove('left'); if(e.key==='ArrowRight') tryMove('right'); if(e.key==='ArrowUp') tryMove('up'); if(e.key==='ArrowDown') tryMove('down'); }; window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h) }, [board])
  const tryMove=(dir)=>{ const {board:nb, moved, scoreGain}=moveBoard(board,dir); if(!moved) return; const withSpawn=spawnRandom(nb); setBoard(withSpawn); setScore(s=>s+scoreGain); if(!canMove(withSpawn)) setState('lost') }
  return React.createElement('div', null, 
    React.createElement('h1', null, '2048 — Standalone'),
    React.createElement('div', { className:'board', style:{ width: size*90, padding:16 } }, board.map((row,r)=> React.createElement('div',{key:r, className:'board-row'}, row.map((v,c)=> React.createElement('div',{key:c, className:'tile tile-'+v}, v===0?'':v))))),
    React.createElement('div', null, 'Score: ', score), state==='lost' && React.createElement('div', null, 'Game Over')
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Game))
</script>
</body>
</html>
```

This single file is intentionally compact; it contains the same core logic and is ready to upload as `2048-standalone.html` to GitHub Pages or any static host.

---

## tests/utils.test.js (Jest tests for pure helpers)

```js
// tests/utils.test.js
import { createEmptyBoard, startBoard, spawnRandom, slideAndMergeRow, moveBoard, canMove } from '../src/utils'

describe('utils', ()=>{
  test('createEmptyBoard creates correct shape', ()=>{
    const b=createEmptyBoard(3)
    expect(b.length).toBe(3)
    expect(b[0].length).toBe(3)
    expect(b.flat().every(v=>v===0)).toBeTruthy()
  })

  test('slideAndMergeRow merges correctly', ()=>{
    const { row, scoreGain } = slideAndMergeRow([2,2,4,0])
    expect(row).toEqual([4,4,0,0])
    expect(scoreGain).toBe(4)
  })

  test('moveBoard moves left correctly', ()=>{
    const b = [ [2,2,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0] ]
    const { board: nb, moved, scoreGain } = moveBoard(b, 'left')
    expect(moved).toBeTruthy()
    expect(scoreGain).toBe(4)
    expect(nb[0][0]).toBe(4)
  })

  test('canMove detects no moves', ()=>{
    const b = [ [2,4,2],[4,2,4],[2,4,2] ]
    expect(canMove(b)).toBe(false)
  })
})
```

Run tests: `npm run test` after installing dependencies.

---

## .github/workflows/deploy.yml (GitHub Actions for auto-deploy to GitHub Pages)

This workflow builds the Vite app and deploys to GitHub Pages. You can adapt it for Netlify or Vercel (those often integrate directly with GitHub). Replace `gh-pages` branch or use `peaceiris/actions-gh-pages`.

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install deps
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to Pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          branch: gh-pages
          folder: dist
```

For Netlify: push to repo and connect site — Netlify will detect Vite and build with `npm run build`. For Vercel: import repo, select `vite` framework, and deploy.

---

## README.md (high level — trimmed)

This repo contains a React 2048 game. Setup:

1. `git clone <repo>`
2. `cd 2048-react` 
3. `npm install`
4. `npm run dev` — open `http://localhost:5173`

To run single-file no-build demo, open `single-file/2048-standalone.html` in a browser or host it.

---

## Deployment guide (short)

**GitHub Pages**
- Use the included GitHub Actions to build & deploy to `gh-pages`. Ensure branch is `main` and action has secrets if needed (none required for public repos).

**Netlify**
- Connect your GitHub repo to Netlify.
- Build command: `npm run build`.
- Publish directory: `dist`.
- Optionally set environment variable `NODE_VERSION`.

**Vercel**
- Import project, it will auto-detect Vite. No special config needed.

**Quick (no-build)**
- Upload `single-file/2048-standalone.html` to GitHub Pages (in `docs/` folder) or any static host.

---

## Notes on functional principles and code quality

- `src/utils.js` is a pure, testable module with no side effects.
- UI in `App.jsx` only calls pure helpers and manages immutable state snapshots for Undo.
- History size is configurable, and Undo is multi-step.
- Spawn probability and target value are adjustable in Settings.

---

## What I changed/added (summary)

- Extracted helper functions to `src/utils.js` and wrote tests.
- Added complete React app files for Vite.
- Created a single-file HTML for quick no-build hosting.
- Added Tailwind placeholders and exact CSS for tiles/animations.
- Added GitHub Actions workflow for auto-deploy to GitHub Pages.
- Enhanced UI with multi-step Undo and settings panel (spawn 4 probability, target value, max undo).

---

### Next actions I can do for you (pick any):
1. Create a ZIP of the repo and give a download link. (I can generate files in the canvas; I cannot host zips directly from here — I can paste commands to create the zip locally.)
2. Commit and push to a GitHub repo for you (I cannot access your GitHub — but can provide exact `git` commands).
3. Add CI tests for the React component using Testing Library.

If you want any of the above, tell me which and I will provide the exact commands and files (already prepared in this canvas).
