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
const leaderboardBtn = document.getElementById('leaderboardBtn');
const hudIntroBtn = document.getElementById('hudIntroBtn');
const hudToggleBtn = document.getElementById('hudToggleBtn');
const hudRight = document.getElementById('hudRight');
const hudRightButtons = document.getElementById('hudRightButtons');
const shopOverlay = document.getElementById('shopOverlay');
const shopCoins = document.getElementById('shopCoins');
const shopItems = document.getElementById('shopItems');
const shopCloseBtn = document.getElementById('shopCloseBtn');
const achievementsOverlay = document.getElementById('achievementsOverlay');
const achievementsList = document.getElementById('achievementsList');
const achievementsCloseBtn = document.getElementById('achievementsCloseBtn');
const leaderboardOverlay = document.getElementById('leaderboardOverlay');
const leaderboardMeta = document.getElementById('leaderboardMeta');
const leaderboardList = document.getElementById('leaderboardList');
const leaderboardCloseBtn = document.getElementById('leaderboardCloseBtn');
const namePromptOverlay = document.getElementById('namePromptOverlay');
const playerNameInput = document.getElementById('playerNameInput');
const playerPasswordInput = document.getElementById('playerPasswordInput');
const playerNameConfirmBtn = document.getElementById('playerNameConfirmBtn');
const playerNameCancelBtn = document.getElementById('playerNameCancelBtn');
const playerNameError = document.getElementById('playerNameError');
const authLoginModeBtn = document.getElementById('authLoginModeBtn');
const authSignupModeBtn = document.getElementById('authSignupModeBtn');
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
const adminPanelOverlay = document.getElementById('adminPanelOverlay');
const adminUnlockAllHatsBtn = document.getElementById('adminUnlockAllHatsBtn');
const adminUnlockAllAchievementsBtn = document.getElementById('adminUnlockAllAchievementsBtn');
const adminPanelCloseBtn = document.getElementById('adminPanelCloseBtn');
const adminCoinInput = document.getElementById('adminCoinInput');
const adminCoinError = document.getElementById('adminCoinError');
const adminCoinApplyBtn = document.getElementById('adminCoinApplyBtn');

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
let crownCoinMultiplier = 3;
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
  hatTop: null,
  hatChef: null,
  hatCowboy: null,
  hatStraw: null,
  hatFrog: null,
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
let hudRightButtonsCollapsed = false;
const unlockedAchievements = new Set();
const pendingAchievementQueue = [];
const hatColorOverrides = {};
let playerName = '';
let hasConfirmedPlayerName = false;
let authMode = 'login';
let currentAccountKey = '';
let pendingStartAction = null;
let leaderboardRecords = [];
let totalJumps = 0;
let topHatSafetyNetEnabled = true;
const maskedHatSpriteCache = new Map();
const grayscaleHatSpriteCache = new Map();
const tintedHatSpriteCache = new Map();
const ACCOUNT_STORAGE_KEY = 'project2_2_accounts_v1';
// Rotated to v2 to clear previous test leaderboard entries.
const LEADERBOARD_STORAGE_KEY = 'project2_2_leaderboard_v2';
let accountStore = {};
const BLOCKED_LEADERBOARD_NAMES = new Set(['osj']);
const TOP_HAT_SAFETY_NET_COST = 75;
const TOP_HAT_COIN_MAGNET_RADIUS = 190;
const TOP_HAT_COIN_MAGNET_PULL = 0.2;

const achievementCatalog = {
  jump_first: {
    name: 'Boing Beginner',
    description: 'Perform your first jump.',
    isUnlocked: () => totalJumps >= 1,
  },
  jump_100: {
    name: 'Sky Hopper',
    description: 'Perform 100 jumps.',
    isUnlocked: () => totalJumps >= 100,
  },
  jump_1000: {
    name: 'Frog Mode',
    description: 'Perform 1000 jumps.',
    isUnlocked: () => totalJumps >= 1000,
  },
  first_coin: {
    name: 'First Shiny',
    description: 'Collect your first coin.',
    isUnlocked: () => coinBalance >= 1,
  },
  coin_centurion: {
    name: 'Coin Centurion',
    description: 'Collect 100 total coins.',
    isUnlocked: () => coinBalance >= 100,
  },
  coin_hoarder: {
    name: 'High Roller',
    description: 'Collect 1000 total coins.',
    isUnlocked: () => coinBalance >= 1000,
  },
  first_win: {
    name: 'Sky Breaker',
    description: 'Reach space for the first time.',
    isUnlocked: () => spaceWins >= 1,
  },
  triple_top: {
    name: 'Top Cat',
    description: 'Reach space 3 times.',
    isUnlocked: () => spaceWins >= 3,
  },
  crown_unlock: {
    name: 'Cosmic Royalty',
    description: 'Reach space 10 times.',
    isUnlocked: () => spaceWins >= 10,
  },
  hat_collector: {
    name: 'Catwalk Ready',
    description: 'Buy/Earn your first hat.',
    isUnlocked: () => getOwnedHatCount() >= 1,
  },
  hat_trio: {
    name: 'Hat Trick',
    description: 'Buy/Earn 3 hats.',
    isUnlocked: () => getOwnedHatCount() >= 3,
  },
  hat_master: {
    name: 'Full Closet',
    description: 'Buy/Earn all hats.',
    isUnlocked: () => getOwnedHatCount() >= (hatCatalog.length - 1),
  },
  secret_found: {
    name: 'Admin Pawnel',
    description: 'Find the admin pawnel.',
    isUnlocked: () => secretUnlocked,
  },
};

const achievementSections = [
  { title: 'Space', ids: ['first_win', 'triple_top', 'crown_unlock'] },
  { title: 'Jumps', ids: ['jump_first', 'jump_100', 'jump_1000'] },
  { title: 'Coins', ids: ['first_coin', 'coin_centurion', 'coin_hoarder'] },
  { title: 'Hats', ids: ['hat_collector', 'hat_trio', 'hat_master'] },
  { title: 'Specialized Achievements', ids: ['secret_found'] },
];

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
    title: 'Achievements Button',
    message: 'Click the achievements button to view unlock goals and track your progress.',
    target: 'achievementsBtn',
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
  { id: 'cap', label: 'Cap', cost: 10, color: '#df5252' },
  { id: 'party', label: 'Party Hat', cost: 15, color: '#4da6ff' },
  { id: 'chef', label: 'Chef Hat', cost: 20, color: '#f0f2ff' },
  { id: 'straw', label: 'Straw Hat', cost: 20, color: '#d5b75a' },
  { id: 'cowboy', label: 'Cowboy Hat', cost: 25, color: '#b5854e' },
  { id: 'wizard', label: 'Wizard Hat', cost: 30, color: '#7f79df' },
  { id: 'frog', label: 'Frog Hat', cost: 0, color: '#61b94e', unlockType: 'achievement', requiredAchievement: 'jump_1000' },
  { id: 'top', label: 'Top Hat', cost: 0, color: '#1e1f2b', unlockType: 'achievement', requiredAchievement: 'coin_hoarder' },
  { id: 'crown', label: 'Crown', cost: 0, color: '#f4ce46', unlockType: 'spaceWins', requiredWins: 10 },
];

const spriteFilePaths = {
  coin: 'Vibe Coding Assets (3) #12 Coin.png',
  hats: {
    none: 'Vibe Coding Assets (3) #16 No Hat.png',
    cap: 'Vibe Coding Assets (3) #13 Cap.png',
    party: 'Vibe Coding Assets (3) #14 Party Hat.png',
    crown: 'Vibe Coding Assets (3) #15 Crown.png',
    wizard: 'Vibe Coding Assets (3) #16 Witch Hat.png',
    straw: 'Vibe Coding Assets (3) #21 Strawhat.png',
    top: 'Vibe Coding Assets (3) #22 Top Hat.png',
    chef: 'Vibe Coding Assets (3) #23 Chef Hat.png',
    cowboy: 'Vibe Coding Assets (3) #24 Cowboy Hat.png',
    frog: 'Vibe Coding Assets (3) #25 Frog Hat New.png',
  },
};

