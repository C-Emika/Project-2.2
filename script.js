const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const titleScreen = document.getElementById('titleScreen');
const introScreen = document.getElementById('introScreen');
const winScreen = document.getElementById('winScreen');
const deathScreen = document.getElementById('deathScreen');
const hud = document.getElementById('hud');
const livesText = document.getElementById('lives');
const coinsText = document.getElementById('coins');
const startBtn = document.getElementById('startBtn');
const introBtn = document.getElementById('introBtn');
const backBtn = document.getElementById('backBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const resetBtn = document.getElementById('resetBtn');
const quitBtn = document.getElementById('quitBtn');
const deathPlayAgainBtn = document.getElementById('deathPlayAgainBtn');
const deathQuitBtn = document.getElementById('deathQuitBtn');
const warningOverlay = document.getElementById('warningOverlay');
const warningTitle = document.getElementById('warningTitle');
const warningMessage = document.getElementById('warningMessage');
const warningConfirmBtn = document.getElementById('warningConfirmBtn');
const warningCancelBtn = document.getElementById('warningCancelBtn');
const mobileControls = document.getElementById('mobileControls');
const mobileLeft = document.getElementById('mobileLeft');
const mobileRight = document.getElementById('mobileRight');
const mobileDown = document.getElementById('mobileDown');
const mobileJump = document.getElementById('mobileJump');
const shopBtn = document.getElementById('shopBtn');
const shopOverlay = document.getElementById('shopOverlay');
const shopCoins = document.getElementById('shopCoins');
const shopItems = document.getElementById('shopItems');
const shopCloseBtn = document.getElementById('shopCloseBtn');

let WIDTH = canvas.width;
let HEIGHT = canvas.height;
const WORLD_HEIGHT = 10032;
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
let coins = [];
let coinBursts = [];
let coinBalance = 0;
let spaceHazards = [];
let damageCooldown = 0;
let dropStartY = null;
let coyoteFrames = 0;
let jumpBufferFrames = 0;

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
  catCrawl1: null,
  catCrawl2: null,
  bgTitle: null,
};
let walkFrame = 0;
let walkTimer = 0;
let crawlFrame = 0;
let crawlTimer = 0;
let lastMoveTime = Date.now();
let isSitting = false;
let savedProgress = null;
const spriteFrameCache = new WeakMap();
let warningAction = null;
let selectedHat = 'none';
const unlockedHats = new Set(['none']);

const hatCatalog = [
  { id: 'none', label: 'No Hat', cost: 0, color: '#ffffff' },
  { id: 'cap', label: 'Red Cap', cost: 12, color: '#df5252' },
  { id: 'crown', label: 'Crown', cost: 25, color: '#f4ce46' },
  { id: 'wizard', label: 'Wizard Hat', cost: 40, color: '#7f79df' },
];

let audioCtx = null;

function applyPixelRenderSettings() {
  ctx.imageSmoothingEnabled = false;
}

function showWarningModal(title, message, onConfirm) {
  closeShop();
  warningAction = onConfirm;
  if (warningTitle) warningTitle.textContent = title;
  if (warningMessage) warningMessage.textContent = message;
  if (warningOverlay) {
    warningOverlay.classList.remove('hidden');
    warningOverlay.classList.add('active');
  }
}

function hideWarningModal() {
  warningAction = null;
  if (warningOverlay) {
    warningOverlay.classList.add('hidden');
    warningOverlay.classList.remove('active');
  }
}

function updateCoinsHUD() {
  if (coinsText) coinsText.textContent = `Coins: ${coinBalance}`;
  if (shopCoins) shopCoins.textContent = `Coins: ${coinBalance}`;
}

