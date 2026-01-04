const untangleCanvas = document.getElementById('untangleCanvas');
const untangleCtx = untangleCanvas.getContext('2d');
const startUntangleBtn = document.getElementById('startUntangleBtn');
const untangleStatus = document.getElementById('untangleStatus');
const untangleScoreDisp = document.getElementById('untangleScore'); // High Score display
const uDotsInput = document.getElementById('uDotsInput');
const uSpeedInput = document.getElementById('uSpeedInput'); // Actually Duration

let uNodes = [];
let uConnections = [];
let uDraggingNode = null;
let uNodeRadius = 15;
let uIsPlaying = false;
let uStartTime = 0;
let uTimeLimit = 30; // seconds
let uTimerInterval;
let uBestScore = localStorage.getItem('untangleBestScore') || 0;

if (untangleScoreDisp) untangleScoreDisp.textContent = uBestScore;

function updateUntangleLabel(id, val, suffix) {
    document.getElementById(id).textContent = val + (suffix || '');
}

function initUntangleGame() {
    startUntangleBtn.style.display = 'none';
    untangleStatus.textContent = "ÇÖZMEYE BAŞLA!";
    untangleStatus.style.color = "#fff";
    uIsPlaying = true;

    // Get Settings
    const dotCount = parseInt(uDotsInput?.value || 6);
    uTimeLimit = parseInt(uSpeedInput?.value || 30);

    generateUntangleGraph(dotCount);

    uStartTime = Date.now();
    startUntangleTimer();
    drawUntangle();
}

function generateUntangleGraph(n) {
    uNodes = [];
    uConnections = [];

    // Generate random positions with padding
    const padding = 60;
    for (let i = 0; i < n; i++) {
        uNodes.push({
            x: padding + Math.random() * (untangleCanvas.width - 2 * padding),
            y: padding + Math.random() * (untangleCanvas.height - 2 * padding)
        });
    }

    // Create a simple loop first to ensure connectivity
    for (let i = 0; i < n; i++) {
        uConnections.push([i, (i + 1) % n]);
    }

    // Add extra random connections (density)
    // Avoid over-cluttering: max 1.5x nodes edges
    const maxEdges = Math.floor(n * 1.5);
    let attempts = 0;
    while (uConnections.length < maxEdges && attempts < 100) {
        attempts++;
        let a = Math.floor(Math.random() * n);
        let b = Math.floor(Math.random() * n);
        if (a !== b && !connectionExists(a, b)) {
            uConnections.push([a, b]);
        }
    }
}

function connectionExists(a, b) {
    return uConnections.some(c => (c[0] === a && c[1] === b) || (c[0] === b && c[1] === a));
}

// Sharkiller Style Constants
const COLOR_BG = '#0b1e10'; // Deep Green Background
const COLOR_NODE = '#00ff00'; // Bright Green Nodes
const COLOR_LINE_SAFE = '#00ff00'; // Green Line
const COLOR_LINE_BAD = '#ff0000'; // Red Line
const COLOR_BORDER = '#00ffaa';

function drawUntangle() {
    let allSafe = true;

    // Fill Background
    untangleCtx.fillStyle = COLOR_BG;
    untangleCtx.fillRect(0, 0, untangleCanvas.width, untangleCanvas.height);

    // Draw Border (Canvas is styled via CSS, but we can add inner glow if needed)

    // Draw Lines
    for (let i = 0; i < uConnections.length; i++) {
        const u = uNodes[uConnections[i][0]];
        const v = uNodes[uConnections[i][1]];

        // Check Intersection
        let isCrossed = false;
        for (let j = 0; j < uConnections.length; j++) {
            if (i === j) continue;
            // Check logic excluding shared nodes
            if (uConnections[i].includes(uConnections[j][0]) || uConnections[i].includes(uConnections[j][1])) continue;

            // Optimization: Simple bounding box check before expensive intersection
            // ... (optional, skipping for simplicity on small N)

            const p = uNodes[uConnections[j][0]];
            const q = uNodes[uConnections[j][1]];

            if (lineIntersect(u.x, u.y, v.x, v.y, p.x, p.y, q.x, q.y)) {
                isCrossed = true;
                break;
            }
        }

        if (isCrossed) allSafe = false;

        untangleCtx.beginPath();
        untangleCtx.moveTo(u.x, u.y);
        untangleCtx.lineTo(v.x, v.y);
        untangleCtx.strokeStyle = isCrossed ? COLOR_LINE_BAD : COLOR_LINE_SAFE;
        untangleCtx.lineWidth = 2; // Thinner lines like reference
        untangleCtx.stroke();
    }

    // Draw Nodes
    for (let i = 0; i < uNodes.length; i++) {
        const node = uNodes[i];
        untangleCtx.beginPath();
        untangleCtx.arc(node.x, node.y, uNodeRadius, 0, Math.PI * 2);
        untangleCtx.fillStyle = COLOR_NODE;
        untangleCtx.shadowBlur = 10;
        untangleCtx.shadowColor = COLOR_NODE;
        untangleCtx.fill();
        untangleCtx.shadowBlur = 0; // Reset

        if (i === uDraggingNode) {
            untangleCtx.strokeStyle = '#fff';
            untangleCtx.lineWidth = 2;
            untangleCtx.stroke();
        }
    }

    // Check Win
    // ... (logic remains in main loop or can be moved here if optimal, but keeping simple)
    return allSafe;
}