function encodeAssetPath(src) {
  return src.split('/').map((seg) => encodeURIComponent(seg)).join('/');
}

function getHatSpritePath(hatId) {
  return spriteFilePaths.hats[hatId] || null;
}

function getHatById(hatId) {
  return hatCatalog.find((hat) => hat.id === hatId) || null;
}

function isHatOwned(hatId) {
  if (hatId === 'none') return true;
  const hat = getHatById(hatId);
  if (!hat) return false;
  if (unlockedHats.has(hatId)) return true;
  if (hat.unlockType === 'spaceWins') {
    return spaceWins >= (hat.requiredWins || 0);
  }
  if (hat.unlockType === 'achievement') {
    return unlockedAchievements.has(hat.requiredAchievement || '');
  }
  return false;
}

function getOwnedHatCount() {
  return hatCatalog.reduce((count, hat) => {
    if (hat.id === 'none') return count;
    return count + (isHatOwned(hat.id) ? 1 : 0);
  }, 0);
}

function getHatPreviewImageSource(hatId) {
  if (hatId === 'cap' && assets.hatCap && assets.hatCap.src) return assets.hatCap.src;
  if (hatId === 'party' && assets.hatParty && assets.hatParty.src) return assets.hatParty.src;
  if (hatId === 'crown' && assets.hatCrown && assets.hatCrown.src) return assets.hatCrown.src;
  if (hatId === 'wizard' && assets.hatWitch && assets.hatWitch.src) return assets.hatWitch.src;
  if (hatId === 'frog' && assets.hatFrog && assets.hatFrog.src) return assets.hatFrog.src;
  if (hatId === 'top' && assets.hatTop && assets.hatTop.src) return assets.hatTop.src;
  if (hatId === 'chef' && assets.hatChef && assets.hatChef.src) return assets.hatChef.src;
  if (hatId === 'cowboy' && assets.hatCowboy && assets.hatCowboy.src) return assets.hatCowboy.src;
  if (hatId === 'straw' && assets.hatStraw && assets.hatStraw.src) return assets.hatStraw.src;

  const spritePath = getHatSpritePath(hatId);
  if (!spritePath) return null;
  return encodeAssetPath(spritePath);
}

function getHatPreviewImageCandidates(hatId) {
  const spritePath = getHatSpritePath(hatId);
  if (!spritePath) return [];

  const preferred = getHatPreviewImageSource(hatId);
  const candidates = [
    preferred,
    encodeAssetPath(spritePath),
    spritePath,
    encodeAssetPath(`assets/${spritePath}`),
    `assets/${spritePath}`,
    encodeAssetPath(`Assets/${spritePath}`),
    `Assets/${spritePath}`,
  ];

  if (hatId === 'frog') {
    const frogVariants = [
      'Vibe Coding Assets (3) #25 Frog Hat New.png',
      'Vibe Coding Assets (3) #25 Frog Hat new.png',
      'Vibe Coding Assets (3) #25 Frog hat new.png',
      'assets/Vibe Coding Assets (3) #25 Frog Hat New.png',
      'assets/Vibe Coding Assets (3) #25 Frog Hat new.png',
      'Assets/Vibe Coding Assets (3) #25 Frog Hat New.png',
      'Assets/Vibe Coding Assets (3) #25 Frog Hat new.png',
      'Vibe Coding Assets (3) #25 Frog Hat.png',
      'Vibe Coding Assets (3) #25 Frog hat.png',
      'Vibe Coding Assets (3) #25 frog hat.png',
      'assets/Vibe Coding Assets (3) #25 Frog Hat.png',
      'assets/Vibe Coding Assets (3) #25 Frog hat.png',
      'Assets/Vibe Coding Assets (3) #25 Frog Hat.png',
      'Assets/Vibe Coding Assets (3) #25 Frog hat.png',
    ];
    frogVariants.forEach((src) => {
      candidates.push(src, encodeAssetPath(src));
    });
  }

  return [...new Set(candidates.filter(Boolean))];
}

function getSelectedHatSprite() {
  if (selectedHat === 'cap') return assets.hatCap;
  if (selectedHat === 'party') return assets.hatParty;
  if (selectedHat === 'crown') return assets.hatCrown;
  if (selectedHat === 'wizard') return assets.hatWitch;
  if (selectedHat === 'frog') return assets.hatFrog;
  if (selectedHat === 'top') return assets.hatTop;
  if (selectedHat === 'chef') return assets.hatChef;
  if (selectedHat === 'cowboy') return assets.hatCowboy;
  if (selectedHat === 'straw') return assets.hatStraw;
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
    return {
      widthRatio: 0.68,
      heightRatio: 0.34,
      xOffset: 0.145,
      bottomYRatio: 0.21,
      walkXOffset: 0.175,
      walkBottomYRatio: 0.25,
      crouchXOffset: 0.19,
      crouchBottomYRatio: 0.33,
      standFineNudgePx: -24,
      walkFineNudgePx: -16,
      crouchFineNudgePx: -12,
    };
  }
  if (hatId === 'party') {
    return {
      widthRatio: 0.7,
      heightRatio: 0.43,
      xOffset: 0.165,
      bottomYRatio: 0.2,
      walkXOffset: 0.18,
      walkBottomYRatio: 0.235,
      crouchXOffset: 0.2,
      crouchBottomYRatio: 0.31,
      standFineNudgePx: 6,
      walkFineNudgePx: 9,
      crouchFineNudgePx: 10,
    };
  }
  if (hatId === 'crown') {
    return { widthRatio: 0.65, heightRatio: 0.37, xOffset: 0.135, bottomYRatio: 0.19 };
  }
  if (hatId === 'wizard') {
    return { widthRatio: 0.78, heightRatio: 0.46, xOffset: 0.135, bottomYRatio: 0.21 };
  }
  if (hatId === 'frog') {
    return {
      widthRatio: 0.72,
      heightRatio: 0.48,
      xOffset: 0.13,
      bottomYRatio: 0.21,
      walkXOffset: 0.16,
      walkBottomYRatio: 0.245,
      crouchXOffset: 0.19,
      crouchBottomYRatio: 0.32,
      sitXOffset: 0.14,
      sitBottomYRatio: 0.24,
      standFineNudgePx: 8,
      walkFineNudgePx: 6,
      crouchFineNudgePx: 4,
      sitFineNudgePx: 7,
      standFineYNudgePx: -1,
      walkFineYNudgePx: 1,
      crouchFineYNudgePx: 2,
      sitFineYNudgePx: 0,
    };
  }
  if (hatId === 'top') {
    return {
      widthRatio: 0.66,
      heightRatio: 0.5,
      xOffset: 0.12,
      bottomYRatio: 0.24,
      walkXOffset: 0.16,
      walkBottomYRatio: 0.275,
      crouchXOffset: 0.19,
      crouchBottomYRatio: 0.345,
      standFineNudgePx: 24,
      walkFineNudgePx: 16,
      crouchFineNudgePx: 14,
    };
  }
  if (hatId === 'chef') {
    return {
      widthRatio: 0.7,
      heightRatio: 0.54,
      xOffset: 0.115,
      bottomYRatio: 0.24,
      walkXOffset: 0.16,
      walkBottomYRatio: 0.285,
      crouchXOffset: 0.19,
      crouchBottomYRatio: 0.34,
      standFineNudgePx: 24,
      walkFineNudgePx: 18,
      crouchFineNudgePx: 15,
    };
  }
  if (hatId === 'cowboy') {
    return {
      widthRatio: 0.8,
      heightRatio: 0.42,
      xOffset: 0.12,
      bottomYRatio: 0.22,
      walkXOffset: 0.165,
      walkBottomYRatio: 0.255,
      crouchXOffset: 0.19,
      crouchBottomYRatio: 0.325,
      standFineNudgePx: 24,
      walkFineNudgePx: 16,
      crouchFineNudgePx: 14,
    };
  }
  if (hatId === 'straw') {
    return {
      widthRatio: 0.78,
      heightRatio: 0.38,
      xOffset: 0.12,
      bottomYRatio: 0.21,
      walkXOffset: 0.16,
      walkBottomYRatio: 0.245,
      crouchXOffset: 0.19,
      crouchBottomYRatio: 0.315,
      standFineNudgePx: 24,
      walkFineNudgePx: 16,
      crouchFineNudgePx: 14,
    };
  }
  return { widthRatio: 0.72, heightRatio: 0.42, xOffset: 0.135, bottomYRatio: 0.2 };
}

