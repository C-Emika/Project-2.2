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
const achievementOverlay = document.getElementById('achievementOverlay');
const achievementTitle = document.getElementById('achievementTitle');
const achievementMessage = document.getElementById('achievementMessage');
const achievementCloseBtn = document.getElementById('achievementCloseBtn');
const tutorialOverlay = document.getElementById('tutorialOverlay');
const tutorialPanel = document.getElementById('tutorialPanel');
const tutorialStepCount = document.getElementById('tutorialStepCount');
const tutorialTitle = document.getElementById('tutorialTitle');
const tutorialMessage = document.getElementById('tutorialMessage');
const tutorialBackBtn = document.getElementById('tutorialBackBtn');
const tutorialNextBtn = document.getElementById('tutorialNextBtn');
const tutorialSkipBtn = document.getElementById('tutorialSkipBtn');
const mobileControls = document.getElementById('mobileControls');
const mobileLeft = document.getElementById('mobileLeft');
const mobileRight = document.getElementById('mobileRight');
const mobileDown = document.getElementById('mobileDown');
const mobileJump = document.getElementById('mobileJump');
const shopBtn = document.getElementById('shopBtn');
const achievementsBtn = document.getElementById('achievementsBtn');
const hudIntroBtn = document.getElementById('hudIntroBtn');
const shopOverlay = document.getElementById('shopOverlay');
const shopCoins = document.getElementById('shopCoins');
const shopItems = document.getElementById('shopItems');
const shopCloseBtn = document.getElementById('shopCloseBtn');
const achievementsOverlay = document.getElementById('achievementsOverlay');
const achievementsList = document.getElementById('achievementsList');
const achievementsCloseBtn = document.getElementById('achievementsCloseBtn');
const titleHeading = document.getElementById('titleHeading');
const secretBtn = document.getElementById('secretBtn');
const secretRainLayer = document.getElementById('secretRainLayer');
const secretUnlockOverlay = document.getElementById('secretUnlockOverlay');
const secretUnlockBtn = document.getElementById('secretUnlockBtn');
const secretPanelOverlay = document.getElementById('secretPanelOverlay');
const secretCoinInput = document.getElementById('secretCoinInput');
const secretCoinApplyBtn = document.getElementById('secretCoinApplyBtn');
const secretPanelCloseBtn = document.getElementById('secretPanelCloseBtn');
const secretPanelError = document.getElementById('secretPanelError');

let WIDTH = canvas.width;
let HEIGHT = canvas.height;
const WORLD_HEIGHT = 10032;
const GOAL_Y = 120;
const GROUND_HEIGHT = 64;
const GROUND_SINK = 34;
const GROUND_Y = WORLD_HEIGHT - GROUND_HEIGHT + GROUND_SINK;
const CAT_DRAW_Y_OFFSET = 2;

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
let spaceWins = 0;
let spaceHazards = [];
let damageCooldown = 0;
let dropStartY = null;
let coyoteFrames = 0;
let jumpBufferFrames = 0;

