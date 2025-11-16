// Space Invaders Game
const spaceHeroes = ["Ripley", "Skywalker", "Kirk", "Spock", "Solo", "Leia", "Picard", "Sulu", "Uhura", "Shepard"];
const familyNames = ["Vanessa", "Luan", "Timo", "Oliver"];

// Snowflake system
function createSnowflakes() {
    const isMobile = window.innerWidth <= 768;
    const snowflakeCount = isMobile ? 30 : 50;
    
    for (let i = 0; i < snowflakeCount; i++) {
        setTimeout(() => {
            createSnowflake();
        }, i * 200);
    }
    
    setInterval(() => {
        if (document.querySelectorAll('.snowflake').length < snowflakeCount) {
            createSnowflake();
        }
    }, 2000);
}

function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    
    const showName = Math.random() < 0.2;
    if (showName) {
        const name = familyNames[Math.floor(Math.random() * familyNames.length)];
        snowflake.textContent = name;
        snowflake.style.fontSize = '14px';
        snowflake.style.fontWeight = '700';
        snowflake.style.color = '#00ffff';
        snowflake.style.textShadow = '0 0 10px #00ffff, 0 0 20px #00ff00';
        snowflake.style.width = 'auto';
        snowflake.style.height = 'auto';
        snowflake.style.background = 'none';
        snowflake.style.borderRadius = '0';
        snowflake.style.boxShadow = 'none';
        snowflake.style.padding = '5px';
    } else {
        const snowflakeEmojis = ['❄️', '❅', '❆', '🌟', '⭐'];
        snowflake.textContent = snowflakeEmojis[Math.floor(Math.random() * snowflakeEmojis.length)];
        snowflake.style.fontSize = '20px';
    }
    
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
    snowflake.style.opacity = Math.random() * 0.6 + 0.4;
    
    document.body.appendChild(snowflake);
    
    setTimeout(() => {
        snowflake.remove();
    }, 5000);
}

let globalAudioContext = null;
function initAudio() {
    if (!globalAudioContext) {
        globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return globalAudioContext;
}

function playSound(type) {
    const audioContext = initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'shoot':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'hit':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        case 'death':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
        case 'alienShoot':
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
            break;
        case 'win':
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
    }
}

let playerName = '';

function startGame() {
    const startScreen = document.getElementById('startScreen');
    const gameContainer = document.getElementById('gameContainer');
    const instructions = document.getElementById('instructions');
    const countdown = document.getElementById('countdown');
    const nameInput = document.getElementById('playerNameInput');
    
    playerName = nameInput.value.trim();
    if (!playerName) {
        playerName = familyNames[Math.floor(Math.random() * familyNames.length)];
    }
    
    startScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    instructions.style.display = 'block';
    
    const ranking = document.getElementById('ranking');
    if (ranking) ranking.style.display = 'none';
    
    let count = 3;
    countdown.style.display = 'block';
    countdown.textContent = count;
    
    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdown.textContent = count;
        } else {
            countdown.textContent = 'GO!';
            setTimeout(() => {
                countdown.style.display = 'none';
                initGame();
            }, 500);
            clearInterval(countdownInterval);
        }
    }, 1000);
}

let player, aliens = [], playerLasers = [], alienLasers = [];
let score = 0, gameOver = false, alienDirection = 1, alienSpeed = 1;
let gameLoop, shootCooldown = false;

