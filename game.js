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
    
    switch(type) {
        case 'shoot':
            // Jingle bell shoot sound
            playNote(audioContext, 1046.5, 0.05, 0.3); // High C
            setTimeout(() => playNote(audioContext, 1318.5, 0.05, 0.25), 50); // High E
            break;
        case 'hit':
            // Jingle bell hit - festive chime
            playNote(audioContext, 1568, 0.1, 0.4); // High G
            setTimeout(() => playNote(audioContext, 1318.5, 0.1, 0.3), 60);
            setTimeout(() => playNote(audioContext, 1046.5, 0.15, 0.2), 120);
            break;
        case 'death':
            // Sad descending Christmas bells
            playNote(audioContext, 523.25, 0.2, 0.4); // C
            setTimeout(() => playNote(audioContext, 466.16, 0.2, 0.35), 150);
            setTimeout(() => playNote(audioContext, 392, 0.3, 0.3), 300);
            break;
        case 'alienShoot':
            // Darker jingle
            playNote(audioContext, 349.23, 0.08, 0.25); // F
            setTimeout(() => playNote(audioContext, 293.66, 0.08, 0.2), 60);
            break;
        case 'win':
            // Jingle Bells melody snippet
            playNote(audioContext, 659.25, 0.15, 0.3); // E
            setTimeout(() => playNote(audioContext, 659.25, 0.15, 0.3), 150);
            setTimeout(() => playNote(audioContext, 659.25, 0.3, 0.3), 300);
            setTimeout(() => playNote(audioContext, 659.25, 0.15, 0.3), 600);
            setTimeout(() => playNote(audioContext, 659.25, 0.15, 0.3), 750);
            setTimeout(() => playNote(audioContext, 659.25, 0.3, 0.3), 900);
            setTimeout(() => playNote(audioContext, 659.25, 0.15, 0.3), 1200);
            setTimeout(() => playNote(audioContext, 783.99, 0.15, 0.3), 1350); // G
            setTimeout(() => playNote(audioContext, 523.25, 0.2, 0.3), 1500); // C
            setTimeout(() => playNote(audioContext, 587.33, 0.15, 0.3), 1700); // D
            setTimeout(() => playNote(audioContext, 659.25, 0.4, 0.3), 1850); // E
            break;
    }
}

function playNote(audioContext, frequency, duration, volume) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Bell-like sound using sine wave with harmonics
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    
    // Add harmonic overtone for bell effect
    const harmonic = audioContext.createOscillator();
    const harmonicGain = audioContext.createGain();
    
    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(frequency * 2, audioContext.currentTime);
    harmonicGain.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
    harmonicGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration * 0.8);
    
    harmonic.connect(harmonicGain);
    harmonicGain.connect(audioContext.destination);
    
    harmonic.start(audioContext.currentTime);
    harmonic.stop(audioContext.currentTime + duration * 0.8);
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
                initGame(true);
            }, 500);
            clearInterval(countdownInterval);
        }
    }, 1000);
}

let player, aliens = [], playerLasers = [], alienLasers = [];
let score = 0, gameOver = false, alienDirection = 1, alienSpeed = 1;
let gameLoop, shootCooldown = false;
let currentLevel = 1;