function createHatPreview(hatId) {
  const preview = document.createElement('div');
  preview.className = 'hat-preview';
  const base = document.createElement('div');
  base.className = 'hat-preview-base';
  preview.appendChild(base);

  if (hatId === 'none') {
    const none = document.createElement('div');
    none.className = 'hat-preview-none';
    none.textContent = 'No Hat';
    preview.appendChild(none);
    return preview;
  }

  if (hatId === 'cap') {
    const a = document.createElement('div');
    a.className = 'hat-preview-piece hat-preview-cap-main';
    const b = document.createElement('div');
    b.className = 'hat-preview-piece hat-preview-cap-brim';
    preview.append(a, b);
  } else if (hatId === 'crown') {
    const a = document.createElement('div');
    a.className = 'hat-preview-piece hat-preview-crown-band';
    const b = document.createElement('div');
    b.className = 'hat-preview-piece hat-preview-crown-tip left';
    const c = document.createElement('div');
    c.className = 'hat-preview-piece hat-preview-crown-tip mid';
    const d = document.createElement('div');
    d.className = 'hat-preview-piece hat-preview-crown-tip right';
    preview.append(a, b, c, d);
  } else if (hatId === 'wizard') {
    const a = document.createElement('div');
    a.className = 'hat-preview-piece hat-preview-wizard-cone';
    const b = document.createElement('div');
    b.className = 'hat-preview-piece hat-preview-wizard-brim';
    preview.append(a, b);
  }
  return preview;
}

function renderShop() {
  if (!shopItems) return;
  shopItems.innerHTML = '';
  hatCatalog.forEach((hat) => {
    const card = document.createElement('div');
    card.className = 'shop-item';

    card.appendChild(createHatPreview(hat.id));

    const title = document.createElement('h3');
    title.textContent = hat.label;
    card.appendChild(title);

    const price = document.createElement('p');
    price.textContent = hat.cost === 0 ? 'Free' : `${hat.cost} coins`;
    card.appendChild(price);

    const btn = document.createElement('button');
    const owned = unlockedHats.has(hat.id);
    const selected = selectedHat === hat.id;
    btn.textContent = selected ? 'Equipped' : owned ? 'Equip' : 'Buy';
    btn.disabled = selected;
    btn.addEventListener('click', () => {
      const hasHat = unlockedHats.has(hat.id);
      if (!hasHat && coinBalance < hat.cost) return;
      if (!hasHat) {
        coinBalance -= hat.cost;
        unlockedHats.add(hat.id);
      }
      selectedHat = hat.id;
      updateCoinsHUD();
      renderShop();
    });
    card.appendChild(btn);

    shopItems.appendChild(card);
  });
}

function openShop() {
  if (!shopOverlay) return;
  hideWarningModal();
  renderShop();
  updateCoinsHUD();
  shopOverlay.classList.remove('hidden');
  shopOverlay.classList.add('active');
}

function closeShop() {
  if (!shopOverlay) return;
  shopOverlay.classList.add('hidden');
  shopOverlay.classList.remove('active');
}

function drawHatAt(x, y, w, h) {
  if (selectedHat === 'none') return;
  const hatY = y - Math.round(h * 0.16);
  if (selectedHat === 'cap') {
    ctx.fillStyle = '#df5252';
    ctx.fillRect(x + Math.round(w * 0.22), hatY, Math.round(w * 0.56), Math.round(h * 0.16));
    ctx.fillRect(x + Math.round(w * 0.56), hatY + Math.round(h * 0.13), Math.round(w * 0.22), Math.round(h * 0.05));
  } else if (selectedHat === 'crown') {
    ctx.fillStyle = '#f4ce46';
    ctx.fillRect(x + Math.round(w * 0.22), hatY + Math.round(h * 0.08), Math.round(w * 0.56), Math.round(h * 0.12));
    ctx.fillRect(x + Math.round(w * 0.22), hatY - Math.round(h * 0.03), Math.round(w * 0.1), Math.round(h * 0.08));
    ctx.fillRect(x + Math.round(w * 0.46), hatY - Math.round(h * 0.06), Math.round(w * 0.1), Math.round(h * 0.11));
    ctx.fillRect(x + Math.round(w * 0.68), hatY - Math.round(h * 0.03), Math.round(w * 0.1), Math.round(h * 0.08));
  } else if (selectedHat === 'wizard') {
    ctx.fillStyle = '#7f79df';
    ctx.beginPath();
    ctx.moveTo(x + Math.round(w * 0.18), hatY + Math.round(h * 0.18));
    ctx.lineTo(x + Math.round(w * 0.5), hatY - Math.round(h * 0.18));
    ctx.lineTo(x + Math.round(w * 0.82), hatY + Math.round(h * 0.18));
    ctx.closePath();
    ctx.fill();
  }
}