function initGame() {
    const gameContainer = document.getElementById('gameContainer');
    const scoreDisplay = document.getElementById('score');
    
    gameContainer.innerHTML = '';
    scoreDisplay.textContent = 'SCORE: 0';
    
    score = 0;
    gameOver = false;
    aliens = [];
    playerLasers = [];
    alienLasers = [];
    
    player = {
        x: gameContainer.offsetWidth / 2 - 25,
        y: gameContainer.offsetHeight - 60,
        width: 50,
        height: 50,
        element: null
    };
    
    // Responsive alien grid - adjust spacing based on container width
    const rows = 4, cols = 8;
    const containerWidth = gameContainer.offsetWidth;
    const isMobile = window.innerWidth <= 768;
    const alienWidth = isMobile ? 30 : 40;
    const alienHeight = isMobile ? 30 : 40;
    const spacing = Math.min(60, (containerWidth - 40) / cols); // Adaptive spacing
    const totalWidth = cols * spacing;
    const startX = (containerWidth - totalWidth) / 2 + spacing / 2 - alienWidth / 2;
    const startY = 40;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            aliens.push({
                x: startX + col * spacing,
                y: startY + row * spacing,
                width: alienWidth,
                height: alienHeight,
                element: createAlien()
            });
        }
    }
    
    // Create player after GO! message disappears (wait 1 second to be safe)
    setTimeout(() => {
        player.element = createPlayer();
    }, 1000);
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    let touchStartX = 0;
    let touchMoved = false;
    
    gameContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchMoved = false;
    });
    
    gameContainer.addEventListener('touchmove', (e) => {
        e.preventDefault();
        touchMoved = true;
        if (!player.element) return;
        const touchX = e.touches[0].clientX;
        const containerRect = gameContainer.getBoundingClientRect();
        const relativeX = touchX - containerRect.left;
        player.x = Math.max(0, Math.min(relativeX - player.width / 2, gameContainer.offsetWidth - player.width));
        player.element.style.left = player.x + 'px';
    }, { passive: false });
    
    gameContainer.addEventListener('touchend', (e) => {
        if (!touchMoved && player.element && !shootCooldown) {
            shoot();
        }
    });
    
    gameLoop = setInterval(update, 1000 / 60);
    setInterval(() => { if (!gameOver && aliens.length > 0) alienShoot(); }, 1500);
}

function createPlayer() {
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;left:${player.x}px;bottom:10px;width:50px;height:50px;font-size:45px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 10px #ff0000)`;
    el.innerHTML = '🚀';
    document.getElementById('gameContainer').appendChild(el);
    return el;
}

function createAlien() {
    const el = document.createElement('div');
    // Smaller aliens on mobile
    const isMobile = window.innerWidth <= 768;
    const size = isMobile ? 30 : 40;
    const fontSize = isMobile ? 26 : 35;
    el.style.cssText = `position:absolute;width:${size}px;height:${size}px;font-size:${fontSize}px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 10px #00ff00)`;
    el.innerHTML = '👾';
    document.getElementById('gameContainer').appendChild(el);
    return el;
}