function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom == 0) return false;
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    return (ua > 0 && ua < 1 && ub > 0 && ub < 1);
}

// Input Handling
function getPos(e) {
    const rect = untangleCanvas.getBoundingClientRect();
    const scaleX = untangleCanvas.width / rect.width;
    const scaleY = untangleCanvas.height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
}

function uHandleInputStart(e) {
    // if (!uIsPlaying) return; // Allow drag in preview mode for fun
    const { x, y } = getPos(e);

    for (let i = 0; i < uNodes.length; i++) {
        const dx = x - uNodes[i].x;
        const dy = y - uNodes[i].y;
        if (dx * dx + dy * dy < uNodeRadius * uNodeRadius * 2.5) { // bigger hit area
            uDraggingNode = i;
            break;
        }
    }
}

function uHandleTouchStart(e) { e.preventDefault(); uHandleInputStart(e); }

function uHandleInputMove(e) {
    if (uDraggingNode !== null) {
        const { x, y } = getPos(e);
        // Bounds check
        uNodes[uDraggingNode].x = Math.max(uNodeRadius, Math.min(untangleCanvas.width - uNodeRadius, x));
        uNodes[uDraggingNode].y = Math.max(uNodeRadius, Math.min(untangleCanvas.height - uNodeRadius, y));

        const isSolved = drawUntangle();
        if (isSolved && uIsPlaying) {
            gameWin();
        }
    }
}

function uHandleTouchMove(e) { e.preventDefault(); uHandleInputMove(e); }

function uHandleInputEnd(e) {
    if (uDraggingNode !== null) {
        uDraggingNode = null;
        const isSolved = drawUntangle();
        if (isSolved && uIsPlaying) {
            gameWin();
        }
    }
}

function startUntangleTimer() {
    clearInterval(uTimerInterval);
    uTimerInterval = setInterval(() => {
        if (!uIsPlaying) return;
        const elapsed = (Date.now() - uStartTime) / 1000;
        const remaining = Math.max(0, uTimeLimit - elapsed);
        untangleStatus.textContent = `SÜRE: ${remaining.toFixed(1)}s`;

        if (remaining <= 0) {
            gameOver();
        }
    }, 100);
}

function gameWin() {
    uIsPlaying = false;
    clearInterval(uTimerInterval);
    untangleStatus.textContent = "BAŞARILI! SİSTEM AÇILDI.";
    untangleStatus.style.color = "#0f0";
    startUntangleBtn.style.display = 'inline-block';

    // Scoring: Score = (Dots * 10) + Remaining Time
    const elapsed = (Date.now() - uStartTime) / 1000;
    const remaining = Math.max(0, uTimeLimit - elapsed);
    const score = Math.floor((uNodes.length * 100) + (remaining * 10));

    if (score > uBestScore) {
        uBestScore = score;
        localStorage.setItem('untangleBestScore', uBestScore);
        if (untangleScoreDisp) untangleScoreDisp.textContent = uBestScore;
    }
}

function gameOver() {
    uIsPlaying = false;
    clearInterval(uTimerInterval);
    untangleStatus.textContent = "BAŞARISIZ! SÜRE DOLDU.";
    untangleStatus.style.color = "#f00";
    startUntangleBtn.style.display = 'inline-block';
}

if (startUntangleBtn) startUntangleBtn.addEventListener('click', initUntangleGame);

// Events - Attached explicitly to enable drag
untangleCanvas.addEventListener('mousedown', uHandleInputStart);
window.addEventListener('mousemove', uHandleInputMove);
window.addEventListener('mouseup', uHandleInputEnd);
untangleCanvas.addEventListener('touchstart', uHandleTouchStart, { passive: false });
window.addEventListener('touchmove', uHandleTouchMove, { passive: false });
window.addEventListener('touchend', uHandleInputEnd);

// Initial Preview Run
setTimeout(() => {
    if (uNodes.length === 0) {
        generateUntangleGraph(parseInt(uDotsInput?.value || 6));
        drawUntangle();
    }
}, 100);
