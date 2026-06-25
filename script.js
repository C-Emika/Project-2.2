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

let WIDTH = canvas.width;
let HEIGHT = canvas.height;
const WORLD_HEIGHT = 3200;
const GOAL_Y = 120;

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
  y: WORLD_HEIGHT - 32 - 52,
  width: 48,
  height: 52,
  vx: 0,
  vy: 0,
  speed: 7.5,
  onGround: false,
  onIce: false,
  jumpCount: 0,
  facingRight: true,
};

// sprite assets (place your images in `assets/`)
const assets = {
  heart: null,
  catSit: null,
  catStand: null,
  catWalk1: null,
  catWalk2: null,
};
let walkFrame = 0;
let walkTimer = 0;
let lastMoveTime = Date.now();
let isSitting = false;

function resetGame() {
  gameState = 'playing';
  lives = 9;
  player.x = WIDTH / 2 - 24;
  player.y = WORLD_HEIGHT - 32 - player.height;
  player.vx = 0;
  player.vy = 0;
  player.onGround = true;
  player.onIce = false;
  player.jumpCount = 0;
  cameraY = WORLD_HEIGHT - HEIGHT;
  confetti = [];
  createPlatforms();
  createStars();
  hud.classList.remove('hidden');
  updateHUD();
}

function resizeCanvas() {
  const oldW = WIDTH || 640;
  const relX = oldW > 0 ? player.x / oldW : 0.5;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  WIDTH = canvas.width;
  HEIGHT = canvas.height;
  player.x = Math.max(0, Math.min(relX * WIDTH, WIDTH - player.width));
  createPlatforms();
  createStars();
  cameraY = clamp(player.y - HEIGHT * 0.55, 0, WORLD_HEIGHT - HEIGHT);
}

function createPlatforms() {
  platforms = [];
  platforms.push({ x: 0, y: WORLD_HEIGHT - 32, width: WIDTH, height: 32, type: 'ground', variant: 'ground', waitTime: 0 });
  const rows = [];
  for (let y = WORLD_HEIGHT - 180; y > GOAL_Y + 140; y -= 210) {
    rows.push(y);
  }
  const column = [40, 200, 360, 520];
  rows.forEach((y, index) => {
    const x = column[index % column.length];
    const width = Math.max(140, 240 - index * 8);
    const variant = index % 7 === 2 ? 'breakable' : index % 5 === 3 ? 'ice' : 'normal';
    platforms.push({ x, y, width, height: 20, type: 'platform', variant, waitTime: 0 });
    if (index % 2 === 0) {
      const altWidth = Math.max(120, width * 0.75);
      const altVariant = (index + 3) % 8 === 0 ? 'ice' : 'normal';
      platforms.push({ x: WIDTH - x - altWidth, y: y - 120, width: altWidth, height: 20, type: 'platform', variant: altVariant, waitTime: 0 });
    }
  });
}

function createStars() {
  stars = [];
  for (let i = 0; i < 120; i += 1) {
    stars.push({ x: Math.random() * WIDTH, y: Math.random() * (HEIGHT - 140), radius: Math.random() * 1.5 + 0.7, alpha: Math.random() * 0.65 + 0.35 });
  }
}

function loadAssets(basePath = 'assets') {
  const load = (src) => new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
  return Promise.all([
    load(`${basePath}/heart.png`).then((i) => (assets.heart = i)),
    load(`${basePath}/cat_sit.png`).then((i) => (assets.catSit = i)),
    load(`${basePath}/cat_stand.png`).then((i) => (assets.catStand = i)),
    load(`${basePath}/cat_walk1.png`).then((i) => (assets.catWalk1 = i)),
    load(`${basePath}/cat_walk2.png`).then((i) => (assets.catWalk2 = i)),
  ]).catch(() => {});
}

function drawLives() {
  const livesEl = document.getElementById('lives');
  if (!livesEl) return;
  livesEl.innerHTML = '';
  const total = 9;
  for (let i = 0; i < total; i += 1) {
    const img = document.createElement('img');
    if (assets.heart) {
      img.src = 'assets/heart.png';
    } else {
      img.textContent = '♥';
    }
    img.alt = '♥';
    if (i >= lives) img.classList.add('empty');
    livesEl.appendChild(img);
  }
}