function createLaser(x, y, isPlayer) {
    const el = document.createElement('div');
    const color = isPlayer ? '#ff0000' : '#00ff00';
    el.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:3px;height:15px;background:${color};box-shadow:0 0 10px ${color}`;
    document.getElementById('gameContainer').appendChild(el);
    return el;
}

let keysPressed = {};
function handleKeyDown(e) {
    keysPressed[e.key] = true;
    if (e.key === ' ') { e.preventDefault(); shoot(); }
}
function handleKeyUp(e) { keysPressed[e.key] = false; }

function movePlayer(dir) {
    if (!player.element) return;
    const container = document.getElementById('gameContainer');
    if (dir === 'left' && player.x > 0) player.x -= 5;
    if (dir === 'right' && player.x < container.offsetWidth - player.width) player.x += 5;
    player.element.style.left = player.x + 'px';
}

function shoot() {
    if (gameOver || shootCooldown || !player.element) return;
    shootCooldown = true;
    setTimeout(() => shootCooldown = false, 300);
    
    playerLasers.push({
        x: player.x + player.width / 2 - 1.5,
        y: player.y,
        width: 3,
        height: 15,
        element: createLaser(player.x + player.width / 2 - 1.5, player.y, true)
    });
    playSound('shoot');
}

function alienShoot() {
    if (aliens.length === 0) return;
    const shooter = aliens[Math.floor(Math.random() * aliens.length)];
    alienLasers.push({
        x: shooter.x + shooter.width / 2 - 1.5,
        y: shooter.y + shooter.height,
        width: 3,
        height: 15,
        element: createLaser(shooter.x + shooter.width / 2 - 1.5, shooter.y + shooter.height, false)
    });
    playSound('alienShoot');
}

function update() {
    if (gameOver) return;
    
    if (keysPressed['ArrowLeft'] || keysPressed['a']) movePlayer('left');
    if (keysPressed['ArrowRight'] || keysPressed['d']) movePlayer('right');
    
    updateAliens();
    updateLasers();
    checkCollisions();
    
    if (aliens.length === 0) winGame();
}

function updateAliens() {
    const container = document.getElementById('gameContainer');
    let descend = false;
    
    for (let alien of aliens) {
        if ((alienDirection > 0 && alien.x + alien.width >= container.offsetWidth) ||
            (alienDirection < 0 && alien.x <= 0)) {
            descend = true;
            break;
        }
    }
    
    if (descend) {
        alienDirection *= -1;
        for (let alien of aliens) {
            alien.y += 20;
            if (player.element && alien.y + alien.height >= player.y) { endGame(); return; }
        }
    }
    
    for (let alien of aliens) {
        alien.x += alienDirection * alienSpeed;
        alien.element.style.left = alien.x + 'px';
        alien.element.style.top = alien.y + 'px';
    }
}

function updateLasers() {
    for (let i = playerLasers.length - 1; i >= 0; i--) {
        playerLasers[i].y -= 5;
        playerLasers[i].element.style.top = playerLasers[i].y + 'px';
        if (playerLasers[i].y < 0) {
            playerLasers[i].element.remove();
            playerLasers.splice(i, 1);
        }
    }
    
    for (let i = alienLasers.length - 1; i >= 0; i--) {
        alienLasers[i].y += 3;
        alienLasers[i].element.style.top = alienLasers[i].y + 'px';
        if (alienLasers[i].y > document.getElementById('gameContainer').offsetHeight) {
            alienLasers[i].element.remove();
            alienLasers.splice(i, 1);
        }
    }
}

function checkCollisions() {
    for (let i = playerLasers.length - 1; i >= 0; i--) {
        for (let j = aliens.length - 1; j >= 0; j--) {
            if (isColliding(playerLasers[i], aliens[j])) {
                playerLasers[i].element.remove();
                playerLasers.splice(i, 1);
                aliens[j].element.remove();
                aliens.splice(j, 1);
                score += 10;
                document.getElementById('score').textContent = 'SCORE: ' + score;
                playSound('hit');
                break;
            }
        }
    }
    
    if (player.element) {
        for (let laser of alienLasers) {
            if (isColliding(laser, player)) { endGame(); return; }
        }
    }
}

function isColliding(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
}

function endGame() {
    gameOver = true;
    clearInterval(gameLoop);
    playSound('death');
    saveScore(score);
    displayRanking();
    setTimeout(() => {
        if (confirm(`👾 GAME OVER! 👾\n\nFinal Score: ${score}\n\nPlay again?`)) {
            document.location.reload();
        }
    }, 500);
}

function winGame() {
    gameOver = true;
    clearInterval(gameLoop);
    playSound('win');
    score += 100;
    document.getElementById('score').textContent = 'SCORE: ' + score;
    saveScore(score);
    displayRanking();
    setTimeout(() => {
        if (confirm(`🏆 YOU WIN! 🏆\n\nFinal Score: ${score}\n\nPlay again?`)) {
            document.location.reload();
        }
    }, 500);
}

window.globalRankings = window.globalRankings || JSON.parse(localStorage.getItem('rankings')) || [];

function saveScore(score) {
    const name = playerName || spaceHeroes[Math.floor(Math.random() * spaceHeroes.length)];
    window.globalRankings.push({ name: name, score: score });
    window.globalRankings.sort((a, b) => b.score - a.score);
    window.globalRankings = window.globalRankings.slice(0, 10);
    localStorage.setItem('rankings', JSON.stringify(window.globalRankings));
    try {
        const channel = new BroadcastChannel('rankings');
        channel.postMessage({ type: 'update', rankings: window.globalRankings });
    } catch (e) {}
}

function displayRanking() {
    const ranking = document.getElementById('ranking');
    if (ranking) ranking.style.display = 'block';
    
    const list = document.getElementById('rankingList');
    list.innerHTML = '';
    window.globalRankings.forEach((entry, i) => {
        const li = document.createElement('li');
        li.textContent = `${i + 1}. ${entry.name}: ${entry.score}`;
        list.appendChild(li);
    });
}

function resetRanking() {
    if (confirm('Reset all rankings?')) {
        window.globalRankings = [];
        localStorage.removeItem('rankings');
        displayRanking();
        try {
            const channel = new BroadcastChannel('rankings');
            channel.postMessage({ type: 'reset' });
        } catch (e) {}
    }
}

try {
    const channel = new BroadcastChannel('rankings');
    channel.onmessage = (e) => {
        if (e.data.type === 'update') window.globalRankings = e.data.rankings;
        else if (e.data.type === 'reset') window.globalRankings = [];
        displayRanking();
    };
} catch (e) {}

createSnowflakes();
displayRanking();
document.getElementById('version').textContent = 'Version: Space Invaders v2.0 Mobile on - k8s homelab, https://www.containerize.ch/';
