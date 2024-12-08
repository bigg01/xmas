const names = ["Oliver", "Vanessa", "Timo", "Luan"];
const nameColors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1"];
const giftIcons = ["🎁", "🎄", "🎅", "❄️"];

function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.style.left = Math.random() * 100 + 'vw';
    snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';

    // Randomly decide whether to use a name, a gift icon, or a snowflake
    const randomChoice = Math.random();
    if (randomChoice < 0.1) { // 10% chance for names
        const nameIndex = Math.floor(Math.random() * names.length);
        snowflake.textContent = " " + names[nameIndex];
        snowflake.style.fontSize = '16px';
        snowflake.style.color = nameColors[nameIndex];
    } else if (randomChoice < 0.2) { // 10% chance for gifts
        const giftIndex = Math.floor(Math.random() * giftIcons.length);
        snowflake.textContent = giftIcons[giftIndex];
        snowflake.style.fontSize = '20px';
    } else { // 80% chance for snowflakes
        snowflake.style.width = '10px';
        snowflake.style.height = '10px';
        snowflake.style.background = 'white';
        snowflake.style.borderRadius = '50%';
        snowflake.style.opacity = 0.8;
    }

    document.body.appendChild(snowflake);
    setTimeout(() => {
        snowflake.remove();
    }, 5000);
}

setInterval(createSnowflake, 100);

function startGame() {
    const playerNameInput = document.getElementById('playerName');
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        document.querySelector('.name-form').style.display = 'none';
        document.querySelector('.game-container').style.display = 'block';
        initGame(playerName);
    } else {
        alert('Please enter your name');
    }
}

function initGame(playerName) {
    const santa = document.getElementById('santa');
    const gameContainer = document.querySelector('.game-container');
    const scoreDisplay = document.getElementById('score');
    const countdownDisplay = document.getElementById('countdown');
    const rankingList = document.getElementById('rankingList');
    let isJumping = false;
    let gravity = 0.9;
    let score = 0;
    let gameOver = false;

    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space' && !gameOver) {
            jump();
        } else if (event.code === 'ArrowUp' && !gameOver) {
            shootGift();
        }
    });

    document.addEventListener('touchstart', function(event) {
        if (!gameOver) {
            jump();
        }
    });

    function jump() {
        if (isJumping) return;
        isJumping = true;
        let position = 0;
        let timerId = setInterval(function() {
            if (position >= 150) {
                clearInterval(timerId);
                let downTimerId = setInterval(function() {
                    if (position <= 0) {
                        clearInterval(downTimerId);
                        isJumping = false;
                    }
                    position -= 5;
                    position = position * gravity;
                    santa.style.bottom = position + 'px';
                }, 20);
            }
            position += 30;
            position = position * gravity;
            santa.style.bottom = position + 'px';
        }, 20);
    }

    function shootGift() {
        const gift = document.createElement('div');
        gift.classList.add('gift');
        gift.style.left = santa.offsetLeft + 'px';
        gameContainer.appendChild(gift);

        let giftPosition = santa.offsetLeft;
        let timerId = setInterval(function() {
            if (giftPosition > 600) {
                clearInterval(timerId);
                gift.remove();
            }
            giftPosition += 10;
            gift.style.left = giftPosition + 'px';
        }, 20);
    }

    function generateObstacle() {
        let obstaclePosition = 800;
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        gameContainer.appendChild(obstacle);
        obstacle.style.left = obstaclePosition + 'px';

        let timerId = setInterval(function() {
            if (obstaclePosition > 0 && obstaclePosition < 80 && parseInt(santa.style.bottom) < 40) {
                clearInterval(timerId);
                gameOver = true;
                saveScore(playerName, score);
                displayRanking();
                alert('Game Over');
                removeGameElements();
                document.location.reload();
            }
            obstaclePosition -= 10;
            obstacle.style.left = obstaclePosition + 'px';
        }, 20);

        if (!gameOver) {
            setTimeout(generateObstacle, Math.random() * 4000);
        }
    }

    function updateScore() {
        if (!gameOver) {
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
        }
    }

    function updateCountdown() {
        const now = new Date();
        const christmas = new Date(now.getFullYear(), 11, 25); // December 25th
        if (now.getMonth() === 11 && now.getDate() > 25) {
            christmas.setFullYear(christmas.getFullYear() + 1);
        }
        const diff = christmas - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        countdownDisplay.textContent = `Christmas in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    function saveScore(name, score) {
        let rankings = JSON.parse(localStorage.getItem('rankings')) || [];
        rankings.push({ name: name, score: score });
        rankings.sort((a, b) => b.score - a.score);
        localStorage.setItem('rankings', JSON.stringify(rankings));
    }

    function displayRanking() {
        let rankings = JSON.parse(localStorage.getItem('rankings')) || [];
        rankingList.innerHTML = rankings.map((entry, index) => `<li>${index + 1}. ${entry.name}: ${entry.score}</li>`).join('');
    }

    function removeGameElements() {
        while (gameContainer.firstChild) {
            gameContainer.removeChild(gameContainer.firstChild);
        }
    }

    generateObstacle();
    setInterval(updateScore, 1000);
    setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call to display countdown immediately
    displayRanking(); // Initial call to display ranking immediately
}