const player = {
  x: WIDTH / 2 - 24,
  y: GROUND_Y - 52,
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
  coin: null,
  catSit: null,
  catStand: null,
  catWalk1: null,
  catWalk2: null,
  catCrawl1: null,
  catCrawl2: null,
  bgTitle: null,
  hatCap: null,
  hatParty: null,
  hatCrown: null,
  hatWitch: null,
  grassSmall: null,
  grassMedium: null,
  grassLarge: null,
  iceGrassSmall: null,
  iceGrassMedium: null,
  iceGrassLarge: null,
  groundGrass: null,
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
let tutorialActive = false;
let tutorialStepIndex = 0;
let highlightedTutorialTarget = null;
let secretUnlocked = false;
let secretAvailableAfterStart = false;
let titleHoverTimer = null;
let secretRainActive = false;
let secretRainStopAt = 0;
let secretRainDrops = [];
const unlockedAchievements = new Set();
const pendingAchievementQueue = [];
const hatColorOverrides = {};
const maskedHatSpriteCache = new Map();
const grayscaleHatSpriteCache = new Map();
const tintedHatSpriteCache = new Map();

const achievementCatalog = {
  first_coin: {
    name: 'First Shiny',
    description: 'Collect your first coin.',
    isUnlocked: () => coinBalance >= 1,
  },
  coin_hoarder: {
    name: 'Coin Hoarder',
    description: 'Collect 25 total coins.',
    isUnlocked: () => coinBalance >= 25,
  },
  coin_centurion: {
    name: 'Coin Centurion',
    description: 'Collect 100 total coins.',
    isUnlocked: () => coinBalance >= 100,
  },
  first_win: {
    name: 'Sky Breaker',
    description: 'Reach space for the first time.',
    isUnlocked: () => spaceWins >= 1,
  },
  crown_unlock: {
    name: 'Cosmic Royalty',
    description: 'Reach space 10 times and unlock the Crown hat.',
    isUnlocked: () => spaceWins >= 10,
  },
  hat_collector: {
    name: 'Catwalk Ready',
    description: 'Buy your first hat from the shop.',
    isUnlocked: () => unlockedHats.size > 1,
  },
  hat_trio: {
    name: 'Hat Trick',
    description: 'Buy or earn 3 hats.',
    isUnlocked: () => Array.from(unlockedHats).filter((h) => h !== 'none').length >= 3,
  },
  hat_master: {
    name: 'Full Closet',
    description: 'Buy or earn all hats.',
    isUnlocked: () => Array.from(unlockedHats).filter((h) => h !== 'none').length >= 4,
  },
  secret_found: {
    name: 'Hidden Pawnel',
    description: 'Unlock the secret panel.',
    isUnlocked: () => secretUnlocked,
  },
};

const tutorialSteps = [
  {
    title: 'Goal',
    message: 'Your goal is to reach space, do so by climbing upward.',
    target: 'goal',
  },
  {
    title: 'Lives',
    message: 'Ensure your lives last to reach your goal.',
    target: 'lives',
  },
  {
    title: 'Coins',
    message: 'Collect coins from platforms during your climb.',
    target: 'coins',
  },
  {
    title: 'Height',
    message: 'Track your progress in meters. Your goal is at 1000 meters.',
    target: 'height',
  },
  {
    title: 'Hats Button',
    message: 'Click the hats button to buy and equip hats with coins. Some hats will need to be obtained through achievements.',
    target: 'shopBtn',
  },
  {
    title: 'Reset Button',
    message: 'Click the reset button to reset your progress and start from the beginning.',
    target: 'resetBtn',
  },
  {
    title: 'Quit Button',
    message: 'Click the quit button to save your current progress and return to the title.',
    target: 'quitBtn',
  },
  {
    title: 'Movement',
    message: 'Use Left/Right or A/D to move. Jump with Up, W, or Space. Hold Down or S to crouch/crawl. Double jump helps reach higher platforms.',
    target: 'gameCanvas',
    panelPosition: 'center',
  },
  {
    title: 'Mobile Controls',
    message: 'On mobile, use the on-screen controls in the lower center.',
    target: 'mobileControls',
  },
];

const hatCatalog = [
  { id: 'none', label: 'No Hat', cost: 0, color: '#ffffff' },
  { id: 'cap', label: 'Red Cap', cost: 10, color: '#df5252' },
  { id: 'party', label: 'Party Hat', cost: 15, color: '#f48252' },
  { id: 'crown', label: 'Crown', cost: 0, color: '#f4ce46', unlockType: 'spaceWins', requiredWins: 10 },
  { id: 'wizard', label: 'Wizard Hat', cost: 30, color: '#7f79df' },
];

const spriteFilePaths = {
  coin: 'Vibe Coding Assets (3) #12 Coin.png',
  hats: {
    cap: 'Vibe Coding Assets (3) #13 Cap.png',
    party: 'Vibe Coding Assets (3) #14 Party Hat.png',
    crown: 'Vibe Coding Assets (3) #15 Crown.png',
    wizard: 'Vibe Coding Assets (3) #16 Witch Hat.png',
  },
};

function encodeAssetPath(src) {
  return src.split('/').map((seg) => encodeURIComponent(seg)).join('/');
}

function getHatSpritePath(hatId) {
  return spriteFilePaths.hats[hatId] || null;
}

function getSelectedHatSprite() {
  if (selectedHat === 'cap') return assets.hatCap;
  if (selectedHat === 'party') return assets.hatParty;
  if (selectedHat === 'crown') return assets.hatCrown;
  if (selectedHat === 'wizard') return assets.hatWitch;
  return null;
}

function getMaskedHatBaseCanvas(cacheKey, sprite, frame) {
  if (!sprite || !frame) return null;
  const frameKey = `${cacheKey}-${frame.sx}-${frame.sy}-${frame.sw}-${frame.sh}`;
  if (maskedHatSpriteCache.has(frameKey)) return maskedHatSpriteCache.get(frameKey);

  const canvasEl = document.createElement('canvas');
  canvasEl.width = frame.sw;
  canvasEl.height = frame.sh;
  const c2d = canvasEl.getContext('2d');
  if (!c2d) return null;
  c2d.imageSmoothingEnabled = false;
  c2d.drawImage(sprite, frame.sx, frame.sy, frame.sw, frame.sh, 0, 0, frame.sw, frame.sh);

  const img = c2d.getImageData(0, 0, frame.sw, frame.sh);
  const data = img.data;
  const sw = frame.sw;
  const sh = frame.sh;

  const corner = (x, y) => {
    const i = (y * sw + x) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const corners = [corner(0, 0), corner(sw - 1, 0), corner(0, sh - 1), corner(sw - 1, sh - 1)];
  const keyR = Math.round((corners[0][0] + corners[1][0] + corners[2][0] + corners[3][0]) / 4);
  const keyG = Math.round((corners[0][1] + corners[1][1] + corners[2][1] + corners[3][1]) / 4);
  const keyB = Math.round((corners[0][2] + corners[1][2] + corners[2][2] + corners[3][2]) / 4);
  const threshold = 54;
  const isBgPixel = (idx) => {
    if (data[idx + 3] === 0) return true;
    const dist = Math.abs(data[idx] - keyR) + Math.abs(data[idx + 1] - keyG) + Math.abs(data[idx + 2] - keyB);
    return dist <= threshold;
  };

  // Remove only edge-connected chroma-key background so hat shading remains intact.
  const visited = new Uint8Array(sw * sh);
  const qx = new Int16Array(sw * sh);
  const qy = new Int16Array(sw * sh);
  let head = 0;
  let tail = 0;
  const enqueue = (x, y) => {
    const p = y * sw + x;
    if (visited[p]) return;
    const idx = p * 4;
    if (!isBgPixel(idx)) return;
    visited[p] = 1;
    qx[tail] = x;
    qy[tail] = y;
    tail += 1;
  };

  for (let x = 0; x < sw; x += 1) {
    enqueue(x, 0);
    enqueue(x, sh - 1);
  }
  for (let y = 0; y < sh; y += 1) {
    enqueue(0, y);
    enqueue(sw - 1, y);
  }

  while (head < tail) {
    const x = qx[head];
    const y = qy[head];
    head += 1;
    const p = y * sw + x;
    const idx = p * 4;
    data[idx + 3] = 0;
    if (x > 0) enqueue(x - 1, y);
    if (x < sw - 1) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y < sh - 1) enqueue(x, y + 1);
  }

  c2d.putImageData(img, 0, 0);
  maskedHatSpriteCache.set(frameKey, canvasEl);
  return canvasEl;
}

function getTintedHatCanvas(cacheKey, maskedBase, tintColor) {
  if (!maskedBase || !tintColor) return maskedBase;
  const grayBase = getGrayscaleHatCanvas(cacheKey, maskedBase);
  if (!grayBase) return maskedBase;
  const tintKey = `${cacheKey}-${grayBase.width}x${grayBase.height}-${tintColor}`;
  if (tintedHatSpriteCache.has(tintKey)) return tintedHatSpriteCache.get(tintKey);

  const canvasEl = document.createElement('canvas');
  canvasEl.width = grayBase.width;
  canvasEl.height = grayBase.height;
  const c2d = canvasEl.getContext('2d');
  if (!c2d) return maskedBase;
  c2d.imageSmoothingEnabled = false;
  c2d.drawImage(grayBase, 0, 0);
  c2d.globalCompositeOperation = 'multiply';
  c2d.globalAlpha = 1;
  c2d.fillStyle = tintColor;
  c2d.fillRect(0, 0, canvasEl.width, canvasEl.height);

  // Keep the exact hat silhouette alpha after colorization.
  c2d.globalCompositeOperation = 'destination-in';
  c2d.drawImage(grayBase, 0, 0);

  c2d.globalCompositeOperation = 'source-over';
  tintedHatSpriteCache.set(tintKey, canvasEl);
  return canvasEl;
}

function getGrayscaleHatCanvas(cacheKey, maskedBase) {
  if (!maskedBase) return null;
  const grayKey = `${cacheKey}-${maskedBase.width}x${maskedBase.height}`;
  if (grayscaleHatSpriteCache.has(grayKey)) return grayscaleHatSpriteCache.get(grayKey);

  const canvasEl = document.createElement('canvas');
  canvasEl.width = maskedBase.width;
  canvasEl.height = maskedBase.height;
  const c2d = canvasEl.getContext('2d');
  if (!c2d) return null;
  c2d.imageSmoothingEnabled = false;
  c2d.drawImage(maskedBase, 0, 0);

  const img = c2d.getImageData(0, 0, canvasEl.width, canvasEl.height);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const lum = Math.round((data[i] * 0.299) + (data[i + 1] * 0.587) + (data[i + 2] * 0.114));
    const lifted = Math.min(255, Math.round(lum * 0.6 + 90));
    data[i] = lifted;
    data[i + 1] = lifted;
    data[i + 2] = lifted;
  }
  c2d.putImageData(img, 0, 0);
  grayscaleHatSpriteCache.set(grayKey, canvasEl);
  return canvasEl;
}

function getHatPlacement(hatId) {
  if (hatId === 'cap') {
    return { widthRatio: 0.68, heightRatio: 0.34, xOffset: 0.205, bottomYRatio: 0.21 };
  }
  if (hatId === 'party') {
    return { widthRatio: 0.7, heightRatio: 0.43, xOffset: 0.165, bottomYRatio: 0.2 };
  }
  if (hatId === 'crown') {
    return { widthRatio: 0.65, heightRatio: 0.37, xOffset: 0.135, bottomYRatio: 0.19 };
  }
  if (hatId === 'wizard') {
    return { widthRatio: 0.78, heightRatio: 0.46, xOffset: 0.135, bottomYRatio: 0.21 };
  }
  return { widthRatio: 0.72, heightRatio: 0.42, xOffset: 0.135, bottomYRatio: 0.2 };
}

function syncAchievementUnlocks() {
  if (spaceWins >= 10) {
    unlockedHats.add('crown');
  } else {
    unlockedHats.delete('crown');
    if (selectedHat === 'crown') selectedHat = 'none';
  }
}

function showAchievementPopup(achievementId) {
  if (!achievementOverlay) return;
  let title = 'Achievement Unlocked!';
  let message = '';
  if (typeof achievementId === 'string') {
    const achievement = achievementCatalog[achievementId];
    if (!achievement) return;
    message = `${achievement.name}: ${achievement.description}`;
  } else if (achievementId && typeof achievementId === 'object') {
    title = achievementId.title || title;
    message = achievementId.message || '';
  }
  hideWarningModal();
  hideSecretUnlockModal();
  if (achievementTitle) achievementTitle.textContent = title;
  if (achievementMessage) achievementMessage.textContent = message;
  achievementOverlay.classList.remove('hidden');
  achievementOverlay.classList.add('active');
}

