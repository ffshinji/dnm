const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('snakeScore');
const startBtn = document.getElementById('startSnakeBtn');

const box = 20; // Size of one grid square
let snake = [];
let food = {};
let score = 0;
let d; // direction
let game; // Interval variable

// Initialize Game State
function initSnakeGame() {
    snake = [];
    snake[0] = { x: 9 * box, y: 10 * box };
    score = 0;
    d = undefined; // Wait for input
    scoreElement.innerText = score;
    createFood();
    draw(); // Draw initial state

    clearInterval(game);
}

function createFood() {
    food = {
        x: Math.floor(Math.random() * 19 + 1) * box,
        y: Math.floor(Math.random() * 19 + 1) * box
    };
}

// Controls
document.addEventListener("keydown", direction);

function direction(event) {
    if (event.keyCode == 37 && d != "RIGHT") d = "LEFT";
    else if (event.keyCode == 38 && d != "DOWN") d = "UP";
    else if (event.keyCode == 39 && d != "LEFT") d = "RIGHT";
    else if (event.keyCode == 40 && d != "UP") d = "DOWN";
}

// Draw Function
function draw() {
    // Clear Screen
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "#0ff" : "#fff"; // Head is cyan, body is white
        ctx.shadowBlur = (i == 0) ? 10 : 0;
        ctx.shadowColor = "#0ff";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);

        ctx.strokeStyle = "#000";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
        ctx.shadowBlur = 0; // Reset shadow
    }

    // Draw Food
    ctx.fillStyle = "#f0f"; // Magenta food
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#f0f";
    ctx.fillRect(food.x, food.y, box, box);
    ctx.shadowBlur = 0;

    // Movement Logic
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

    // Snake eats food
    if (snakeX == food.x && snakeY == food.y) {
        score++;
        scoreElement.innerText = score;
        createFood();
    } else {
        // Remove tail
        snake.pop();
    }

    // Game Over Rules
    // 1. Hit Wall
    // 2. Hit Self
    let newHead = { x: snakeX, y: snakeY };

    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        alert("Oyun Bitti! Skorun: " + score);
        return;
    }

    // Move Head
    snake.unshift(newHead);
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}

// Start Button Listener
startBtn.addEventListener('click', () => {
    initSnakeGame();
    if (game) clearInterval(game);
    game = setInterval(draw, 100); // 100ms per frame
});

// Stop function for global script to use when navigating away
function stopSnakeGame() {
    clearInterval(game);
}