function initGame(newLevel = false) {
    const gameContainer = document.getElementById('gameContainer');
    let scoreDisplay = document.getElementById('score');
    
    // Save score element before clearing
    const scoreParent = scoreDisplay ? scoreDisplay.parentNode : null;
    const scoreHTML = scoreDisplay ? scoreDisplay.outerHTML : '<div class="score" id="score">SCORE: 0</div>';
    
    // Clear game area but keep score
    const children = Array.from(gameContainer.children);
    children.forEach(child => {
        if (child.id !== 'score') {
            child.remove();
        }
    });
    
    // Make sure score element exists
    if (!document.getElementById('score')) {
        gameContainer.insertAdjacentHTML('afterbegin', scoreHTML);
    }
    scoreDisplay = document.getElementById('score');
    
    if (newLevel) {
        // Starting new game
        score = 0;
        currentLevel = 1;
        scoreDisplay.textContent = 'SCORE: 0 | LEVEL: 1';
    } else {
        // Continuing to next level
        scoreDisplay.textContent = `SCORE: ${score} | LEVEL: ${currentLevel}`;
    }
    
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
    
    // Calculate number of aliens based on level: 2, 4, 8, 16, 30 max
    let alienCount = Math.min(Math.pow(2, currentLevel), 30);
    
    // Responsive alien grid - adjust based on alien count
    const containerWidth = gameContainer.offsetWidth;
    const isMobile = window.innerWidth <= 768;
    const alienWidth = isMobile ? 30 : 40;
    const alienHeight = isMobile ? 30 : 40;
    
    // Determine grid layout based on alien count
    let cols, rows;
    if (alienCount <= 2) {
        cols = 2; rows = 1;
    } else if (alienCount <= 4) {
        cols = 4; rows = 1;
    } else if (alienCount <= 8) {
        cols = 4; rows = 2;
    } else if (alienCount <= 16) {
        cols = 8; rows = 2;
    } else {
        cols = 10; rows = 3;
    }
    
    const spacing = Math.min(60, (containerWidth - 40) / cols); // Adaptive spacing
    const totalWidth = cols * spacing;
    const startX = (containerWidth - totalWidth) / 2 + spacing / 2 - alienWidth / 2;
    const startY = 40;
    
    // Create aliens up to alienCount
    let created = 0;
    for (let row = 0; row < rows && created < alienCount; row++) {
        for (let col = 0; col < cols && created < alienCount; col++) {
            aliens.push({
                x: startX + col * spacing,
                y: startY + row * spacing,
                width: alienWidth,
                height: alienHeight,
                element: createAlien()
            });
            created++;
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
                document.getElementById('score').textContent = `SCORE: ${score} | LEVEL: ${currentLevel}`;
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
    currentLevel++;
    
    const maxAliens = Math.min(Math.pow(2, currentLevel), 30);
    
    // Check if we've completed all levels (level where we'd have 30+ aliens)
    if (maxAliens >= 30 && currentLevel > 5) {
        // Beat the game!
        document.getElementById('score').textContent = `SCORE: ${score} | LEVEL: ${currentLevel - 1} COMPLETE!`;
        saveScore(score);
        displayRanking();
        setTimeout(() => {
            if (confirm(`🎄 YOU BEAT ALL LEVELS! 🎄\n\nFinal Score: ${score}\n\nPlay again?`)) {
                document.location.reload();
            }
        }, 500);
    } else {
        // Progress to next level
        document.getElementById('score').textContent = `SCORE: ${score} | LEVEL: ${currentLevel}`;
        
        const countdown = document.getElementById('countdown');
        countdown.style.display = 'block';
        countdown.textContent = `LEVEL ${currentLevel}`;
        
        setTimeout(() => {
            gameOver = false; // Reset gameOver for next level
            let count = 3;
            countdown.textContent = count;
            
            const countdownInterval = setInterval(() => {
                count--;
                if (count > 0) {
                    countdown.textContent = count;
                } else {
                    countdown.textContent = 'GO!';
                    setTimeout(() => {
                        countdown.style.display = 'none';
                        initGame(false);
                    }, 500);
                    clearInterval(countdownInterval);
                }
            }, 1000);
        }, 1500);
    }
}

// Backend API URL - change this to your server URL
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api' 
    : '/api';  // Use relative path in production

window.globalRankings = [];

// Load rankings from backend on page load
function loadRankings() {
    fetch(`${API_URL}/scores`)
        .then(response => response.json())
        .then(data => {
            window.globalRankings = data.rankings || [];
            displayRanking();
        })
        .catch(err => {
            console.error('Failed to load rankings:', err);
            // Fallback to localStorage
            window.globalRankings = JSON.parse(localStorage.getItem('rankings')) || [];
            displayRanking();
        });
}

function saveScore(score) {
    const name = playerName || spaceHeroes[Math.floor(Math.random() * spaceHeroes.length)];
    const level = currentLevel || 1;
    
    // Save to backend
    fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score, level })
    })
    .then(response => response.json())
    .then(data => {
        window.globalRankings = data.rankings || [];
        displayRanking();
    })
    .catch(err => {
        console.error('Failed to save score:', err);
        // Fallback to localStorage
        window.globalRankings.push({ name, score, level });
        window.globalRankings.sort((a, b) => b.score - a.score);
        window.globalRankings = window.globalRankings.slice(0, 10);
        localStorage.setItem('rankings', JSON.stringify(window.globalRankings));
        displayRanking();
    });
}

function displayRanking() {
    const ranking = document.getElementById('ranking');
    if (ranking) ranking.style.display = 'block';
    
    const list = document.getElementById('rankingList');
    list.innerHTML = '';
    
    if (!window.globalRankings || window.globalRankings.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No scores yet!';
        li.style.opacity = '0.5';
        list.appendChild(li);
        return;
    }
    
    window.globalRankings.forEach((entry, i) => {
        const li = document.createElement('li');
        const levelInfo = entry.level ? ` [L${entry.level}]` : '';
        li.textContent = `${i + 1}. ${entry.name}: ${entry.score}${levelInfo}`;
        list.appendChild(li);
    });
}

function resetRanking() {
    if (confirm('Reset all rankings?')) {
        fetch(`${API_URL}/scores/reset`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            window.globalRankings = [];
            displayRanking();
        })
        .catch(err => {
            console.error('Failed to reset rankings:', err);
            // Fallback to localStorage
            window.globalRankings = [];
            localStorage.removeItem('rankings');
            displayRanking();
        });
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
loadRankings();
document.getElementById('version').textContent = 'Version: Space Invaders v2.0 Mobile on - k8s homelab, AI generated, https://www.containerize.ch';