function syncAchievementUnlocks() {
  if (unlockedAchievements.has('coin_hoarder') || coinBalance >= 1000) {
    unlockedHats.add('top');
  }
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

function showAdminPanel() {
  if (!secretUnlocked || !adminPanelOverlay) return;
  hideWarningModal();
  closeShop();
  closeAchievements();
  hideSecretPanel();
  if (adminCoinError) adminCoinError.textContent = '';
  if (adminCoinInput) {
    adminCoinInput.value = '';
    adminCoinInput.focus();
  }
  adminPanelOverlay.classList.remove('hidden');
  adminPanelOverlay.classList.add('active');
}

function hideAdminPanel() {
  if (!adminPanelOverlay) return;
  adminPanelOverlay.classList.add('hidden');
  adminPanelOverlay.classList.remove('active');
}

function unlockAllHats() {
  unlockedHats.add('cap');
  unlockedHats.add('party');
  unlockedHats.add('chef');
  unlockedHats.add('cowboy');
  unlockedHats.add('straw');
  unlockedHats.add('top');
  unlockedHats.add('crown');
  unlockedHats.add('wizard');
  unlockedHats.add('frog');
  coinBalance = Math.max(coinBalance, 1000);
  spaceWins = 10;
  unlockAchievementsByState(false);
  updateCoinsHUD();
  syncAchievementUnlocks();
  renderShop();
  if (selectedHat === 'none') selectedHat = 'cap';
}

function unlockAllAchievements() {
  Object.keys(achievementCatalog).forEach((id) => {
    unlockAchievement(id, false);
  });
  renderAchievements();
}

function tryUseTopHatSafetyNet() {
  if (selectedHat !== 'top') return false;
  if (!topHatSafetyNetEnabled) return false;
  if (coinBalance < TOP_HAT_SAFETY_NET_COST) return false;
  coinBalance -= TOP_HAT_SAFETY_NET_COST;
  updateCoinsHUD();
  return true;
}

function updateSecretButtonVisibility() {
  if (!secretBtn) return;
  secretBtn.classList.toggle('hidden', !(secretUnlocked && secretAvailableAfterStart && gameState === 'playing'));
}

function setHudRightButtonsCollapsed(collapsed) {
  hudRightButtonsCollapsed = !!collapsed;
  if (hudRight) {
    hudRight.classList.toggle('collapsed', hudRightButtonsCollapsed);
  }
  if (hudRightButtons) {
    hudRightButtons.classList.toggle('hidden', hudRightButtonsCollapsed);
  }
  if (hudToggleBtn) {
    hudToggleBtn.setAttribute('aria-expanded', hudRightButtonsCollapsed ? 'false' : 'true');
    hudToggleBtn.textContent = '☰';
  }
}

function toggleHudRightButtons() {
  setHudRightButtonsCollapsed(!hudRightButtonsCollapsed);
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

function isTitleScreenActive() {
  return gameState === 'title' && !!titleScreen && !titleScreen.classList.contains('hidden');
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
  if (secretUnlocked || !titleHeading || !isTitleScreenActive()) return;
  if (titleHoverTimer) clearTimeout(titleHoverTimer);
  titleHeading.classList.add('arming');
  titleHoverTimer = setTimeout(() => {
    if (isTitleScreenActive()) {
      unlockSecretPanel();
    } else {
      cancelTitleHoverTimer();
    }
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
  closeLeaderboard();
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
  closeLeaderboard();
  setHudRightButtonsCollapsed(false);
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
  updateLeaderboardForCurrentPlayer();
}

function createHatPreview(hatId, tintColor = null, isLocked = false) {
  const preview = document.createElement('div');
  preview.className = 'hat-preview';

  const spritePath = getHatSpritePath(hatId);
  if (spritePath) {
    const previewSources = getHatPreviewImageCandidates(hatId);
    const img = document.createElement('img');
    img.className = 'hat-preview-image';
    img.alt = `${hatId} hat`;
    const missing = document.createElement('div');
    missing.className = 'hat-preview-missing';
    missing.textContent = 'Image failed to load';
    const tint = document.createElement('div');
    tint.className = 'hat-preview-tint';

    const updateMask = (src) => {
      tint.style.setProperty('--hat-mask-url', `url("${src}")`);
    };

    let sourceIndex = 0;
    const applySource = () => {
      if (sourceIndex < 0 || sourceIndex >= previewSources.length) return;
      const nextSrc = previewSources[sourceIndex];
      img.src = nextSrc;
      updateMask(nextSrc);
    };

    img.addEventListener('load', () => {
      updateMask(img.currentSrc || img.src);
      img.classList.remove('hat-preview-image-hidden');
      missing.classList.remove('active');
      tint.classList.remove('hidden');
    });
    img.addEventListener('error', () => {
      sourceIndex += 1;
      if (sourceIndex < previewSources.length) {
        applySource();
        return;
      }
      img.classList.add('hat-preview-image-hidden');
      tint.classList.add('hidden');
      missing.classList.add('active');
    });

    preview.appendChild(img);
    tint.style.setProperty('--hat-mask-url', previewSources[0] ? `url("${previewSources[0]}")` : 'none');
    preview.appendChild(tint);
    preview.appendChild(missing);

    if (previewSources.length > 0) {
      applySource();
    } else {
      img.classList.add('hat-preview-image-hidden');
      tint.classList.add('hidden');
      missing.classList.add('active');
    }

    if (isLocked) preview.classList.add('hat-preview-locked-sprite');
    if (tintColor) {
      preview.style.setProperty('--hat-tint', tintColor);
      preview.classList.add('hat-preview-has-tint');
    }
    return preview;
  }

  if (hatId === 'none') {
    if (isLocked) preview.classList.add('hat-preview-locked');
    const none = document.createElement('div');
    none.className = 'hat-preview-none';
    none.textContent = 'No Hat';
    preview.appendChild(none);
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

    const achievementLocked = (
      (hat.unlockType === 'spaceWins' && spaceWins < (hat.requiredWins || 0))
      || (hat.unlockType === 'achievement' && !unlockedAchievements.has(hat.requiredAchievement || ''))
    );
    const owned = isHatOwned(hat.id);
    const selected = selectedHat === hat.id;
    const hasCustomHatColor = Object.prototype.hasOwnProperty.call(hatColorOverrides, hat.id);
    const defaultHatColor = hat.color || '#ffffff';
    const hatTintColor = hasCustomHatColor
      ? hatColorOverrides[hat.id]
      : (hat.id === 'top' || hat.id === 'frog' ? null : defaultHatColor);
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
    } else if (hat.unlockType === 'achievement') {
      const reqAchievement = achievementCatalog[hat.requiredAchievement || ''];
      const reqName = reqAchievement?.name || 'Achievement';
      const reqProgress = getAchievementCardStatus(hat.requiredAchievement || '', reqAchievement);
      price.textContent = unlockedAchievements.has(hat.requiredAchievement || '')
        ? `${reqName} unlocked`
        : `${reqName}: ${reqProgress}`;
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
      colorInput.value = hasCustomHatColor
        ? hatColorOverrides[hat.id]
        : (hat.id === 'top' ? '#ffffff' : defaultHatColor);
      colorInput.disabled = !owned || achievementLocked;
      colorInput.title = owned ? 'Choose hat color' : 'Buy or unlock this hat first';
      colorInput.addEventListener('input', () => {
        hatColorOverrides[hat.id] = colorInput.value;
        previewEl.style.setProperty('--hat-tint', colorInput.value);
        previewEl.classList.add('hat-preview-has-tint');
      });

      colorWrap.appendChild(colorInput);
      card.appendChild(colorWrap);
    } else {
      const colorSpacer = document.createElement('div');
      colorSpacer.className = 'hat-color-wrap hat-color-wrap-empty';
      colorSpacer.textContent = 'Color';
      card.appendChild(colorSpacer);
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
      const hasHat = isHatOwned(hat.id);
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

    if (hat.id === 'top' && owned && !achievementLocked) {
      const safetyWrap = document.createElement('div');
      safetyWrap.className = 'top-hat-toggle-wrap';

      const safetyInfo = document.createElement('p');
      safetyInfo.className = 'top-hat-toggle-info';
      safetyInfo.textContent = `Safety Net Cost: ${TOP_HAT_SAFETY_NET_COST} coins`;
      safetyWrap.appendChild(safetyInfo);

      const safetyToggleBtn = document.createElement('button');
      safetyToggleBtn.className = 'top-hat-toggle-btn';
      safetyToggleBtn.textContent = `Safety Net: ${topHatSafetyNetEnabled ? 'On' : 'Off'}`;
      safetyToggleBtn.addEventListener('click', () => {
        topHatSafetyNetEnabled = !topHatSafetyNetEnabled;
        renderShop();
      });
      safetyWrap.appendChild(safetyToggleBtn);

      card.appendChild(safetyWrap);
    }

    shopItems.appendChild(card);
  });
}

function getAchievementCardStatus(id, achievement) {
  if (id === 'jump_first') return `${Math.min(totalJumps, 1)}/1`;
  if (id === 'jump_100') return `${Math.min(totalJumps, 100)}/100`;
  if (id === 'jump_1000') return `${Math.min(totalJumps, 1000)}/1000`;
  if (id === 'first_coin') return `${Math.min(coinBalance, 1)}/1`;
  if (id === 'coin_hoarder') return `${Math.min(coinBalance, 1000)}/1000`;
  if (id === 'coin_centurion') return `${Math.min(coinBalance, 100)}/100`;
  if (id === 'first_win') return `${Math.min(spaceWins, 1)}/1`;
  if (id === 'triple_top') return `${Math.min(spaceWins, 3)}/3`;
  if (id === 'crown_unlock') return `${Math.min(spaceWins, 10)}/10`;
  if (id === 'hat_collector') return getOwnedHatCount() >= 1 ? 'Done' : '0/1';
  if (id === 'hat_trio') return `${Math.min(getOwnedHatCount(), 3)}/3`;
  if (id === 'hat_master') {
    const maxHats = Math.max(1, hatCatalog.length - 1);
    const ownedHats = getOwnedHatCount();
    return `${Math.min(ownedHats, maxHats)}/${maxHats}`;
  }
  if (id === 'secret_found') return secretUnlocked ? 'Done' : 'Locked';
  return achievement && unlockedAchievements.has(id) ? 'Done' : 'Locked';
}

function renderAchievements() {
  if (!achievementsList) return;
  achievementsList.innerHTML = '';
  achievementSections.forEach((section) => {
    const sectionWrap = document.createElement('section');
    sectionWrap.className = 'achievement-section';

    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'achievement-section-title';
    sectionTitle.textContent = section.title;
    sectionWrap.appendChild(sectionTitle);

    const row = document.createElement('div');
    row.className = 'achievement-row';

    section.ids.forEach((id) => {
      const achievement = achievementCatalog[id];
      if (!achievement) return;
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

      row.appendChild(card);
    });

    sectionWrap.appendChild(row);
    achievementsList.appendChild(sectionWrap);
  });
}

function openAchievements() {
  if (!achievementsOverlay) return;
  hideWarningModal();
  closeShop();
  closeLeaderboard();
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
  closeLeaderboard();
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

function drawHatAt(x, y, w, h, posture = null) {
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
    const crouchOrCrawl = !!(posture && posture.isCrouching);
    const walking = !!(posture && posture.isWalking) && !crouchOrCrawl;
    const sitting = !!(posture && posture.isSitting) && !walking && !crouchOrCrawl;
    const xOffsetRatio = crouchOrCrawl
      ? (placement.crouchXOffset ?? (placement.xOffset + 0.085))
      : walking
        ? (placement.walkXOffset ?? placement.xOffset)
        : sitting
          ? (placement.sitXOffset ?? placement.xOffset)
          : placement.xOffset;
    const bottomYRatio = crouchOrCrawl
      ? (placement.crouchBottomYRatio ?? (placement.bottomYRatio + 0.11))
      : walking
        ? (placement.walkBottomYRatio ?? placement.bottomYRatio)
        : sitting
          ? (placement.sitBottomYRatio ?? placement.bottomYRatio)
          : placement.bottomYRatio;
    const maxW = Math.round(w * placement.widthRatio);
    const maxH = Math.round(h * placement.heightRatio);
    const scale = Math.min(maxW / sourceSw, maxH / sourceSh);
    const drawW = Math.max(8, Math.round(sourceSw * scale));
    const drawH = Math.max(8, Math.round(sourceSh * scale));
    const facingSign = player.facingRight ? 1 : -1;
    // Keep hats attached to the head side by making horizontal offset follow facing direction.
    const facingOffset = facingSign * (w * xOffsetRatio);
    let drawX = Math.round(x + (w - drawW) / 2 + facingOffset);
    const spritePixelScale = drawW / frame.sw;
    let fineNudgePx = 0;
    if (crouchOrCrawl) {
      fineNudgePx = Number.isFinite(placement.crouchFineNudgePx)
        ? placement.crouchFineNudgePx
        : Number.isFinite(placement.standFineNudgePx)
          ? placement.standFineNudgePx
          : 0;
    } else if (walking) {
      fineNudgePx = Number.isFinite(placement.walkFineNudgePx)
        ? placement.walkFineNudgePx
        : Number.isFinite(placement.standFineNudgePx)
          ? placement.standFineNudgePx
          : 0;
    } else if (sitting) {
      fineNudgePx = Number.isFinite(placement.sitFineNudgePx)
        ? placement.sitFineNudgePx
        : Number.isFinite(placement.standFineNudgePx)
          ? placement.standFineNudgePx
          : 0;
    } else {
      fineNudgePx = Number.isFinite(placement.standFineNudgePx)
        ? placement.standFineNudgePx
        : 0;
    }
    if (!Number.isFinite(fineNudgePx) && selectedHat === 'crown') {
      fineNudgePx = 3;
    }
    drawX += Math.round(spritePixelScale * fineNudgePx * facingSign);
    let drawY = Math.round(y + (h * bottomYRatio) - drawH);
    const yNudgePx = crouchOrCrawl
      ? (placement.crouchFineYNudgePx ?? 0)
      : walking
        ? (placement.walkFineYNudgePx ?? 0)
        : sitting
          ? (placement.sitFineYNudgePx ?? (placement.standFineYNudgePx ?? 0))
          : (placement.standFineYNudgePx ?? 0);
    if (Number.isFinite(yNudgePx)) {
      drawY += Math.round(spritePixelScale * yNudgePx);
    }
    if (walking && posture && posture.walkFrame === 1) {
      drawY += Math.max(1, Math.round(spritePixelScale * 2));
    }
    const shouldFaceRight = player.facingRight;
    const drawFacingRight = shouldFaceRight;
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
  if (!tryUseTopHatSafetyNet()) {
    lives -= 1;
  }
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
  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  const compactPortrait = isTouchLike && isPortrait;
  mobileControls.classList.toggle('hidden', !isTouchLike);
  mobileControls.classList.toggle('compact-portrait', compactPortrait);

  // Keep action buttons out of the way on narrow touch screens.
  if (isTouchLike) {
    setHudRightButtonsCollapsed(compactPortrait);
  }
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

function canUseLocalStorage() {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

function sanitizePlayerName(name) {
  if (typeof name !== 'string') return '';
  return name.replace(/\s+/g, ' ').trim().slice(0, 24);
}

function normalizeForModeration(name) {
  if (typeof name !== 'string') return '';
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const blockedUsernameTerms = [
  'fuck',
  'fucking',
  'shit',
  'bitch',
  'cunt',
  'nigger',
  'nigga',
  'retard',
  'fag',
  'faggot',
  'slut',
  'whore',
  'porn',
  'sex',
  'penis',
  'vagina',
  'dick',
  'pussy',
  'rape',
  'naz',
  'hitler',
  'kkk',
  'suicide',
  'killyourself',
  'terrorist',
];

function getUsernameValidationError(name) {
  const safeName = sanitizePlayerName(name);
  if (!safeName) return 'Please enter a valid username.';
  if (safeName.length < 1) return 'Username must be at least 1 character.';

  const allowedPattern = /^[A-Za-z0-9 _.:()-]+$/;
  if (!allowedPattern.test(safeName)) {
    return 'Username can only use letters, numbers, spaces, ., -, _, (, ), and :.';
  }

  const normalized = normalizeForModeration(safeName);
  if (normalized) {
    const hasBlockedTerm = blockedUsernameTerms.some((term) => normalized.includes(term));
    if (hasBlockedTerm) {
      return 'That username is not allowed. Please choose another.';
    }

    const repeatedCharPattern = /(.)\1{5,}/;
    if (repeatedCharPattern.test(normalized)) {
      return 'Please choose a less spammy username.';
    }
  }

  return '';
}

function normalizePlayerName(name) {
  return sanitizePlayerName(name).toLowerCase();
}

function hashPassword(password) {
  let hash = 5381;
  const text = String(password || '');
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function loadAccountStore() {
  accountStore = {};
  if (!canUseLocalStorage()) return;
  try {
    const raw = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return;
    Object.entries(parsed).forEach(([key, record]) => {
      if (!record || typeof record !== 'object') return;
      const safeName = sanitizePlayerName(record.playerName || record.name || '');
      if (!safeName) return;
      const normalized = normalizePlayerName(safeName);
      accountStore[normalized] = {
        playerName: safeName,
        passwordHash: String(record.passwordHash || ''),
        progress: record.progress && typeof record.progress === 'object' ? record.progress : null,
      };
    });
  } catch {
    accountStore = {};
  }
}

function saveAccountStore() {
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accountStore));
  } catch {
    // Ignore storage write failures.
  }
}

function getAccountRecordByName(name) {
  const normalized = normalizePlayerName(name);
  if (!normalized) return null;
  return accountStore[normalized] || null;
}

function writePersistentProgress() {
  if (!savedProgress || !currentAccountKey || !accountStore[currentAccountKey]) return;
  accountStore[currentAccountKey].progress = savedProgress;
  saveAccountStore();
}

function loadPersistentProgress() {
  if (!currentAccountKey) return null;
  const account = accountStore[currentAccountKey];
  if (!account || !account.progress || typeof account.progress !== 'object') return null;
  return account.progress;
}

function clearPersistentProgress() {
  if (!currentAccountKey || !accountStore[currentAccountKey]) return;
  accountStore[currentAccountKey].progress = null;
  saveAccountStore();
}

function setCurrentAccountByName(name) {
  const normalized = normalizePlayerName(name);
  if (!normalized || !accountStore[normalized]) return false;
  currentAccountKey = normalized;
  playerName = accountStore[normalized].playerName;
  hasConfirmedPlayerName = true;
  return true;
}

function logoutCurrentAccount() {
  currentAccountKey = '';
  playerName = '';
  hasConfirmedPlayerName = false;
  savedProgress = null;
}

function createAccount(name, password) {
  const safeName = sanitizePlayerName(name);
  const usernameError = getUsernameValidationError(safeName);
  if (usernameError) return { ok: false, message: usernameError };
  const normalized = normalizePlayerName(safeName);
  if (!safeName || !normalized) return { ok: false, message: 'Please enter a valid username.' };
  if (accountStore[normalized]) return { ok: false, message: 'That username is already taken.' };
  if (typeof password !== 'string' || password.length < 5) {
    return { ok: false, message: 'Password must be at least 5 characters.' };
  }
  accountStore[normalized] = {
    playerName: safeName,
    passwordHash: hashPassword(password),
    progress: null,
  };
  saveAccountStore();
  setCurrentAccountByName(safeName);
  return { ok: true };
}

function loginAccount(name, password) {
  const safeName = sanitizePlayerName(name);
  const usernameError = getUsernameValidationError(safeName);
  if (usernameError) return { ok: false, message: usernameError };
  const account = getAccountRecordByName(safeName);
  if (!account) return { ok: false, message: 'No account found for that username.' };
  if (account.passwordHash !== hashPassword(password)) {
    return { ok: false, message: 'Incorrect password.' };
  }
  setCurrentAccountByName(account.playerName);
  return { ok: true };
}

function loadLeaderboardData() {
  if (!canUseLocalStorage()) {
    leaderboardRecords = [];
    return;
  }
  try {
    const raw = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) {
      leaderboardRecords = [];
      return;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      leaderboardRecords = [];
      return;
    }
    leaderboardRecords = parsed
      .filter((entry) => entry && typeof entry === 'object')
      .map((entry) => ({
        name: sanitizePlayerName(entry.name || ''),
        wins: Math.max(0, Math.floor(Number(entry.wins) || 0)),
        coins: Math.max(0, Math.floor(Number(entry.coins) || 0)),
        updatedAt: Number(entry.updatedAt) || Date.now(),
      }))
      .filter((entry) => {
        if (!entry.name) return false;
        return !BLOCKED_LEADERBOARD_NAMES.has(entry.name.toLowerCase());
      });
    saveLeaderboardData();
  } catch {
    leaderboardRecords = [];
  }
}

function saveLeaderboardData() {
  if (!canUseLocalStorage()) return;
  leaderboardRecords = leaderboardRecords.filter((entry) => {
    if (!entry || !entry.name) return false;
    return !BLOCKED_LEADERBOARD_NAMES.has(String(entry.name).toLowerCase());
  });
  try {
    window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboardRecords));
  } catch {
    // Ignore storage write failures.
  }
}

function updateLeaderboardForCurrentPlayer(winsValue = spaceWins, coinsValue = coinBalance, nameValue = playerName) {
  if (!hasConfirmedPlayerName) return;
  const safeName = sanitizePlayerName(nameValue);
  if (!safeName) return;
  const normalized = safeName.toLowerCase();
  if (!normalized) return;
  const now = Date.now();
  const existing = leaderboardRecords.find((entry) => entry.name.toLowerCase() === normalized);
  const safeWins = Math.max(0, Math.floor(Number(winsValue) || 0));
  const safeCoins = Math.max(0, Math.floor(Number(coinsValue) || 0));
  if (existing) {
    existing.name = safeName;
    existing.wins = Math.max(existing.wins, safeWins);
    existing.coins = Math.max(existing.coins, safeCoins);
    existing.updatedAt = now;
  } else {
    leaderboardRecords.push({
      name: safeName,
      wins: safeWins,
      coins: safeCoins,
      updatedAt: now,
    });
  }

  leaderboardRecords.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.coins !== a.coins) return b.coins - a.coins;
    if (a.updatedAt !== b.updatedAt) return a.updatedAt - b.updatedAt;
    return a.name.localeCompare(b.name);
  });
  leaderboardRecords = leaderboardRecords.slice(0, 25);
  saveLeaderboardData();
}