function playCoinSfx() {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
    }
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(980, t + 0.08);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  } catch {
    // Audio can fail on some browsers/devices before user gesture.
  }
}

function spawnCoinBurst(x, y) {
  const pieces = [];
  for (let i = 0; i < 8; i += 1) {
    pieces.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 2.8,
      vy: -Math.random() * 2.4 - 0.6,
      life: 22 + Math.floor(Math.random() * 10),
      maxLife: 30,
    });
  }
  coinBursts.push(pieces);
}

function drawCoinBursts() {
  coinBursts = coinBursts.filter((burst) => {
    let anyAlive = false;
    burst.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.life -= 1;
      if (p.life > 0) {
        anyAlive = true;
        const sy = p.y - cameraY;
        if (sy > -10 && sy < HEIGHT + 10) {
          const alpha = Math.max(0, p.life / p.maxLife);
          ctx.fillStyle = `rgba(255, 216, 77, ${alpha})`;
          ctx.fillRect(Math.round(p.x - 2), Math.round(sy - 2), 4, 4);
        }
      }
    });
    return anyAlive;
  });
}

function createSpaceHazards() {
  spaceHazards = [];
  platforms.forEach((plat) => {
    if (plat.type !== 'platform' || plat.biome !== 'space') return;
    if (Math.random() > 0.18) return;
    const range = Math.max(40, Math.min(220, plat.width * 0.45));
    const cx = plat.x + plat.width / 2;
    spaceHazards.push({
      x: cx,
      y: plat.y - 26,
      w: 16,
      h: 14,
      vx: Math.random() < 0.5 ? 0.6 : -0.6,
      minX: cx - range,
      maxX: cx + range,
    });
  });
}

function drawSpaceHazards() {
  spaceHazards.forEach((hz) => {
    const sy = hz.y - cameraY;
    if (sy < -40 || sy > HEIGHT + 40) return;
    ctx.fillStyle = '#8f96ab';
    ctx.fillRect(Math.round(hz.x - hz.w / 2), Math.round(sy - hz.h / 2), hz.w, hz.h);
    ctx.fillStyle = '#c2c7d5';
    ctx.fillRect(Math.round(hz.x - hz.w / 4), Math.round(sy - hz.h / 4), Math.round(hz.w / 2), Math.round(hz.h / 2));
  });
}

function hitPlayer() {
  if (damageCooldown > 0) return;
  damageCooldown = 90;
  lives -= 1;
  if (lives <= 0) {
    gameState = 'death';
    showScreen('death');
    hud.classList.add('hidden');
    return;
  }
  player.x = WIDTH / 2 - 24;
  player.y = Math.max(GOAL_Y + 140, WORLD_HEIGHT - 32 - player.height - 220);
  player.vx = 0;
  player.vy = 0;
  player.jumpCount = 0;
  player.onGround = false;
}

function setMobileControlsVisibility() {
  if (!mobileControls) return;
  const isTouchLike = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  mobileControls.classList.toggle('hidden', !isTouchLike);
}

function bindMobileControl(buttonEl, onDown, onUp) {
  if (!buttonEl) return;

  const press = (event) => {
    event.preventDefault();
    onDown();
  };
  const release = (event) => {
    event.preventDefault();
    onUp();
  };

  if (window.PointerEvent) {
    buttonEl.addEventListener('pointerdown', press);
    buttonEl.addEventListener('pointerup', release);
    buttonEl.addEventListener('pointercancel', release);
    buttonEl.addEventListener('pointerleave', release);
  } else {
    buttonEl.addEventListener('touchstart', press, { passive: false });
    buttonEl.addEventListener('touchend', release, { passive: false });
    buttonEl.addEventListener('touchcancel', release, { passive: false });
  }
}

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
    coinBalance,
    selectedHat,
    unlockedHats: Array.from(unlockedHats),
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
    coins: coins.map((c) => ({ ...c })),
    spaceHazards: spaceHazards.map((h) => ({ ...h })),
  };
}

