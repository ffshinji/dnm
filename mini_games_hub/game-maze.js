const mazeCanvas = document.getElementById('mazeCanvas');
const mazeCtx = mazeCanvas.getContext('2d');
const startMazeBtn = document.getElementById('startMazeBtn');
const mazeStatus = document.getElementById('mazeStatus');
const mazeTimerDisp = document.getElementById('mazeTimer');
const mazeBestTimeDisp = document.getElementById('mazeBestTime');
const mSizeInput = document.getElementById('mSizeInput');

let mGridSize = 10;
let mMaze = [];
let mPlayer = { x: 0, y: 0 };
let mGoal = { x: 0, y: 0 };
let mCellSize = 0;
let mIsPlaying = false;
let mStartTime = 0;
let mTimerInterval;
let mBestTime = localStorage.getItem('mazeBestTime') || '---';

mazeBestTimeDisp.textContent = mBestTime;

function updateMazeLabel(val) {
    const labels = ["Kolay", "Orta", "Zor"];
    document.getElementById('mSizeVal').textContent = labels[val - 1];
}

function initMazeGame() {
    startMazeBtn.style.display = 'none';
    mazeStatus.textContent = "BAŞLATILDI";
    mazeStatus.style.color = "#fff";
    mIsPlaying = true;

    // Config
    const levels = [10, 20, 30]; // Grid sizes
    mGridSize = levels[parseInt(mSizeInput.value) - 1];
    mCellSize = mazeCanvas.width / mGridSize;

    generateMaze();
    mPlayer = { x: 0, y: 0 };
    mGoal = { x: mGridSize - 1, y: mGridSize - 1 };

    mStartTime = Date.now();
    startTimer();
    drawMaze();

    // Focus for key events
    window.addEventListener('keydown', handleMazeMove);
}

function generateMaze() {
    // Randomized Prim's or DFS. Using Recursive Backtracker (DFS)
    mMaze = Array(mGridSize).fill().map(() => Array(mGridSize).fill({
        top: true, right: true, bottom: true, left: true, visited: false
    }));

    // Re-init with new objects to avoid reference issues
    for (let y = 0; y < mGridSize; y++) {
        for (let x = 0; x < mGridSize; x++) {
            mMaze[y][x] = { top: true, right: true, bottom: true, left: true, visited: false };
        }
    }

    const stack = [];
    let current = { x: 0, y: 0 };
    mMaze[0][0].visited = true;

    let visitedCount = 1;

    while (visitedCount < mGridSize * mGridSize) {
        const neighbors = getUnvisitedNeighbors(current.x, current.y);

        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            stack.push(current);

            // Remove walls
            if (next.x > current.x) { mMaze[current.y][current.x].right = false; mMaze[next.y][next.x].left = false; }
            else if (next.x < current.x) { mMaze[current.y][current.x].left = false; mMaze[next.y][next.x].right = false; }
            else if (next.y > current.y) { mMaze[current.y][current.x].bottom = false; mMaze[next.y][next.x].top = false; }
            else if (next.y < current.y) { mMaze[current.y][current.x].top = false; mMaze[next.y][next.x].bottom = false; }

            mMaze[next.y][next.x].visited = true;
            visitedCount++;
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop();
        }
    }
}

function getUnvisitedNeighbors(x, y) {
    const neighbors = [];
    if (y > 0 && !mMaze[y - 1][x].visited) neighbors.push({ x, y: y - 1 });
    if (x < mGridSize - 1 && !mMaze[y][x + 1].visited) neighbors.push({ x: x + 1, y });
    if (y < mGridSize - 1 && !mMaze[y + 1][x].visited) neighbors.push({ x, y: y + 1 });
    if (x > 0 && !mMaze[y][x - 1].visited) neighbors.push({ x: x - 1, y });
    return neighbors;
}

