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