function restoreProgress() {
  if (!savedProgress) return false;
  lives = savedProgress.lives;
  coinBalance = savedProgress.coinBalance || 0;
  selectedHat = savedProgress.selectedHat || 'none';
  unlockedHats.clear();
  (savedProgress.unlockedHats || ['none']).forEach((h) => unlockedHats.add(h));
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
  coins = (savedProgress.coins || []).map((c) => ({ ...c }));
  spaceHazards = (savedProgress.spaceHazards || []).map((h) => ({ ...h }));
  gameState = 'playing';
  hud.classList.remove('hidden');
  showScreen('none');
  updateHUD();
  return true;
}

function resetGame(keepProgress = false) {
  gameState = 'playing';
  lives = 9;
  if (!keepProgress) {
    coinBalance = 0;
    selectedHat = 'none';
    unlockedHats.clear();
    unlockedHats.add('none');
  }
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
  coinBursts = [];
  spaceHazards = [];
  damageCooldown = 0;
  coyoteFrames = 0;
  jumpBufferFrames = 0;
  createPlatforms();
  createStars();
  closeShop();
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
  applyPixelRenderSettings();
  WIDTH = canvas.width;
  HEIGHT = canvas.height;
  player.x = Math.max(0, Math.min(relX * WIDTH, WIDTH - player.width));
  createPlatforms();
  createStars();
  cameraY = clamp(player.y - HEIGHT * 0.55, 0, WORLD_HEIGHT - HEIGHT);
}

function createPlatforms() {
  platforms = [];
  coins = [];
  platforms.push({ x: 0, y: WORLD_HEIGHT - 32, width: WIDTH, height: 32, type: 'ground', variant: 'ground', waitTime: 0, biome: 'earth', flowerDensity: 1 });

  const minGapY = 130;
  const maxGapY = 168;
  const maxStepX = 190;
  let y = WORLD_HEIGHT - 180;
  let mainX = Math.max(16, WIDTH / 2 - 120);

  while (y > GOAL_Y + 90) {
    const width = Math.max(120, 260 - ((WORLD_HEIGHT - y) / 85));
    const rawShift = (Math.random() * 2 - 1) * maxStepX;
    mainX = Math.max(16, Math.min(mainX + rawShift, WIDTH - width - 16));

    const altitude = WORLD_HEIGHT - y;
    const biome = altitude < 3500 ? 'earth' : altitude < 7300 ? 'cloud' : 'space';
    const flowerDensity = Math.max(0, 1 - altitude / 4500);
    const variantRoll = Math.random();
    const variant = variantRoll < 0.14 ? 'breakable' : variantRoll < 0.28 ? 'ice' : 'normal';

    platforms.push({ x: mainX, y, width, height: 24, type: 'platform', variant, waitTime: 0, biome, flowerDensity });
    if (Math.random() < 0.5) {
      coins.push({ x: mainX + width / 2, y: y - 16, collected: false });
    }

    // optional secondary platform, still reachable from the main path
    if (Math.random() < 0.48) {
      const sideWidth = Math.max(110, width * (0.62 + Math.random() * 0.24));
      const sideOffsetX = (Math.random() < 0.5 ? -1 : 1) * (70 + Math.random() * 110);
      const sideX = Math.max(16, Math.min(mainX + sideOffsetX, WIDTH - sideWidth - 16));
      const sideRise = 24 + Math.random() * 74;
      const sideY = Math.max(GOAL_Y + 84, y - sideRise);
      const sideAlt = WORLD_HEIGHT - sideY;
      const sideBiome = sideAlt < 3500 ? 'earth' : sideAlt < 7300 ? 'cloud' : 'space';
      const sideFlowerDensity = Math.max(0, 1 - sideAlt / 4500);
      const sideRoll = Math.random();
      const sideVariant = sideRoll < 0.1 ? 'breakable' : sideRoll < 0.24 ? 'ice' : 'normal';
      platforms.push({ x: sideX, y: sideY, width: sideWidth, height: 24, type: 'platform', variant: sideVariant, waitTime: 0, biome: sideBiome, flowerDensity: sideFlowerDensity });
      if (Math.random() < 0.36) {
        coins.push({ x: sideX + sideWidth / 2, y: sideY - 16, collected: false });
      }
    }

    y -= minGapY + Math.random() * (maxGapY - minGapY);
  }
  createSpaceHazards();
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

  const loadFirst = (names) => names.reduce(
    (p, name) => p.then((img) => img || load(`${basePath}/${name}`)),
    Promise.resolve(null)
  );

  return Promise.all([
    load(`${basePath}/heart.png`).then((i) => (assets.heart = i)),
    loadFirst(['cat_sitNew.png', 'cat_sit_new.png', 'cat_sitNEW.png', 'cat_sit.png']).then((i) => (assets.catSit = i)),
    loadFirst(['cat_standNew.png', 'cat_stand_new.png', 'cat_standNEW.png', 'cat_stand.png']).then((i) => (assets.catStand = i)),
    loadFirst(['cat_walk1New.png', 'cat_walk1_new.png', 'cat_walk1NEW.png', 'cat_walk1.png']).then((i) => (assets.catWalk1 = i)),
    loadFirst(['cat_walk2New.png', 'cat_walk2_new.png', 'cat_walk2NEW.png', 'cat_walk2.png']).then((i) => (assets.catWalk2 = i)),
    loadFirst(['cat_crawl1New.png', 'cat_crawl1_new.png', 'cat_crawl1NEW.png', 'cat_crawl1.png']).then((i) => (assets.catCrawl1 = i)),
    loadFirst(['cat_crawl2New.png', 'cat_crawl2_new.png', 'cat_crawl2NEW.png', 'cat_crawl2.png']).then((i) => (assets.catCrawl2 = i)),
    load(`${basePath}/bg_title.png`).then((i) => (assets.bgTitle = i)),
  ]).catch(() => {});
}

