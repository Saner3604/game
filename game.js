"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const screens = {
  menu: document.getElementById("menuScreen"),
  level: document.getElementById("levelScreen"),
  select: document.getElementById("selectScreen"),
  modal: document.getElementById("resultModal"),
  pause: document.getElementById("pauseModal"),
  rules: document.getElementById("rulesModal")
};

const ui = {
  level: document.getElementById("hudLevel"),
  timer: document.getElementById("hudTimer"),
  p1Label: document.getElementById("hudP1Label"),
  p2Label: document.getElementById("hudP2Label"),
  p1: document.getElementById("hudP1"),
  p2: document.getElementById("hudP2"),
  resultTitle: document.getElementById("resultTitle"),
  resultText: document.getElementById("resultText"),
  nextBtn: document.getElementById("nextBtn"),
  retryBtn: document.getElementById("retryBtn"),
  menuBtn: document.getElementById("menuBtn"),
  rulesBtn: document.getElementById("rulesBtn"),
  closeRulesBtn: document.getElementById("closeRulesBtn"),
  levelTitle: document.getElementById("levelSelectTitle"),
  levelNote: document.getElementById("levelProgressNote"),
  levelChoices: document.getElementById("levelChoices"),
  levelContinueBtn: document.getElementById("levelContinueBtn"),
  resumeBtn: document.getElementById("resumeBtn"),
  pauseRetryBtn: document.getElementById("pauseRetryBtn"),
  pauseRulesBtn: document.getElementById("pauseRulesBtn"),
  pauseMenuBtn: document.getElementById("pauseMenuBtn")
};

const TILE = {
  FLOOR: 0,
  WALL: 1,
  DOOR: 2
};

const MODE = {
  SINGLE: "single",
  COOP: "coop",
  VERSUS: "versus"
};

const POWERUPS = [
  { type: "freeze", label: "冰冻", icon: "❄", color: "#73d8ff", accent: "#1b9fe8" },
  { type: "shield", label: "护盾", icon: "盾", color: "#ffd166", accent: "#f08c00" },
  { type: "magnet", label: "磁吸", icon: "吸", color: "#ff8cc6", accent: "#d63384" },
  { type: "speed", label: "加速", icon: "快", color: "#8ce99a", accent: "#2f9e44" }
];

const ENEMY_TYPES = [
  {
    id: "chaser",
    name: "果冻追兵",
    level: 1,
    color: "#c07a47",
    dark: "#7b5632",
    glow: "#ffb86b",
    speedFactor: 1,
    chaseFactor: 1.18,
    canPhase: false,
    canLaser: false,
    canFly: false,
    canSkate: false
  },
  {
    id: "ghost",
    name: "穿墙幽灵",
    level: 2,
    color: "#b8f7ff",
    dark: "#5489a3",
    glow: "#89e8ff",
    speedFactor: 0.88,
    chaseFactor: 1.05,
    canPhase: true,
    canLaser: false,
    canFly: false,
    canSkate: false
  },
  {
    id: "skater",
    name: "滑板快客",
    level: 3,
    color: "#78e08f",
    dark: "#2f7d55",
    glow: "#b8ff5c",
    speedFactor: 1.22,
    chaseFactor: 1.34,
    canPhase: false,
    canLaser: false,
    canFly: false,
    canSkate: true
  },
  {
    id: "laser",
    name: "棱镜炮手",
    level: 4,
    color: "#ff8cc6",
    dark: "#8f3a72",
    glow: "#ff4fc3",
    speedFactor: 0.78,
    chaseFactor: 0.92,
    canPhase: false,
    canLaser: true,
    canFly: false,
    canSkate: false
  },
  {
    id: "flyer",
    name: "飞跃怪",
    level: 5,
    color: "#b197fc",
    dark: "#5f3dc4",
    glow: "#d0bfff",
    speedFactor: 1.02,
    chaseFactor: 1.08,
    canPhase: false,
    canLaser: false,
    canFly: true,
    canSkate: false
  }
];

const CHARACTERS = [
  {
    id: "runner",
    label: "闪电队长",
    mood: "热血、爱冲锋，越危险越兴奋",
    attackName: "雷霆弧光",
    attackStyle: "lightning",
    type: "visor",
    body: ["#ff4d6d", "#ff9f1c"],
    head: "#ffd7b5",
    accent: "#ffd166",
    trim: "#ffffff"
  },
  {
    id: "pilot",
    label: "星际飞行员",
    mood: "冷静、精准，喜欢用蓝色能量切开路线",
    attackName: "星轨切线",
    attackStyle: "laser",
    type: "helmet",
    body: ["#3a86ff", "#4cc9f0"],
    head: "#ffe1bd",
    accent: "#80ffdb",
    trim: "#111827"
  },
  {
    id: "mage",
    label: "糖果法师",
    mood: "俏皮、爱恶作剧，攻击像糖果魔法爆开",
    attackName: "糖霜星爆",
    attackStyle: "spark",
    type: "hood",
    body: ["#f72585", "#7209b7"],
    head: "#f7c7a0",
    accent: "#c77dff",
    trim: "#ffdf6e"
  },
  {
    id: "scout",
    label: "青柠斥候",
    mood: "灵巧、机警，擅长用旋风扫清身前",
    attackName: "青柠旋风",
    attackStyle: "wind",
    type: "cap",
    body: ["#2ec4b6", "#52ffa8"],
    head: "#ffd0a6",
    accent: "#b8ff5c",
    trim: "#0f172a"
  }
];

const SKINS = [
  { id: "base", label: "原装", unlock: "默认解锁", body: null, accent: null, trim: null },
  { id: "sunny", label: "晴空", unlock: "单人通关第1关", need: { singleLevel: 1 }, body: ["#ffb703", "#fb8500"], accent: "#fff176", trim: "#ffffff" },
  { id: "frost", label: "冰原", unlock: "单人通关第3关", need: { singleLevel: 3 }, body: ["#48cae4", "#90e0ef"], accent: "#caf0f8", trim: "#1d3557" },
  { id: "ember", label: "熔火", unlock: "单人通关第5关", need: { singleLevel: 5 }, body: ["#e63946", "#f77f00"], accent: "#ffd166", trim: "#fff3b0" },
  { id: "royal", label: "冠军", unlock: "PK累计获胜3次", need: { pkWins: 3 }, body: ["#8338ec", "#ff006e"], accent: "#ffbe0b", trim: "#ffffff" }
];

const LEVELS = [
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,2,1],
    [1,0,1,1,1,0,1,1,1,1,1,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,2,1],
    [1,0,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,0,2,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ]
];

const keys = new Set();
let activeMode = MODE.COOP;
let selected = { p1: 0, p2: 1, p1Skin: "base", p2Skin: "base" };
let selectedLevel = 1;
let lastTime = performance.now();
const SAVE_KEY = "jellyMazeProgressV2";
const MAX_LEVEL_SELECT = 12;

CHARACTERS[0].attackStyle = "lightning";
CHARACTERS[1].attackStyle = "laser";
CHARACTERS[2].attackStyle = "spark";
CHARACTERS[3].attackName = "青柠手雷";
CHARACTERS[3].attackStyle = "grenade";
CHARACTERS[3].mood = "机灵、爱绕后，最喜欢把小手雷丢进敌人堆里";

function defaultProgress() {
  return { bestSingleLevel: 0, bestCoopLevel: 0, pkWins: 0, unlockedSkins: ["base"] };
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    const merged = { ...defaultProgress(), ...saved };
    if (!Array.isArray(merged.unlockedSkins)) merged.unlockedSkins = ["base"];
    if (!merged.unlockedSkins.includes("base")) merged.unlockedSkins.unshift("base");
    return merged;
  } catch {
    return defaultProgress();
  }
}

let progress = loadProgress();

function saveProgress() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
  } catch {
    // Some locked-down file origins may deny localStorage; the game still runs without persistent unlocks.
  }
}

function skinRequirementMet(skin) {
  if (!skin.need) return true;
  if (skin.need.singleLevel && progress.bestSingleLevel < skin.need.singleLevel) return false;
  if (skin.need.pkWins && progress.pkWins < skin.need.pkWins) return false;
  return true;
}

function isSkinUnlocked(skinId) {
  const skin = SKINS.find((item) => item.id === skinId) || SKINS[0];
  return progress.unlockedSkins.includes(skin.id) && skinRequirementMet(skin);
}

function applySkin(character, skinId) {
  const skin = SKINS.find((item) => item.id === skinId) || SKINS[0];
  const safeSkin = isSkinUnlocked(skin.id) ? skin : SKINS[0];
  return {
    ...character,
    body: safeSkin.body || character.body,
    accent: safeSkin.accent || character.accent,
    trim: safeSkin.trim || character.trim,
    skinId: safeSkin.id,
    skinLabel: safeSkin.label
  };
}

function modeLabel(mode) {
  if (mode === MODE.SINGLE) return "单人闯关";
  if (mode === MODE.COOP) return "合作模式";
  return "PK 模式";
}

function bestLevelFor(mode) {
  if (mode === MODE.SINGLE) return progress.bestSingleLevel || 0;
  if (mode === MODE.COOP) return progress.bestCoopLevel || 0;
  return Math.max(progress.bestSingleLevel || 0, progress.bestCoopLevel || 0);
}

function unlockedLevelFor(mode) {
  return clamp(bestLevelFor(mode) + 1, 1, MAX_LEVEL_SELECT);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDirection() {
  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];
  return dirs[randInt(0, dirs.length - 1)];
}

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function pointInTile(entity, tile) {
  return entity.x >= tile.x && entity.x < tile.x + 1 && entity.y >= tile.y && entity.y < tile.y + 1;
}

function circleTouch(a, b, radius) {
  return Math.hypot(a.x - b.x, a.y - b.y) <= radius;
}

class MazeMap {
  constructor(matrix) {
    this.grid = matrix.map((row) => row.slice());
    this.rows = this.grid.length;
    this.cols = this.grid[0].length;
    this.door = this.findDoor();
  }

  findDoor() {
    for (let y = 0; y < this.rows; y += 1) {
      for (let x = 0; x < this.cols; x += 1) {
        if (this.grid[y][x] === TILE.DOOR) return { x, y };
      }
    }
    return { x: this.cols - 2, y: this.rows - 2 };
  }

  clearDoorTiles() {
    for (let y = 0; y < this.rows; y += 1) {
      for (let x = 0; x < this.cols; x += 1) {
        if (this.grid[y][x] === TILE.DOOR) this.grid[y][x] = TILE.FLOOR;
      }
    }
  }

  placeRandomDoor(players = []) {
    this.clearDoorTiles();
    const references = players.map((player) => ({ x: player.x, y: player.y }));
    const candidates = this.doorCandidates(references);
    const fallback = candidates.length ? candidates : [{ x: this.cols - 2, y: this.rows - 2 }];

    const tiers = [
      (c) => c.minDistance >= 4.2 && c.fair && (c.edge || c.degree <= 2),
      (c) => c.minDistance >= 4.0 && c.fair,
      (c) => c.minDistance >= 3.4 && (c.fair || c.edge),
      (c) => c.minDistance >= 2.6,
      () => true
    ];

    let options = fallback;
    for (const tier of tiers) {
      const filtered = candidates.filter(tier);
      if (filtered.length) {
        options = filtered;
        break;
      }
    }

    const chosen = options[randInt(0, options.length - 1)];
    this.door = { x: chosen.x, y: chosen.y };
    this.grid[chosen.y][chosen.x] = TILE.DOOR;
  }

  doorCandidates(references) {
    const candidates = [];
    for (let y = 1; y < this.rows - 1; y += 1) {
      for (let x = 1; x < this.cols - 1; x += 1) {
        if (this.grid[y][x] !== TILE.FLOOR) continue;
        const center = { x: x + 0.5, y: y + 0.5 };
        const distances = references.map((p) => Math.hypot(center.x - p.x, center.y - p.y));
        const minDistance = distances.length ? Math.min(...distances) : Infinity;
        const diff = distances.length >= 2 ? Math.abs(distances[0] - distances[1]) : 0;
        const fair = distances.length < 2 || diff <= Math.max(2.6, minDistance * 0.55);
        const edge = x <= 2 || y <= 2 || x >= this.cols - 3 || y >= this.rows - 3;
        candidates.push({
          x,
          y,
          minDistance,
          fair,
          edge,
          degree: this.walkableNeighborCount(x, y)
        });
      }
    }
    return candidates;
  }