function hideAchievementPopup() {
  if (!achievementOverlay) return;
  achievementOverlay.classList.add('hidden');
  achievementOverlay.classList.remove('active');
}

function unlockAchievement(achievementId, shouldNotify = true) {
  const achievement = achievementCatalog[achievementId];
  if (!achievement || unlockedAchievements.has(achievementId)) return false;
  unlockedAchievements.add(achievementId);
  renderAchievements();
  if (shouldNotify) {
    pendingAchievementQueue.push(achievementId);
    if (!achievementOverlay || achievementOverlay.classList.contains('hidden')) {
      const nextId = pendingAchievementQueue.shift();
      if (nextId) showAchievementPopup(nextId);
    }
  }
  return true;
}

function unlockAchievementsByState(shouldNotify = true) {
  Object.keys(achievementCatalog).forEach((achievementId) => {
    const achievement = achievementCatalog[achievementId];
    if (achievement && achievement.isUnlocked()) {
      unlockAchievement(achievementId, shouldNotify);
    }
  });
}

function queueHatPopup(title, message) {
  pendingAchievementQueue.push({ title, message });
  if (!achievementOverlay || achievementOverlay.classList.contains('hidden')) {
    const nextId = pendingAchievementQueue.shift();
    if (nextId) showAchievementPopup(nextId);
  }
}

function showNextAchievementPopup() {
  if (pendingAchievementQueue.length === 0) return;
  const nextId = pendingAchievementQueue.shift();
  if (nextId) showAchievementPopup(nextId);
}

function showSecretUnlockModal() {
  if (!secretUnlockOverlay) return;
  secretUnlockOverlay.classList.remove('hidden');
  secretUnlockOverlay.classList.add('active');
}

function hideSecretUnlockModal() {
  if (!secretUnlockOverlay) return;
  secretUnlockOverlay.classList.add('hidden');
  secretUnlockOverlay.classList.remove('active');
}

function showSecretPanel() {
  if (!secretUnlocked || !secretAvailableAfterStart || gameState !== 'playing' || !secretPanelOverlay) return;
  hideWarningModal();
  hideSecretUnlockModal();
  closeShop();
  if (secretPanelError) secretPanelError.textContent = '';
  if (secretCoinInput) {
    secretCoinInput.value = '';
    secretCoinInput.focus();
  }
  secretPanelOverlay.classList.remove('hidden');
  secretPanelOverlay.classList.add('active');
}

function hideSecretPanel() {
  if (!secretPanelOverlay) return;
  secretPanelOverlay.classList.add('hidden');
  secretPanelOverlay.classList.remove('active');
}

function updateSecretButtonVisibility() {
  if (!secretBtn) return;
  secretBtn.classList.toggle('hidden', !(secretUnlocked && secretAvailableAfterStart && gameState === 'playing'));
}

function getSecretCatSpritePath() {
  return encodeAssetPath('assets/cat_standNew.png');
}

function spawnSecretDrop() {
  if (!secretRainLayer) return;
  const isCat = Math.random() < 0.35;
  const node = isCat ? document.createElement('img') : document.createElement('div');
  node.className = `secret-rain-item ${isCat ? 'secret-rain-cat' : 'secret-rain-star'}`;
  if (isCat) {
    node.src = getSecretCatSpritePath();
    node.alt = '';
    node.decoding = 'async';
  }

  secretRainLayer.appendChild(node);
  secretRainDrops.push({
    node,
    x: Math.random() * Math.max(40, window.innerWidth - 40),
    y: -20 - Math.random() * 140,
    vy: isCat ? (2.2 + Math.random() * 2.6) : (2.8 + Math.random() * 3.8),
    vx: (Math.random() - 0.5) * (isCat ? 0.9 : 1.4),
    rot: Math.random() * 360,
    vr: (Math.random() - 0.5) * (isCat ? 2.2 : 6.0),
    scale: isCat ? (0.8 + Math.random() * 0.45) : (0.7 + Math.random() * 0.7),
  });
}

function startSecretRain() {
  if (!secretRainLayer) return;
  secretRainActive = true;
  secretRainStopAt = performance.now() + 2300;
  for (let i = 0; i < 34; i += 1) {
    spawnSecretDrop();
  }
}

function updateSecretRain() {
  if (!secretRainLayer) return;
  const now = performance.now();
  if (secretRainActive && now < secretRainStopAt && Math.random() < 0.42) {
    spawnSecretDrop();
  }

  const maxY = window.innerHeight + 60;
  secretRainDrops = secretRainDrops.filter((drop) => {
    drop.y += drop.vy;
    drop.x += drop.vx;
    drop.rot += drop.vr;
    drop.node.style.transform = `translate(${Math.round(drop.x)}px, ${Math.round(drop.y)}px) rotate(${drop.rot.toFixed(1)}deg) scale(${drop.scale.toFixed(2)})`;
    if (drop.y > maxY) {
      drop.node.remove();
      return false;
    }
    return true;
  });

  if (secretRainActive && now >= secretRainStopAt && secretRainDrops.length === 0) {
    secretRainActive = false;
  }
}

function unlockSecretPanel() {
  if (secretUnlocked) return;
  secretUnlocked = true;
  if (titleHoverTimer) {
    clearTimeout(titleHoverTimer);
    titleHoverTimer = null;
  }
  if (titleHeading) titleHeading.classList.remove('arming');
  updateSecretButtonVisibility();
  startSecretRain();
  showSecretUnlockModal();
  unlockAchievementsByState(true);
}

function beginTitleHoverTimer() {
  if (secretUnlocked || !titleHeading) return;
  if (titleHoverTimer) clearTimeout(titleHoverTimer);
  titleHeading.classList.add('arming');
  titleHoverTimer = setTimeout(() => {
    unlockSecretPanel();
  }, 5000);
}

function cancelTitleHoverTimer() {
  if (titleHoverTimer) {
    clearTimeout(titleHoverTimer);
    titleHoverTimer = null;
  }
  if (titleHeading) titleHeading.classList.remove('arming');
}

function ensureSelectedHatIsUnlocked() {
  if (!unlockedHats.has(selectedHat)) {
    selectedHat = 'none';
  }
}

let audioCtx = null;

function applyPixelRenderSettings() {
  ctx.imageSmoothingEnabled = false;
}

