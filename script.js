const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const titleScreen = document.getElementById('titleScreen');
const introScreen = document.getElementById('introScreen');
const winScreen = document.getElementById('winScreen');
const hud = document.getElementById('hud');
const livesText = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const introBtn = document.getElementById('introBtn');
const backBtn = document.getElementById('backBtn');
const playAgainBtn = document.getElementById('playAgainBtn');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const WORLD_HEIGHT = 2400;
const GOAL_Y = 160;

const keys = {
  left: false,
  right: false,
  up: false,
  jump: false,
};

let gameState = 'title';
let cameraY = 0;
let lives = 9;
let confetti = [];
let platforms = [];
let stars = [];
let dropStartY = null;

const player = {
  x: WIDTH / 2 - 24,
  y: WORLD_HEIGHT - 120,
  width: 48,
  height: 52,
  vx: 0,
  vy: 0,
  speed: 5.2,
  onGround: false,
  jumpCount: 0,
};

function resetGame() {
  gameState = 'playing';
  lives = 9;
  player.x = WIDTH / 2 - 24;
  player.y = WORLD_HEIGHT - 120;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.jumpCount = 0;
  cameraY = WORLD_HEIGHT - HEIGHT;
  confetti = [];
  createPlatforms();
  createStars();
  hud.classList.remove('hidden');
  updateHUD();
}

function createPlatforms() {
  platforms = [];
  platforms.push({ x: 0, y: WORLD_HEIGHT - 32, width: WIDTH, height: 32, type: 'ground' });
  const rows = [WORLD_HEIGHT - 200, WORLD_HEIGHT - 340, WORLD_HEIGHT - 520, WORLD_HEIGHT - 700, WORLD_HEIGHT - 860, WORLD_HEIGHT - 1040, WORLD_HEIGHT - 1180, WORLD_HEIGHT - 1340, WORLD_HEIGHT - 1500, WORLD_HEIGHT - 1660, WORLD_HEIGHT - 1820, WORLD_HEIGHT - 1980, WORLD_HEIGHT - 2140, WORLD_HEIGHT - 2300];
  const column = [40, 200, 360, 520];
  rows.forEach((y, index) => {
    const x = column[index % column.length];
    const width = 220 - (index * 8);
    platforms.push({ x, y, width, height: 20, type: 'platform' });
    if (index % 2 === 0) {
      platforms.push({ x: WIDTH - x - width, y: y - 120, width: width * 0.75, height: 20, type: 'platform' });
    }
  });
}

function createStars() {
  stars = [];
  for (let i = 0; i < 120; i += 1) {
    stars.push({ x: Math.random() * WIDTH, y: Math.random() * (HEIGHT - 140), radius: Math.random() * 1.5 + 0.7, alpha: Math.random() * 0.65 + 0.35 });
  }
}

function updateHUD() {
  livesText.textContent = `Lives: ${lives}`;
}

function showScreen(screen) {
  titleScreen.classList.add('hidden');
  introScreen.classList.add('hidden');
  winScreen.classList.add('hidden');
  if (screen === 'title') titleScreen.classList.remove('hidden');
  if (screen === 'intro') introScreen.classList.remove('hidden');
  if (screen === 'win') winScreen.classList.remove('hidden');
}

function startGame() {
  if (gameState === 'title' || gameState === 'win') {
    resetGame();
    showScreen('none');
  }
}

function winGame() {
  gameState = 'win';
  spawnConfetti();
  showScreen('win');
  hud.classList.add('hidden');
}

function spawnConfetti() {
  confetti = [];
  const colors = ['#ff0084', '#ffd400', '#3ddc97', '#6b8eed', '#ff6f61'];
  for (let i = 0; i < 110; i += 1) {
    confetti.push({
      x: Math.random() * WIDTH,
      y: Math.random() * HEIGHT,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 3 + 1,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.04 + 0.02,
    });
  }
}