function drawLives() {
  const livesEl = document.getElementById('lives');
  if (!livesEl) return;
  livesEl.innerHTML = '';
  const count = document.createElement('span');
  count.className = 'lives-count';
  count.textContent = `${lives}x`;
  livesEl.appendChild(count);

  if (assets.heart) {
    const img = document.createElement('img');
    img.src = 'assets/heart.png';
    img.alt = 'heart';
    img.className = 'lives-icon';
    livesEl.appendChild(img);
  } else {
    const span = document.createElement('span');
    span.textContent = '♥';
    livesEl.appendChild(span);
  }
}

function updateHUD() {
  drawLives();
  updateCoinsHUD();
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
  if (gameState === 'title') {
    resetGame();
    showScreen('none');
  }
  if (gameState === 'win') {
    // keep coin/shop progress when replaying from the win flow
    resetGame(true);
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
      ctx.fillStyle = '#6b4b2d';
    } else {
      if (plat.biome === 'earth') {
        ctx.fillStyle = '#6b4b2d';
      } else if (plat.biome === 'cloud') {
        ctx.fillStyle = '#e7f4ff';
      } else {
        ctx.fillStyle = '#83889a';
      }
    }
    ctx.fillRect(plat.x, screenY, plat.width, plat.height);

    if (plat.type === 'ground') {
      ctx.fillStyle = '#3f8c47';
      ctx.fillRect(plat.x, screenY, plat.width, 10);
      for (let i = 0; i < WIDTH; i += 38) {
        const fx = i + 12;
        const fy = screenY + 3;
        ctx.fillStyle = '#f4d35e';
        ctx.fillRect(fx, fy, 2, 2);
        ctx.fillStyle = '#f26f8b';
        ctx.fillRect(fx - 2, fy + 2, 2, 2);
        ctx.fillRect(fx + 2, fy + 2, 2, 2);
      }
    }

    if (plat.biome === 'earth') {
      ctx.fillStyle = '#3f8c47';
      ctx.fillRect(plat.x, screenY, plat.width, Math.max(4, plat.height * 0.3));
      const flowers = Math.floor((plat.width / 36) * (plat.flowerDensity || 0));
      for (let i = 0; i < flowers; i += 1) {
        const fx = plat.x + 12 + i * 20;
        const fy = screenY + 4;
        ctx.fillStyle = '#f4d35e';
        ctx.fillRect(fx, fy, 2, 2);
        ctx.fillStyle = '#f26f8b';
        ctx.fillRect(fx - 2, fy + 2, 2, 2);
        ctx.fillRect(fx + 2, fy + 2, 2, 2);
      }
    }

    if (plat.biome === 'space') {
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1;
      ctx.strokeRect(plat.x + 1, screenY + 1, plat.width - 2, plat.height - 2);
    }

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

function drawCoins() {
  coins.forEach((coin) => {
    if (coin.collected) return;
    const cy = coin.y - cameraY;
    if (cy < -30 || cy > HEIGHT + 30) return;
    ctx.fillStyle = '#ffd84d';
    ctx.fillRect(Math.round(coin.x - 6), Math.round(cy - 6), 12, 12);
    ctx.fillStyle = '#ffef9a';
    ctx.fillRect(Math.round(coin.x - 2), Math.round(cy - 2), 4, 4);
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
  if (manualSit && assets.catCrawl1 && assets.catCrawl2) {
    crawlTimer += 16;
    if (crawlTimer >= 500) {
      crawlTimer = 0;
      crawlFrame = (crawlFrame + 1) % 2;
    }
    sprite = crawlFrame === 0 ? assets.catCrawl1 : assets.catCrawl2;
  } else if (isSitting && assets.catSit) {
    crawlTimer = 0;
    sprite = assets.catSit;
  } else if (moving && assets.catWalk1 && assets.catWalk2) {
    crawlTimer = 0;
    walkTimer += 16;
    if (walkTimer >= 500) {
      walkTimer = 0;
      walkFrame = (walkFrame + 1) % 2;
    }
    sprite = walkFrame === 0 ? assets.catWalk1 : assets.catWalk2;
  } else if (assets.catStand) {
    crawlTimer = 0;
    sprite = assets.catStand;
  }

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
    drawHatAt(drawX, drawY, drawW, drawH);
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
  drawHatAt(fx, fy, w, h);
}

function applyPhysics() {
  const wasOnGround = player.onGround;
  player.onGround = false;
  player.onIce = false;
  let standingPlatform = null;

  if (damageCooldown > 0) damageCooldown -= 1;
  if (jumpBufferFrames > 0) jumpBufferFrames -= 1;

  spaceHazards.forEach((hz) => {
    hz.x += hz.vx;
    if (hz.x < hz.minX || hz.x > hz.maxX) {
      hz.vx *= -1;
      hz.x = Math.max(hz.minX, Math.min(hz.maxX, hz.x));
    }
    const overlapX = Math.abs((player.x + player.width / 2) - hz.x) < (player.width / 2 + hz.w / 2 - 2);
    const overlapY = Math.abs((player.y + player.height / 2) - hz.y) < (player.height / 2 + hz.h / 2 - 2);
    if (overlapX && overlapY) {
      hitPlayer();
    }
  });

  player.vy += 0.72;
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

  if (player.onGround) coyoteFrames = 7;
  else if (coyoteFrames > 0) coyoteFrames -= 1;

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

  const moveX = player.vx;
  const stepCount = Math.max(1, Math.ceil(Math.abs(moveX) / 4));
  const stepX = moveX / stepCount;
  for (let s = 0; s < stepCount; s += 1) {
    const oldX = player.x;
    player.x += stepX;
    let hitSide = false;
    platforms.forEach((plat) => {
      if (hitSide) return;
      const platTop = plat.y;
      const platBottom = plat.y + plat.height;
      const verticalOverlap = player.y + player.height > platTop && player.y < platBottom;
      if (!verticalOverlap) return;
      if (oldX + player.width <= plat.x && player.x + player.width > plat.x) {
        player.x = plat.x - player.width;
        player.vx = 0;
        hitSide = true;
      } else if (oldX >= plat.x + plat.width && player.x < plat.x + plat.width) {
        player.x = plat.x + plat.width;
        player.vx = 0;
        hitSide = true;
      }
    });
    if (hitSide) break;
  }

  coins.forEach((coin) => {
    if (coin.collected) return;
    const overlapX = Math.abs((player.x + player.width / 2) - coin.x) < (player.width / 2 + 7);
    const overlapY = Math.abs((player.y + player.height / 2) - coin.y) < (player.height / 2 + 7);
    if (overlapX && overlapY) {
      coin.collected = true;
      coinBalance += 1;
      spawnCoinBurst(coin.x, coin.y);
      playCoinSfx();
      updateCoinsHUD();
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
  const groundJump = -20.8 * scale;
  const airJump = -18.8 * scale;
  if (keys.jump) jumpBufferFrames = 7;
  if ((player.onGround || coyoteFrames > 0) && jumpBufferFrames > 0) {
    player.vy = groundJump;
    player.jumpCount = 1;
    coyoteFrames = 0;
    jumpBufferFrames = 0;
    keys.jump = false;
  }

  if (!player.onGround && jumpBufferFrames > 0 && player.jumpCount < 2) {
    player.vy = airJump;
    player.jumpCount += 1;
    jumpBufferFrames = 0;
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
  drawSpaceHazards();
  drawCoins();
  drawCoinBursts();
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
    // win-screen replay keeps collected coins and purchased hats
    resetGame(true);
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    showWarningModal(
      'Reset Progress?',
      'Reset fully restarts the game, clears saved progress, and returns to the title screen.',
      () => {
        resetGame();
        gameState = 'title';
        showScreen('title');
        hud.classList.add('hidden');
      }
    );
  });
}

if (quitBtn) {
  quitBtn.addEventListener('click', () => {
    showWarningModal(
      'Quit to Title?',
      'Quit saves current progress and exits to the title screen.',
      () => {
        saveProgress();
        gameState = 'title';
        showScreen('title');
        hud.classList.add('hidden');
      }
    );
  });
}

if (shopBtn) {
  shopBtn.addEventListener('click', () => {
    openShop();
  });
}

if (shopCloseBtn) {
  shopCloseBtn.addEventListener('click', () => {
    closeShop();
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
  if (shopOverlay && !shopOverlay.classList.contains('hidden')) {
    if (event.code === 'Escape') closeShop();
    event.preventDefault();
    return;
  }
  if (warningOverlay && !warningOverlay.classList.contains('hidden')) {
    if (event.code === 'Escape') hideWarningModal();
    event.preventDefault();
    return;
  }
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
applyPixelRenderSettings();

if (warningConfirmBtn) {
  warningConfirmBtn.addEventListener('click', () => {
    const action = warningAction;
    hideWarningModal();
    if (action) action();
  });
}

if (warningCancelBtn) {
  warningCancelBtn.addEventListener('click', () => {
    hideWarningModal();
  });
}

bindMobileControl(
  mobileLeft,
  () => {
    keys.left = true;
  },
  () => {
    keys.left = false;
  }
);

bindMobileControl(
  mobileRight,
  () => {
    keys.right = true;
  },
  () => {
    keys.right = false;
  }
);

bindMobileControl(
  mobileDown,
  () => {
    keys.down = true;
    if (player.onGround) isSitting = true;
  },
  () => {
    keys.down = false;
  }
);

bindMobileControl(
  mobileJump,
  () => {
    keys.jump = true;
    isSitting = false;
    lastMoveTime = Date.now();
  },
  () => {
    keys.jump = false;
  }
);

setMobileControlsVisibility();
window.addEventListener('resize', setMobileControlsVisibility);
// load optional assets then start
loadAssets().finally(() => {
  drawLives();
});

showScreen('title');
loop();
