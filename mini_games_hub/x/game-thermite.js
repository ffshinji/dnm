const thermiteGrid = document.getElementById('thermiteGrid');
const thermiteStatus = document.getElementById('thermiteStatus');
const thermiteLevelDisp = document.getElementById('thermiteLevel');
const thermiteMaxScoreDisp = document.getElementById('thermiteMaxScore');
const startThermiteBtn = document.getElementById('startThermiteBtn');

// Inputs
const tGridInput = document.getElementById('tGridInput');
const tSpeedInput = document.getElementById('tSpeedInput');

let tLevel = 1;
let tGridSize = 6;
let tPattern = [];
let tInput = [];
let tIsInputPhase = false;
let tMaxScore = localStorage.getItem('thermiteMaxScore') || 0;

// Init Max Score
thermiteMaxScoreDisp.textContent = tMaxScore;

function initThermiteGame() {
    // Read Settings
    tGridSize = parseInt(tGridInput.value);
    tLevel = 1;
    startThermiteRound();
}

function startThermiteRound() {
    thermiteLevelDisp.textContent = tLevel;
    thermiteStatus.textContent = "Hafıza Taranıyor...";
    thermiteStatus.style.color = "#fff";
    startThermiteBtn.style.display = 'none';

    // Update Grid CSS dynamically
    thermiteGrid.style.gridTemplateColumns = `repeat(${tGridSize}, 1fr)`;
    thermiteGrid.style.gridTemplateRows = `repeat(${tGridSize}, 1fr)`;

    generateGrid();
    generatePattern();

    setTimeout(() => {
        showPattern();
    }, 500);
}

function generateGrid() {
    thermiteGrid.innerHTML = '';
    for (let i = 0; i < tGridSize * tGridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('thermite-cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleThermiteClick);
        thermiteGrid.appendChild(cell);
    }
}

function generatePattern() {
    tPattern = [];
    tInput = [];
    tIsInputPhase = false;

    // Blocks count scales with level and grid size
    // Base 4 + level/2, capped reasonably for grid size
    let maxBlocks = (tGridSize * tGridSize) / 2;
    let blocksCount = Math.min(maxBlocks, 4 + Math.floor(tLevel * 0.8));

    while (tPattern.length < blocksCount) {
        let randIndex = Math.floor(Math.random() * (tGridSize * tGridSize));
        if (!tPattern.includes(randIndex)) {
            tPattern.push(randIndex);
        }
    }
}

function showPattern() {
    const cells = document.querySelectorAll('.thermite-cell');

    tPattern.forEach(index => {
        cells[index].classList.add('active');
    });

    // Hide after configured time
    let duration = parseInt(tSpeedInput.value) * 1000;

    setTimeout(() => {
        tPattern.forEach(index => {
            cells[index].classList.remove('active');
        });
        tIsInputPhase = true;
        thermiteStatus.textContent = "Şimdi SEN!";
        thermiteStatus.style.color = "#0ff";
    }, duration);
}

function handleThermiteClick(e) {
    if (!tIsInputPhase) return;

    const cell = e.target;
    const index = parseInt(cell.dataset.index);

    if (tInput.includes(index)) return;

    if (tPattern.includes(index)) {
        cell.classList.add('solved');
        tInput.push(index);

        if (tInput.length === tPattern.length) {
            thermiteWin();
        }
    } else {
        cell.classList.add('wrong');
        thermiteFail();
    }
}

function thermiteWin() {
    tIsInputPhase = false;
    thermiteStatus.innerHTML = "BAŞARILI!";
    thermiteStatus.style.color = "#0f0";

    // Update Max Score
    if (tLevel > tMaxScore) {
        tMaxScore = tLevel;
        localStorage.setItem('thermiteMaxScore', tMaxScore);
        thermiteMaxScoreDisp.textContent = tMaxScore;
    }

    setTimeout(() => {
        tLevel++;
        startThermiteRound();
    }, 1500);
}

function thermiteFail() {
    tIsInputPhase = false;
    const cells = document.querySelectorAll('.thermite-cell');
    tPattern.forEach(index => {
        if (!tInput.includes(index)) cells[index].classList.add('active');
    });

    thermiteStatus.innerHTML = `HATA! Seviye: ${tLevel}`;
    thermiteStatus.style.color = "#f00";
    startThermiteBtn.style.display = 'block';
    startThermiteBtn.textContent = 'TEKRAR DENE';
}

startThermiteBtn.addEventListener('click', initThermiteGame);
