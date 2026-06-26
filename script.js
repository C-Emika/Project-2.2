const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const titleScreen = document.getElementById('titleScreen');
const introScreen = document.getElementById('introScreen');
const winScreen = document.getElementById('winScreen');
const deathScreen = document.getElementById('deathScreen');
const hud = document.getElementById('hud');
const livesText = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const introBtn = document.getElementById('introBtn');
const backBtn = document.getElementById('backBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const resetBtn = document.getElementById('resetBtn');
const quitBtn = document.getElementById('quitBtn');
const deathPlayAgainBtn = document.getElementById('deathPlayAgainBtn');
const deathQuitBtn = document.getElementById('deathQuitBtn');

let WIDTH = canvas.width;
let HEIGHT = canvas.height;
const WORLD_HEIGHT = 4200;
const GOAL_Y = 120;

const keys = {
  left: false,
  right: false,
  up: false,
  down: false,
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
  bgTitle: null,
};
let walkFrame = 0;
let walkTimer = 0;
let lastMoveTime = Date.now();
let isSitting = false;
let savedProgress = null;
const spriteFrameCache = new WeakMap();

function getSpriteFrame(img) {
  if (!img) return null;
  if (spriteFrameCache.has(img)) return spriteFrameCache.get(img);

  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = w;
  tmpCanvas.height = h;
  const tmpCtx = tmpCanvas.getContext('2d');
  tmpCtx.drawImage(img, 0, 0);
  const pixels = tmpCtx.getImageData(0, 0, w, h).data;

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const alpha = pixels[(y * w + x) * 4 + 3];
      if (alpha > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  const frame = maxX >= 0
    ? { sx: minX, sy: minY, sw: maxX - minX + 1, sh: maxY - minY + 1 }
    : { sx: 0, sy: 0, sw: w, sh: h };

  spriteFrameCache.set(img, frame);
  return frame;
}

function saveProgress() {
  savedProgress = {
    lives,
    cameraY,
    dropStartY,
    player: {
      x: player.x,
      y: player.y,
      vx: player.vx,
      vy: player.vy,
      jumpCount: player.jumpCount,
      facingRight: player.facingRight,
      onGround: player.onGround,
      onIce: player.onIce,
    },
    platforms: platforms.map((p) => ({ ...p })),
  };
}

function restoreProgress() {
  if (!savedProgress) return false;
  lives = savedProgress.lives;
  cameraY = savedProgress.cameraY;
  dropStartY = savedProgress.dropStartY;
  player.x = savedProgress.player.x;
  player.y = savedProgress.player.y;
  player.vx = savedProgress.player.vx;
  player.vy = savedProgress.player.vy;
  player.jumpCount = savedProgress.player.jumpCount;
  player.facingRight = savedProgress.player.facingRight;
  player.onGround = savedProgress.player.onGround;
  player.onIce = savedProgress.player.onIce;
  platforms = savedProgress.platforms.map((p) => ({ ...p }));
  gameState = 'playing';
  hud.classList.remove('hidden');
  showScreen('none');
  updateHUD();
  return true;
}

function resetGame() {
  gameState = 'playing';
  lives = 9;
  savedProgress = null;
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
  // force an immediate draw so sprites load and positioning updates
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawBackground();
  drawPlants();
  drawPlatforms();
  drawCat();
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
  for (let y = WORLD_HEIGHT - 180; y > GOAL_Y + 80; y -= 180) {
    rows.push(y);
  }
  const column = [40, 180, 330, 500, 660];
  rows.forEach((y, index) => {
    const x = column[index % column.length];
    const width = Math.max(120, 260 - index * 10);
    const variant = index % 7 === 2 ? 'breakable' : index % 5 === 3 ? 'ice' : 'normal';
    platforms.push({ x, y, width, height: 24, type: 'platform', variant, waitTime: 0 });
    if (index % 2 === 0) {
      const altWidth = Math.max(110, width * 0.7);
      const altVariant = (index + 3) % 8 === 0 ? 'ice' : 'normal';
      platforms.push({ x: WIDTH - x - altWidth, y: y - 110, width: altWidth, height: 24, type: 'platform', variant: altVariant, waitTime: 0 });
    }
  });
}

function createStars() {
  stars = [];
  for (let i = 0; i < 120; i += 1) {
    stars.push({
      x: Math.random() * WIDTH,
      y: Math.random() * WORLD_HEIGHT,
      radius: Math.random() * 1.5 + 0.7,
      alpha: Math.random() * 0.65 + 0.35,
    });
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
    load(`${basePath}/bg_title.png`).then((i) => (assets.bgTitle = i)),
  ]).catch(() => {});
}

function drawLives() {
  const livesEl = document.getElementById('lives');
  if (!livesEl) return;
  livesEl.innerHTML = '';
  const total = 9;
  for (let i = 0; i < total; i += 1) {
    if (assets.heart) {
      const img = document.createElement('img');
      img.src = 'assets/heart.png';
      img.alt = '♥';
      if (i >= lives) img.classList.add('empty');
      livesEl.appendChild(img);
    } else {
      const span = document.createElement('span');
      span.textContent = '♥';
      if (i >= lives) span.style.opacity = '0.4';
      livesEl.appendChild(span);
    }
  }
}

function updateHUD() {
  drawLives();
  // ground should read as 0 meters (ground platform is 32px high)
  const heightMeters = Math.max(0, Math.round((WORLD_HEIGHT - player.y - player.height - 32) / 10));
  document.getElementById('height').textContent = `Height: ${heightMeters}m`;
}

function showScreen(screen) {
  [titleScreen, introScreen, winScreen, deathScreen].forEach((screenEl) => {
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
  if (screen === 'death') {
    deathScreen.classList.remove('hidden');
    deathScreen.classList.add('active');
  }
}

function startGame() {
  if (gameState === 'title' && restoreProgress()) {
    return;
  }
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
  // World-fixed sky gradient: dark at top of world, light at ground.
  const worldTop = -cameraY;
  const worldBottom = WORLD_HEIGHT - cameraY;
  const gradient = ctx.createLinearGradient(0, worldTop, 0, worldBottom);
  gradient.addColorStop(0, '#0b2143');
  gradient.addColorStop(0.35, '#2b446f');
  gradient.addColorStop(1, '#99bce8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const heightProgress = 1 - Math.min(Math.max(cameraY / (WORLD_HEIGHT - HEIGHT), 0), 1);
  const starAlpha = Math.max(0, heightProgress - 0.2) * 1.15;
  ctx.globalAlpha = starAlpha;
  stars.forEach((star) => {
    const sy = star.y - cameraY;
    if (sy < -10 || sy > HEIGHT + 10) return;
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.beginPath();
    ctx.arc(star.x, sy, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });
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
  const desiredW = Math.round(player.width * 1.45);
  const desiredH = Math.round(player.height * 1.45);
  const now = Date.now();
  const moving = keys.left || keys.right;
  if (moving) {
    lastMoveTime = now;
    player.facingRight = keys.right || !keys.left;
  }

  // Sitting: manual crouch with Down/S, or automatic idle sit.
  const autoSit = !moving && (now - lastMoveTime > 2000) && player.onGround;
  const manualSit = keys.down && player.onGround;
  isSitting = manualSit || autoSit;

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
    // scale the image using its natural size so any internal trimming in the
    // PNG isn't accidentally clipped by incorrect draw offsets
    const frame = getSpriteFrame(sprite);
    const scale = Math.min(desiredW / frame.sw, desiredH / frame.sh);
    const drawW = Math.round(frame.sw * scale);
    const drawH = Math.round(frame.sh * scale);
    const drawX = Math.round(player.x + (player.width - drawW) / 2);
    const drawY = Math.round((player.y + player.height) - drawH - cameraY);
    ctx.save();
    if (!player.facingRight) {
      ctx.translate(drawX + drawW, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, frame.sx, frame.sy, frame.sw, frame.sh, 0, 0, drawW, drawH);
    } else {
      ctx.drawImage(sprite, frame.sx, frame.sy, frame.sw, frame.sh, drawX, drawY, drawW, drawH);
    }
    ctx.restore();
    return;
  }

  // fallback vector cat if sprites aren't available
  const fx = px;
  const fy = py;
  const w = desiredW;
  const h = desiredH;
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

  // prevent horizontal sprite clipping by keeping extra sprite padding inside viewport
  const drawW = Math.round(player.width * 1.45);
  const padX = Math.round((drawW - player.width) / 2);
  const minPlayerX = padX;
  const maxPlayerX = Math.max(padX, WIDTH - player.width - padX);
  if (player.x < minPlayerX) player.x = minPlayerX;
  if (player.x > maxPlayerX) player.x = maxPlayerX;

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
    if (dropStartY !== null) {
      const fallPixels = player.y - dropStartY;
      const fallThreshold = 50 * 10; // 50 meters -> 500 pixels
      if (fallPixels >= fallThreshold) {
        lives -= 1;
        drawLives();
        if (lives <= 0) {
          gameState = 'death';
          showScreen('death');
          hud.classList.add('hidden');
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
  const isCrouching = keys.down && player.onGround;
  const maxGroundSpeed = isCrouching ? player.speed * 0.15 : player.speed;
  const acceleration = player.onIce ? 0.6 : isCrouching ? 0.22 : 0.85;
  if (keys.left) player.vx = Math.max(player.vx - acceleration, -maxGroundSpeed);
  if (keys.right) player.vx = Math.min(player.vx + acceleration, maxGroundSpeed);
  if (player.onIce) {
    player.vx *= 0.992;
  } else if (player.onGround) {
    player.vx *= isCrouching ? 0.55 : 0.80; // crouch applies stronger drag
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
      gameState = 'death';
      showScreen('death');
      hud.classList.add('hidden');
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
  // Ensure the player's sprite is fully visible in the viewport so it isn't clipped.
  // calculate sprite height using same scale as drawCat()
  const spriteH = Math.round(player.height * 1.45);
  // drawY used in drawCat = player.y - cameraY - (spriteH - player.height)
  let drawY = player.y - cameraY - (spriteH - player.height);
  const margin = 8;
  if (drawY < margin) {
    cameraY -= (margin - drawY);
  } else if (drawY + spriteH > HEIGHT - margin) {
    cameraY += (drawY + spriteH - (HEIGHT - margin));
  }
  cameraY = clamp(cameraY, 0, WORLD_HEIGHT - HEIGHT);
  updateHUD();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function drawGoal() {
  const topBar = GOAL_Y - cameraY;
  // use the same light blue as buttons for the space gate line
  ctx.fillStyle = '#52538f';
  ctx.fillRect(0, topBar, WIDTH, 10);
  ctx.fillStyle = '#fff';
  ctx.font = '700 24px "Vibe Coding Body", "Vibe Coding Title", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Space Gate', WIDTH / 2, topBar - 12);
}

function handleInput(event, isDown) {
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
    keys.left = isDown;
    event.preventDefault();
  }
  if (event.code === 'ArrowRight' || event.code === 'KeyD') {
    keys.right = isDown;
    event.preventDefault();
  }
  if (event.code === 'ArrowUp' || event.code === 'KeyW' || event.code === 'Space') {
    if (isDown) {
      // jumping from sit should immediately switch out of sit pose
      isSitting = false;
      lastMoveTime = Date.now();
    }
    if (isDown) keys.jump = true;
    if (!isDown) keys.jump = false;
    event.preventDefault();
  }

  if (event.code === 'ArrowDown' || event.code === 'KeyS') {
    keys.down = isDown;
    if (isDown && player.onGround) {
      isSitting = true;
    }
    event.preventDefault();
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

if (startBtn) {
  startBtn.addEventListener('click', () => {
    showScreen('none');
    startGame();
  });
}
if (introBtn) {
  introBtn.addEventListener('click', () => {
    showScreen('intro');
  });
}
if (backBtn) {
  backBtn.addEventListener('click', () => {
    showScreen('title');
  });
}
if (playAgainBtn) {
  playAgainBtn.addEventListener('click', () => {
    showScreen('none');
    resetGame();
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    const shouldReset = window.confirm(
      'Reset will fully restart the game, clear saved progress, and return to the title screen. Continue?'
    );
    if (!shouldReset) return;
    resetGame();
    gameState = 'title';
    showScreen('title');
    hud.classList.add('hidden');
  });
}

if (quitBtn) {
  quitBtn.addEventListener('click', () => {
    const shouldQuit = window.confirm(
      'Quit will save your current progress and return to the title screen. Continue?'
    );
    if (!shouldQuit) return;
    saveProgress();
    gameState = 'title';
    showScreen('title');
    hud.classList.add('hidden');
  });
}

if (deathPlayAgainBtn) {
  deathPlayAgainBtn.addEventListener('click', () => {
    showScreen('none');
    resetGame();
  });
}

if (deathQuitBtn) {
  deathQuitBtn.addEventListener('click', () => {
    gameState = 'title';
    showScreen('title');
    hud.classList.add('hidden');
  });
}

window.addEventListener('keydown', (event) => {
  handleInput(event, true);
});
window.addEventListener('keyup', (event) => {
  handleInput(event, false);
});

window.addEventListener('blur', () => {
  keys.left = false;
  keys.right = false;
  keys.up = false;
  keys.down = false;
  keys.jump = false;
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