function showWarningModal(title, message, onConfirm) {
  closeAchievements();
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

function clearTutorialHighlight() {
  if (highlightedTutorialTarget) {
    highlightedTutorialTarget.classList.remove('tutorial-highlight');
    highlightedTutorialTarget = null;
  }
}

function getTutorialTargetRect(step) {
  if (!step || !step.target) return null;
  const targetEl = document.getElementById(step.target);
  if (!targetEl || step.target === 'mobileControls' && targetEl.classList.contains('hidden')) return null;
  const rect = targetEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  return { rect, targetEl };
}

function positionTutorialPanel(targetRect) {
  if (!tutorialPanel) return;
  const margin = 12;
  const gap = 14;
  const panelRect = tutorialPanel.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let panelX = Math.round((vw - panelRect.width) / 2);
  let panelY = Math.round((vh - panelRect.height) / 2);
  let arrow = 'none';
  let arrowLeft = panelRect.width / 2;

  if (targetRect) {
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const placeBelow = targetCenterY < vh * 0.44;
    panelY = placeBelow
      ? Math.round(targetRect.bottom + gap)
      : Math.round(targetRect.top - panelRect.height - gap);
    panelX = Math.round(targetCenterX - panelRect.width / 2);
    panelX = clamp(panelX, margin, vw - panelRect.width - margin);
    panelY = clamp(panelY, margin, vh - panelRect.height - margin);
    arrow = placeBelow ? 'up' : 'down';
    arrowLeft = clamp(targetCenterX - panelX, 24, panelRect.width - 24);
  }

  tutorialPanel.style.left = `${panelX}px`;
  tutorialPanel.style.top = `${panelY}px`;
  tutorialPanel.dataset.arrow = arrow;
  tutorialPanel.style.setProperty('--arrow-left', `${arrowLeft}px`);
}

function centerTutorialPanel() {
  if (!tutorialPanel) return;
  const panelRect = tutorialPanel.getBoundingClientRect();
  const panelX = Math.round((window.innerWidth - panelRect.width) / 2);
  const panelY = Math.round((window.innerHeight - panelRect.height) / 2);
  tutorialPanel.style.left = `${panelX}px`;
  tutorialPanel.style.top = `${panelY}px`;
  tutorialPanel.dataset.arrow = 'none';
  tutorialPanel.style.setProperty('--arrow-left', `${Math.round(panelRect.width / 2)}px`);
}

function renderTutorialStep() {
  if (!tutorialActive || !tutorialPanel || !tutorialOverlay) return;
  const step = tutorialSteps[tutorialStepIndex];
  if (!step) return;

  clearTutorialHighlight();
  tutorialStepCount.textContent = `Step ${tutorialStepIndex + 1}/${tutorialSteps.length}`;
  tutorialTitle.textContent = step.title;
  tutorialMessage.textContent = step.message;
  if (tutorialBackBtn) tutorialBackBtn.disabled = tutorialStepIndex === 0;
  tutorialNextBtn.textContent = tutorialStepIndex === tutorialSteps.length - 1 ? 'Finish' : 'Next';

  const target = getTutorialTargetRect(step);
  if (target && step.target !== 'gameCanvas' && step.target !== 'mobileControls') {
    highlightedTutorialTarget = target.targetEl;
    highlightedTutorialTarget.classList.add('tutorial-highlight');
  }
  if (step.panelPosition === 'center') {
    positionTutorialPanel(null);
    centerTutorialPanel();
    return;
  }
  positionTutorialPanel(target ? target.rect : null);
}

function endGuidedTutorial() {
  tutorialActive = false;
  tutorialStepIndex = 0;
  clearTutorialHighlight();
  if (!tutorialOverlay) return;
  tutorialOverlay.classList.add('hidden');
  tutorialOverlay.classList.remove('active');
}

function startGuidedTutorial() {
  hideWarningModal();
  closeShop();
  showScreen('none');
  if (gameState !== 'playing') {
    resetGame();
  }
  hud.classList.remove('hidden');
  tutorialActive = true;
  tutorialStepIndex = 0;
  tutorialOverlay.classList.remove('hidden');
  tutorialOverlay.classList.add('active');
  renderTutorialStep();
}

function nextTutorialStep() {
  if (!tutorialActive) return;
  if (tutorialStepIndex >= tutorialSteps.length - 1) {
    endGuidedTutorial();
    return;
  }
  tutorialStepIndex += 1;
  renderTutorialStep();
}

function previousTutorialStep() {
  if (!tutorialActive || tutorialStepIndex <= 0) return;
  tutorialStepIndex -= 1;
  renderTutorialStep();
}

function updateCoinsHUD() {
  if (coinsText) coinsText.textContent = `Coins: ${coinBalance}`;
  if (shopCoins) shopCoins.textContent = `Coins: ${coinBalance}`;
}

function createHatPreview(hatId, tintColor = null, isLocked = false) {
  const preview = document.createElement('div');
  preview.className = 'hat-preview';
  if (isLocked) preview.classList.add('hat-preview-locked');

  if (hatId === 'none') {
    const none = document.createElement('div');
    none.className = 'hat-preview-none';
    none.textContent = 'No Hat';
    preview.appendChild(none);
    return preview;
  }

  const spritePath = getHatSpritePath(hatId);
  if (spritePath) {
    const img = document.createElement('img');
    img.className = 'hat-preview-image';
    img.alt = `${hatId} hat`;
    img.src = encodeAssetPath(spritePath);
    preview.appendChild(img);
    const tint = document.createElement('div');
    tint.className = 'hat-preview-tint';
    preview.appendChild(tint);
    return preview;
  }

  if (tintColor && hatId !== 'none') {
    preview.style.setProperty('--hat-tint', tintColor);
    preview.classList.add('hat-preview-has-tint');
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

    const achievementLocked = hat.unlockType === 'spaceWins' && spaceWins < (hat.requiredWins || 0);
    const owned = unlockedHats.has(hat.id);
    const selected = selectedHat === hat.id;
    const hatTintColor = hatColorOverrides[hat.id] || hat.color || '#ffffff';
    const previewLocked = hat.id !== 'none' && (!owned || achievementLocked);

    const previewEl = createHatPreview(hat.id, hatTintColor, previewLocked);
    card.appendChild(previewEl);

    const title = document.createElement('h3');
    title.textContent = hat.label;
    card.appendChild(title);

    const price = document.createElement('p');
    if (hat.unlockType === 'spaceWins') {
      const winsLeft = Math.max(0, (hat.requiredWins || 0) - spaceWins);
      const unlockAchievementName = hat.id === 'crown' ? achievementCatalog.crown_unlock.name : 'Achievement';
      price.textContent = winsLeft === 0
        ? `${unlockAchievementName} unlocked (${spaceWins}/${hat.requiredWins})`
        : `${unlockAchievementName}: Reach Space ${hat.requiredWins}x (${spaceWins}/${hat.requiredWins})`;
    } else {
      price.textContent = hat.cost === 0 ? 'Free' : `${hat.cost} coins`;
    }
    card.appendChild(price);

    if (hat.id !== 'none') {
      const colorWrap = document.createElement('label');
      colorWrap.className = 'hat-color-wrap';
      colorWrap.textContent = 'Color';

      const colorInput = document.createElement('input');
      colorInput.className = 'hat-color-input';
      colorInput.type = 'color';
      colorInput.value = hatTintColor;
      colorInput.disabled = !owned || achievementLocked;
      colorInput.title = owned ? 'Choose hat color' : 'Buy or unlock this hat first';
      colorInput.addEventListener('input', () => {
        hatColorOverrides[hat.id] = colorInput.value;
        previewEl.style.setProperty('--hat-tint', colorInput.value);
        previewEl.classList.add('hat-preview-has-tint');
      });

      colorWrap.appendChild(colorInput);
      card.appendChild(colorWrap);
    }

    const btn = document.createElement('button');
    if (achievementLocked) {
      btn.textContent = 'Locked';
      btn.disabled = true;
    } else {
      btn.textContent = selected ? 'Equipped' : owned ? 'Equip' : 'Buy';
      btn.disabled = selected;
    }
    btn.addEventListener('click', () => {
      if (achievementLocked) return;
      const hasHat = unlockedHats.has(hat.id);
      if (!hasHat && coinBalance < hat.cost) {
        showWarningModal('Insufficient Funds', 'Insufficient Funds', () => {});
        return;
      }
      if (!hasHat) {
        coinBalance -= hat.cost;
        unlockedHats.add(hat.id);
        queueHatPopup('Hat Bought', 'Hat can be equipped.');
        unlockAchievementsByState(true);
      }
      selectedHat = hat.id;
      updateCoinsHUD();
      renderShop();
    });
    card.appendChild(btn);

    shopItems.appendChild(card);
  });
}

function getAchievementCardStatus(id, achievement) {
  if (id === 'first_coin') return `${Math.min(coinBalance, 1)}/1`;
  if (id === 'coin_hoarder') return `${Math.min(coinBalance, 25)}/25`;
  if (id === 'coin_centurion') return `${Math.min(coinBalance, 100)}/100`;
  if (id === 'first_win') return `${Math.min(spaceWins, 1)}/1`;
  if (id === 'crown_unlock') return `${Math.min(spaceWins, 10)}/10`;
  if (id === 'hat_collector') return Array.from(unlockedHats).filter((h) => h !== 'none').length >= 1 ? 'Done' : '0/1';
  if (id === 'hat_trio') return `${Math.min(Array.from(unlockedHats).filter((h) => h !== 'none').length, 3)}/3`;
  if (id === 'hat_master') return `${Math.min(Array.from(unlockedHats).filter((h) => h !== 'none').length, 4)}/4`;
  if (id === 'secret_found') return secretUnlocked ? 'Done' : 'Locked';
  return achievement && unlockedAchievements.has(id) ? 'Done' : 'Locked';
}