function renderLeaderboard() {
  if (!leaderboardList || !leaderboardMeta) return;
  updateLeaderboardForCurrentPlayer();
  leaderboardList.innerHTML = '';
  leaderboardMeta.textContent = playerName
    ? `Player: ${playerName}`
    : 'No player name set yet.';

  if (leaderboardRecords.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'leaderboard-empty';
    empty.textContent = 'No entries yet. Start playing to add scores.';
    leaderboardList.appendChild(empty);
    return;
  }

  leaderboardRecords.forEach((entry, idx) => {
    const row = document.createElement('div');
    row.className = 'leaderboard-entry';

    const rank = document.createElement('div');
    rank.className = 'leaderboard-rank';
    rank.textContent = `#${idx + 1}`;

    const name = document.createElement('div');
    name.className = 'leaderboard-name';
    name.textContent = entry.name;

    const wins = document.createElement('div');
    wins.className = 'leaderboard-stat';
    wins.textContent = `Wins: ${entry.wins}`;

    const coinsTextNode = document.createElement('div');
    coinsTextNode.className = 'leaderboard-stat';
    coinsTextNode.textContent = `Coins: ${entry.coins}`;

    row.append(rank, name, wins, coinsTextNode);
    leaderboardList.appendChild(row);
  });
}

function openLeaderboard() {
  if (!leaderboardOverlay) return;
  hideWarningModal();
  closeShop();
  closeAchievements();
  renderLeaderboard();
  leaderboardOverlay.classList.remove('hidden');
  leaderboardOverlay.classList.add('active');
}