function drawMaze() {
    mazeCtx.fillStyle = '#000';
    mazeCtx.fillRect(0, 0, mazeCanvas.width, mazeCanvas.height);

    mazeCtx.strokeStyle = '#0ff'; // Neon Blue Walls
    mazeCtx.lineWidth = 2;
    mazeCtx.shadowBlur = 10;
    mazeCtx.shadowColor = '#0ff';

    for (let y = 0; y < mGridSize; y++) {
        for (let x = 0; x < mGridSize; x++) {
            const cell = mMaze[y][x];
            const px = x * mCellSize;
            const py = y * mCellSize;

            mazeCtx.beginPath();
            if (cell.top) { mazeCtx.moveTo(px, py); mazeCtx.lineTo(px + mCellSize, py); }
            if (cell.right) { mazeCtx.moveTo(px + mCellSize, py); mazeCtx.lineTo(px + mCellSize, py + mCellSize); }
            if (cell.bottom) { mazeCtx.moveTo(px, py + mCellSize); mazeCtx.lineTo(px + mCellSize, py + mCellSize); }
            if (cell.left) { mazeCtx.moveTo(px, py); mazeCtx.lineTo(px, py + mCellSize); }
            mazeCtx.stroke();
        }
    }

    // Draw Goal
    mazeCtx.fillStyle = '#0f0'; // Neon Green
    mazeCtx.shadowColor = '#0f0';
    mazeCtx.fillRect(mGoal.x * mCellSize + 5, mGoal.y * mCellSize + 5, mCellSize - 10, mCellSize - 10);

    // Draw Player
    mazeCtx.fillStyle = '#f0f'; // Neon Pink
    mazeCtx.shadowColor = '#f0f';
    mazeCtx.beginPath();
    mazeCtx.arc(mPlayer.x * mCellSize + mCellSize / 2, mPlayer.y * mCellSize + mCellSize / 2, mCellSize / 3, 0, Math.PI * 2);
    mazeCtx.fill();
}

function handleMazeMove(e) {
    if (!mIsPlaying) return;

    const key = e.key;
    const current = mMaze[mPlayer.y][mPlayer.x];
    let moved = false;

    if ((key === 'ArrowUp' || key === 'w') && !current.top) { mPlayer.y--; moved = true; }
    else if ((key === 'ArrowRight' || key === 'd') && !current.right) { mPlayer.x++; moved = true; }
    else if ((key === 'ArrowDown' || key === 's') && !current.bottom) { mPlayer.y++; moved = true; }
    else if ((key === 'ArrowLeft' || key === 'a') && !current.left) { mPlayer.x--; moved = true; }

    if (moved) {
        drawMaze();
        checkWin();
    }
}

function checkWin() {
    if (mPlayer.x === mGoal.x && mPlayer.y === mGoal.y) {
        mIsPlaying = false;
        clearInterval(mTimerInterval);

        const timeSpent = ((Date.now() - mStartTime) / 1000).toFixed(2);
        mazeStatus.textContent = `TAMAMLANDI! (${timeSpent}s)`;
        mazeStatus.style.color = "#0f0";
        startMazeBtn.style.display = 'inline-block';
        startMazeBtn.textContent = "TEKRAR OYNA";

        if (mBestTime === '---' || parseFloat(timeSpent) < parseFloat(mBestTime)) {
            mBestTime = timeSpent;
            localStorage.setItem('mazeBestTime', mBestTime);
            mazeBestTimeDisp.textContent = mBestTime + "s";
        }

        window.removeEventListener('keydown', handleMazeMove);
    }
}

function startTimer() {
    clearInterval(mTimerInterval);
    mTimerInterval = setInterval(() => {
        if (!mIsPlaying) return;
        const now = Date.now();
        const diff = now - mStartTime;
        const secs = Math.floor(diff / 1000);
        const ms = Math.floor((diff % 1000) / 10);
        mazeTimerDisp.textContent = `${secs}.${ms < 10 ? '0' + ms : ms}`;
    }, 50);
}

startMazeBtn.addEventListener('click', initMazeGame);