  walkableNeighborCount(x, y) {
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];
    return dirs.reduce((count, dir) => {
      const tile = this.tileAt(x + dir.x, y + dir.y);
      return count + (tile === TILE.FLOOR || tile === TILE.DOOR ? 1 : 0);
    }, 0);
  }

  tileAt(x, y) {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return TILE.WALL;
    return this.grid[y][x];
  }

  isWalkable(x, y) {
    const tile = this.tileAt(x, y);
    return tile === TILE.FLOOR || tile === TILE.DOOR;
  }

  isDoorOpenFor(player, game) {
    if (game.mode === MODE.COOP || game.mode === MODE.SINGLE) return game.remainingTotal() === 0;
    return player.remainingFruit === 0;
  }

  collides(rect, player, game) {
    const startX = Math.floor(rect.x);
    const endX = Math.floor(rect.x + rect.w - 0.001);
    const startY = Math.floor(rect.y);
    const endY = Math.floor(rect.y + rect.h - 0.001);

    for (let y = startY; y <= endY; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        const tile = this.tileAt(x, y);
        if (tile === TILE.WALL) return true;
        if (tile === TILE.DOOR && !this.isDoorOpenFor(player, game)) return true;
      }
    }
    return false;
  }

  collidesWallOnly(rect) {
    const startX = Math.floor(rect.x);
    const endX = Math.floor(rect.x + rect.w - 0.001);
    const startY = Math.floor(rect.y);
    const endY = Math.floor(rect.y + rect.h - 0.001);

    for (let y = startY; y <= endY; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        if (this.tileAt(x, y) === TILE.WALL) return true;
      }
    }
    return false;
  }

  randomFloor(exclude = []) {
    const options = [];
    for (let y = 1; y < this.rows - 1; y += 1) {
      for (let x = 1; x < this.cols - 1; x += 1) {
        if (!this.isWalkable(x, y) || this.tileAt(x, y) === TILE.DOOR) continue;
        const blocked = exclude.some((p) => Math.hypot(p.x - (x + 0.5), p.y - (y + 0.5)) < (p.radius || 1.2));
        if (!blocked) options.push({ x: x + 0.5, y: y + 0.5 });
      }
    }
    return options[randInt(0, options.length - 1)] || this.nearestFloor(1.5, 1.5);
  }

  nearestFloor(cx, cy) {
    let best = null;
    let bestDist = Infinity;
    for (let y = 1; y < this.rows - 1; y += 1) {
      for (let x = 1; x < this.cols - 1; x += 1) {
        if (this.tileAt(x, y) !== TILE.FLOOR) continue;
        const dist = Math.hypot(cx - (x + 0.5), cy - (y + 0.5));
        if (dist < bestDist) {
          best = { x: x + 0.5, y: y + 0.5 };
          bestDist = dist;
        }
      }
    }
    return best || { x: 1.5, y: 1.5 };
  }

  randomEdgeFloor() {
    const options = [];
    for (let y = 1; y < this.rows - 1; y += 1) {
      for (let x = 1; x < this.cols - 1; x += 1) {
        if (this.tileAt(x, y) !== TILE.FLOOR) continue;
        if (x <= 2 || y <= 2 || x >= this.cols - 3 || y >= this.rows - 3) {
          options.push({ x: x + 0.5, y: y + 0.5 });
        }
      }
    }
    return options[randInt(0, options.length - 1)] || { x: 1.5, y: 1.5 };
  }
}

class Fruit {
  constructor(owner, x, y) {
    this.owner = owner;
    this.x = x;
    this.y = y;
    this.size = 0.42;
    this.dead = false;
  }

  get rect() {
    return { x: this.x - this.size / 2, y: this.y - this.size / 2, w: this.size, h: this.size };
  }

  touches(player) {
    const distance = Math.hypot(player.x - this.x, player.y - this.y);
    return distance <= player.size * 0.58 + this.size * 0.72;
  }

  draw(game) {
    const { x, y, size } = game.worldCircle(this.x, this.y, this.size / 2);
    const style = game.fruitStyle(this.owner);

    ctx.save();
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = 20;
    const gradient = ctx.createRadialGradient(x - size * 0.18, y - size * 0.18, 2, x, y, size);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.22, style.primary);
    gradient.addColorStop(1, style.secondary);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = style.accent;
    ctx.lineWidth = Math.max(2, size * 0.16);
    ctx.beginPath();
    ctx.arc(x, y, size * 1.18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#9dffb3";
    ctx.fillRect(x + size * 0.1, y - size * 1.2, size * 0.28, size * 0.52);
    ctx.restore();
  }
}

