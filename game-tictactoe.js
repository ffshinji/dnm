const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('tttStatus');
let currentPlayer = "X";
let boardState = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function initTicTacToe() {
    cells.forEach(cell => cell.addEventListener('click', cellClicked));
    updateStatus();
    resetTicTacToe();
}

function cellClicked() {
    const cellIndex = this.getAttribute('data-index');

    if (boardState[cellIndex] !== "" || !gameActive) {
        return;
    }

    updateCell(this, cellIndex);
    checkWinner();
}

function updateCell(cell, index) {
    boardState[index] = currentPlayer;
    cell.textContent = currentPlayer;

    // Style update
    cell.classList.add(currentPlayer === "X" ? "x" : "o");
}

function switchPlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateStatus();
}

function updateStatus() {
    statusText.innerHTML = `Sıra: <span class="${currentPlayer === 'X' ? 'player-x' : 'player-o'}">${currentPlayer}</span>`;
}

function checkWinner() {
    let roundWon = false;
    let winningLine = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const condition = winningConditions[i];
        const cellA = boardState[condition[0]];
        const cellB = boardState[condition[1]];
        const cellC = boardState[condition[2]];

        if (cellA === "" || cellB === "" || cellC === "") {
            continue;
        }
        if (cellA === cellB && cellB === cellC) {
            roundWon = true;
            winningLine = condition;
            break;
        }
    }

    if (roundWon) {
        statusText.textContent = `${currentPlayer} Kazandı!`;
        highlightWin(winningLine);
        gameActive = false;
        return;
    }

    if (!boardState.includes("")) {
        statusText.textContent = "Berabere!";
        gameActive = false;
        return;
    }

    switchPlayer();
}

function highlightWin(indices) {
    indices.forEach(index => {
        cells[index].classList.add('winning');
    });
}

function resetTicTacToe() {
    currentPlayer = "X";
    boardState = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    updateStatus();
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("x", "o", "winning");
    });
}

// Auto-initialize listeners
initTicTacToe();
