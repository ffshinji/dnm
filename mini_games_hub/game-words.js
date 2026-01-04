const wordsDisplay = document.getElementById('wordsDisplay');
const wordsOptions = document.getElementById('wordsOptions');
const startWordsBtn = document.getElementById('startWordsBtn');
const wordsStatus = document.getElementById('wordsStatus');
const wordsScoreDisp = document.getElementById('wordsScore');
const wordsLevelDisp = document.getElementById('wordsLevel');

// Database of Turkish words
const wordDb = {
    3: ["KOD", "BOT", "HACK", "RAM", "CPU", "BUS", "NET"],
    4: ["DATA", "BITE", "KASA", "WIFI", "DISK", "BIOS"],
    5: ["MODEL", "MODEM", "PATCH", "CACHE", "MOUSE", "LOGIN"],
    6: ["SERVER", "DRIVER", "SOCKET", "KERNEL", "SCRIPT"],
    7: ["NETWORK", "DISPLAY", "MONITOR", "BROWSER"]
};

let wScore = 0;
let wLevel = 1;
let wTargetWord = "";
let wIsPlaying = false;
let wTimer;

function initWordsGame() {
    wScore = 0;
    wLevel = 1;
    wordsScoreDisp.textContent = "0";
    wordsLevelDisp.textContent = "1";
    startWordsBtn.style.display = 'none';
    wIsPlaying = true;
    nextWordRound();
}

function nextWordRound() {
    wordsOptions.innerHTML = '';
    wordsStatus.textContent = "KELİMEYE ODAKLAN...";
    wordsStatus.style.color = "#fff";

    // Choose word length based on level (cap at 7)
    let len = Math.min(3 + Math.floor((wLevel - 1) / 2), 7);
    const list = wordDb[len] || wordDb[5];
    wTargetWord = list[Math.floor(Math.random() * list.length)];

    // Show word
    wordsDisplay.textContent = wTargetWord;
    wordsDisplay.classList.remove('hidden');

    // Hide after short time (gets faster)
    const viewTime = Math.max(1000, 2000 - (wLevel * 100));

    setTimeout(() => {
        wordsDisplay.classList.add('hidden');
        showWordOptions();
    }, viewTime);
}

function showWordOptions() {
    wordsStatus.textContent = "HANGİSİYDİ?";
    wordsStatus.style.color = "#0ff";

    // Generate distractors
    const options = generateOptions(wTargetWord);

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'word-opt-btn';
        btn.textContent = opt;
        btn.onclick = () => checkWordAnswer(opt);
        wordsOptions.appendChild(btn);
    });
}

function generateOptions(target) {
    const opts = [target];
    const alphabet = "ABCDEFGHIJKLMNOPRSTUVYZ";

    // Create 5 distractors
    for (let i = 0; i < 5; i++) {
        let dist = target.split('');
        // Change 1 or 2 chars
        let changeCount = Math.random() > 0.5 ? 1 : 2;
        for (let k = 0; k < changeCount; k++) {
            let idx = Math.floor(Math.random() * dist.length);
            dist[idx] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
        opts.push(dist.join(''));
    }

    // Shuffle
    return opts.sort(() => Math.random() - 0.5);
}

function checkWordAnswer(answer) {
    if (!wIsPlaying) return;

    if (answer === wTargetWord) {
        // Correct
        wScore += 10;
        wLevel++;
        wordsScoreDisp.textContent = wScore;
        wordsLevelDisp.textContent = wLevel;
        wordsStatus.textContent = "DOĞRU!";
        wordsStatus.style.color = "#0f0";
        setTimeout(nextWordRound, 1000);
    } else {
        // Wrong
        wIsPlaying = false;
        wordsStatus.textContent = `YANLIŞ! Doğrusu: ${wTargetWord}`;
        wordsStatus.style.color = "#f00";
        startWordsBtn.style.display = 'inline-block';
        startWordsBtn.textContent = "TEKRAR DENE";
    }
}

if (startWordsBtn) startWordsBtn.addEventListener('click', initWordsGame);