function updateHUD() {
  drawLives();
  // ground should read as 0 meters (ground platform is 32px high)
  const heightMeters = Math.max(0, Math.round((WORLD_HEIGHT - player.y - player.height - 32) / 10));
  document.getElementById('height').textContent = `Height: ${heightMeters}m`;
}

function showScreen(screen) {
  [titleScreen, introScreen, winScreen].forEach((screenEl) => {
    screenEl.classList.add('hidden');
    screenEl.classList.remove('active');
  });

  if (screen === 'title') {
    titleScreen.classList.remove('hidden');
    titleScreen.classList.add('active');
  }
  if (screen === 'intro') {
    introScreen.classList.remove('hidden');
    introScreen.classList.add('active');
  }
  if (screen === 'win') {
    winScreen.classList.remove('hidden');
    winScreen.classList.add('active');
  }
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
  const skyTop = mixColor('#0b2143', '#1f4c88', progress * 0.65 + 0.1);
  const skyBottom = mixColor('#d9f3ff', '#9ec9ff', progress * 0.35 + 0.25);
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
    if (plat.type === 'ground') {
      ctx.fillStyle = '#2f4e38';
    } else if (plat.variant === 'ice') {
      ctx.fillStyle = '#c7ecff';
    } else if (plat.variant === 'breakable') {
      ctx.fillStyle = '#f7b76c';
    } else {
      ctx.fillStyle = '#ffffffcc';
    }
    ctx.fillRect(plat.x, screenY, plat.width, plat.height);

    if (plat.type === 'platform') {
      ctx.strokeStyle = plat.variant === 'ice' ? 'rgba(50, 130, 190, 0.55)' : 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(plat.x, screenY);
      ctx.lineTo(plat.x + plat.width, screenY);
      ctx.stroke();

      if (plat.variant === 'ice') {
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1;
        for (let i = 10; i < plat.width; i += 20) {
          ctx.beginPath();
          ctx.moveTo(plat.x + i, screenY + 4);
          ctx.lineTo(plat.x + i + 10, screenY + 10);
          ctx.stroke();
        }
      }

      if (plat.variant === 'breakable') {
        ctx.strokeStyle = 'rgba(180, 50, 20, 0.7)';
        ctx.lineWidth = 2;
        const crackX = plat.x + plat.width / 2;
        ctx.beginPath();
        ctx.moveTo(crackX - 12, screenY + 6);
        ctx.lineTo(crackX, screenY + 12);
        ctx.lineTo(crackX + 10, screenY + 4);
        ctx.stroke();
        if (plat.waitTime > 60) {
          ctx.fillStyle = 'rgba(255,120,80,0.3)';
          ctx.fillRect(plat.x, screenY, plat.width, plat.height);
        }
      }
    }
  });
}