class PowerUp {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.size = 0.46;
    this.dead = false;
    this.style = POWERUPS.find((item) => item.type === type) || POWERUPS[0];
  }

  touches(player) {
    return circleTouch(player, this, player.size * 0.6 + this.size * 0.75);
  }

  draw(game) {
    if (this.dead) return;
    const p = game.worldPoint(this.x, this.y);
    const r = this.size * game.tileSize / 2;
    const pulse = 1 + Math.sin(performance.now() / 180 + this.x) * 0.08;

    ctx.save();
    ctx.shadowColor = this.style.accent;
    ctx.shadowBlur = 18;
    ctx.fillStyle = this.style.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 1.18 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(p.x - r * 0.22, p.y - r * 0.24, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.style.accent;
    ctx.lineWidth = Math.max(2, r * 0.14);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 1.18 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#31415f";
    ctx.font = `900 ${Math.max(10, r * 0.88)}px "Segoe UI", "Microsoft YaHei", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.style.icon, p.x, p.y + r * 0.04);
    ctx.restore();
  }
}

class Player {
  constructor(id, x, y, character, accent) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.spawn = { x, y };
    this.size = 0.62;
    this.speed = 4.05;
    this.dir = { x: id === 1 ? 1 : -1, y: 0 };
    this.character = character;
    this.accent = accent;
    this.dead = false;
    this.downed = false;
    this.rescueTimer = 0;
    this.rescueProgress = 0;
    this.stunTimer = 0;
    this.attackTimer = 0;
    this.attackCooldown = 0;
    this.shieldTimer = 0;
    this.magnetTimer = 0;
    this.speedBoostTimer = 0;
    this.slide = { x: 0, y: 0 };
    this.remainingFruit = 0;
  }

  get rect() {
    return { x: this.x - this.size / 2, y: this.y - this.size / 2, w: this.size, h: this.size };
  }

  get attackRect() {
    if (this.attackTimer <= 0) return null;
    const style = this.character.attackStyle;
    const reach = style === "laser" ? 1.42 : style === "grenade" ? 1.05 : style === "spark" ? 0.95 : 1.05;
    const width = style === "laser" ? 0.42 : style === "grenade" ? 1.2 : style === "spark" ? 1.08 : 0.74;
    const base = this.rect;
    if (this.dir.x > 0) return { x: base.x + base.w, y: this.y - width / 2, w: reach, h: width };
    if (this.dir.x < 0) return { x: base.x - reach, y: this.y - width / 2, w: reach, h: width };
    if (this.dir.y > 0) return { x: this.x - width / 2, y: base.y + base.h, w: width, h: reach };
    return { x: this.x - width / 2, y: base.y - reach, w: width, h: reach };
  }

  update(dt, game) {
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.shieldTimer = Math.max(0, this.shieldTimer - dt);
    this.magnetTimer = Math.max(0, this.magnetTimer - dt);
    this.speedBoostTimer = Math.max(0, this.speedBoostTimer - dt);
    this.stunTimer = Math.max(0, this.stunTimer - dt);
    if (this.downed || this.stunTimer > 0) return;

    const bind = this.id === 1
      ? { up: "KeyW", down: "KeyS", left: "KeyA", right: "KeyD" }
      : { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" };

    let vx = 0;
    let vy = 0;
    if (keys.has(bind.left)) vx -= 1;
    if (keys.has(bind.right)) vx += 1;
    if (keys.has(bind.up)) vy -= 1;
    if (keys.has(bind.down)) vy += 1;

    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      vx /= len;
      vy /= len;
      this.dir = Math.abs(vx) > Math.abs(vy) ? { x: Math.sign(vx), y: 0 } : { x: 0, y: Math.sign(vy) };
    }

    let speed = this.speed;
    if (this.speedBoostTimer > 0) speed *= 1.62;

    const hazard = game.hazardAt(this.x, this.y);
    if (hazard?.type === "mud") speed *= 0.58;
    if (hazard?.type === "boost") speed *= 1.35;
    if (hazard?.type === "ice") {
      this.slide.x = this.slide.x * 0.94 + vx * speed * 0.12;
      this.slide.y = this.slide.y * 0.94 + vy * speed * 0.12;
      this.move(this.slide.x * dt, 0, game);
      this.move(0, this.slide.y * dt, game);
      return;
    }

    this.slide.x *= 0.7;
    this.slide.y *= 0.7;
    this.move(vx * speed * dt, 0, game);
    this.move(0, vy * speed * dt, game);
  }

  move(dx, dy, game) {
    if (dx === 0 && dy === 0) return;
    const next = { x: this.x + dx - this.size / 2, y: this.y + dy - this.size / 2, w: this.size, h: this.size };
    if (!game.map.collides(next, this, game)) {
      this.x += dx;
      this.y += dy;
    }
  }

  attack() {
    if (this.attackCooldown > 0 || this.dead || this.downed || this.stunTimer > 0) return;
    this.attackTimer = 0.22;
    this.attackCooldown = 0.42;
  }

  down() {
    if (this.shieldTimer > 0) {
      this.shieldTimer = 0;
      return false;
    }
    this.downed = true;
    this.rescueTimer = 6;
    this.rescueProgress = 0;
    this.attackTimer = 0;
    return true;
  }

  revive() {
    this.downed = false;
    this.rescueTimer = 0;
    this.rescueProgress = 0;
    this.shieldTimer = 1.4;
  }

  resetToSpawn(stun = 1.8) {
    this.x = this.spawn.x;
    this.y = this.spawn.y;
    this.stunTimer = stun;
    this.shieldTimer = 1.4;
    this.slide = { x: 0, y: 0 };
  }

  draw(game) {
    const pos = game.worldPoint(this.x, this.y);
    const r = this.size * game.tileSize / 2;

    if (this.attackRect) {
      drawAttackSlash(ctx, game, this, pos.x, pos.y, r);
    }

    drawLittlePerson(ctx, this.character, pos.x, pos.y, r, this.dir, this.id, this);
  }
}

class Enemy {
  constructor(x, y, settings, type = ENEMY_TYPES[0]) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = 0.58;
    this.speed = settings.enemySpeed * type.speedFactor;
    this.chaseRange = settings.chaseRange;
    this.loseRange = settings.loseRange;
    this.targetInterval = settings.targetInterval;
    this.respawnDelay = settings.respawnDelay;
    this.dead = false;
    this.respawnTimer = 0;
    this.target = null;
    this.goal = { x, y };
    this.thinkTimer = Math.random() * this.targetInterval;
    this.wander = randomDirection();
    this.wanderTimer = 0.2 + Math.random() * 0.8;
    this.lastCell = null;
    this.stuckTimer = 0;
    this.lastPosition = { x, y };
    this.skillCooldown = 1.4 + Math.random() * 1.6;
    this.laserTimer = 0;
    this.laserDir = { x: 1, y: 0 };
    this.laserPhase = "idle";
    this.airTimer = 0;
    this.airborne = false;
    this.skateBoost = 0;
  }

  get rect() {
    return { x: this.x - this.size / 2, y: this.y - this.size / 2, w: this.size, h: this.size };
  }

  kill() {
    this.dead = true;
    this.respawnTimer = this.respawnDelay;
    this.target = null;
    this.goal = { x: this.x, y: this.y };
    this.laserTimer = 0;
    this.laserPhase = "idle";
    this.airTimer = 0;
    this.airborne = false;
    this.skateBoost = 0;
  }

  update(dt, game) {
    if (this.dead) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        const p = game.map.randomEdgeFloor();
        this.x = p.x;
        this.y = p.y;
        this.goal = { x: p.x, y: p.y };
        this.lastPosition = { x: p.x, y: p.y };
        this.skillCooldown = 1.2 + Math.random() * 1.8;
        this.laserPhase = "idle";
        this.laserTimer = 0;
        this.airborne = false;
        this.airTimer = 0;
        this.dead = false;
      }
      return;
    }
    if (game.freezeTimer > 0) {
      this.laserPhase = "idle";
      this.laserTimer = 0;
      return;
    }

    this.thinkTimer -= dt;
    if (this.thinkTimer <= 0) {
      const maxDistance = this.target ? this.loseRange : this.chaseRange;
      this.target = game.nearestPlayer(this, maxDistance);
      this.thinkTimer = this.targetInterval;
    }

    if (this.target && (this.target.downed || this.target.stunTimer > 0 || Math.hypot(this.target.x - this.x, this.target.y - this.y) > this.loseRange)) {
      this.target = null;
    }

    if (this.updateSpecial(dt, game)) return;

    const moved = this.moveTowardGoal(dt, game);
    const drift = Math.hypot(this.x - this.lastPosition.x, this.y - this.lastPosition.y);
    this.stuckTimer = drift < 0.01 ? this.stuckTimer + dt : 0;
    this.lastPosition = { x: this.x, y: this.y };

    if (!moved || this.reachedGoal() || this.stuckTimer > 0.42) {
      this.pickNextGoal(game, this.stuckTimer > 0.42);
      this.stuckTimer = 0;
    }
  }

  reachedGoal() {
    return Math.hypot(this.goal.x - this.x, this.goal.y - this.y) < 0.08;
  }

  updateSpecial(dt, game) {
    if (this.laserPhase !== "idle") {
      this.laserTimer -= dt;
      if (this.laserTimer <= 0) {
        if (this.laserPhase === "charge") {
          this.laserPhase = "fire";
          this.laserTimer = 0.36;
        } else {
          this.laserPhase = "idle";
          this.laserTimer = 0;
        }
      }
      return this.laserPhase !== "idle";
    }

    if (this.airborne) {
      this.airTimer -= dt;
      if (this.target) this.goal = { x: this.target.x, y: this.target.y };
      if (this.airTimer <= 0) {
        this.airborne = false;
        this.airTimer = 0;
        const land = game.map.nearestFloor(this.x, this.y);
        this.x = land.x;
        this.y = land.y;
        this.goal = { x: land.x, y: land.y };
      }
    }

    this.skateBoost = Math.max(0, this.skateBoost - dt);
    this.skillCooldown -= dt;
    if (this.skillCooldown > 0 || !this.target) return false;

    if (this.type.canLaser) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      this.laserDir = Math.abs(dx) >= Math.abs(dy)
        ? { x: Math.sign(dx) || 1, y: 0 }
        : { x: 0, y: Math.sign(dy) || 1 };
      this.laserPhase = "charge";
      this.laserTimer = 0.78;
      this.skillCooldown = 3.6 + Math.random() * 1.2;
      return true;
    }

    if (this.type.canFly) {
      this.airborne = true;
      this.airTimer = 0.86;
      this.skillCooldown = 3.8 + Math.random() * 1.4;
      this.goal = { x: this.target.x, y: this.target.y };
      return false;
    }

    if (this.type.canSkate) {
      this.skateBoost = 0.92;
      this.skillCooldown = 2.5 + Math.random() * 1.2;
    }

    return false;
  }

  laserRect() {
    if (this.laserPhase !== "fire") return null;
    const width = 0.34;
    if (this.laserDir.x !== 0) return { x: 0, y: this.y - width / 2, w: 999, h: width };
    return { x: this.x - width / 2, y: 0, w: width, h: 999 };
  }

  moveTowardGoal(dt, game) {
    const dx = this.goal.x - this.x;
    const dy = this.goal.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.001) return false;

    let moveFactor = this.target ? this.type.chaseFactor : 0.68;
    if (this.skateBoost > 0) moveFactor *= 1.75;
    if (this.airborne) moveFactor *= 1.9;
    const step = Math.min(dist, this.speed * dt * moveFactor);
    const nx = (dx / dist) * step;
    const ny = (dy / dist) * step;
    const next = { x: this.x + nx - this.size / 2, y: this.y + ny - this.size / 2, w: this.size, h: this.size };
    if (!this.type.canPhase && !this.airborne && game.map.collidesWallOnly(next)) return false;
    this.x += nx;
    this.y += ny;
    return true;
  }

  pickNextGoal(game, forceTurn = false) {
    const cx = Math.floor(this.x);
    const cy = Math.floor(this.y);
    const center = { x: cx + 0.5, y: cy + 0.5 };
    const target = this.target;
    const options = [
      { x: cx + 1, y: cy, dir: { x: 1, y: 0 } },
      { x: cx - 1, y: cy, dir: { x: -1, y: 0 } },
      { x: cx, y: cy + 1, dir: { x: 0, y: 1 } },
      { x: cx, y: cy - 1, dir: { x: 0, y: -1 } }
    ].filter((option) => {
      if (this.type.canPhase) return option.x > 0 && option.y > 0 && option.x < game.map.cols - 1 && option.y < game.map.rows - 1;
      return game.map.isWalkable(option.x, option.y);
    });

    if (options.length === 0) {
      this.goal = center;
      return;
    }

    const previous = this.lastCell;
    const scored = options.map((option) => {
      const gx = option.x + 0.5;
      const gy = option.y + 0.5;
      let score = Math.random() * 0.18;
      if (target) score -= Math.hypot(target.x - gx, target.y - gy) * 1.3;
      else {
        const forward = option.dir.x === this.wander.x && option.dir.y === this.wander.y;
        score += forward ? 1.0 : 0;
        score += Math.random() * 0.7;
      }
      if (!forceTurn && previous && option.x === previous.x && option.y === previous.y && options.length > 1) score -= target ? 1.2 : 1.8;
      return { option, score };
    }).sort((a, b) => b.score - a.score);

    const chosen = scored[0].option;
    this.lastCell = { x: cx, y: cy };
    this.wander = chosen.dir;
    this.goal = { x: chosen.x + 0.5, y: chosen.y + 0.5 };
  }

  draw(game) {
    if (this.dead) return;
    const pos = game.worldPoint(this.x, this.y);
    const r = this.size * game.tileSize / 2;
    const type = this.type;
    if (this.laserPhase !== "idle") drawEnemyLaser(ctx, game, this);

    ctx.save();
    if (type.canPhase) ctx.globalAlpha = 0.7 + Math.sin(performance.now() / 160 + this.x) * 0.12;
    if (this.airborne) {
      ctx.fillStyle = "rgba(56, 41, 74, 0.22)";
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y + r * 1.08, r * 1.08, r * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.translate(0, -r * (0.72 + Math.sin(performance.now() / 110) * 0.08));
    }
    ctx.shadowColor = this.target ? hexToRgba(type.glow, 0.6) : "rgba(122,99,77,0.28)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "rgba(85,58,35,0.24)";
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + r * 0.82, r * 0.95, r * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();

    const gradient = ctx.createRadialGradient(pos.x, pos.y - r * 0.35, 2, pos.x, pos.y, r * 1.2);
    gradient.addColorStop(0, "#fff8df");
    gradient.addColorStop(0.25, this.target ? type.glow : type.color);
    gradient.addColorStop(1, type.dark);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y - r);
    ctx.quadraticCurveTo(pos.x + r, pos.y - r, pos.x + r, pos.y);
    ctx.lineTo(pos.x + r * 0.72, pos.y + r);
    ctx.lineTo(pos.x + r * 0.25, pos.y + r * 0.68);
    ctx.lineTo(pos.x, pos.y + r);
    ctx.lineTo(pos.x - r * 0.25, pos.y + r * 0.68);
    ctx.lineTo(pos.x - r * 0.72, pos.y + r);
    ctx.lineTo(pos.x - r, pos.y);
    ctx.quadraticCurveTo(pos.x - r, pos.y - r, pos.x, pos.y - r);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#382316";
    ctx.fillRect(pos.x - r * 0.42, pos.y - r * 0.22, r * 0.28, r * 0.18);
    ctx.fillRect(pos.x + r * 0.14, pos.y - r * 0.22, r * 0.28, r * 0.18);
    if (type.canSkate) {
      ctx.fillStyle = "#263238";
      ctx.beginPath();
      ctx.roundRect(pos.x - r * 0.82, pos.y + r * 0.86, r * 1.64, r * 0.18, r * 0.09);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(pos.x - r * 0.52, pos.y + r * 1.02, r * 0.13, 0, Math.PI * 2);
      ctx.arc(pos.x + r * 0.52, pos.y + r * 1.02, r * 0.13, 0, Math.PI * 2);
      ctx.fill();
      if (this.skateBoost > 0) {
        ctx.strokeStyle = type.glow;
        ctx.lineWidth = Math.max(2, r * 0.08);
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.moveTo(pos.x - r * (1.2 + i * 0.22), pos.y + r * (0.15 + i * 0.24));
          ctx.lineTo(pos.x - r * (1.75 + i * 0.28), pos.y + r * (0.15 + i * 0.24));
          ctx.stroke();
        }
      }
    }
    if (type.canLaser) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(2, r * 0.12);
      ctx.beginPath();
      ctx.moveTo(pos.x - r * 0.55, pos.y - r * 0.62);
      ctx.lineTo(pos.x + r * 0.55, pos.y - r * 0.62);
      ctx.lineTo(pos.x, pos.y - r * 1.04);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = type.glow;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - r * 0.62, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
    if (type.canFly) {
      ctx.fillStyle = hexToRgba(type.glow, 0.72);
      ctx.beginPath();
      ctx.ellipse(pos.x - r * 0.72, pos.y - r * 0.15, r * 0.44, r * 0.18, -0.55, 0, Math.PI * 2);
      ctx.ellipse(pos.x + r * 0.72, pos.y - r * 0.15, r * 0.44, r * 0.18, 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
    if (type.canPhase) {
      ctx.strokeStyle = hexToRgba(type.glow, 0.82);
      ctx.lineWidth = Math.max(2, r * 0.08);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r * 1.1, 0.2, Math.PI * 1.82);
      ctx.stroke();
    }
    if (this.target) {
      ctx.fillStyle = "#fff3a8";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - r * 1.25, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawEnemyLaser(renderCtx, game, enemy) {
  const p = game.worldPoint(enemy.x, enemy.y);
  const charge = enemy.laserPhase === "charge";
  const alpha = charge ? 0.42 + Math.sin(performance.now() / 80) * 0.18 : 0.88;
  const width = game.tileSize * (charge ? 0.12 : 0.34);
  const color = charge ? enemy.type.glow : "#ff2fb3";

  renderCtx.save();
  renderCtx.globalAlpha = alpha;
  renderCtx.shadowColor = color;
  renderCtx.shadowBlur = game.tileSize * (charge ? 0.35 : 0.9);
  renderCtx.strokeStyle = charge ? hexToRgba(color, 0.76) : "#ffffff";
  renderCtx.lineWidth = Math.max(2, width);
  renderCtx.lineCap = "round";
  renderCtx.beginPath();
  if (enemy.laserDir.x !== 0) {
    renderCtx.moveTo(game.offset.x + 4, p.y);
    renderCtx.lineTo(game.offset.x + game.map.cols * game.tileSize - 4, p.y);
  } else {
    renderCtx.moveTo(p.x, game.offset.y + 4);
    renderCtx.lineTo(p.x, game.offset.y + game.map.rows * game.tileSize - 4);
  }
  renderCtx.stroke();
  if (!charge) {
    renderCtx.strokeStyle = color;
    renderCtx.lineWidth = Math.max(3, width * 0.55);
    renderCtx.stroke();
  }
  renderCtx.restore();
}

class Game {
  constructor() {
    this.mode = MODE.COOP;
    this.level = 1;
    this.state = "menu";
    this.map = new MazeMap(LEVELS[0]);
    this.settings = this.difficultySettings();
    this.players = [];
    this.fruits = [];
    this.enemies = [];
    this.pickups = [];
    this.powerups = [];
    this.hazards = [];
    this.freezeTimer = 0;
    this.stats = { fruits: 0, enemiesDefeated: 0, rescues: 0, powerups: 0, startTimer: 90, winner: null, stars: 0 };
    this.timeLeft = 90;
    this.tileSize = 42;
    this.offset = { x: 0, y: 0 };
    this.result = null;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  start(mode, level = 1) {
    this.mode = mode;
    this.level = level;
    this.result = null;
    this.map = new MazeMap(LEVELS[(level - 1) % LEVELS.length]);
    this.settings = this.difficultySettings();
    this.resize();
    this.timeLeft = this.settings.timer;

    const p1Char = applySkin(CHARACTERS[selected.p1], selected.p1Skin);
    const p2Char = applySkin(CHARACTERS[selected.p2], selected.p2Skin);
    const p1Spawn = this.map.nearestFloor(1.5, 1.5);
    const p2Spawn = this.map.nearestFloor(this.map.cols - 2.5, this.map.rows - 2.5);
    this.players = this.mode === MODE.SINGLE
      ? [new Player(1, p1Spawn.x, p1Spawn.y, p1Char, "#ff4d6d")]
      : [
        new Player(1, p1Spawn.x, p1Spawn.y, p1Char, "#ff4d6d"),
        new Player(2, p2Spawn.x, p2Spawn.y, p2Char, "#4cc9f0")
      ];
    this.map.placeRandomDoor(this.players);

    this.fruits = [];
    this.enemies = [];
    this.pickups = [];
    this.powerups = [];
    this.hazards = [];
    this.freezeTimer = 0;
    this.stats = {
      fruits: 0,
      enemiesDefeated: 0,
      rescues: 0,
      powerups: 0,
      startTimer: this.timeLeft,
      winner: null,
      stars: 0
    };
    this.spawnHazards();
    this.spawnFruits();
    this.spawnPowerups();
    this.spawnEnemies();
    this.state = "playing";
    setScreen(null);
    hideResult();
    hidePause(false);
    this.updateHud();
  }

  spawnFruits() {
    const count = this.settings.fruitsPerPlayer;
    const occupied = [
      { x: this.players[0].x, y: this.players[0].y, radius: 2.8 },
      { x: this.map.door.x + 0.5, y: this.map.door.y + 0.5, radius: 2.2 }
    ];
    if (this.players[1]) occupied.push({ x: this.players[1].x, y: this.players[1].y, radius: 2.8 });

    const owners = this.mode === MODE.SINGLE ? [1] : [1, 2];
    for (const owner of owners) {
      for (let i = 0; i < count; i += 1) {
        const p = this.map.randomFloor(occupied);
        this.fruits.push(new Fruit(owner, p.x, p.y));
        occupied.push({ x: p.x, y: p.y, radius: 1.0 });
      }
    }
    this.syncRemainingFruit();
  }

  spawnEnemies() {
    const enemyCount = this.settings.enemyCount;
    const occupied = this.players.map((p) => ({ x: p.x, y: p.y, radius: 4 }));

    for (let i = 0; i < enemyCount; i += 1) {
      const p = this.map.randomFloor(occupied);
      this.enemies.push(new Enemy(p.x, p.y, this.settings, this.enemyTypeFor(i)));
      occupied.push({ x: p.x, y: p.y, radius: 2 });
    }
  }

  enemyTypeFor(index) {
    const unlocked = ENEMY_TYPES.filter((type) => this.level >= type.level);
    if (index === 0 || this.level <= 1) return ENEMY_TYPES[0];
    if (this.level >= 2 && index === 1) return ENEMY_TYPES[1];
    if (this.level >= 3 && index === 2) return ENEMY_TYPES[2];
    if (this.level >= 4 && index === 3) return ENEMY_TYPES[3];
    if (this.level >= 5 && index === 4) return ENEMY_TYPES[4];
    const specialBias = this.mode === MODE.SINGLE ? 0.72 : 0.62;
    if (Math.random() < specialBias) return unlocked[randInt(0, unlocked.length - 1)];
    return ENEMY_TYPES[0];
  }

  spawnPowerups() {
    const count = clamp(1 + Math.floor(this.level / 2), 1, 4);
    const occupied = [
      ...this.players.map((p) => ({ x: p.x, y: p.y, radius: 2.4 })),
      ...this.fruits.map((f) => ({ x: f.x, y: f.y, radius: 1.0 }))
    ];

    for (let i = 0; i < count; i += 1) {
      const p = this.map.randomFloor(occupied);
      const type = POWERUPS[i % POWERUPS.length].type;
      this.powerups.push(new PowerUp(type, p.x, p.y));
      occupied.push({ x: p.x, y: p.y, radius: 1.4 });
    }
  }

  spawnHazards() {
    const themeIndex = (this.level - 1) % 3;
    const types = ["boost", "ice", "mud"];
    const count = clamp(2 + Math.floor(this.level / 2), 2, 6);
    const occupied = [
      { x: this.map.door.x + 0.5, y: this.map.door.y + 0.5, radius: 2.2 }
    ];

    for (let i = 0; i < count; i += 1) {
      const p = this.map.randomFloor(occupied);
      this.hazards.push({ type: types[themeIndex], x: p.x, y: p.y, size: 0.82 });
      occupied.push({ x: p.x, y: p.y, radius: 1.6 });
    }
  }

  difficultySettings() {
    const tier = this.level - 1;
    const versusBoost = this.mode === MODE.VERSUS ? 0.12 : 0;
    const singleBoost = this.mode === MODE.SINGLE ? 0.18 : 0;
    return {
      fruitsPerPlayer: this.mode === MODE.SINGLE ? clamp(5 + Math.floor(tier * 0.85), 5, 12) : clamp(3 + Math.floor(tier * 0.75), 3, 8),
      enemyCount: this.mode === MODE.SINGLE ? clamp(2 + Math.floor(tier / 2) + (tier >= 3 ? 1 : 0), 2, 7) : clamp(2 + Math.floor(tier / 2) + (tier >= 3 ? 1 : 0), 2, 6),
      enemySpeed: clamp(1.12 + tier * 0.17 + versusBoost + singleBoost, 1.12, 2.55),
      chaseRange: clamp(4.55 + tier * 0.42 + (this.mode === MODE.SINGLE ? 0.25 : 0), 4.55, 7.8),
      loseRange: clamp(6.4 + tier * 0.46 + (this.mode === MODE.SINGLE ? 0.35 : 0), 6.4, 9.6),
      targetInterval: clamp(0.55 - tier * 0.04, 0.28, 0.55),
      respawnDelay: clamp(5.5 - tier * 0.25, 3.4, 5.5),
      timer: this.mode === MODE.SINGLE ? clamp(92 - tier * 5, 48, 92) : clamp(125 - tier * 8, 62, 125)
    };
  }

  levelTheme() {
    const themes = [
      {
        skyTop: "#b9f0ff",
        skyMid: "#e7fbff",
        skyBottom: "#a9e88f",
        board: "#8fd36b",
        boardDark: "#5fa449",
        floor: "#f7d89a",
        floorAlt: "#f3c97d",
        wall: "#7fc66a",
        wallSide: "#4f9647",
        wallTop: "#b8ec87",
        line: "rgba(109, 122, 74, 0.2)",
        door: "#9a6a3b",
        doorLight: "#f0bc68"
      },
      {
        skyTop: "#c7f3ff",
        skyMid: "#f4fdff",
        skyBottom: "#b7e6ff",
        board: "#9bd6ef",
        boardDark: "#4d9fc4",
        floor: "#e8f8ff",
        floorAlt: "#caecfb",
        wall: "#9bd4ec",
        wallSide: "#579bc0",
        wallTop: "#e4faff",
        line: "rgba(73, 122, 154, 0.2)",
        door: "#5f7e9b",
        doorLight: "#d9f4ff"
      },
      {
        skyTop: "#ffd89b",
        skyMid: "#fff3d3",
        skyBottom: "#e7b070",
        board: "#d99b5c",
        boardDark: "#9b6238",
        floor: "#f4c07a",
        floorAlt: "#e8a95e",
        wall: "#b87842",
        wallSide: "#7e4b2c",
        wallTop: "#e2a066",
        line: "rgba(92, 55, 27, 0.22)",
        door: "#7a4630",
        doorLight: "#ffd180"
      }
    ];
    return themes[(this.level - 1) % themes.length];
  }

  resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(320, Math.floor(rect.width * dpr));
    canvas.height = Math.max(240, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.viewW = rect.width;
    this.viewH = rect.height;
    this.tileSize = Math.max(22, Math.min((rect.width - 38) / this.map.cols, (rect.height - 38) / this.map.rows));
    this.offset = {
      x: (rect.width - this.map.cols * this.tileSize) / 2,
      y: (rect.height - this.map.rows * this.tileSize) / 2
    };
  }

  update(dt) {
    if (this.state !== "playing") return;
    this.freezeTimer = Math.max(0, this.freezeTimer - dt);
    if (this.mode !== MODE.VERSUS) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.fail(this.mode === MODE.SINGLE ? "倒计时结束，没能及时逃出大门。" : "倒计时结束，出口还没有完成双人撤离。");
        return;
      }
    }

    for (const player of this.players) player.update(dt, this);
    for (const enemy of this.enemies) enemy.update(dt, this);
    this.pickups = this.pickups
      .map((effect) => ({ ...effect, life: effect.life - dt }))
      .filter((effect) => effect.life > 0);
    this.handleCollisions();
    this.handleRescue(dt);
    this.updateHud();
  }

  handleCollisions() {
    for (const fruit of this.fruits) {
      if (fruit.dead) continue;
      const player = this.players[fruit.owner - 1];
      const magnet = player.magnetTimer > 0 && circleTouch(player, fruit, 2.25);
      if (!player.downed && !player.stunTimer && (fruit.touches(player) || magnet)) {
        fruit.dead = true;
        this.stats.fruits += 1;
        this.pickups.push({
          x: fruit.x,
          y: fruit.y,
          color: this.fruitStyle(fruit.owner).primary,
          accent: this.fruitStyle(fruit.owner).accent,
          life: 0.42,
          maxLife: 0.42
        });
        this.syncRemainingFruit();
      }
    }

    for (const powerup of this.powerups) {
      if (powerup.dead) continue;
      for (const player of this.players) {
        if (!player.downed && player.stunTimer <= 0 && powerup.touches(player)) {
          powerup.dead = true;
          this.applyPowerUp(player, powerup.type);
          this.stats.powerups += 1;
          this.pickups.push({
            x: powerup.x,
            y: powerup.y,
            color: powerup.style.color,
            accent: powerup.style.accent,
            text: powerup.style.label,
            life: 0.65,
            maxLife: 0.65
          });
          break;
        }
      }
    }

    for (const player of this.players) {
      const attack = player.attackRect;
      if (!attack) continue;
      for (const enemy of this.enemies) {
        if (!enemy.dead && aabb(attack, enemy.rect)) {
          this.pickups.push({
            x: enemy.x,
            y: enemy.y,
            color: player.id === 1 ? "#ff7a3d" : "#2f9ee8",
            accent: player.id === 1 ? "#ffd43b" : "#74d8ff",
            text: "砰!",
            life: 0.72,
            maxLife: 0.72,
            burst: true
          });
          enemy.kill();
          this.stats.enemiesDefeated += 1;
        }
      }
    }

    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      const laser = enemy.laserRect();
      for (const player of this.players) {
        if (laser && !player.downed && player.stunTimer <= 0 && aabb(laser, player.rect)) {
          if (this.enemyHitsPlayer(player, enemy, "laser") === "fail") return;
          continue;
        }
        if (!enemy.airborne && !player.downed && player.stunTimer <= 0 && aabb(enemy.rect, player.rect)) {
          if (this.enemyHitsPlayer(player, enemy, "touch") === "fail") return;
        }
      }
    }

    this.checkWin();
  }

  enemyHitsPlayer(player, enemy, kind) {
    if (player.shieldTimer > 0) {
      player.shieldTimer = 0;
      this.pickups.push({
        x: player.x,
        y: player.y,
        color: "#ffd166",
        accent: "#f08c00",
        text: kind === "laser" ? "挡光" : "挡",
        life: 0.65,
        maxLife: 0.65,
        burst: true
      });
      if (kind !== "laser") enemy.kill();
      return "blocked";
    }
    if (this.mode === MODE.SINGLE) {
      this.fail(kind === "laser" ? "被棱镜激光击中了，闯关失败。" : "被敌人抓住了，闯关失败。");
      return "fail";
    }
    if (this.mode === MODE.COOP) {
      player.down();
      enemy.target = null;
      if (this.players.every((p) => p.downed)) {
        this.fail("两名玩家都倒地了，挑战失败。");
        return "fail";
      }
    } else {
      player.resetToSpawn(2.0);
    }
    return "hit";
  }

  oldEnemyHitBlockDisabled() {
    if (false) {
      const player = this.players[0];
      const enemy = this.enemies[0];
          if (player.shieldTimer > 0) {
            player.shieldTimer = 0;
            this.pickups.push({
              x: enemy.x,
              y: enemy.y,
              color: "#ffd166",
              accent: "#f08c00",
              text: "挡!",
              life: 0.65,
              maxLife: 0.65,
              burst: true
            });
            enemy.kill();
            return;
          }
          if (this.mode === MODE.SINGLE) {
            this.fail("被敌人抓住了，闯关失败。");
            return;
          }
          if (this.mode === MODE.COOP) {
            player.down();
            enemy.target = null;
            if (this.players.every((p) => p.downed)) {
              this.fail("两名玩家都倒地了，挑战失败。");
              return;
            }
          } else {
            player.resetToSpawn(2.0);
          }
        }
  }

  checkWin() {
    const door = this.map.door;
    if (this.mode === MODE.SINGLE) {
      const player = this.players[0];
      if (this.remainingTotal() > 0) return;
      if (!player.downed && player.stunTimer <= 0 && pointInTile(player, door)) {
        this.stats.winner = 1;
        this.win("闯关成功", `${player.character.label}完成了单人逃亡。`);
      }
      return;
    }

    if (this.mode === MODE.COOP) {
      if (this.remainingTotal() > 0) return;
      if (this.players.every((p) => !p.downed && p.stunTimer <= 0 && pointInTile(p, door))) {
        this.win("合作成功", "两名玩家都抵达了出口。");
      }
      return;
    }

    for (const player of this.players) {
      if (!player.downed && player.stunTimer <= 0 && player.remainingFruit === 0 && pointInTile(player, door)) {
        this.stats.winner = player.id;
        this.win(`玩家 ${player.id} 获胜`, `玩家 ${player.id} 率先吃完水果并冲进出口。`);
        return;
      }
    }
  }

  win(title, text) {
    this.state = "result";
    this.result = "win";
    this.stats.stars = this.calculateStars();
    const unlockText = this.applyUnlocks();
    showResult(title, `${text}\n${this.resultSummary()}${unlockText ? `\n${unlockText}` : ""}`, true);
    buildCharacterChoices();
  }

  applyUnlocks() {
    const unlockedBefore = new Set(progress.unlockedSkins);
    if (this.mode === MODE.SINGLE) {
      progress.bestSingleLevel = Math.max(progress.bestSingleLevel, this.level);
    }
    if (this.mode === MODE.COOP) {
      progress.bestCoopLevel = Math.max(progress.bestCoopLevel || 0, this.level);
    }
    if (this.mode === MODE.VERSUS && this.stats.winner) {
      progress.pkWins += 1;
    }

    const newlyUnlocked = [];
    for (const skin of SKINS) {
      if (!unlockedBefore.has(skin.id) && skinRequirementMet(skin)) {
        progress.unlockedSkins.push(skin.id);
        newlyUnlocked.push(skin.label);
      }
    }
    saveProgress();
    return newlyUnlocked.length ? `新解锁皮肤：${newlyUnlocked.join("、")}` : "";
  }

  fail(text) {
    this.state = "result";
    this.result = "fail";
    showResult("挑战失败", text, false);
  }

  applyPowerUp(player, type) {
    if (type === "freeze") this.freezeTimer = 3.5;
    if (type === "shield") player.shieldTimer = 7;
    if (type === "magnet") player.magnetTimer = 7;
    if (type === "speed") player.speedBoostTimer = 7;
  }

  handleRescue(dt) {
    if (this.mode !== MODE.COOP) return;
    const [p1, p2] = this.players;
    for (const [downed, helper] of [[p1, p2], [p2, p1]]) {
      if (!downed?.downed) continue;
      downed.rescueTimer -= dt;
      if (circleTouch(downed, helper, 1.15) && !helper.downed && helper.stunTimer <= 0) {
        downed.rescueProgress += dt;
      } else {
        downed.rescueProgress = Math.max(0, downed.rescueProgress - dt * 0.55);
      }
      if (downed.rescueProgress >= 1.35) {
        downed.revive();
        this.stats.rescues += 1;
        this.pickups.push({
          x: downed.x,
          y: downed.y,
          color: "#8ce99a",
          accent: "#2f9e44",
          text: "救援",
          life: 0.8,
          maxLife: 0.8
        });
      }
      if (downed.downed && downed.rescueTimer <= 0) {
        this.fail(`玩家 ${downed.id} 没能及时被救援。`);
      }
    }
  }

  calculateStars() {
    let stars = 1;
    const timeRatio = this.mode === MODE.COOP ? this.timeLeft / this.settings.timer : 0.45;
    if (timeRatio >= 0.35 || this.stats.enemiesDefeated >= this.settings.enemyCount) stars += 1;
    if (timeRatio >= 0.55 || (this.stats.powerups >= 2 && this.stats.rescues === 0)) stars += 1;
    return clamp(stars, 1, 3);
  }

  resultSummary() {
    const cleanStars = "★".repeat(this.stats.stars) + "☆".repeat(3 - this.stats.stars);
    const cleanTime = this.mode === MODE.VERSUS ? `胜者 P${this.stats.winner}` : `剩余时间 ${formatTime(this.timeLeft)}`;
    return `星级 ${cleanStars} · ${cleanTime} · 水果 ${this.stats.fruits} · 击退 ${this.stats.enemiesDefeated} · 救援 ${this.stats.rescues} · 道具 ${this.stats.powerups}`;
    const stars = "★".repeat(this.stats.stars) + "☆".repeat(3 - this.stats.stars);
    const time = this.mode === MODE.COOP ? `剩余时间 ${formatTime(this.timeLeft)}` : `胜者 P${this.stats.winner}`;
    return `星级 ${stars}｜${time}｜水果 ${this.stats.fruits}｜击退 ${this.stats.enemiesDefeated}｜救援 ${this.stats.rescues}｜道具 ${this.stats.powerups}`;
  }

  remainingTotal() {
    return this.fruits.filter((f) => !f.dead).length;
  }

  syncRemainingFruit() {
    for (const player of this.players) {
      player.remainingFruit = this.fruits.filter((f) => !f.dead && f.owner === player.id).length;
    }
  }

  fruitStyle(owner) {
    const character = this.players[owner - 1]?.character || CHARACTERS[owner - 1] || CHARACTERS[0];
    return {
      primary: character.body[0],
      secondary: character.body[1],
      accent: character.accent,
      glow: hexToRgba(character.accent, 0.72)
    };
  }

  nearestPlayer(enemy, maxDistance = Infinity) {
    let best = null;
    let bestDist = Infinity;
    for (const player of this.players) {
      if (player.dead || player.downed || player.stunTimer > 0) continue;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (dist <= maxDistance && dist < bestDist) {
        best = player;
        bestDist = dist;
      }
    }
    return best;
  }

  updateHud() {
    ui.level.textContent = String(this.level);
    ui.timer.textContent = this.mode === MODE.VERSUS ? "PK" : formatTime(this.timeLeft);
    ui.p1Label.textContent = this.mode === MODE.SINGLE ? "水果" : "P1 果实";
    ui.p2Label.textContent = this.mode === MODE.SINGLE ? "招式" : "P2 果实";
    ui.p1.textContent = String(this.players[0]?.remainingFruit ?? 0);
    ui.p2.textContent = this.mode === MODE.SINGLE ? this.players[0]?.character.attackName ?? "--" : String(this.players[1]?.remainingFruit ?? 0);
  }

  hazardAt(x, y) {
    return this.hazards.find((hazard) => Math.hypot(hazard.x - x, hazard.y - y) < hazard.size * 0.7);
  }

  draw() {
    ctx.clearRect(0, 0, this.viewW, this.viewH);
    this.drawBackdrop();
    this.drawMap();
    this.drawHazards();
    for (const fruit of this.fruits) if (!fruit.dead) fruit.draw(this);
    for (const powerup of this.powerups) if (!powerup.dead) powerup.draw(this);
    this.drawPickupEffects();
    for (const enemy of this.enemies) enemy.draw(this);
    for (const player of this.players) player.draw(this);
    this.drawStatusOverlays();
  }

  drawPickupEffects() {
    for (const effect of this.pickups) {
      const p = this.worldPoint(effect.x, effect.y);
      const t = 1 - effect.life / effect.maxLife;
      const radius = this.tileSize * (0.25 + t * 0.58);
      ctx.save();
      ctx.globalAlpha = 1 - t;
      ctx.strokeStyle = effect.accent;
      ctx.fillStyle = effect.color;
      ctx.shadowColor = effect.accent;
      ctx.shadowBlur = 20;
      ctx.lineWidth = Math.max(2, this.tileSize * 0.06);
      if (effect.burst) {
        ctx.lineWidth = Math.max(3, this.tileSize * 0.07);
        ctx.beginPath();
        for (let i = 0; i < 12; i += 1) {
          const angle = (Math.PI * 2 * i) / 12;
          const inner = radius * 0.35;
          const outer = radius * (0.95 + (i % 2) * 0.35);
          ctx.moveTo(p.x + Math.cos(angle) * inner, p.y + Math.sin(angle) * inner);
          ctx.lineTo(p.x + Math.cos(angle) * outer, p.y + Math.sin(angle) * outer);
        }
        ctx.stroke();
        ctx.fillStyle = effect.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 0.32, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.font = `800 ${Math.max(12, this.tileSize * 0.34)}px Segoe UI`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(effect.text || "+1", p.x, p.y - t * this.tileSize * 0.6);
      ctx.restore();
    }
  }

  drawHazards() {
    for (const hazard of this.hazards) {
      const p = this.worldPoint(hazard.x, hazard.y);
      const r = this.tileSize * hazard.size * 0.5;
      ctx.save();
      if (hazard.type === "boost") {
        ctx.fillStyle = "#8ce99a";
        ctx.strokeStyle = "#2f9e44";
      } else if (hazard.type === "ice") {
        ctx.fillStyle = "#d8f7ff";
        ctx.strokeStyle = "#4dabf7";
      } else {
        ctx.fillStyle = "#c9905a";
        ctx.strokeStyle = "#7a4a25";
      }
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(p.x - r, p.y - r * 0.55, r * 2, r * 1.1, 8);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = `900 ${Math.max(12, this.tileSize * 0.35)}px "Segoe UI", "Microsoft YaHei", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = hazard.type === "boost" ? "加" : hazard.type === "ice" ? "滑" : "慢";
      ctx.fillText(label, p.x, p.y);
      ctx.restore();
    }
  }

  drawStatusOverlays() {
    if (this.freezeTimer > 0) {
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.78)";
      ctx.strokeStyle = "#4dabf7";
      ctx.lineWidth = 2;
      ctx.font = `900 ${Math.max(16, this.tileSize * 0.38)}px "Segoe UI", "Microsoft YaHei", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.strokeText(`敌人冰冻 ${this.freezeTimer.toFixed(1)}s`, this.viewW / 2, 14);
      ctx.fillText(`敌人冰冻 ${this.freezeTimer.toFixed(1)}s`, this.viewW / 2, 14);
      ctx.restore();
    }

    for (const player of this.players) {
      const p = this.worldPoint(player.x, player.y);
      const r = this.tileSize * 0.42;
      ctx.save();
      if (player.downed) {
        const progress = clamp(player.rescueProgress / 1.35, 0, 1);
        ctx.fillStyle = "rgba(255,255,255,0.88)";
        ctx.strokeStyle = "#ff6b6b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(p.x - r, p.y - r * 1.8, r * 2, r * 0.32, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#8ce99a";
        ctx.beginPath();
        ctx.roundRect(p.x - r + 3, p.y - r * 1.8 + 3, (r * 2 - 6) * progress, r * 0.32 - 6, 4);
        ctx.fill();
        ctx.fillStyle = "#ff6b6b";
        ctx.font = `900 ${Math.max(10, this.tileSize * 0.24)}px "Segoe UI", "Microsoft YaHei", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`救援 ${Math.ceil(player.rescueTimer)}s`, p.x, p.y - r * 1.92);
      }

      const buffs = [];
      if (player.shieldTimer > 0) buffs.push(["盾", "#ffd166"]);
      if (player.magnetTimer > 0) buffs.push(["吸", "#ff8cc6"]);
      if (player.speedBoostTimer > 0) buffs.push(["快", "#8ce99a"]);
      if (player.stunTimer > 0) buffs.push(["晕", "#ff8787"]);
      buffs.forEach((buff, index) => {
        ctx.fillStyle = buff[1];
        ctx.beginPath();
        ctx.arc(p.x - r * 0.55 + index * r * 0.48, p.y + r * 1.36, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = `900 ${Math.max(8, this.tileSize * 0.18)}px "Segoe UI", "Microsoft YaHei", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(buff[0], p.x - r * 0.55 + index * r * 0.48, p.y + r * 1.36);
      });
      ctx.restore();
    }
  }

  drawBackdrop() {
    const theme = this.levelTheme();
    const g = ctx.createLinearGradient(0, 0, this.viewW, this.viewH);
    g.addColorStop(0, theme.skyTop);
    g.addColorStop(0.45, theme.skyMid);
    g.addColorStop(1, theme.skyBottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.viewW, this.viewH);

    ctx.save();
    ctx.globalAlpha = 0.36;
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    for (let i = 0; i < 5; i += 1) {
      const x = ((i * 223 + this.level * 37) % Math.max(1, this.viewW)) - 80;
      const y = 38 + (i % 3) * 58;
      ctx.beginPath();
      ctx.ellipse(x, y, 52, 17, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 38, y + 4, 44, 14, 0, 0, Math.PI * 2);
      ctx.ellipse(x - 38, y + 6, 34, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawMap() {
    ctx.save();
    const theme = this.levelTheme();
    const boardX = this.offset.x;
    const boardY = this.offset.y;
    const boardW = this.map.cols * this.tileSize;
    const boardH = this.map.rows * this.tileSize;

    ctx.shadowColor = "rgba(74, 54, 31, 0.26)";
    ctx.shadowBlur = 24;
    ctx.fillStyle = theme.boardDark;
    ctx.beginPath();
    ctx.roundRect(boardX - 12, boardY - 8, boardW + 24, boardH + 28, 14);
    ctx.fill();
    ctx.shadowBlur = 0;

    const frame = ctx.createLinearGradient(boardX, boardY, boardX + boardW, boardY + boardH);
    frame.addColorStop(0, theme.board);
    frame.addColorStop(1, theme.boardDark);
    ctx.fillStyle = frame;
    ctx.beginPath();
    ctx.roundRect(boardX - 8, boardY - 8, boardW + 16, boardH + 16, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.48)";
    ctx.lineWidth = 1;
    ctx.strokeRect(boardX - 3, boardY - 3, boardW + 6, boardH + 6);

    for (let y = 0; y < this.map.rows; y += 1) {
      for (let x = 0; x < this.map.cols; x += 1) {
        const px = this.offset.x + x * this.tileSize;
        const py = this.offset.y + y * this.tileSize;
        const tile = this.map.tileAt(x, y);

        if (tile === TILE.WALL) {
          ctx.shadowColor = "rgba(70, 50, 24, 0.28)";
          ctx.shadowBlur = 8;
          ctx.fillStyle = theme.wallSide;
          ctx.beginPath();
          ctx.roundRect(px + 3, py + this.tileSize * 0.18, this.tileSize - 6, this.tileSize * 0.75, 7);
          ctx.fill();
          ctx.shadowBlur = 0;
          const grad = ctx.createLinearGradient(px, py, px, py + this.tileSize);
          grad.addColorStop(0, theme.wallTop);
          grad.addColorStop(1, theme.wall);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(px + 2, py + 1, this.tileSize - 4, this.tileSize * 0.72, 8);
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.32)";
          ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,0.18)";
          ctx.beginPath();
          ctx.ellipse(px + this.tileSize * 0.35, py + this.tileSize * 0.2, this.tileSize * 0.18, this.tileSize * 0.06, -0.3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const floor = ctx.createLinearGradient(px, py, px, py + this.tileSize);
          floor.addColorStop(0, theme.floor);
          floor.addColorStop(1, theme.floorAlt);
          ctx.fillStyle = floor;
          ctx.beginPath();
          ctx.roundRect(px + 1, py + 1, this.tileSize - 2, this.tileSize - 2, 4);
          ctx.fill();
          ctx.strokeStyle = theme.line;
          ctx.stroke();

          if (((x * 17 + y * 11 + this.level) % 23) === 0) {
            ctx.fillStyle = "rgba(255,255,255,0.54)";
            ctx.beginPath();
            ctx.arc(px + this.tileSize * 0.74, py + this.tileSize * 0.3, this.tileSize * 0.07, 0, Math.PI * 2);
            ctx.arc(px + this.tileSize * 0.66, py + this.tileSize * 0.38, this.tileSize * 0.06, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (tile === TILE.DOOR) this.drawDoor(px, py);
      }
    }
    ctx.restore();
  }

  drawDoor(px, py) {
    const coopOpen = this.mode === MODE.COOP && this.remainingTotal() === 0;
    const p1Open = this.players[0]?.remainingFruit === 0;
    const p2Open = this.players[1]?.remainingFruit === 0;
    const open = this.mode === MODE.COOP ? coopOpen : (p1Open || p2Open);

    const theme = this.levelTheme();
    ctx.save();
    ctx.shadowColor = "rgba(76, 49, 22, 0.32)";
    ctx.shadowBlur = 12;
    ctx.fillStyle = theme.door;
    ctx.beginPath();
    ctx.roundRect(px + this.tileSize * 0.12, py + this.tileSize * 0.16, this.tileSize * 0.76, this.tileSize * 0.72, Math.max(4, this.tileSize * 0.13));
    ctx.fill();
    ctx.shadowBlur = open ? 18 : 0;
    ctx.strokeStyle = open ? "#69d86c" : "#7b4a2b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(px + this.tileSize * 0.2, py + this.tileSize * 0.24, this.tileSize * 0.6, this.tileSize * 0.56, Math.max(3, this.tileSize * 0.1));
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = open ? "#e9ffcf" : theme.doorLight;
    ctx.beginPath();
    ctx.roundRect(px + this.tileSize * 0.23, py + this.tileSize * 0.09, this.tileSize * 0.54, this.tileSize * 0.22, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(85,48,25,0.34)";
    ctx.stroke();
    ctx.fillStyle = open ? "#3b8f43" : "#7a4a25";
    ctx.font = `900 ${Math.max(12, this.tileSize * 0.3)}px Segoe UI`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(open ? "开" : "关", px + this.tileSize / 2, py + this.tileSize * 0.2);
    ctx.restore();
  }

  worldPoint(x, y) {
    return {
      x: this.offset.x + x * this.tileSize,
      y: this.offset.y + y * this.tileSize
    };
  }

  worldCircle(x, y, r) {
    const p = this.worldPoint(x, y);
    return { x: p.x, y: p.y, size: r * this.tileSize };
  }

  worldRect(rect) {
    return {
      x: this.offset.x + rect.x * this.tileSize,
      y: this.offset.y + rect.y * this.tileSize,
      w: rect.w * this.tileSize,
      h: rect.h * this.tileSize
    };
  }
}

function drawLittlePerson(renderCtx, character, x, y, r, dir = { x: 0, y: 1 }, playerId = 0, state = null) {
  const facing = dir.x === 0 ? 1 : Math.sign(dir.x);
  const bob = Math.sin(performance.now() / 120 + playerId * 1.7) * r * 0.045;
  const bodyW = r * 1.1;
  const bodyH = r * 1.15;
  const headR = r * 0.48;
  const bodyX = x - bodyW / 2;
  const bodyY = y - r * 0.1 + bob;
  const headX = x + facing * r * 0.08;
  const headY = y - r * 0.78 + bob;

  renderCtx.save();
  if (state?.downed) {
    renderCtx.translate(x, y);
    renderCtx.rotate(-0.72);
    renderCtx.translate(-x, -y);
    renderCtx.globalAlpha = 0.72;
  }
  if (state?.speedBoostTimer > 0) {
    renderCtx.fillStyle = "rgba(255,255,255,0.44)";
    renderCtx.beginPath();
    renderCtx.ellipse(x - facing * r * 0.8, y + r * 0.4, r * 0.5, r * 0.18, 0, 0, Math.PI * 2);
    renderCtx.fill();
  }
  if (state?.shieldTimer > 0) {
    renderCtx.strokeStyle = "rgba(255,209,102,0.9)";
    renderCtx.lineWidth = Math.max(2, r * 0.11);
    renderCtx.shadowColor = "#ffd166";
    renderCtx.shadowBlur = r * 0.55;
    renderCtx.beginPath();
    renderCtx.arc(x, y, r * 1.32, 0, Math.PI * 2);
    renderCtx.stroke();
  }
  renderCtx.shadowColor = character.accent;
  renderCtx.shadowBlur = r * 0.9;
  renderCtx.fillStyle = "rgba(0, 0, 0, 0.36)";
  renderCtx.beginPath();
  renderCtx.ellipse(x, y + r * 0.82, r * 0.9, r * 0.23, 0, 0, Math.PI * 2);
  renderCtx.fill();

  renderCtx.lineCap = "round";
  renderCtx.lineJoin = "round";
  renderCtx.strokeStyle = character.trim;
  renderCtx.lineWidth = Math.max(2, r * 0.16);
  renderCtx.globalAlpha = 0.96;

  renderCtx.beginPath();
  renderCtx.moveTo(x - r * 0.24, y + r * 0.55 + bob);
  renderCtx.lineTo(x - r * 0.42, y + r * 0.95 + bob);
  renderCtx.moveTo(x + r * 0.24, y + r * 0.55 + bob);
  renderCtx.lineTo(x + r * 0.44, y + r * 0.95 + bob);
  renderCtx.stroke();

  const suit = renderCtx.createLinearGradient(bodyX, bodyY, bodyX + bodyW, bodyY + bodyH);
  suit.addColorStop(0, character.body[0]);
  suit.addColorStop(1, character.body[1]);
  renderCtx.fillStyle = suit;
  renderCtx.strokeStyle = "rgba(255,255,255,0.58)";
  renderCtx.lineWidth = Math.max(1.5, r * 0.08);
  renderCtx.beginPath();
  renderCtx.roundRect(bodyX, bodyY, bodyW, bodyH, r * 0.28);
  renderCtx.fill();
  renderCtx.stroke();

  renderCtx.strokeStyle = character.accent;
  renderCtx.lineWidth = Math.max(2, r * 0.12);
  renderCtx.beginPath();
  renderCtx.moveTo(x - r * 0.55, y + r * 0.1 + bob);
  renderCtx.lineTo(x - r * 0.82, y + r * 0.42 + bob);
  renderCtx.moveTo(x + r * 0.55, y + r * 0.1 + bob);
  renderCtx.lineTo(x + r * 0.84, y + r * 0.38 + bob);
  renderCtx.stroke();

  renderCtx.fillStyle = character.head;
  renderCtx.strokeStyle = "rgba(255,255,255,0.7)";
  renderCtx.lineWidth = Math.max(1.5, r * 0.07);
  renderCtx.beginPath();
  renderCtx.arc(headX, headY, headR, 0, Math.PI * 2);
  renderCtx.fill();
  renderCtx.stroke();

  drawHeadGear(renderCtx, character, headX, headY, headR, facing);

  renderCtx.shadowBlur = 0;
  renderCtx.fillStyle = "#111827";
  const eyeY = headY - headR * 0.06;
  const alert = state?.downed || state?.stunTimer > 0;
  const excited = state?.speedBoostTimer > 0 || state?.character?.id === "runner";
  renderCtx.beginPath();
  renderCtx.arc(headX - headR * 0.22 + facing * headR * 0.1, eyeY, alert ? headR * 0.12 : headR * 0.08, 0, Math.PI * 2);
  renderCtx.arc(headX + headR * 0.22 + facing * headR * 0.1, eyeY, alert ? headR * 0.12 : headR * 0.08, 0, Math.PI * 2);
  renderCtx.fill();

  renderCtx.strokeStyle = "rgba(17,24,39,0.75)";
  renderCtx.lineWidth = Math.max(1, r * 0.045);
  renderCtx.beginPath();
  if (alert) {
    renderCtx.arc(headX + facing * headR * 0.08, headY + headR * 0.24, headR * 0.12, 0, Math.PI * 2);
    renderCtx.stroke();
  } else if (character.id === "mage") {
    renderCtx.arc(headX + facing * headR * 0.08, headY + headR * 0.12, headR * 0.26, 0.05, Math.PI * 0.85);
    renderCtx.stroke();
  } else if (excited) {
    renderCtx.moveTo(headX - headR * 0.18, headY + headR * 0.2);
    renderCtx.quadraticCurveTo(headX, headY + headR * 0.38, headX + headR * 0.28, headY + headR * 0.15);
    renderCtx.stroke();
  } else {
    renderCtx.arc(headX + facing * headR * 0.08, headY + headR * 0.18, headR * 0.22, 0.15, Math.PI - 0.15);
    renderCtx.stroke();
  }

  renderCtx.fillStyle = "rgba(255,255,255,0.72)";
  renderCtx.beginPath();
  renderCtx.roundRect(x - r * 0.18, bodyY + r * 0.25, r * 0.36, r * 0.14, r * 0.06);
  renderCtx.fill();

  if (playerId) {
    renderCtx.fillStyle = playerId === 1 ? "#ff4d6d" : "#4cc9f0";
    renderCtx.shadowColor = renderCtx.fillStyle;
    renderCtx.shadowBlur = r * 0.5;
    renderCtx.beginPath();
    renderCtx.arc(x + r * 0.62, y - r * 0.76, r * 0.24, 0, Math.PI * 2);
    renderCtx.fill();
    renderCtx.shadowBlur = 0;
    renderCtx.fillStyle = "#ffffff";
    renderCtx.font = `800 ${Math.max(8, r * 0.32)}px Segoe UI`;
    renderCtx.textAlign = "center";
    renderCtx.textBaseline = "middle";
    renderCtx.fillText(String(playerId), x + r * 0.62, y - r * 0.76);
  }

  renderCtx.restore();
}

function drawAttackSlash(renderCtx, game, player, x, y, r) {
  const progress = 1 - player.attackTimer / 0.22;
  const ease = Math.sin(progress * Math.PI);
  const style = player.character.attackStyle;
  const color = player.character.body[0];
  const light = player.character.accent;
  const dir = player.dir.x !== 0 || player.dir.y !== 0 ? player.dir : { x: 1, y: 0 };
  const angle = Math.atan2(dir.y, dir.x);
  const reach = r * 2.05;

  renderCtx.save();
  renderCtx.translate(x, y);
  renderCtx.rotate(angle);
  renderCtx.globalAlpha = 0.96;
  renderCtx.shadowColor = color;
  renderCtx.shadowBlur = r * 1.2;

  if (style === "laser") {
    drawLaserAttack(renderCtx, r, reach, progress, color, light);
    renderCtx.restore();
    return;
  }
  if (style === "spark") {
    drawSparkAttack(renderCtx, r, reach, progress, color, light);
    renderCtx.restore();
    return;
  }
  if (style === "grenade") {
    drawGrenadeAttack(renderCtx, r, reach, progress, color, light);
    renderCtx.restore();
    return;
  }
  if (style === "lightning") {
    drawLightningAttack(renderCtx, r, reach, progress, color, light);
    renderCtx.restore();
    return;
  }
  if (style === "wind") {
    drawWindAttack(renderCtx, r, reach, progress, color, light);
    renderCtx.restore();
    return;
  }

  const slash = renderCtx.createRadialGradient(r * 0.55, 0, r * 0.1, r * 1.05, 0, reach);
  slash.addColorStop(0, "rgba(255,255,255,0.98)");
  slash.addColorStop(0.34, hexToRgba(light, 0.92));
  slash.addColorStop(0.72, hexToRgba(color, 0.72));
  slash.addColorStop(1, hexToRgba(color, 0));

  renderCtx.fillStyle = slash;
  renderCtx.beginPath();
  renderCtx.moveTo(r * 0.32, -r * 0.5);
  renderCtx.quadraticCurveTo(reach * (0.72 + ease * 0.12), -r * (1.28 + ease * 0.22), reach, 0);
  renderCtx.quadraticCurveTo(reach * (0.72 + ease * 0.12), r * (1.28 + ease * 0.22), r * 0.32, r * 0.5);
  renderCtx.quadraticCurveTo(r * 0.8, 0, r * 0.32, -r * 0.5);
  renderCtx.fill();

  renderCtx.shadowBlur = r * 0.55;
  renderCtx.strokeStyle = "#ffffff";
  renderCtx.lineWidth = Math.max(3, r * 0.14);
  renderCtx.beginPath();
  renderCtx.arc(r * 0.82, 0, r * (1.08 + ease * 0.2), -0.78, 0.78);
  renderCtx.stroke();

  renderCtx.strokeStyle = color;
  renderCtx.lineWidth = Math.max(2, r * 0.08);
  renderCtx.beginPath();
  renderCtx.arc(r * 0.9, 0, r * (1.28 + ease * 0.24), -0.72, 0.72);
  renderCtx.stroke();

  for (let i = 0; i < 7; i += 1) {
    const t = i / 6;
    const px = r * (0.75 + t * 1.55) + ease * r * 0.22;
    const py = Math.sin((t - 0.5) * Math.PI) * r * 0.74;
    renderCtx.fillStyle = i % 2 === 0 ? "#ffffff" : light;
    renderCtx.globalAlpha = (1 - progress * 0.55) * (0.7 + t * 0.3);
    renderCtx.beginPath();
    renderCtx.arc(px, py, r * (0.08 + 0.04 * (1 - t)), 0, Math.PI * 2);
    renderCtx.fill();
  }

  renderCtx.restore();
}

function drawLaserAttack(renderCtx, r, reach, progress, color, light) {
  const width = r * (0.34 + Math.sin(progress * Math.PI) * 0.18);
  const beam = renderCtx.createLinearGradient(r * 0.2, 0, reach * 1.2, 0);
  beam.addColorStop(0, hexToRgba("#ffffff", 0.95));
  beam.addColorStop(0.22, hexToRgba(light, 0.9));
  beam.addColorStop(1, hexToRgba(color, 0));
  renderCtx.fillStyle = beam;
  renderCtx.shadowColor = light;
  renderCtx.shadowBlur = r * 1.4;
  renderCtx.beginPath();
  renderCtx.roundRect(r * 0.3, -width / 2, reach * 1.1, width, width / 2);
  renderCtx.fill();
  renderCtx.strokeStyle = "#ffffff";
  renderCtx.lineWidth = Math.max(2, r * 0.1);
  renderCtx.beginPath();
  renderCtx.moveTo(r * 0.42, 0);
  renderCtx.lineTo(reach * 1.18, 0);
  renderCtx.stroke();
  for (let i = 0; i < 4; i += 1) {
    const x = r * (0.8 + i * 0.48 + progress * 0.3);
    renderCtx.strokeStyle = i % 2 ? color : light;
    renderCtx.beginPath();
    renderCtx.moveTo(x, -r * 0.7);
    renderCtx.lineTo(x + r * 0.25, r * 0.7);
    renderCtx.stroke();
  }
}

function drawSparkAttack(renderCtx, r, reach, progress, color, light) {
  renderCtx.shadowColor = light;
  renderCtx.shadowBlur = r * 1.25;
  for (let i = 0; i < 12; i += 1) {
    const t = i / 12;
    const angle = -0.82 + t * 1.64;
    const dist = r * (0.75 + t * 1.65) + progress * r * 0.3;
    const px = Math.cos(angle) * dist + r * 0.75;
    const py = Math.sin(angle) * dist;
    const points = i % 2 ? 5 : 4;
    renderCtx.fillStyle = i % 3 === 0 ? "#ffffff" : (i % 3 === 1 ? light : color);
    renderCtx.beginPath();
    for (let j = 0; j < points * 2; j += 1) {
      const a = -Math.PI / 2 + (Math.PI * j) / points;
      const rr = j % 2 === 0 ? r * 0.2 : r * 0.08;
      const sx = px + Math.cos(a) * rr;
      const sy = py + Math.sin(a) * rr;
      if (j === 0) renderCtx.moveTo(sx, sy);
      else renderCtx.lineTo(sx, sy);
    }
    renderCtx.closePath();
    renderCtx.fill();
  }
  renderCtx.strokeStyle = hexToRgba(color, 0.72);
  renderCtx.lineWidth = Math.max(3, r * 0.12);
  renderCtx.beginPath();
  renderCtx.arc(r * 0.88, 0, r * (1.1 + progress * 0.2), -0.9, 0.9);
  renderCtx.stroke();
}

function drawWindAttack(renderCtx, r, reach, progress, color, light) {
  renderCtx.shadowColor = light;
  renderCtx.shadowBlur = r * 1.1;
  renderCtx.strokeStyle = hexToRgba(color, 0.86);
  renderCtx.lineWidth = Math.max(4, r * 0.16);
  for (let i = 0; i < 3; i += 1) {
    const offset = (i - 1) * r * 0.36;
    renderCtx.beginPath();
    renderCtx.moveTo(r * 0.32, offset);
    renderCtx.bezierCurveTo(r * 0.9, -r * 1.0 + offset, reach * 0.9, r * 0.95 + offset, reach * 1.12, offset * 0.2);
    renderCtx.stroke();
  }
  renderCtx.fillStyle = hexToRgba(light, 0.75);
  for (let i = 0; i < 8; i += 1) {
    const t = i / 7;
    renderCtx.beginPath();
    renderCtx.ellipse(r * (0.7 + t * 1.75), Math.sin(t * Math.PI * 2 + progress * 3) * r * 0.55, r * 0.13, r * 0.06, progress + t, 0, Math.PI * 2);
    renderCtx.fill();
  }
}

function drawLightningAttack(renderCtx, r, reach, progress, color, light) {
  const pulse = Math.sin(progress * Math.PI);
  renderCtx.shadowColor = "#fff176";
  renderCtx.shadowBlur = r * (1.4 + pulse);
  renderCtx.lineCap = "round";
  renderCtx.lineJoin = "round";

  for (let branch = 0; branch < 3; branch += 1) {
    const offset = (branch - 1) * r * 0.42;
    renderCtx.strokeStyle = branch === 1 ? "#ffffff" : hexToRgba(light, 0.9);
    renderCtx.lineWidth = Math.max(3, r * (0.12 - branch * 0.02));
    renderCtx.beginPath();
    renderCtx.moveTo(r * 0.18, offset * 0.3);
    for (let i = 1; i <= 6; i += 1) {
      const x = r * 0.18 + (reach * 1.18 * i) / 6;
      const jitter = Math.sin(progress * 13 + i * 2.2 + branch) * r * 0.26;
      const y = offset + jitter;
      renderCtx.lineTo(x, y);
    }
    renderCtx.stroke();
  }

  renderCtx.fillStyle = hexToRgba(color, 0.72);
  for (let i = 0; i < 7; i += 1) {
    const x = r * (0.45 + i * 0.42);
    const y = Math.sin(i * 1.7 + progress * 8) * r * 0.62;
    renderCtx.beginPath();
    renderCtx.arc(x, y, r * (0.09 + pulse * 0.05), 0, Math.PI * 2);
    renderCtx.fill();
  }
}

function drawGrenadeAttack(renderCtx, r, reach, progress, color, light) {
  const pulse = Math.sin(progress * Math.PI);
  const cx = r * (1.3 + progress * 0.55);
  const cy = -Math.sin(progress * Math.PI) * r * 0.55;
  const blast = r * (0.72 + pulse * 0.74);

  renderCtx.shadowColor = light;
  renderCtx.shadowBlur = r * 1.7;
  renderCtx.fillStyle = hexToRgba("#fff7a8", 0.5);
  renderCtx.beginPath();
  renderCtx.arc(cx, cy, blast, 0, Math.PI * 2);
  renderCtx.fill();

  const boom = renderCtx.createRadialGradient(cx, cy, r * 0.1, cx, cy, blast * 1.1);
  boom.addColorStop(0, "#ffffff");
  boom.addColorStop(0.24, light);
  boom.addColorStop(0.58, color);
  boom.addColorStop(1, hexToRgba(color, 0));
  renderCtx.fillStyle = boom;
  renderCtx.beginPath();
  for (let i = 0; i < 18; i += 1) {
    const a = (Math.PI * 2 * i) / 18;
    const rr = i % 2 === 0 ? blast * 1.05 : blast * 0.58;
    const px = cx + Math.cos(a) * rr;
    const py = cy + Math.sin(a) * rr;
    if (i === 0) renderCtx.moveTo(px, py);
    else renderCtx.lineTo(px, py);
  }
  renderCtx.closePath();
  renderCtx.fill();

  renderCtx.shadowBlur = 0;
  renderCtx.fillStyle = "#2f3a4f";
  renderCtx.strokeStyle = "#ffffff";
  renderCtx.lineWidth = Math.max(2, r * 0.08);
  renderCtx.beginPath();
  renderCtx.arc(cx - r * 0.26, cy - r * 0.18, r * 0.26, 0, Math.PI * 2);
  renderCtx.fill();
  renderCtx.stroke();
  renderCtx.strokeStyle = light;
  renderCtx.beginPath();
  renderCtx.arc(cx - r * 0.1, cy - r * 0.42, r * 0.22, -Math.PI * 0.1, Math.PI * 1.1);
  renderCtx.stroke();
}

function drawHeadGear(renderCtx, character, x, y, r, facing) {
  renderCtx.save();
  renderCtx.shadowBlur = 0;
  renderCtx.fillStyle = character.accent;
  renderCtx.strokeStyle = character.trim;
  renderCtx.lineWidth = Math.max(1, r * 0.08);

  if (character.type === "helmet") {
    renderCtx.beginPath();
    renderCtx.arc(x, y - r * 0.07, r * 0.9, Math.PI * 1.02, Math.PI * 1.98);
    renderCtx.lineTo(x + r * 0.78, y - r * 0.02);
    renderCtx.quadraticCurveTo(x, y + r * 0.28, x - r * 0.78, y - r * 0.02);
    renderCtx.closePath();
    renderCtx.fill();
    renderCtx.stroke();
    renderCtx.fillStyle = "rgba(255,255,255,0.72)";
    renderCtx.beginPath();
    renderCtx.roundRect(x - r * 0.48 + facing * r * 0.08, y - r * 0.25, r * 0.78, r * 0.22, r * 0.09);
    renderCtx.fill();
  } else if (character.type === "hood") {
    renderCtx.beginPath();
    renderCtx.moveTo(x, y - r * 1.08);
    renderCtx.quadraticCurveTo(x + r * 0.9, y - r * 0.3, x + r * 0.62, y + r * 0.42);
    renderCtx.quadraticCurveTo(x, y + r * 0.16, x - r * 0.62, y + r * 0.42);
    renderCtx.quadraticCurveTo(x - r * 0.9, y - r * 0.3, x, y - r * 1.08);
    renderCtx.fill();
    renderCtx.stroke();
    renderCtx.fillStyle = character.trim;
    renderCtx.beginPath();
    renderCtx.arc(x + r * 0.55, y - r * 0.9, r * 0.17, 0, Math.PI * 2);
    renderCtx.fill();
  } else if (character.type === "cap") {
    renderCtx.beginPath();
    renderCtx.roundRect(x - r * 0.7, y - r * 0.86, r * 1.28, r * 0.42, r * 0.16);
    renderCtx.fill();
    renderCtx.stroke();
    renderCtx.beginPath();
    renderCtx.ellipse(x + facing * r * 0.55, y - r * 0.58, r * 0.42, r * 0.16, facing * 0.16, 0, Math.PI * 2);
    renderCtx.fill();
  } else {
    renderCtx.beginPath();
    renderCtx.roundRect(x - r * 0.62, y - r * 0.7, r * 1.24, r * 0.28, r * 0.12);
    renderCtx.fill();
    renderCtx.stroke();
    renderCtx.fillStyle = "rgba(255,255,255,0.78)";
    renderCtx.beginPath();
    renderCtx.roundRect(x - r * 0.5 + facing * r * 0.12, y - r * 0.63, r * 0.74, r * 0.12, r * 0.05);
    renderCtx.fill();
  }

  renderCtx.restore();
}

function formatTime(seconds) {
  const value = Math.max(0, Math.ceil(seconds));
  const min = Math.floor(value / 60);
  const sec = String(value % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function setScreen(name) {
  if (name === null && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  if (name === "level") buildLevelChoices();
  if (name === "select") buildCharacterChoices();
  screens.menu.classList.toggle("active", name === "menu");
  screens.level.classList.toggle("active", name === "level");
  screens.select.classList.toggle("active", name === "select");
  document.body.classList.toggle("single-select", name === "select" && activeMode === MODE.SINGLE);
}

function showResult(title, text, canNext) {
  ui.resultTitle.textContent = title;
  ui.resultText.textContent = text;
  ui.nextBtn.style.display = canNext ? "inline-flex" : "none";
  ui.nextBtn.style.alignItems = "center";
  screens.modal.classList.add("show");
}

function hideResult() {
  screens.modal.classList.remove("show");
}

function showRules() {
  screens.rules.classList.add("show");
}

function hideRules() {
  screens.rules.classList.remove("show");
}

function showPause() {
  if (game.state !== "playing") return;
  game.state = "paused";
  screens.pause.classList.add("show");
}

function hidePause(resume = true) {
  screens.pause.classList.remove("show");
  if (resume && game.state === "paused") game.state = "playing";
}

function buildLevelChoices() {
  progress = loadProgress();
  const unlocked = unlockedLevelFor(activeMode);
  selectedLevel = clamp(selectedLevel || 1, 1, unlocked);
  ui.levelTitle.textContent = `${modeLabel(activeMode)} · 选择关卡`;
  ui.levelNote.innerHTML = `
    <strong>关卡存档</strong>
    <span>已通关最高：第 ${bestLevelFor(activeMode)} 关</span>
    <span>当前可选择：1 - ${unlocked} 关</span>
  `;
  ui.levelChoices.innerHTML = "";

  for (let level = 1; level <= MAX_LEVEL_SELECT; level += 1) {
    const button = document.createElement("button");
    const locked = level > unlocked;
    button.type = "button";
    button.className = `level-card ${selectedLevel === level ? "selected" : ""} ${locked ? "locked" : ""}`;
    button.disabled = locked;
    button.innerHTML = `<strong>${level}</strong><span>${locked ? "未解锁" : level === unlocked && level > 1 ? "新挑战" : "可挑战"}</span>`;
    button.addEventListener("click", () => {
      selectedLevel = level;
      buildLevelChoices();
    });
    ui.levelChoices.appendChild(button);
  }
}

function buildCharacterChoices() {
  progress = loadProgress();
  const title = screens.select.querySelector(".select-head h2");
  if (title) {
    title.textContent = activeMode === MODE.SINGLE ? "选择闯关角色" : "选择两名角色";
  }
  let note = screens.select.querySelector(".unlock-note");
  if (!note) {
    note = document.createElement("div");
    note.className = "unlock-note";
    screens.select.querySelector(".select-head").insertAdjacentElement("afterend", note);
  }
  note.innerHTML = `
    <strong>解锁规则</strong>
    <span>默认四名角色全开放；皮肤通过单人最高关卡和 PK 胜场解锁。</span>
    <span>单人最高：第 ${progress.bestSingleLevel} 关 · PK 胜场：${progress.pkWins}</span>
  `;

  const groups = [
    { root: document.getElementById("p1Choices"), player: "p1" },
    { root: document.getElementById("p2Choices"), player: "p2" }
  ];

  for (const group of groups) {
    group.root.innerHTML = "";
    const skinKey = `${group.player}Skin`;
    if (!isSkinUnlocked(selected[skinKey])) selected[skinKey] = "base";
    CHARACTERS.forEach((character, index) => {
      const chosen = selected[group.player] === index;
      const previewCharacter = applySkin(character, chosen ? selected[skinKey] : "base");
      const card = document.createElement("div");
      card.className = `character-card ${chosen ? "selected" : ""}`;
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `${group.player.toUpperCase()} ${character.label}`);
      card.innerHTML = `
        <canvas class="preview" width="116" height="116"></canvas>
        <span>${character.label}</span>
        <small>${character.mood}</small>
        <em>${character.attackName}</em>
        <div class="skin-row" aria-label="皮肤选择"></div>
      `;
      const chooseCharacter = () => {
        selected[group.player] = index;
        buildCharacterChoices();
      };
      card.addEventListener("click", chooseCharacter);
      card.addEventListener("keydown", (event) => {
        if (event.code === "Enter" || event.code === "Space") {
          event.preventDefault();
          chooseCharacter();
        }
      });
      group.root.appendChild(card);

      const preview = card.querySelector("canvas");
      const pctx = preview.getContext("2d");
      pctx.save();
      pctx.translate(58, 64);
      pctx.shadowColor = previewCharacter.accent;
      pctx.shadowBlur = 18;
      drawLittlePerson(pctx, previewCharacter, 0, 7, 31, { x: 1, y: 0 }, 0);
      pctx.restore();

      const skinRow = card.querySelector(".skin-row");
      for (const skin of SKINS) {
        const unlocked = isSkinUnlocked(skin.id);
        const dot = document.createElement("button");
        dot.className = `skin-dot ${selected[skinKey] === skin.id && chosen ? "selected" : ""} ${unlocked ? "" : "locked"}`;
        dot.type = "button";
        dot.title = unlocked ? skin.label : `${skin.label}：${skin.unlock}`;
        dot.style.background = skin.body
          ? `linear-gradient(135deg, ${skin.body[0]}, ${skin.body[1]})`
          : `linear-gradient(135deg, ${character.body[0]}, ${character.body[1]})`;
        dot.textContent = unlocked ? "" : "锁";
        dot.addEventListener("click", (event) => {
          event.stopPropagation();
          selected[group.player] = index;
          if (unlocked) selected[skinKey] = skin.id;
          buildCharacterChoices();
        });
        skinRow.appendChild(dot);
      }
    });
  }
}

const game = new Game();
buildCharacterChoices();
setScreen("menu");

document.getElementById("singleBtn").addEventListener("click", () => {
  activeMode = MODE.SINGLE;
  selectedLevel = clamp(selectedLevel, 1, unlockedLevelFor(activeMode));
  setScreen("level");
});

document.getElementById("coopBtn").addEventListener("click", () => {
  activeMode = MODE.COOP;
  selectedLevel = clamp(selectedLevel, 1, unlockedLevelFor(activeMode));
  setScreen("level");
});

document.getElementById("versusBtn").addEventListener("click", () => {
  activeMode = MODE.VERSUS;
  selectedLevel = clamp(selectedLevel, 1, unlockedLevelFor(activeMode));
  setScreen("level");
});

document.getElementById("levelBackBtn").addEventListener("click", () => setScreen("menu"));
ui.levelContinueBtn.addEventListener("click", () => setScreen("select"));
document.getElementById("backToMenuBtn").addEventListener("click", () => setScreen("level"));
document.getElementById("startGameBtn").addEventListener("click", () => game.start(activeMode, selectedLevel));
ui.rulesBtn.addEventListener("click", showRules);
ui.closeRulesBtn.addEventListener("click", hideRules);
screens.rules.addEventListener("click", (event) => {
  if (event.target === screens.rules) hideRules();
});
ui.resumeBtn.addEventListener("click", () => hidePause(true));
ui.pauseRetryBtn.addEventListener("click", () => {
  hidePause(false);
  game.start(game.mode, game.level);
});
ui.pauseRulesBtn.addEventListener("click", showRules);
ui.pauseMenuBtn.addEventListener("click", () => {
  hidePause(false);
  hideResult();
  game.state = "menu";
  setScreen("menu");
});
ui.nextBtn.addEventListener("click", () => game.start(game.mode, game.level + 1));
ui.retryBtn.addEventListener("click", () => game.start(game.mode, game.level));
ui.menuBtn.addEventListener("click", () => {
  hideResult();
  hidePause(false);
  game.state = "menu";
  setScreen("menu");
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Escape") {
    if (screens.rules.classList.contains("show")) {
      hideRules();
      return;
    }
    if (game.state === "playing") {
      showPause();
      return;
    }
    if (game.state === "paused") {
      hidePause(true);
      return;
    }
    return;
  }
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Space"].includes(event.code)) {
    event.preventDefault();
  }
  if (event.code === "Space") return;
  keys.add(event.code);
  if (game.state !== "playing") return;
  if (event.code === "KeyJ") game.players[0]?.attack();
  if (event.code === "Enter") game.players[1]?.attack();
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  game.update(dt);
  game.draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
