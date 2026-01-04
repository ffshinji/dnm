const hackGrid = document.getElementById('hackGrid');
const hackTarget = document.getElementById('hackTarget');
const hackTimerFill = document.getElementById('hackTimerFill');
const hackStatus = document.getElementById('hackStatus');
const hackScoreDisp = document.getElementById('hackScore');
const hackMaxScoreDisp = document.getElementById('hackMaxScore');
const startHackBtn = document.getElementById('startHackBtn');

// Inputs
const hTimeInput = document.getElementById('hTimeInput');

// Charsets
const sets = {
    alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    num: "0123456789",
    greek: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",
    rune: "ᚠᚢᚦᚨᚱᚲᚺᚾᛁᛃᛈᛉᛊᛏᛒᛖᛗᛚᛜᛟᛞ",
    braille: "⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠥⠧⠺⠭⠽⠵",
    symbol: "¥€$£!@#$%^&*()_+[]{}|;:,.<>?"
};

let hScore = 0;
let hMaxScore = localStorage.getItem('hackMaxScore') || 0;
let hTimer;
let hMaxTime = 15; // default
let hTimeLeft = 100; // Percentage
let hIsPlaying = false;
let hCorrectCode = "";
let currentCharset = "";

// Init Max Score
hackMaxScoreDisp.textContent = hMaxScore;

function initHackGame() {
    hScore = 0;
    hackScoreDisp.textContent = hScore;

    // Read Settings
    hMaxTime = parseInt(hTimeInput.value);
    buildCharset();

    if (currentCharset.length === 0) {
        alert("Lütfen en az bir karakter seti seçin!");
        return;
    }

    startHackRound();
}

function buildCharset() {
    currentCharset = "";
    if (document.getElementById('hTypeAlpha').checked) currentCharset += sets.alpha;
    if (document.getElementById('hTypeNum').checked) currentCharset += sets.num;
    if (document.getElementById('hTypeGreek').checked) currentCharset += sets.greek;
    if (document.getElementById('hTypeRune').checked) currentCharset += sets.rune;
    if (document.getElementById('hTypeBraille').checked) currentCharset += sets.braille;
    if (document.getElementById('hTypeSymbol').checked) currentCharset += sets.symbol;
}

function startHackRound() {
    hIsPlaying = true;
    startHackBtn.style.display = 'none';
    hackStatus.textContent = "SİSTEM KİLİTLENİYOR...";
    hTimeLeft = 100;

    generateHackData();
    startTimer();
}

function generateHackData() {
    // 1. Generate Target Code (4 chars)
    hCorrectCode = "";
    for (let i = 0; i < 4; i++) {
        hCorrectCode += currentCharset[Math.floor(Math.random() * currentCharset.length)];
    }
    hackTarget.textContent = hCorrectCode;

    // 2. Generate Grid
    hackGrid.innerHTML = '';
    let correctIndex = Math.floor(Math.random() * 32);

    for (let i = 0; i < 32; i++) {
        const cell = document.createElement('div');
        cell.classList.add('hack-cell');

        if (i === correctIndex) {
            cell.textContent = hCorrectCode;
            cell.dataset.correct = "true";
        } else {
            // Random distraction
            let wrongCode = "";
            for (let k = 0; k < 4; k++) {
                wrongCode += currentCharset[Math.floor(Math.random() * currentCharset.length)];
            }
            cell.textContent = wrongCode;
        }

        cell.addEventListener('click', handleHackClick);
        hackGrid.appendChild(cell);
    }
}

function handleHackClick(e) {
    if (!hIsPlaying) return;

    if (e.target.dataset.correct === "true") {
        // Correct
        hScore++;
        hackScoreDisp.textContent = hScore;
        clearInterval(hTimer);

        if (hScore > hMaxScore) {
            hMaxScore = hScore;
            localStorage.setItem('hackMaxScore', hMaxScore);
            hackMaxScoreDisp.textContent = hMaxScore;
        }

        e.target.style.background = "#0f0";
        e.target.style.color = "#000";

        setTimeout(() => {
            startHackRound();
        }, 500);
    } else {
        // Wrong
        hackFail();
    }
}

function startTimer() {
    clearInterval(hTimer);
    hackTimerFill.style.width = "100%";

    // Decrease logic
    // We want full bar = hMaxTime seconds
    // Interval 100ms
    // Decrease step per interval
    let step = 100 / (hMaxTime * 10);

    hTimer = setInterval(() => {
        hTimeLeft -= step;
        hackTimerFill.style.width = hTimeLeft + "%";

        if (hTimeLeft <= 0) {
            hackFail();
        }
    }, 100);
}

function hackFail() {
    hIsPlaying = false;
    clearInterval(hTimer);
    hackStatus.textContent = "BAĞLANTI KOPTU!";
    hackStatus.style.color = "#f00";
    startHackBtn.style.display = 'block';
    startHackBtn.textContent = "YENİDEN BAĞLAN";
}

startHackBtn.addEventListener('click', initHackGame);
