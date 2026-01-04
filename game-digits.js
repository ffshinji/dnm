const digitsDisplay = document.getElementById('digitsDisplay');
const digitsInput = document.getElementById('digitsInput');
const digitsStatus = document.getElementById('digitsStatus');
const startDigitsBtn = document.getElementById('startDigitsBtn');
const digitsScoreDisp = document.getElementById('digitsScore');
const digitsMaxScoreDisp = document.getElementById('digitsMaxScore');

const dCountInput = document.getElementById('dCountInput');
const dTimeInput = document.getElementById('dTimeInput');

let dScore = 0;
let dMaxScore = localStorage.getItem('digitsMaxScore') || 0;
let dCurrentCode = "";
let dIsPlaying = false;

digitsMaxScoreDisp.textContent = dMaxScore;

function initDigitsGame() {
    dScore = 0;
    digitsScoreDisp.textContent = dScore;
    digitsInput.value = "";
    digitsInput.disabled = true;
    startDigitsRound();
}

function startDigitsRound() {
    startDigitsBtn.style.display = 'none';
    dIsPlaying = true;
    digitsStatus.textContent = "HAZIR OL...";
    digitsStatus.style.color = "#fff";
    digitsDisplay.textContent = "????";
    digitsDisplay.classList.remove('reveal');
    digitsInput.value = "";
    digitsInput.disabled = true;

    setTimeout(() => {
        generateAndShowCode();
    }, 1000);
}

function generateAndShowCode() {
    // Generate
    const len = parseInt(dCountInput.value);
    dCurrentCode = "";
    for (let i = 0; i < len; i++) {
        dCurrentCode += Math.floor(Math.random() * 10);
    }

    // Show
    digitsDisplay.textContent = dCurrentCode;
    digitsDisplay.classList.add('reveal');
    digitsStatus.textContent = "EZBERLE!";
    digitsStatus.style.color = "#0ff";

    // Hide after time
    const showTime = parseFloat(dTimeInput.value) * 1000;

    setTimeout(() => {
        digitsDisplay.textContent = "????";
        digitsDisplay.classList.remove('reveal');
        digitInputPhase();
    }, showTime);
}

function digitInputPhase() {
    digitsStatus.textContent = "KODU GİR:";
    digitsStatus.style.color = "#f0f";
    digitsInput.disabled = false;
    digitsInput.focus();
}

// Input handling
digitsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        checkDigitAnswer();
    }
});

function checkDigitAnswer() {
    if (!dIsPlaying) return;

    const val = digitsInput.value;
    if (val === dCurrentCode) {
        // Correct
        dScore++;
        digitsScoreDisp.textContent = dScore;
        digitsStatus.textContent = "DOĞRU!";
        digitsStatus.style.color = "#0f0";
        digitsInput.disabled = true;

        if (dScore > dMaxScore) {
            dMaxScore = dScore;
            localStorage.setItem('digitsMaxScore', dMaxScore);
            digitsMaxScoreDisp.textContent = dMaxScore;
        }

        setTimeout(() => {
            startDigitsRound();
        }, 1000);
    } else {
        // Wrong
        dIsPlaying = false;
        digitsStatus.textContent = `YANLIŞ! Kod: ${dCurrentCode}`;
        digitsStatus.style.color = "#f00";
        digitsInput.disabled = true;
        startDigitsBtn.style.display = 'block';
        startDigitsBtn.textContent = "TEKRAR DENE";
    }
}

startDigitsBtn.addEventListener('click', initDigitsGame);