function renderAchievements() {
  if (!achievementsList) return;
  achievementsList.innerHTML = '';
  Object.entries(achievementCatalog).forEach(([id, achievement]) => {
    const unlocked = unlockedAchievements.has(id);
    const card = document.createElement('div');
    card.className = `achievement-card${unlocked ? '' : ' locked'}`;

    const title = document.createElement('h3');
    title.textContent = achievement.name;
    card.appendChild(title);

    const desc = document.createElement('p');
    desc.textContent = achievement.description;
    card.appendChild(desc);

    const status = document.createElement('div');
    status.className = 'achievement-card-status';
    status.textContent = unlocked
      ? 'Unlocked'
      : `Progress: ${getAchievementCardStatus(id, achievement)}`;
    card.appendChild(status);

    achievementsList.appendChild(card);
  });
}

function openAchievements() {
  if (!achievementsOverlay) return;
  hideWarningModal();
  closeShop();
  renderAchievements();
  achievementsOverlay.classList.remove('hidden');
  achievementsOverlay.classList.add('active');
}

function closeAchievements() {
  if (!achievementsOverlay) return;
  achievementsOverlay.classList.add('hidden');
  achievementsOverlay.classList.remove('active');
}

function openShop() {
  if (!shopOverlay) return;
  hideWarningModal();
  closeAchievements();
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
  const hatTintColor = hatColorOverrides[selectedHat] || null;

  const hatSprite = getSelectedHatSprite();
  if (hatSprite) {
    const frame = getSpriteFrame(hatSprite);
    const maskedBase = getMaskedHatBaseCanvas(`hat-${selectedHat}`, hatSprite, frame);
    const tintedSource = hatTintColor ? getTintedHatCanvas(`hat-${selectedHat}`, maskedBase, hatTintColor) : null;
    const source = tintedSource || maskedBase || hatSprite;
    const sourceSx = maskedBase ? 0 : frame.sx;
    const sourceSy = maskedBase ? 0 : frame.sy;
    const sourceSw = (maskedBase || tintedSource) ? source.width : frame.sw;
    const sourceSh = (maskedBase || tintedSource) ? source.height : frame.sh;
    const placement = getHatPlacement(selectedHat);
    const maxW = Math.round(w * placement.widthRatio);
    const maxH = Math.round(h * placement.heightRatio);
    const scale = Math.min(maxW / sourceSw, maxH / sourceSh);
    const drawW = Math.max(8, Math.round(sourceSw * scale));
    const drawH = Math.max(8, Math.round(sourceSh * scale));
    // Keep hats attached to the head side by making horizontal offset follow facing direction.
    const facingOffset = (player.facingRight ? 1 : -1) * (w * placement.xOffset);
    let drawX = Math.round(x + (w - drawW) / 2 + facingOffset);
    const spritePixelScale = drawW / frame.sw;
    if (selectedHat === 'cap') {
      // Move cap further left for better head alignment.
      drawX -= Math.round(spritePixelScale * 12);
    } else if (selectedHat === 'crown') {
      // Nudge crown right slightly.
      drawX += Math.round(spritePixelScale * 3);
    }
    const drawY = Math.round(y + (h * placement.bottomYRatio) - drawH);
    const shouldFaceRight = player.facingRight;
    // Cap uses opposite orientation from previous tuning so the thin strap side stays at the cat's back.
    const drawFacingRight = selectedHat === 'cap' ? shouldFaceRight : shouldFaceRight;
    ctx.save();
    if (drawFacingRight) {
      ctx.drawImage(source, sourceSx, sourceSy, sourceSw, sourceSh, drawX, drawY, drawW, drawH);
      if (hatTintColor && !tintedSource) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.globalAlpha = 0.62;
        ctx.fillStyle = hatTintColor;
        ctx.fillRect(drawX, drawY, drawW, drawH);
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.translate(drawX + drawW, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(source, sourceSx, sourceSy, sourceSw, sourceSh, 0, 0, drawW, drawH);
      if (hatTintColor && !tintedSource) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.globalAlpha = 0.62;
        ctx.fillStyle = hatTintColor;
        ctx.fillRect(0, 0, drawW, drawH);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
    return;
  }

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
  // Space debris removed per current design request.
  spaceHazards = [];
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
    endGuidedTutorial();
    gameState = 'death';
    showScreen('death');
    hud.classList.add('hidden');
    return;
  }
  player.x = WIDTH / 2 - 24;
  player.y = Math.max(GOAL_Y + 140, GROUND_Y - player.height - 220);
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
    spaceWins,
    selectedHat,
    unlockedHats: Array.from(unlockedHats),
    hatColorOverrides: { ...hatColorOverrides },
    unlockedAchievements: Array.from(unlockedAchievements),
    secretUnlocked,
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
  const hadSecretUnlockedAlready = secretUnlocked;
  lives = savedProgress.lives;
  coinBalance = savedProgress.coinBalance || 0;
  spaceWins = savedProgress.spaceWins || 0;
  selectedHat = savedProgress.selectedHat || 'none';
  // Keep a title-screen unlock that happened after the last save.
  secretUnlocked = !!savedProgress.secretUnlocked || hadSecretUnlockedAlready;
  unlockedHats.clear();
  (savedProgress.unlockedHats || ['none']).forEach((h) => unlockedHats.add(h));
  Object.keys(hatColorOverrides).forEach((k) => {
    delete hatColorOverrides[k];
  });
  const restoredHatColors = savedProgress.hatColorOverrides || {};
  Object.keys(restoredHatColors).forEach((k) => {
    hatColorOverrides[k] = restoredHatColors[k];
  });
  unlockedAchievements.clear();
  (savedProgress.unlockedAchievements || []).forEach((id) => unlockedAchievements.add(id));
  syncAchievementUnlocks();
  unlockAchievementsByState(false);
  ensureSelectedHatIsUnlocked();
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
  platforms = savedProgress.platforms.map((p) => ({
    ...p,
    variant: p.variant === 'breakable' ? 'normal' : p.variant,
    waitTime: 0,
  }));
  coins = (savedProgress.coins || []).map((c) => ({ ...c }));
  spaceHazards = (savedProgress.spaceHazards || []).map((h) => ({ ...h }));
  gameState = 'playing';
  hud.classList.remove('hidden');
  showScreen('none');
  updateHUD();
  renderAchievements();
  return true;
}

function resetGame(keepProgress = false) {
  gameState = 'playing';
  lives = 9;
  if (!keepProgress) {
    coinBalance = 0;
    spaceWins = 0;
    selectedHat = 'none';
    unlockedHats.clear();
    unlockedHats.add('none');
    unlockedAchievements.clear();
    if (secretUnlocked) {
      unlockedAchievements.add('secret_found');
    }
    Object.keys(hatColorOverrides).forEach((k) => {
      delete hatColorOverrides[k];
    });
  }
  syncAchievementUnlocks();
  savedProgress = null;
  player.x = WIDTH / 2 - 24;
  player.y = GROUND_Y - player.height;
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
  closeAchievements();
  hud.classList.remove('hidden');
  updateHUD();
  renderAchievements();
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

function getGrassSpriteForSize(size) {
  if (size === 'large') return assets.grassLarge;
  if (size === 'medium') return assets.grassMedium;
  return assets.grassSmall;
}

function getPlatformDimensionsForSize(size, targetHeight = 51) {
  const targetHeightBySize = {
    small: Math.max(32, Math.round(targetHeight * 1.03)),
    medium: Math.max(36, Math.round(targetHeight * 1.11)),
    large: Math.max(41, Math.round(targetHeight * 1.27)),
  };

  const fallbackBySize = {
    small: { width: 124, height: 22 },
    medium: { width: 176, height: 24 },
    large: { width: 228, height: 26 },
  };
  const sprite = getGrassSpriteForSize(size);
  if (!sprite) return fallbackBySize[size] || fallbackBySize.medium;
  const frame = getSpriteFrame(sprite);
  if (!frame || !frame.sw || !frame.sh) return fallbackBySize[size] || fallbackBySize.medium;

  // Uniform X/Y scaling preserves each sprite's pixel proportions (no stretch).
  const scaledTargetHeight = targetHeightBySize[size] || targetHeightBySize.medium;
  const scale = scaledTargetHeight / frame.sh;
  return {
    width: Math.max(30, Math.round(frame.sw * scale)),
    height: Math.max(16, Math.round(frame.sh * scale)),
  };
}

function createPlatforms() {
  platforms = [];
  coins = [];
  platforms.push({ x: 0, y: GROUND_Y, width: WIDTH, height: GROUND_HEIGHT, type: 'ground', variant: 'ground', waitTime: 0, biome: 'earth', flowerDensity: 1 });

  // Keep all grass lengths in circulation while avoiding long same-size streaks.
  const sizeAge = {
    small: 0,
    medium: 2,
    large: 4,
  };

  const weightedSizeByBiome = {
    earth: [
      { size: 'large', weight: 0.42 },
      { size: 'medium', weight: 0.36 },
      { size: 'small', weight: 0.22 },
    ],
    cloud: [
      { size: 'large', weight: 0.34 },
      { size: 'medium', weight: 0.40 },
      { size: 'small', weight: 0.26 },
    ],
    space: [
      { size: 'large', weight: 0.28 },
      { size: 'medium', weight: 0.38 },
      { size: 'small', weight: 0.34 },
    ],
  };

  const pickWeightedSize = (pool) => {
    let r = Math.random();
    for (let i = 0; i < pool.length; i += 1) {
      r -= pool[i].weight;
      if (r <= 0) return pool[i].size;
    }
    return pool[pool.length - 1].size;
  };

  const pickGrassSize = (biome, lastSize, sameSizeStreak) => {
    const overdue = Object.keys(sizeAge).filter((k) => sizeAge[k] >= 6);
    if (overdue.length > 0) {
      return overdue[Math.floor(Math.random() * overdue.length)];
    }

    let chosen = pickWeightedSize(weightedSizeByBiome[biome] || weightedSizeByBiome.cloud);
    if (sameSizeStreak >= 2 && chosen === lastSize) {
      const alternatives = ['small', 'medium', 'large'].filter((s) => s !== lastSize);
      chosen = alternatives[Math.floor(Math.random() * alternatives.length)];
    }
    return chosen;
  };

  const updateSizeAge = (chosenSize) => {
    Object.keys(sizeAge).forEach((k) => {
      sizeAge[k] += 1;
    });
    sizeAge[chosenSize] = 0;
  };

  // Conservative edge-gap envelope for consistent reachability on main path.
  const getMaxReachableEdgeGap = (gapY, targetSize) => {
    const sizeBonus = targetSize === 'large' ? 14 : targetSize === 'medium' ? 7 : -3;
    return clamp(184 - gapY * 0.39 + sizeBonus, 74, 142);
  };

  const pickVariantForBiome = (biome) => {
    const roll = Math.random();
    if (biome === 'earth') {
      return 'normal';
    }
    if (biome === 'cloud') {
      if (roll < 0.22) return 'ice';
      return 'normal';
    }
    if (roll < 0.28) return 'ice';
    return 'normal';
  };

  const minGapY = 160;
  const maxGapY = 204;
  let y = WORLD_HEIGHT - 180;
  let mainX = Math.max(16, WIDTH / 2 - 120);
  let lastMainWidth = 220;
  let lastMainSize = 'medium';
  let sameMainSizeStreak = 0;

  while (y > GOAL_Y + 90) {
    const altitude = WORLD_HEIGHT - y;
    const biome = altitude < 3500 ? 'earth' : altitude < 7300 ? 'cloud' : 'space';
    const spriteSize = pickGrassSize(biome, lastMainSize, sameMainSizeStreak);
    const mainDims = getPlatformDimensionsForSize(spriteSize);
    const width = mainDims.width;
    const height = mainDims.height;
    const gapY = minGapY + Math.random() * (maxGapY - minGapY);
    const maxEdgeGap = getMaxReachableEdgeGap(gapY, spriteSize);
    const worldMinX = 16;
    const worldMaxX = WIDTH - width - 16;
    const minReachX = Math.max(worldMinX, mainX - maxEdgeGap - width);
    const maxReachX = Math.min(worldMaxX, mainX + lastMainWidth + maxEdgeGap);
    const rawShift = (Math.random() * 2 - 1) * (maxEdgeGap * 0.95 + width * 0.12);
    const driftedX = mainX + rawShift;
    const safeCenterX = mainX + (lastMainWidth - width) / 2;
    mainX = minReachX <= maxReachX
      ? clamp(driftedX, minReachX, maxReachX)
      : clamp(safeCenterX, worldMinX, worldMaxX);

    const flowerDensity = Math.max(0, 1 - altitude / 4500);
    const variant = pickVariantForBiome(biome);

    platforms.push({ x: mainX, y, width, height, type: 'platform', variant, waitTime: 0, biome, flowerDensity, spriteSize });
    updateSizeAge(spriteSize);
    sameMainSizeStreak = spriteSize === lastMainSize ? sameMainSizeStreak + 1 : 1;
    lastMainSize = spriteSize;
    lastMainWidth = width;

    // Coins only spawn on the main climb path so every coin remains collectible.
    if (Math.random() < 0.55) {
      coins.push({ x: mainX + width / 2, y: y - 16, collected: false });
    }

    // optional secondary platform, still reachable from the main path
    if (Math.random() < 0.28) {
      const sideSpriteSize = pickGrassSize(biome, spriteSize, 1);
      const sideDims = getPlatformDimensionsForSize(sideSpriteSize);
      const sideWidth = sideDims.width;
      const sideHeight = sideDims.height;
      const sideRise = 78 + Math.random() * 44;
      const sideY = Math.max(GOAL_Y + 84, y - sideRise);
      const sideMaxEdgeGap = getMaxReachableEdgeGap(sideRise, sideSpriteSize) + 24;
      const sideDirection = Math.random() < 0.5 ? -1 : 1;
      const sideGap = 58 + Math.random() * Math.min(118, sideMaxEdgeGap);
      const sideAnchorX = sideDirection < 0
        ? mainX - sideGap - sideWidth
        : mainX + width + sideGap;
      const sideX = clamp(sideAnchorX, 16, WIDTH - sideWidth - 16);
      const sideAlt = WORLD_HEIGHT - sideY;
      const sideBiome = sideAlt < 3500 ? 'earth' : sideAlt < 7300 ? 'cloud' : 'space';
      const sideFlowerDensity = Math.max(0, 1 - sideAlt / 4500);
      const sideVariant = pickVariantForBiome(sideBiome);
      platforms.push({ x: sideX, y: sideY, width: sideWidth, height: sideHeight, type: 'platform', variant: sideVariant, waitTime: 0, biome: sideBiome, flowerDensity: sideFlowerDensity, spriteSize: sideSpriteSize });
    }

    y -= gapY;
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
  const ASSET_REV = '2026-06-29-icy-refresh';
  const withAssetRev = (src) => `${encodeAssetPath(src)}${src.includes('?') ? '&' : '?'}v=${ASSET_REV}`;
  const load = (src) => new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = withAssetRev(src);
  });

  const loadFirst = (names) => names.reduce(
    (p, name) => p.then((img) => img || load(`${basePath}/${name}`)),
    Promise.resolve(null)
  );

  const loadFirstPaths = (paths) => paths.reduce(
    (p, path) => p.then((img) => img || load(path)),
    Promise.resolve(null)
  );

  return Promise.all([
    load(`${basePath}/heart.png`).then((i) => (assets.heart = i)),
    loadFirstPaths([
      spriteFilePaths.coin,
      `${basePath}/${spriteFilePaths.coin}`,
    ]).then((i) => (assets.coin = i)),
    loadFirst(['cat_sitNew.png', 'cat_sit_new.png', 'cat_sitNEW.png', 'cat_sit.png']).then((i) => (assets.catSit = i)),
    loadFirst(['cat_standNew.png', 'cat_stand_new.png', 'cat_standNEW.png', 'cat_stand.png']).then((i) => (assets.catStand = i)),
    loadFirst(['cat_walk1New.png', 'cat_walk1_new.png', 'cat_walk1NEW.png', 'cat_walk1.png']).then((i) => (assets.catWalk1 = i)),
    loadFirst(['cat_walk2New.png', 'cat_walk2_new.png', 'cat_walk2NEW.png', 'cat_walk2.png']).then((i) => (assets.catWalk2 = i)),
    loadFirst(['cat_crawl1New.png', 'cat_crawl1_new.png', 'cat_crawl1NEW.png', 'cat_crawl1.png']).then((i) => (assets.catCrawl1 = i)),
    loadFirst(['cat_crawl2New.png', 'cat_crawl2_new.png', 'cat_crawl2NEW.png', 'cat_crawl2.png']).then((i) => (assets.catCrawl2 = i)),
    load(`${basePath}/bg_title.png`).then((i) => (assets.bgTitle = i)),
    loadFirstPaths([
      spriteFilePaths.hats.cap,
      `${basePath}/${spriteFilePaths.hats.cap}`,
    ]).then((i) => (assets.hatCap = i)),
    loadFirstPaths([
      spriteFilePaths.hats.party,
      `${basePath}/${spriteFilePaths.hats.party}`,
    ]).then((i) => (assets.hatParty = i)),
    loadFirstPaths([
      spriteFilePaths.hats.crown,
      `${basePath}/${spriteFilePaths.hats.crown}`,
    ]).then((i) => (assets.hatCrown = i)),
    loadFirstPaths([
      spriteFilePaths.hats.wizard,
      `${basePath}/${spriteFilePaths.hats.wizard}`,
    ]).then((i) => (assets.hatWitch = i)),
    loadFirstPaths([
      'Vibe Coding Assets (3) #8 Small Grass Platform.png',
      `${basePath}/Vibe Coding Assets (3) #8 Small Grass Platform.png`,
    ]).then((i) => (assets.grassSmall = i)),
    loadFirstPaths([
      'Vibe Coding Assets (3) #12 Icy Small Grass Platform New.png',
      `${basePath}/Vibe Coding Assets (3) #12 Icy Small Grass Platform New.png`,
      'Vibe Coding Assets (3) #12 Icy Small Grass Platform.png',
      `${basePath}/Vibe Coding Assets (3) #12 Icy Small Grass Platform.png`,
    ]).then((i) => (assets.iceGrassSmall = i)),
    // Name correction: file labeled #10 Large is the medium platform art.
    loadFirstPaths([
      'Vibe Coding Assets (3) #10 Large Grass Platform.png',
      `${basePath}/Vibe Coding Assets (3) #10 Large Grass Platform.png`,
    ]).then((i) => (assets.grassMedium = i)),
    loadFirstPaths([
      'Vibe Coding Assets (3) #13 Icy Medium Grass Platform New.png',
      `${basePath}/Vibe Coding Assets (3) #13 Icy Medium Grass Platform New.png`,
      'Vibe Coding Assets (3) #13 Icy Medium Grass Platform.png',
      `${basePath}/Vibe Coding Assets (3) #13 Icy Medium Grass Platform.png`,
    ]).then((i) => (assets.iceGrassMedium = i)),
    // Prefer the newly uploaded large platform art, with the older file as fallback.
    loadFirstPaths([
      'Vibe Coding Assets (3) #10 Large Grass Platform New.png',
      `${basePath}/Vibe Coding Assets (3) #10 Large Grass Platform New.png`,
      'Vibe Coding Assets (3) #9 Medium Grass Platform.png',
      `${basePath}/Vibe Coding Assets (3) #9 Medium Grass Platform.png`,
    ]).then((i) => (assets.grassLarge = i)),
    loadFirstPaths([
      'Vibe Coding Assets (3) #14 Icy Large Grass Platform New.png',
      `${basePath}/Vibe Coding Assets (3) #14 Icy Large Grass Platform New.png`,
      'Vibe Coding Assets (3) #14 Icy Large Grass Platform.png',
      `${basePath}/Vibe Coding Assets (3) #14 Icy Large Grass Platform.png`,
    ]).then((i) => (assets.iceGrassLarge = i)),
    loadFirstPaths([
      'Vibe Coding Assets (3) #11 Ground Grass New.png',
      'Assets/Vibe Coding Assets (3) #11 Ground Grass New.png',
      'assets/Vibe Coding Assets (3) #11 Ground Grass New.png',
      `${basePath}/Vibe Coding Assets (3) #11 Ground Grass New.png`,
      'Vibe Coding Assets (3) #11 Ground Grass.png',
      'Assets/Vibe Coding Assets (3) #11 Ground Grass.png',
      'assets/Vibe Coding Assets (3) #11 Ground Grass.png',
      `${basePath}/Vibe Coding Assets (3) #11 Ground Grass.png`,
    ]).then((i) => (assets.groundGrass = i)),
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
  // ground should read as 0 meters regardless of ground sprite scale.
  const heightMeters = Math.max(0, Math.round((GROUND_Y - player.y - player.height) / 10));
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

  updateSecretButtonVisibility();
}

function startGame() {
  endGuidedTutorial();
  secretAvailableAfterStart = true;
  updateSecretButtonVisibility();
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
  endGuidedTutorial();
  spaceWins += 1;
  syncAchievementUnlocks();
  unlockAchievementsByState(true);
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
  const groundY = GROUND_Y;
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
    const spriteKey = plat.spriteSize || (plat.width >= 220 ? 'large' : plat.width >= 165 ? 'medium' : 'small');
    const isIcePlatform = plat.variant === 'ice';
    const platformArt = spriteKey === 'large'
      ? (isIcePlatform ? assets.iceGrassLarge : assets.grassLarge)
      : spriteKey === 'medium'
        ? (isIcePlatform ? assets.iceGrassMedium : assets.grassMedium)
        : (isIcePlatform ? assets.iceGrassSmall : assets.grassSmall);
    const fallbackPlatformArt = platformArt || assets.grassMedium || assets.grassLarge || assets.grassSmall;
    const groundArt = assets.groundGrass || assets.grassLarge || assets.grassMedium || assets.grassSmall;

    if (plat.type === 'ground' && groundArt) {
      const frame = getSpriteFrame(groundArt);
      const sourceW = frame?.sw || groundArt.naturalWidth || groundArt.width;
      const sourceH = frame?.sh || groundArt.naturalHeight || groundArt.height;
      const sourceX = frame?.sx || 0;
      const sourceY = frame?.sy || 0;
      if (sourceW > 0 && sourceH > 0) {
        const scale = plat.height / sourceH;
        const scaledW = Math.max(1, Math.round(sourceW * scale));
        // Ground sprite is intentionally long; render one strip instead of repeating.
        if (scaledW >= plat.width) {
          const cropW = Math.max(1, Math.round((plat.width / scaledW) * sourceW));
          const cropX = sourceX + Math.max(0, Math.floor((sourceW - cropW) / 2));
          ctx.drawImage(groundArt, cropX, sourceY, cropW, sourceH, plat.x, screenY, plat.width, plat.height);
        } else {
          ctx.drawImage(groundArt, sourceX, sourceY, sourceW, sourceH, plat.x, screenY, plat.width, plat.height);
        }
      }
      return;
    }

    const useGrassPlatform = plat.type === 'platform' && fallbackPlatformArt;
    if (useGrassPlatform) {
      const frame = getSpriteFrame(fallbackPlatformArt);
      if (frame && frame.sw > 0 && frame.sh > 0) {
        ctx.drawImage(
          fallbackPlatformArt,
          frame.sx,
          frame.sy,
          frame.sw,
          frame.sh,
          plat.x,
          screenY,
          plat.width,
          plat.height
        );
      } else {
        ctx.drawImage(fallbackPlatformArt, plat.x, screenY, plat.width, plat.height);
      }
    }

  });
}

function drawCoins() {
  const time = performance.now() * 0.0042;
  const bobAmplitude = 3;
  coins.forEach((coin) => {
    if (coin.collected) return;
    const bobOffset = Math.sin(time + (coin.x * 0.05) + (coin.y * 0.002)) * bobAmplitude;
    const cy = coin.y - cameraY + bobOffset;
    if (cy < -30 || cy > HEIGHT + 30) return;

    if (assets.coin) {
      const frame = getSpriteFrame(assets.coin);
      const maxSize = 16;
      const scale = Math.min(maxSize / frame.sw, maxSize / frame.sh);
      const drawW = Math.max(8, Math.round(frame.sw * scale));
      const drawH = Math.max(8, Math.round(frame.sh * scale));
      const drawX = Math.round(coin.x - drawW / 2);
      const drawY = Math.round(cy - drawH / 2);
      ctx.drawImage(assets.coin, frame.sx, frame.sy, frame.sw, frame.sh, drawX, drawY, drawW, drawH);
      return;
    }

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
  const autoSit = !moving && (now - lastMoveTime > 5000) && player.onGround;
  const manualSit = keys.down && player.onGround;
  isSitting = manualSit || autoSit;

  let sprite = null;
  if (manualSit && assets.catCrawl1 && assets.catCrawl2) {
    // Only animate crawl while player is actively moving left/right.
    if (moving) {
      crawlTimer += 16;
      if (crawlTimer >= 500) {
        crawlTimer = 0;
        crawlFrame = (crawlFrame + 1) % 2;
      }
      sprite = crawlFrame === 0 ? assets.catCrawl1 : assets.catCrawl2;
    } else {
      crawlTimer = 0;
      crawlFrame = 0;
      sprite = assets.catCrawl1;
    }
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
    const drawY = Math.round((player.y + player.height) - drawH - cameraY + CAT_DRAW_Y_OFFSET);
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
          endGuidedTutorial();
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
      unlockAchievementsByState(true);
    }
  });

  const scale = Math.max(1.0, HEIGHT / 900);
  const groundJump = -19.8 * scale;
  const airJump = -17.9 * scale;
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
      endGuidedTutorial();
      gameState = 'death';
      showScreen('death');
      hud.classList.add('hidden');
      return;
    }
    player.x = WIDTH / 2 - 24;
    player.y = GROUND_Y - player.height;
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
  let drawY = player.y - cameraY - (spriteH - player.height) + CAT_DRAW_Y_OFFSET;
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
    } else if (!isDown) {
      // Releasing crouch should return to standing and not trigger idle-sit instantly.
      isSitting = false;
      lastMoveTime = Date.now();
      crawlTimer = 0;
      crawlFrame = 0;
    }
    event.preventDefault();
  }
}

