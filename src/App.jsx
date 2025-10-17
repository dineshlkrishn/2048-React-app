import React, { useState, useEffect } from 'react'
import './index.css'

export default function App() {
  const size = 4
  const [board, setBoard] = useState(Array(size).fill().map(()=>Array(size).fill(0)))
  const [score, setScore] = useState(0)

  useEffect(() => {
    addRandomTile()
    addRandomTile()
    const handleKey = (e) => move(e.key)
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  function addRandomTile() {
    const empty = []
    for (let i=0;i<size;i++) for (let j=0;j<size;j++) if (board[i][j]===0) empty.push([i,j])
    if (empty.length===0) return
    const [x,y] = empty[Math.floor(Math.random()*empty.length)]
    const newBoard = board.map(r=>[...r])
    newBoard[x][y] = Math.random()<0.9?2:4
    setBoard(newBoard)
  }

  function move(dir) {
    let newBoard = board.map(r=>[...r])
    let moved = false
    const rotate = (b) => b[0].map((_, i) => b.map(row => row[i])).reverse()
    const flip = (b) => b.map(r=>[...r].reverse())

    if (dir === 'ArrowUp') newBoard = rotate(newBoard)
    if (dir === 'ArrowDown') newBoard = rotate(flip(rotate(rotate(newBoard))))
    if (dir === 'ArrowRight') newBoard = flip(newBoard)

    for (let i=0;i<size;i++) {
      let row = newBoard[i].filter(x=>x)
      for (let j=0;j<row.length-1;j++) {
        if (row[j]===row[j+1]) {
          row[j]*=2
          setScore(s=>s+row[j])
          row[j+1]=0
        }
      }
      row = row.filter(x=>x)
      while(row.length<size) row.push(0)
      if (row.some((val, idx) => val !== newBoard[i][idx])) moved = true
      newBoard[i] = row
    }

    if (dir === 'ArrowUp') newBoard = rotate(rotate(rotate(newBoard)))
    if (dir === 'ArrowDown') newBoard = rotate(rotate(rotate(flip(rotate(newBoard)))))
    if (dir === 'ArrowRight') newBoard = flip(newBoard)

    if (moved) {
      setBoard(newBoard)
      addRandomTile()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">2048 Game</h1>
      <div className="mb-4 text-lg">Score: {score}</div>
      <div className="grid grid-cols-4 gap-2 bg-gray-300 p-4 rounded">
        {board.flat().map((cell, idx)=>(
          <div key={idx} className={`tile tile-${cell} w-16 h-16 flex items-center justify-center rounded text-xl font-bold`}>
            {cell!==0?cell:''}
          </div>
        ))}
      </div>
    </div>
  )
}
