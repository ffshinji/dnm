const lpCanvas = document.getElementById('lockpickCanvas');
const lpCtx = lpCanvas.getContext('2d');
const lpStatus = document.getElementById('lockpickStatus');
const lpScoreDisplay = document.getElementById('lockpickScore');
const lpMaxScoreDisplay = document.getElementById('lockpickMaxScore');
const lpStartBtn = document.getElementById('startLockpickBtn');

let lpGameInterval;
let lpLevel = 1;
let lpScore = 0;
let lpMaxScore = localStorage.getItem('lockpickMaxScore') || 0;
let lpAngle = 0;
let lpSpeed = 2;
let lpTargetStart = 0;
let lpTargetWidth = 45;
let lpIsRunning = false;
let lpRotationDir = 1;

// Init Max Score Display
lpMaxScoreDisplay.textContent = lpMaxScore;

function initLockpickGame() {
    lpLevel = 1;
    lpScore = 0;
    lpScoreDisplay.textContent = lpScore;
    lpSpeed = 2;
    lpTargetWidth = 60;
    resetRound();
    lpStartBtn.style.display = 'none';
    lpIsRunning = true;
    lpGameInterval = requestAnimationFrame(lpGameLoop);
}

function resetRound() {
    lpAngle = 0;
    lpTargetStart = Math.random() * (300) + 30;
    lpRotationDir = Math.random() > 0.5 ? 1 : -1;

    lpStatus.textContent = "KİLİT KIRILIYOR...";
    lpStatus.style.color = "#fff";
}

function lpGameLoop() {
    if (!lpIsRunning) return;

    lpAngle += lpSpeed * lpRotationDir;

    if (lpAngle >= 360) lpAngle = 0;
    if (lpAngle < 0) lpAngle = 360;

    drawLockpick();

    lpGameInterval = requestAnimationFrame(lpGameLoop);
}

function drawLockpick() {
    lpCtx.clearRect(0, 0, lpCanvas.width, lpCanvas.height);

    const centerX = lpCanvas.width / 2;
    const centerY = lpCanvas.height / 2;
    const radius = 100;

    // 1. Background Ring
    lpCtx.beginPath();
    lpCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    lpCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    lpCtx.lineWidth = 20;
    lpCtx.stroke();

    // 2. Target Zone
    let startRad = (lpTargetStart * Math.PI) / 180;
    let endRad = ((lpTargetStart + lpTargetWidth) * Math.PI) / 180;

    lpCtx.beginPath();
    lpCtx.arc(centerX, centerY, radius, startRad, endRad);
    lpCtx.strokeStyle = '#0ff';
    lpCtx.lineWidth = 20;
    lpCtx.lineCap = 'butt';
    lpCtx.shadowBlur = 15;
    lpCtx.shadowColor = '#0ff';
    lpCtx.stroke();
    lpCtx.shadowBlur = 0;

    // 3. Needle
    let needleRad = (lpAngle * Math.PI) / 180;
    let needleX = centerX + Math.cos(needleRad) * (radius - 5);
    let needleY = centerY + Math.sin(needleRad) * (radius - 5);

    lpCtx.beginPath();
    lpCtx.moveTo(centerX, centerY);
    lpCtx.lineTo(needleX, needleY);
    lpCtx.strokeStyle = '#f0f';
    lpCtx.lineWidth = 4;
    lpCtx.shadowBlur = 10;
    lpCtx.shadowColor = '#f0f';
    lpCtx.stroke();
    lpCtx.shadowBlur = 0;

    // 4. Center Hub with Level
    lpCtx.beginPath();
    lpCtx.arc(centerX, centerY, 25, 0, Math.PI * 2); // Larger hub
    lpCtx.fillStyle = '#101025'; // Dark background for contrast
    lpCtx.fill();
    lpCtx.lineWidth = 2;
    lpCtx.strokeStyle = '#fff';
    lpCtx.stroke();

    // Level Text
    lpCtx.fillStyle = '#fff';
    lpCtx.font = 'bold 20px "Orbitron", sans-serif';
    lpCtx.textAlign = 'center';
    lpCtx.textBaseline = 'middle';
    lpCtx.fillText(lpLevel, centerX, centerY + 2); // Adjust vertical alignment
}

function checkLock() {
    if (!lpIsRunning) return;

    let targetEnd = lpTargetStart + lpTargetWidth;
    let hit = false;

    if (lpAngle >= lpTargetStart && lpAngle <= targetEnd) {
        hit = true;
    }

    if (hit) {
        handleSuccess();
    } else {
        handleFail();
    }
}

function handleSuccess() {
    lpScore += 100;
    lpLevel++;

    if (lpScore > lpMaxScore) {
        lpMaxScore = lpScore;
        localStorage.setItem('lockpickMaxScore', lpMaxScore);
        lpMaxScoreDisplay.textContent = lpMaxScore;
    }

    lpScoreDisplay.textContent = lpScore;

    // Difficulty
    lpSpeed += 0.5;
    lpTargetWidth = Math.max(15, lpTargetWidth - 2);

    resetRound();

    // Visual Pulse
    lpCanvas.style.borderColor = '#0ff';
    setTimeout(() => lpCanvas.style.borderColor = 'rgba(0, 255, 255, 0.4)', 200);
}

function handleFail() {
    lpIsRunning = false;
    cancelAnimationFrame(lpGameInterval);
    lpStatus.innerHTML = `HATA!<br>Skor: ${lpScore}`;
    lpStatus.style.color = "#f00";
    lpStartBtn.style.display = 'block';

    // Shake
    lpCanvas.style.transform = "translateX(5px)";
    setTimeout(() => lpCanvas.style.transform = "translateX(-5px)", 50);
    setTimeout(() => lpCanvas.style.transform = "translateX(0)", 100);
}

document.addEventListener('keydown', (e) => {
    if (document.getElementById('game-lockpick').classList.contains('active-section')) {
        if (e.code === 'Space') {
            if (lpIsRunning) {
                checkLock();
            } else if (lpStartBtn.style.display !== 'none') {
                initLockpickGame();
            }
        }
    }
});

lpStartBtn.addEventListener('click', initLockpickGame);

function stopLockpickGame() {
    lpIsRunning = false;
    cancelAnimationFrame(lpGameInterval);
}
