// Game constants
const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

// Game state
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let isGameRunning = false;
let gameSpeed = 150;

// DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const gameOverElement = document.getElementById('game-over');

// Initialize high score display
highScoreElement.textContent = highScore;

// Initialize snake
function initSnake() {
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
}

// Generate random food position
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head - brighter
            ctx.fillStyle = '#4ecca3';
        } else {
            // Body - gradient effect
            const gradient = 1 - (index / snake.length) * 0.5;
            ctx.fillStyle = `rgba(78, 204, 163, ${gradient})`;
        }
        
        ctx.fillRect(
            segment.x * CELL_SIZE + 1,
            segment.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );
        
        // Add eyes to head
        if (index === 0) {
            ctx.fillStyle = '#0d0d0d';
            const eyeSize = CELL_SIZE / 6;
            const eyeOffset = CELL_SIZE / 3;
            
            if (direction === 'right' || direction === 'left') {
                const x = direction === 'right' 
                    ? segment.x * CELL_SIZE + CELL_SIZE - eyeOffset 
                    : segment.x * CELL_SIZE + eyeOffset;
                ctx.fillRect(x, segment.y * CELL_SIZE + eyeOffset - eyeSize/2, eyeSize, eyeSize);
                ctx.fillRect(x, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize/2, eyeSize, eyeSize);
            } else {
                const y = direction === 'down' 
                    ? segment.y * CELL_SIZE + CELL_SIZE - eyeOffset 
                    : segment.y * CELL_SIZE + eyeOffset;
                ctx.fillRect(segment.x * CELL_SIZE + eyeOffset - eyeSize/2, y, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize/2, y, eyeSize, eyeSize);
            }
        }
    });

    // Draw food
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Food glow effect
    ctx.shadowColor = '#ff6b6b';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
}

// Move snake
function moveSnake() {
    direction = nextDirection;
    
    const head = { ...snake[0] };
    
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }

    // Wrap around walls (snake goes through walls and comes out on the other side)
    if (head.x < 0) {
        head.x = GRID_SIZE - 1;
    } else if (head.x >= GRID_SIZE) {
        head.x = 0;
    }
    
    if (head.y < 0) {
        head.y = GRID_SIZE - 1;
    } else if (head.y >= GRID_SIZE) {
        head.y = 0;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        
        // Update high score
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        food = generateFood();
        
        // Increase speed slightly
        if (gameSpeed > 50) {
            gameSpeed -= 2;
            clearInterval(gameLoop);
            gameLoop = setInterval(gameStep, gameSpeed);
        }
    } else {
        snake.pop();
    }
}

// Game step
function gameStep() {
    moveSnake();
    if (isGameRunning) {
        draw();
    }
}

// Game over
function gameOver() {
    isGameRunning = false;
    clearInterval(gameLoop);
    gameOverElement.classList.remove('hidden');
}

// Start game
function startGame() {
    if (isGameRunning) return;
    
    initSnake();
    food = generateFood();
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameSpeed = 150;
    scoreElement.textContent = score;
    gameOverElement.classList.add('hidden');
    isGameRunning = true;
    
    draw();
    gameLoop = setInterval(gameStep, gameSpeed);
}

// Reset game
function resetGame() {
    clearInterval(gameLoop);
    isGameRunning = false;
    initSnake();
    food = generateFood();
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameSpeed = 150;
    scoreElement.textContent = score;
    gameOverElement.classList.add('hidden');
    draw();
}

// Handle keyboard input
function handleKeyPress(e) {
    const key = e.key.toLowerCase();
    
    switch (key) {
        case 'arrowup':
        case 'w':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'arrowdown':
        case 's':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'arrowleft':
        case 'a':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'arrowright':
        case 'd':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
    
    // Prevent default scrolling for arrow keys
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
    }
}

// Event listeners
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
document.addEventListener('keydown', handleKeyPress);

// Initial draw
initSnake();
food = generateFood();
draw();