function draw() {
  if (gameState === 'title') return;
  drawBackground();
  drawPlants();
  drawPlatforms();
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
  updateSecretRain();
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
    startGuidedTutorial();
  });
}
if (secretBtn) {
  secretBtn.addEventListener('click', () => {
    showSecretPanel();
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
    if (tutorialActive) return;
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
    if (tutorialActive) return;
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
    if (tutorialActive) return;
    openShop();
  });
}

if (achievementsBtn) {
  achievementsBtn.addEventListener('click', () => {
    if (tutorialActive) return;
    openAchievements();
  });
}

if (hudIntroBtn) {
  hudIntroBtn.addEventListener('click', () => {
    if (tutorialActive) return;
    startGuidedTutorial();
  });
}

if (shopCloseBtn) {
  shopCloseBtn.addEventListener('click', () => {
    closeShop();
  });
}

if (achievementsCloseBtn) {
  achievementsCloseBtn.addEventListener('click', () => {
    closeAchievements();
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

if (secretUnlockBtn) {
  secretUnlockBtn.addEventListener('click', () => {
    hideSecretUnlockModal();
  });
}

if (achievementCloseBtn) {
  achievementCloseBtn.addEventListener('click', () => {
    hideAchievementPopup();
    showNextAchievementPopup();
  });
}

if (secretPanelCloseBtn) {
  secretPanelCloseBtn.addEventListener('click', () => {
    hideSecretPanel();
  });
}

if (secretCoinApplyBtn) {
  secretCoinApplyBtn.addEventListener('click', () => {
    if (!secretCoinInput) return;
    const raw = secretCoinInput.value.trim();
    const parsed = Number(raw);
    if (!raw || !Number.isFinite(parsed)) {
      if (secretPanelError) {
        secretPanelError.style.color = '#ffd68f';
        secretPanelError.textContent = 'Enter a valid number.';
      }
      return;
    }

    const rounded = Math.round(parsed);
    const amount = clamp(rounded, 0, 1000000);
    coinBalance += amount;
    updateCoinsHUD();
    if (secretPanelError) {
      secretPanelError.style.color = '#ffed61';
      secretPanelError.textContent = `${amount} coins added.`;
    }
    secretCoinInput.value = '';
  });
}

window.addEventListener('keydown', (event) => {
  if (tutorialActive) {
    if (event.code === 'Escape') endGuidedTutorial();
    event.preventDefault();
    return;
  }
  if (shopOverlay && !shopOverlay.classList.contains('hidden')) {
    if (event.code === 'Escape') closeShop();
    event.preventDefault();
    return;
  }
  if (achievementsOverlay && !achievementsOverlay.classList.contains('hidden')) {
    if (event.code === 'Escape') closeAchievements();
    event.preventDefault();
    return;
  }
  if (warningOverlay && !warningOverlay.classList.contains('hidden')) {
    if (event.code === 'Escape') hideWarningModal();
    event.preventDefault();
    return;
  }
  if (secretUnlockOverlay && !secretUnlockOverlay.classList.contains('hidden')) {
    if (event.code === 'Escape') hideSecretUnlockModal();
    event.preventDefault();
    return;
  }
  if (achievementOverlay && !achievementOverlay.classList.contains('hidden')) {
    if (event.code === 'Escape') {
      hideAchievementPopup();
      showNextAchievementPopup();
    }
    event.preventDefault();
    return;
  }
  if (secretPanelOverlay && !secretPanelOverlay.classList.contains('hidden')) {
    if (event.code === 'Escape') {
      hideSecretPanel();
      event.preventDefault();
      return;
    }
    if (event.target === secretCoinInput || document.activeElement === secretCoinInput) {
      return;
    }
    event.preventDefault();
    return;
  }
  handleInput(event, true);
});
window.addEventListener('keyup', (event) => {
  if (tutorialActive) {
    event.preventDefault();
    return;
  }
  if (secretPanelOverlay && !secretPanelOverlay.classList.contains('hidden')) {
    if (event.target === secretCoinInput || document.activeElement === secretCoinInput) {
      return;
    }
    event.preventDefault();
    return;
  }
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
updateSecretButtonVisibility();
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

if (tutorialNextBtn) {
  tutorialNextBtn.addEventListener('click', () => {
    nextTutorialStep();
  });
}

if (tutorialBackBtn) {
  tutorialBackBtn.addEventListener('click', () => {
    previousTutorialStep();
  });
}

if (tutorialSkipBtn) {
  tutorialSkipBtn.addEventListener('click', () => {
    endGuidedTutorial();
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
window.addEventListener('resize', () => {
  if (tutorialActive) renderTutorialStep();
});
// load optional assets then start
loadAssets().finally(() => {
  createPlatforms();
  drawLives();
  unlockAchievementsByState(false);
  renderAchievements();
});

if (titleHeading) {
  titleHeading.addEventListener('mouseenter', beginTitleHoverTimer);
  titleHeading.addEventListener('mouseleave', cancelTitleHoverTimer);
}

showScreen('title');
loop();