function closeLeaderboard() {
  if (!leaderboardOverlay) return;
  leaderboardOverlay.classList.add('hidden');
  leaderboardOverlay.classList.remove('active');
}

function showNamePrompt(onConfirm) {
  if (!namePromptOverlay) {
    if (typeof onConfirm === 'function') onConfirm();
    return;
  }
  closeShop();
  closeAchievements();
  closeLeaderboard();
  hideWarningModal();
  pendingStartAction = typeof onConfirm === 'function' ? onConfirm : null;
  if (playerNameError) {
    playerNameError.style.color = '#ffd68f';
    playerNameError.textContent = '';
  }
  if (authLoginModeBtn && authSignupModeBtn) {
    authLoginModeBtn.classList.toggle('active', authMode === 'login');
    authSignupModeBtn.classList.toggle('active', authMode === 'signup');
  }
  if (playerNameInput) {
    playerNameInput.value = playerName;
  }
  if (playerPasswordInput) {
    playerPasswordInput.value = '';
    playerPasswordInput.setAttribute('autocomplete', authMode === 'signup' ? 'new-password' : 'current-password');
  }
  namePromptOverlay.classList.remove('hidden');
  namePromptOverlay.classList.add('active');
  if (playerNameInput) {
    playerNameInput.focus();
    playerNameInput.select();
  }
}