function drawCat() {
  const px = Math.round(player.x);
  const py = Math.round(player.y - cameraY);
  const w = player.width;
  const h = player.height;
  const now = Date.now();
  const moving = keys.left || keys.right;
  if (moving) {
    lastMoveTime = now;
    player.facingRight = keys.right || !keys.left;
  }

  isSitting = !moving && (now - lastMoveTime > 2000) && player.onGround;

  let sprite = null;
  if (isSitting && assets.catSit) sprite = assets.catSit;
  else if (moving && assets.catWalk1 && assets.catWalk2) {
    walkTimer += 16;
    if (walkTimer >= 500) {
      walkTimer = 0;
      walkFrame = (walkFrame + 1) % 2;
    }
    sprite = walkFrame === 0 ? assets.catWalk1 : assets.catWalk2;
  } else if (assets.catStand) sprite = assets.catStand;

  if (sprite) {
    ctx.save();
    if (!player.facingRight) {
      // Flip horizontally: translate to right edge and scale left
      ctx.translate(px + w, py);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, 0, 0, w, h);
    } else {
      ctx.drawImage(sprite, px, py, w, h);
    }
    ctx.restore();
    return;
  }

  // fallback vector cat if sprites aren't available
  const fx = px;
  const fy = py;
  ctx.save();
  ctx.translate(fx + w / 2, fy + h / 2);
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
  const wasOnGround = player.onGround;
  player.onGround = false;
  player.onIce = false;
  let standingPlatform = null;

  player.vy += 0.9;
  const oldY = player.y;
  const newY = player.y + player.vy;
  const oldBottom = oldY + player.height;
  const newBottom = newY + player.height;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > WIDTH) player.x = WIDTH - player.width;

  platforms.forEach((plat) => {
    const isHorizontalOverlap = player.x + player.width > plat.x + 4 && player.x < plat.x + plat.width - 4;
    if (!isHorizontalOverlap) return;

    const platformTop = plat.y;
    const platformBottom = plat.y + plat.height;
    const playerTop = oldY;
    const newTop = newY;

    if (oldBottom <= platformTop && newBottom >= platformTop && player.vy >= 0) {
      player.y = platformTop - player.height;
      player.vy = 0;
      player.onGround = true;
      player.jumpCount = 0;
      if (plat.variant === 'ice') player.onIce = true;
      if (plat.variant === 'breakable') standingPlatform = plat;
    } else if (playerTop >= platformBottom && newTop <= platformBottom && player.vy < 0) {
      player.y = platformBottom;
      player.vy = 0;
    }
  });

  // landing and fall-damage detection
  if (!wasOnGround && player.onGround) {
    // just landed
    if (dropStartY !== null) {
      const fallPixels = dropStartY - player.y;
      const fallThreshold = 30 * 10; // 30 meters -> 300 pixels
      if (fallPixels >= fallThreshold) {
        lives -= 1;
        drawLives();
        if (lives <= 0) {
          resetGame();
          return;
        }
      }
    }
    dropStartY = null;
  } else if (wasOnGround && !player.onGround) {
    // started falling
    dropStartY = oldY;
  }

  if (!player.onGround) {
    player.y = newY;
  }

  // horizontal movement: acceleration then apply friction based on surface
  const acceleration = player.onIce ? 0.6 : 0.85;
  if (keys.left) player.vx = Math.max(player.vx - acceleration, -player.speed);
  if (keys.right) player.vx = Math.min(player.vx + acceleration, player.speed);
  if (player.onIce) {
    player.vx *= 0.992;
  } else if (player.onGround) {
    player.vx *= 0.80; // increased friction on normal ground
    if (Math.abs(player.vx) < 0.12) player.vx = 0; // deadzone to stop micro-sliding
  } else {
    player.vx *= 0.98;
  }

  const oldX = player.x;
  player.x += player.vx;

  // horizontal collision resolution to prevent phasing through platforms
  platforms.forEach((plat) => {
    const platTop = plat.y;
    const platBottom = plat.y + plat.height;
    const verticalOverlap = player.y + player.height > platTop && player.y < platBottom;
    if (!verticalOverlap) return;
    if (oldX + player.width <= plat.x && player.x + player.width > plat.x) {
      // hit from left
      player.x = plat.x - player.width;
      player.vx = 0;
    } else if (oldX >= plat.x + plat.width && player.x < plat.x + plat.width) {
      // hit from right
      player.x = plat.x + plat.width;
      player.vx = 0;
    }
  });

  if (standingPlatform) {
    standingPlatform.waitTime += 1;
    if (standingPlatform.waitTime >= 120) {
      platforms = platforms.filter((plat) => plat !== standingPlatform);
      // platform broke while player was standing - start falling
      dropStartY = player.y;
      player.onGround = false;
    }
  } else {
    platforms.forEach((plat) => {
      if (plat.variant === 'breakable') plat.waitTime = 0;
    });
  }

  const scale = Math.max(1.0, HEIGHT / 900);
  const groundJump = -19.5 * scale;
  const airJump = -17.5 * scale;
  if (player.onGround && keys.jump) {
    player.vy = groundJump;
    player.jumpCount = 1;
    keys.jump = false;
  }

  if (!player.onGround && keys.jump && player.jumpCount < 2) {
    player.vy = airJump;
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
    player.y = WORLD_HEIGHT - 32 - player.height;
    player.vx = 0;
    player.vy = 0;
    player.jumpCount = 0;
    player.onGround = true;
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
    update();
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
// initialize canvas size and content
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
// load optional assets then start
loadAssets().finally(() => {
  drawLives();
});

showScreen('title');
loop();
