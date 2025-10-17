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