function hideNamePrompt() {
  if (!namePromptOverlay) return;
  namePromptOverlay.classList.add('hidden');
  namePromptOverlay.classList.remove('active');
}

function cancelPlayerNamePrompt() {
  pendingStartAction = null;
  if (playerNameError) {
    playerNameError.style.color = '#ffd68f';
    playerNameError.textContent = '';
  }
  hideNamePrompt();
}

function setAuthMode(mode) {
  authMode = mode === 'signup' ? 'signup' : 'login';
  if (authLoginModeBtn && authSignupModeBtn) {
    authLoginModeBtn.classList.toggle('active', authMode === 'login');
    authSignupModeBtn.classList.toggle('active', authMode === 'signup');
  }
  if (playerPasswordInput) {
    playerPasswordInput.setAttribute('autocomplete', authMode === 'signup' ? 'new-password' : 'current-password');
  }
  if (playerNameError) {
    playerNameError.style.color = '#ffd68f';
    playerNameError.textContent = '';
  }
}

function ensurePlayerNameBefore(onConfirm) {
  if (hasConfirmedPlayerName && currentAccountKey && sanitizePlayerName(playerName)) {
    if (typeof onConfirm === 'function') onConfirm();
    return;
  }
  showNamePrompt(onConfirm);
}

function confirmPlayerNameFromInput() {
  if (!playerNameInput || !playerPasswordInput) return;
  const nextName = sanitizePlayerName(playerNameInput.value);
  const nextPassword = String(playerPasswordInput.value || '');
  const usernameError = getUsernameValidationError(nextName);
  if (usernameError) {
    if (playerNameError) playerNameError.textContent = usernameError;
    return;
  }

  let result;
  if (authMode === 'signup') {
    result = createAccount(nextName, nextPassword);
  } else {
    result = loginAccount(nextName, nextPassword);
  }

  if (!result || !result.ok) {
    if (playerNameError) playerNameError.textContent = result?.message || 'Unable to continue.';
    return;
  }

  savedProgress = null;
  if (playerNameError) {
    playerNameError.style.color = '#ffed61';
    playerNameError.textContent = authMode === 'signup' ? 'Account created.' : 'Login successful.';
  }
  hideNamePrompt();
  updateLeaderboardForCurrentPlayer();
  const action = pendingStartAction;
  pendingStartAction = null;
  if (typeof action === 'function') action();
}