function handleConfetti() {
  confetti.forEach((piece) => {
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.rotation += piece.speed;
    if (piece.y > HEIGHT + 20) piece.y = -20;
    if (piece.x < -20) piece.x = WIDTH + 20;
    if (piece.x > WIDTH + 20) piece.x = -20;
    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.5);
    ctx.restore();
  });
}

function drawBackground() {
  const progress = 1 - Math.min(Math.max((cameraY / (WORLD_HEIGHT - HEIGHT)) * 1.2, 0), 1);
  const skyTop = mixColor('#0a1c34', '#c3e8ff', progress);
  const skyBottom = mixColor('#090d28', '#7cc9ff', progress * 0.8 + 0.2);
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, skyTop);
  gradient.addColorStop(1, skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.save();
  ctx.translate(0, -cameraY * 0.14);
  const starAlpha = Math.max(0, progress - 0.2) * 1.3;
  ctx.globalAlpha = starAlpha;
  stars.forEach((star) => {
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
  ctx.globalAlpha = 1;
}

function mixColor(a, b, t) {
  const parse = (hex) => hex.match(/.{2}/g).map((x) => parseInt(x, 16));
  const [r1, g1, b1] = parse(a.replace('#', ''));
  const [r2, g2, b2] = parse(b.replace('#', ''));
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

function drawPlants() {
  const groundY = WORLD_HEIGHT - 32;
  for (let i = 0; i < 7; i += 1) {
    const x = 40 + i * 90;
    drawFlower(x, groundY - 16, 16, '#3c8f52', '#f9e35f', '#f26f8b');
  }
  for (let i = 0; i < 6; i += 1) {
    const x = 80 + i * 100;
    drawPlant(x, groundY - 12, 18, '#2f6a34');
  }
}

function drawFlower(x, y, stemHeight, stemColor, petalColor, centerColor) {
  ctx.fillStyle = stemColor;
  ctx.fillRect(x, y - stemHeight, 4, stemHeight);
  ctx.fillStyle = petalColor;
  for (let j = 0; j < 6; j++) {
    const angle = (Math.PI * 2 * j) / 6;
    const px = x + 8 + Math.cos(angle) * 10;
    const py = y - stemHeight + Math.sin(angle) * 8;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(x + 8, y - stemHeight, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlant(x, y, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y - height, 4, height);
  ctx.beginPath();
  ctx.moveTo(x + 2, y - height + 4);
  ctx.quadraticCurveTo(x + 18, y - height + 16, x + 2, y - height + 28);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 2, y - height + 14);
  ctx.quadraticCurveTo(x - 14, y - height + 26, x + 2, y - height + 38);
  ctx.fill();
}

function drawPlatforms() {
  platforms.forEach((plat) => {
    const screenY = plat.y - cameraY;
    ctx.fillStyle = plat.type === 'ground' ? '#2f4e38' : '#ffffffcc';
    ctx.fillRect(plat.x, screenY, plat.width, plat.height);
    if (plat.type === 'platform') {
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(plat.x, screenY);
      ctx.lineTo(plat.x + plat.width, screenY);
      ctx.stroke();
    }
  });
}

function drawCat() {
  const px = player.x;
  const py = player.y - cameraY;
  ctx.save();
  ctx.translate(px + player.width / 2, py + player.height / 2);
  ctx.fillStyle = '#f7c24b';
  ctx.beginPath();
  ctx.ellipse(0, -6, 22, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fc9d2d';
  ctx.beginPath();
  ctx.moveTo(-18, -28);
  ctx.lineTo(-4, -52);
  ctx.lineTo(4, -28);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(18, -28);
  ctx.lineTo(10, -52);
  ctx.lineTo(2, -28);
  ctx.fill();
  ctx.fillStyle = '#fff7e1';
  ctx.beginPath();
  ctx.ellipse(-10, -8, 7, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10, -8, 7, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3f2d1f';
  ctx.beginPath();
  ctx.arc(-10, -8, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(10, -8, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3f2d1f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4, 6);
  ctx.lineTo(0, 10);
  ctx.lineTo(4, 6);
  ctx.stroke();
  ctx.fillStyle = '#f7c24b';
  ctx.fillRect(-24, 10, 14, 14);
  ctx.fillRect(10, 10, 14, 14);
  ctx.restore();
}

function applyPhysics() {
  player.vx *= 0.92;
  if (keys.left) player.vx = Math.max(player.vx - 0.7, -player.speed);
  if (keys.right) player.vx = Math.min(player.vx + 0.7, player.speed);
  player.x += player.vx;
  player.vy += 0.9;
  player.y += player.vy;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > WIDTH) player.x = WIDTH - player.width;

  player.onGround = false;
  platforms.forEach((plat) => {
    if (
      player.x + player.width > plat.x + 4 &&
      player.x < plat.x + plat.width - 4 &&
      player.y + player.height <= plat.y + 20 &&
      player.y + player.height + player.vy >= plat.y
    ) {
      player.y = plat.y - player.height;
      player.vy = 0;
      player.onGround = true;
      player.jumpCount = 0;
    }
  });

  if (player.onGround && keys.jump) {
    player.vy = -18.5;
    player.jumpCount = 1;
    keys.jump = false;
  }

  if (!player.onGround && keys.jump && player.jumpCount < 2) {
    player.vy = -17;
    player.jumpCount += 1;
    keys.jump = false;
  }

  if (player.y > WORLD_HEIGHT + 120) {
    lives -= 1;
    if (lives <= 0) {
      lives = 9;
      resetGame();
      return;
    }
    player.x = WIDTH / 2 - 24;
    player.y = WORLD_HEIGHT - 120;
    player.vx = 0;
    player.vy = 0;
    player.jumpCount = 0;
    cameraY = WORLD_HEIGHT - HEIGHT;
  }

  cameraY = clamp(player.y - HEIGHT * 0.55, 0, WORLD_HEIGHT - HEIGHT);
  updateHUD();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function drawGoal() {
  const topBar = GOAL_Y - cameraY;
  ctx.fillStyle = '#ffe66d';
  ctx.fillRect(0, topBar, WIDTH, 10);
  ctx.fillStyle = '#fff';
  ctx.font = '700 24px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Space Gate', WIDTH / 2, topBar - 12);
}

function handleInput(event, isDown) {
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') keys.left = isDown;
  if (event.code === 'ArrowRight' || event.code === 'KeyD') keys.right = isDown;
  if (event.code === 'ArrowUp' || event.code === 'KeyW' || event.code === 'Space') {
    if (isDown) keys.jump = true;
    if (!isDown) keys.jump = false;
  }
}

function draw() {
  if (gameState === 'title') return;
  drawBackground();
  drawPlants();
  drawPlatforms();
  drawGoal();
  drawCat();
  if (gameState === 'win') handleConfetti();
}

function update() {
  if (gameState === 'playing') {
    applyPhysics();
    if (player.y <= GOAL_Y + 36) {
      winGame();
    }
  }
}

function loop() {
  if (gameState !== 'title') {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    draw();
  }
  if (gameState === 'win') handleConfetti();
  requestAnimationFrame(loop);
}

startBtn.addEventListener('click', () => {
  showScreen('none');
  startGame();
});
introBtn.addEventListener('click', () => {
  showScreen('intro');
});
backBtn.addEventListener('click', () => {
  showScreen('title');
});
playAgainBtn.addEventListener('click', () => {
  showScreen('none');
  resetGame();
});

window.addEventListener('keydown', (event) => {
  handleInput(event, true);
});
window.addEventListener('keyup', (event) => {
  handleInput(event, false);
});

showScreen('title');
createPlatforms();
createStars();
loop();