function saveProgress() {
  if (!currentAccountKey || !hasConfirmedPlayerName) return;
  updateLeaderboardForCurrentPlayer();
  savedProgress = {
    lives,
    coinBalance,
    spaceWins,
    totalJumps,
    crownCoinMultiplier,
    playerName,
    hasConfirmedPlayerName,
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
  writePersistentProgress();
}

function restoreProgress() {
  if (!savedProgress) {
    const diskProgress = loadPersistentProgress();
    if (diskProgress) savedProgress = diskProgress;
  }
  if (!savedProgress) return false;
  const hadSecretUnlockedAlready = secretUnlocked;
  lives = Math.max(1, Math.floor(Number(savedProgress.lives) || 9));
  coinBalance = savedProgress.coinBalance || 0;
  spaceWins = savedProgress.spaceWins || 0;
  totalJumps = Math.max(0, Math.floor(Number(savedProgress.totalJumps) || 0));
  playerName = sanitizePlayerName(playerName || savedProgress.playerName || '');
  hasConfirmedPlayerName = !!hasConfirmedPlayerName || !!savedProgress.hasConfirmedPlayerName;
  crownCoinMultiplier = Math.max(3, savedProgress.crownCoinMultiplier || 3);
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
  cameraY = Number(savedProgress.cameraY) || 0;
  dropStartY = Number.isFinite(savedProgress.dropStartY) ? savedProgress.dropStartY : null;
  const savedPlayer = savedProgress.player || {};
  player.x = Number(savedPlayer.x) || (WIDTH / 2 - 24);
  player.y = Number(savedPlayer.y) || (GROUND_Y - player.height);
  player.vx = Number(savedPlayer.vx) || 0;
  player.vy = Number(savedPlayer.vy) || 0;
  player.jumpCount = Number(savedPlayer.jumpCount) || 0;
  player.facingRight = savedPlayer.facingRight !== false;
  player.onGround = !!savedPlayer.onGround;
  player.onIce = !!savedPlayer.onIce;
  platforms = (savedProgress.platforms || []).map((p) => ({
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
  updateLeaderboardForCurrentPlayer();
  return true;
}

function resetGame(keepProgress = false) {
  gameState = 'playing';
  lives = 9;
  if (!keepProgress) {
    // Preserve the player's best standing before wiping run progress.
    updateLeaderboardForCurrentPlayer(spaceWins, coinBalance, playerName);
  }
  if (!keepProgress) {
    coinBalance = 0;
    spaceWins = 0;
    totalJumps = 0;
    crownCoinMultiplier = 3;
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
  if (!keepProgress) {
    savedProgress = null;
    clearPersistentProgress();
  }
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
  updateLeaderboardForCurrentPlayer();
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

  const PLATFORM_OVERLAP_PADDING = 6;
  const overlapsExistingPlatform = (x, y, width, height) => platforms.some((plat) => {
    if (plat.type !== 'platform') return false;
    return x < (plat.x + plat.width + PLATFORM_OVERLAP_PADDING)
      && (x + width + PLATFORM_OVERLAP_PADDING) > plat.x
      && y < (plat.y + plat.height + PLATFORM_OVERLAP_PADDING)
      && (y + height + PLATFORM_OVERLAP_PADDING) > plat.y;
  });

  const findAvailableX = (targetX, yPos, width, height, minX, maxX) => {
    const low = Math.min(minX, maxX);
    const high = Math.max(minX, maxX);
    if (high < low) return null;
    const clampedTarget = clamp(targetX, low, high);
    if (!overlapsExistingPlatform(clampedTarget, yPos, width, height)) {
      return clampedTarget;
    }

    const span = Math.max(0, high - low);
    const sweepStep = Math.max(12, Math.floor(span / 16) || 12);
    for (let probe = low; probe <= high; probe += sweepStep) {
      if (!overlapsExistingPlatform(probe, yPos, width, height)) {
        return probe;
      }
    }
    if (!overlapsExistingPlatform(high, yPos, width, height)) {
      return high;
    }
    return null;
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
    const candidateMainX = minReachX <= maxReachX
      ? clamp(driftedX, minReachX, maxReachX)
      : clamp(safeCenterX, worldMinX, worldMaxX);
    const mainBoundsMinX = minReachX <= maxReachX ? minReachX : worldMinX;
    const mainBoundsMaxX = minReachX <= maxReachX ? maxReachX : worldMaxX;
    const resolvedMainX = findAvailableX(candidateMainX, y, width, height, mainBoundsMinX, mainBoundsMaxX);
    if (resolvedMainX === null) {
      y -= gapY;
      continue;
    }
    mainX = resolvedMainX;

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
      const resolvedSideX = findAvailableX(sideX, sideY, sideWidth, sideHeight, 16, WIDTH - sideWidth - 16);
      if (resolvedSideX !== null) {
        platforms.push({ x: resolvedSideX, y: sideY, width: sideWidth, height: sideHeight, type: 'platform', variant: sideVariant, waitTime: 0, biome: sideBiome, flowerDensity: sideFlowerDensity, spriteSize: sideSpriteSize });
      }
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
  const ASSET_REV = '2026-06-29-hats-refresh-3';
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
      spriteFilePaths.hats.top,
      `${basePath}/${spriteFilePaths.hats.top}`,
    ]).then((i) => (assets.hatTop = i)),
    loadFirstPaths([
      spriteFilePaths.hats.chef,
      `${basePath}/${spriteFilePaths.hats.chef}`,
    ]).then((i) => (assets.hatChef = i)),
    loadFirstPaths([
      spriteFilePaths.hats.cowboy,
      `${basePath}/${spriteFilePaths.hats.cowboy}`,
    ]).then((i) => (assets.hatCowboy = i)),
    loadFirstPaths([
      spriteFilePaths.hats.frog,
      `${basePath}/${spriteFilePaths.hats.frog}`,
      'Vibe Coding Assets (3) #25 Frog Hat.png',
      `${basePath}/Vibe Coding Assets (3) #25 Frog Hat.png`,
    ]).then((i) => (assets.hatFrog = i)),
    loadFirstPaths([
      spriteFilePaths.hats.straw,
      `${basePath}/${spriteFilePaths.hats.straw}`,
    ]).then((i) => (assets.hatStraw = i)),
    loadFirstPaths([
      'Vibe Coding Assets (3) #8 Small Grass Platform.png',
      `${basePath}/Vibe Coding Assets (3) #8 Small Grass Platform.png`,
    ]).then((i) => (assets.grassSmall = i)),
    loadFirstPaths([
      'Vibe Coding Assets (3) #12 Icy Small Grass Platform New.png',
      'Assets/Vibe Coding Assets (3) #12 Icy Small Grass Platform New.png',
      'assets/Vibe Coding Assets (3) #12 Icy Small Grass Platform New.png',
      `${basePath}/Vibe Coding Assets (3) #12 Icy Small Grass Platform New.png`,
      'Vibe Coding Assets (3) #12 Icy Small Grass Platform.png',
      'Assets/Vibe Coding Assets (3) #12 Icy Small Grass Platform.png',
      'assets/Vibe Coding Assets (3) #12 Icy Small Grass Platform.png',
      `${basePath}/Vibe Coding Assets (3) #12 Icy Small Grass Platform.png`,
    ]).then((i) => (assets.iceGrassSmall = i)),
    // Name correction: file labeled #10 Large is the medium platform art.
    loadFirstPaths([
      'Vibe Coding Assets (3) #10 Large Grass Platform.png',
      `${basePath}/Vibe Coding Assets (3) #10 Large Grass Platform.png`,
    ]).then((i) => (assets.grassMedium = i)),
    loadFirstPaths([
      'Vibe Coding Assets (3) #13 Icy Medium Grass Platform New.png',
      'Assets/Vibe Coding Assets (3) #13 Icy Medium Grass Platform New.png',
      'assets/Vibe Coding Assets (3) #13 Icy Medium Grass Platform New.png',
      `${basePath}/Vibe Coding Assets (3) #13 Icy Medium Grass Platform New.png`,
      'Vibe Coding Assets (3) #13 Icy Medium Grass Platform.png',
      'Assets/Vibe Coding Assets (3) #13 Icy Medium Grass Platform.png',
      'assets/Vibe Coding Assets (3) #13 Icy Medium Grass Platform.png',
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
      'Assets/Vibe Coding Assets (3) #14 Icy Large Grass Platform New.png',
      'assets/Vibe Coding Assets (3) #14 Icy Large Grass Platform New.png',
      `${basePath}/Vibe Coding Assets (3) #14 Icy Large Grass Platform New.png`,
      'Vibe Coding Assets (3) #14 Icy Large Grass Platform.png',
      'Assets/Vibe Coding Assets (3) #14 Icy Large Grass Platform.png',
      'assets/Vibe Coding Assets (3) #14 Icy Large Grass Platform.png',
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

  if (screen !== 'title') {
    cancelTitleHoverTimer();
  }

  if (screen === 'title') {
    titleScreen.classList.remove('hidden');
    titleScreen.classList.add('active');
    if (titleHeading && titleHeading.matches(':hover')) {
      beginTitleHoverTimer();
    }
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
  if (selectedHat === 'crown') {
    crownCoinMultiplier *= 3;
  }
  syncAchievementUnlocks();
  unlockAchievementsByState(true);
  updateLeaderboardForCurrentPlayer();
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
    drawHatAt(drawX, drawY, drawW, drawH, { isCrouching: manualSit, isWalking: moving && !manualSit, isSitting, walkFrame });
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
  drawHatAt(fx, fy, w, h, { isCrouching: manualSit, isWalking: moving && !manualSit, isSitting, walkFrame });
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

  // prevent horizontal sprite clipping by keeping extra sprite padding inside viewport
  const drawW = Math.round(player.width * 1.45);
  const padX = Math.round((drawW - player.width) / 2);
  const minPlayerX = padX;
  const maxPlayerX = Math.max(padX, WIDTH - player.width - padX);
  if (player.x < minPlayerX) player.x = minPlayerX;
  if (player.x > maxPlayerX) player.x = maxPlayerX;

  const moveY = player.vy;
  const verticalStepCount = Math.max(1, Math.ceil(Math.abs(moveY) / 4));
  const stepY = moveY / verticalStepCount;
  for (let step = 0; step < verticalStepCount; step += 1) {
    const prevY = player.y;
    player.y += stepY;
    let hitVertical = false;

    platforms.forEach((plat) => {
      if (hitVertical) return;
      const isHorizontalOverlap = player.x + player.width > plat.x + 4 && player.x < plat.x + plat.width - 4;
      if (!isHorizontalOverlap) return;

      const platformTop = plat.y;
      const platformBottom = plat.y + plat.height;
      const prevBottom = prevY + player.height;
      const newBottom = player.y + player.height;
      const prevTop = prevY;
      const newTop = player.y;

      if (stepY >= 0 && prevBottom <= platformTop && newBottom >= platformTop) {
        player.y = platformTop - player.height;
        player.vy = 0;
        player.onGround = true;
        player.jumpCount = 0;
        if (plat.variant === 'ice') player.onIce = true;
        hitVertical = true;
      } else if (stepY < 0 && prevTop >= platformBottom && newTop <= platformBottom) {
        player.y = platformBottom;
        player.vy = 0;
        hitVertical = true;
      }
    });

    if (hitVertical) break;
  }

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
  const stepCount = Math.max(1, Math.ceil(Math.abs(moveX) / 3));
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
      } else {
        const horizontalOverlap = player.x + player.width > plat.x && player.x < plat.x + plat.width;
        if (horizontalOverlap) {
          // Fallback overlap correction to prevent phasing at high diagonal speeds.
          const overlapFromLeft = Math.abs((player.x + player.width) - plat.x);
          const overlapFromRight = Math.abs((plat.x + plat.width) - player.x);
          if (oldX + player.width <= plat.x || overlapFromLeft <= overlapFromRight) {
            player.x = plat.x - player.width;
          } else {
            player.x = plat.x + plat.width;
          }
          player.vx = 0;
          hitSide = true;
        }
      }
    });
    if (hitSide) break;
  }

  if (player.x < minPlayerX) player.x = minPlayerX;
  if (player.x > maxPlayerX) player.x = maxPlayerX;

  coins.forEach((coin) => {
    if (coin.collected) return;
    if (selectedHat === 'top') {
      const px = player.x + player.width / 2;
      const py = player.y + player.height / 2;
      const dx = px - coin.x;
      const dy = py - coin.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0 && dist < TOP_HAT_COIN_MAGNET_RADIUS) {
        const strength = (1 - (dist / TOP_HAT_COIN_MAGNET_RADIUS)) * TOP_HAT_COIN_MAGNET_PULL;
        coin.x += dx * strength;
        coin.y += dy * strength;
      }
    }
    const overlapX = Math.abs((player.x + player.width / 2) - coin.x) < (player.width / 2 + 7);
    const overlapY = Math.abs((player.y + player.height / 2) - coin.y) < (player.height / 2 + 7);
    if (overlapX && overlapY) {
      coin.collected = true;
      const coinGain = selectedHat === 'crown' ? crownCoinMultiplier : 1;
      coinBalance += coinGain;
      spawnCoinBurst(coin.x, coin.y);
      playCoinSfx();
      updateCoinsHUD();
      unlockAchievementsByState(true);
    }
  });

  const scale = Math.max(1.0, HEIGHT / 900);
  const frogJumpMultiplier = selectedHat === 'frog' ? 1.55 : 1;
  const groundJump = -19.8 * scale * frogJumpMultiplier;
  const airJump = -17.9 * scale * frogJumpMultiplier;
  if (keys.jump) jumpBufferFrames = 7;
  if ((player.onGround || coyoteFrames > 0) && jumpBufferFrames > 0) {
    player.vy = groundJump;
    player.jumpCount = 1;
    totalJumps += 1;
    coyoteFrames = 0;
    jumpBufferFrames = 0;
    keys.jump = false;
    unlockAchievementsByState(true);
  }

  if (!player.onGround && jumpBufferFrames > 0 && player.jumpCount < 2) {
    player.vy = airJump;
    player.jumpCount += 1;
    totalJumps += 1;
    jumpBufferFrames = 0;
    keys.jump = false;
    unlockAchievementsByState(true);
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
    ensurePlayerNameBefore(() => {
      showScreen('none');
      startGame();
    });
  });
}
if (introBtn) {
  introBtn.addEventListener('click', () => {
    ensurePlayerNameBefore(() => {
      startGuidedTutorial();
    });
  });
}
if (secretBtn) {
  secretBtn.addEventListener('click', () => {
    showAdminPanel();
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
      'Quit saves current progress, logs out, and exits to the title screen.',
      () => {
        saveProgress();
        logoutCurrentAccount();
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

if (leaderboardBtn) {
  leaderboardBtn.addEventListener('click', () => {
    if (tutorialActive) return;
    openLeaderboard();
  });
}

if (hudIntroBtn) {
  hudIntroBtn.addEventListener('click', () => {
    if (tutorialActive) return;
    startGuidedTutorial();
  });
}

if (hudToggleBtn) {
  hudToggleBtn.addEventListener('click', () => {
    if (tutorialActive) return;
    toggleHudRightButtons();
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

if (leaderboardCloseBtn) {
  leaderboardCloseBtn.addEventListener('click', () => {
    closeLeaderboard();
  });
}

if (playerNameConfirmBtn) {
  playerNameConfirmBtn.addEventListener('click', () => {
    confirmPlayerNameFromInput();
  });
}

if (playerNameCancelBtn) {
  playerNameCancelBtn.addEventListener('click', () => {
    cancelPlayerNamePrompt();
  });
}

if (playerNameInput) {
  playerNameInput.addEventListener('keydown', (event) => {
    if (event.code === 'Enter' || event.key === 'Enter') {
      event.preventDefault();
      confirmPlayerNameFromInput();
    }
  });
}

if (playerPasswordInput) {
  playerPasswordInput.addEventListener('keydown', (event) => {
    if (event.code === 'Enter' || event.key === 'Enter') {
      event.preventDefault();
      confirmPlayerNameFromInput();
    }
  });
}

if (authLoginModeBtn) {
  authLoginModeBtn.addEventListener('click', () => {
    setAuthMode('login');
  });
}

if (authSignupModeBtn) {
  authSignupModeBtn.addEventListener('click', () => {
    setAuthMode('signup');
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
    saveProgress();
    logoutCurrentAccount();
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
    unlockAchievementsByState(true);
    if (secretPanelError) {
      secretPanelError.style.color = '#ffed61';
      secretPanelError.textContent = `${amount} coins added.`;
    }
    secretCoinInput.value = '';
  });
}

if (adminUnlockAllHatsBtn) {
  adminUnlockAllHatsBtn.addEventListener('click', () => {
    unlockAllHats();
  });
}

if (adminUnlockAllAchievementsBtn) {
  adminUnlockAllAchievementsBtn.addEventListener('click', () => {
    unlockAllAchievements();
  });
}

if (adminPanelCloseBtn) {
  adminPanelCloseBtn.addEventListener('click', () => {
    hideAdminPanel();
  });
}

if (adminCoinApplyBtn) {
  adminCoinApplyBtn.addEventListener('click', () => {
    if (!adminCoinInput) return;
    const raw = adminCoinInput.value.trim();
    const parsed = Number(raw);
    if (!raw || !Number.isFinite(parsed)) {
      if (adminCoinError) {
        adminCoinError.style.color = '#ffd68f';
        adminCoinError.textContent = 'Enter a valid number.';
      }
      return;
    }

    const rounded = Math.round(parsed);
    const amount = clamp(rounded, 0, 1000000);
    coinBalance += amount;
    updateCoinsHUD();
    unlockAchievementsByState(true);
    if (adminCoinError) {
      adminCoinError.style.color = '#ffed61';
      adminCoinError.textContent = `${amount} coins added.`;
    }
    adminCoinInput.value = '';
  });
}

window.addEventListener('keydown', (event) => {
  if (namePromptOverlay && !namePromptOverlay.classList.contains('hidden')) {
    const typingInNameInput = event.target === playerNameInput
      || document.activeElement === playerNameInput
      || event.target === playerPasswordInput
      || document.activeElement === playerPasswordInput;
    if (event.code === 'Escape') {
      cancelPlayerNamePrompt();
      event.preventDefault();
      return;
    }
    if (typingInNameInput) {
      return;
    }
    event.preventDefault();
    return;
  }
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
  if (leaderboardOverlay && !leaderboardOverlay.classList.contains('hidden')) {
    if (event.code === 'Escape') closeLeaderboard();
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
  if (namePromptOverlay && !namePromptOverlay.classList.contains('hidden')) {
    const typingInNameInput = event.target === playerNameInput
      || document.activeElement === playerNameInput
      || event.target === playerPasswordInput
      || document.activeElement === playerPasswordInput;
    if (typingInNameInput) {
      return;
    }
    event.preventDefault();
    return;
  }
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
  if (gameState === 'playing' || gameState === 'win') {
    saveProgress();
  }
});

window.addEventListener('pagehide', () => {
  if (gameState === 'playing' || gameState === 'win') {
    saveProgress();
  }
});

showScreen('title');
updateSecretButtonVisibility();
setHudRightButtonsCollapsed(false);
loadAccountStore();
loadLeaderboardData();
setAuthMode('login');
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

loop();
