/* OUJA v119: OUJA interaction base + 12 WS cards */

/*
 * iPhone 16 Pro Max 参数区
 * 目标画布：440 × 956 CSS px（竖屏）。
 * 坐标仍以 1179 × 2556 原始背景像素为单位，方便直接微调。
 */
const PWA_BUILD = "123";
window.__OUJA_BUILD__ = `v${PWA_BUILD}`;
document.documentElement.dataset.oujaBuild = `v${PWA_BUILD}`;
// 每次真正启动 App 都使用不同会话标识。关键媒体在同一 build 下也不会复用上一次 PWA 进程里的媒体响应。
const AUDIO_SESSION_ID = `${PWA_BUILD}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
// URL 只作为版本标记，不再靠它强制二次加载。实际版本由当前激活 SW 的原子缓存决定。
try {
  const buildUrl = new URL(window.location.href);
  if (buildUrl.searchParams.get("appv") !== PWA_BUILD) {
    buildUrl.searchParams.set("appv", PWA_BUILD);
    window.history.replaceState(null, "", buildUrl.href);
  }
} catch {}

const ANIMATION_CONFIG = {
  // 第一阶段最长 3 秒；kh1 提前播完时立即进入第二阶段，不再空等。
  firstStageDuration: 3,
  // 第二阶段音效异常时的保底总时长；正常流程以 ydmusic ended 为结束点。
  sequenceDuration: 3.5,
  stageTwo: {
    backHold: 1.5,
    flipDuration: 0.42,
  },
  move: {
    x: 0,
    y: -800,
    duration: 1.2,
  },
  bg3: {
    x: 0,
    y: -320,
    width: 99,
    height: 100,
    duration: 1.5,
  },
  bg4: {
    // 四张 bg4：左/上/右 + 一张从屏幕正前方沿深度方向反转进入；最后向中心汇合。
    spread: 360,
    // 起始位置放到画面外，左右两张从两侧进入，中间一张从上方进入。
    entryDistance: 1400,
    duration: 1.2,
    // charu 播放到 1.00 秒时启动 bg4。
    startTimecode: { seconds: 1, frames: 0, fps: 30 },
  },
  bg5: {
    // bg4 汇合后，bg5 带白色外发光显示 0.5 秒，再切换 bg3。
    duration: 0.5,
  },
  shatter: {
    // 卡盒向右抽出成功时，bg3 + 腰带镜面碎裂并消失。
    duration: 0.72,
  },
  ws: {
    // OUJA 的 12 张 WS 卡片。三排四列；仍沿用 OUJA 原有 ws-card 交互。
    // x / y 控制整组位置，cardWidth 控制统一显示宽度，gapX / gapY 控制间距，均可直接自定义。
    // 原图约 211×307 px，因此默认 cardWidth=211，图片高度按各自原始比例自动计算。
    x: -460,
    y: 250,
    cardWidth: 211,
    gapX: 25,
    gapY: 25,
    entryDistance: 420,
    duration: 0.45,
  },
  sideButtons: {
    // 直接复用 Ryuki：原左下角 4 个按钮移到中间第二排。
    // x / y 为整排左上角相对场景中心的位置。
    x: -454,
    y: 1070,
    size: 157,
    gap: 80,
  },
  centerButtons: {
    // 直接复用 Ryuki：第一排 an1 / an2 / an3。
    // 三颗按钮保持相同 237 的横向中心间距。
    x: 0,
    y: 930,
    button1: { x: -375, y: 0, size: 157 },
    button2: { x: -138, y: 0, size: 157 },
    button3: { x: 99, y: 0, size: 157 },
  },
  auxDevice: {
    // BS 按钮保留 OUJA 原流程；x / y / width 可自行调整。
    bs: { x: 560, y: 330, width: 150 },

    // 蛇杖整体容器：x / y 为整体基准位置；slideX 为从 BS 弹出的距离。
    // scale 为整个蛇杖本体缩放倍率：1 = 原大小，0.8 = 80%，1.2 = 120%。
    // 只缩放 sz1 / sz2 / syfg / 卡槽及其内部偏移，不改变整个容器的 x / y / slideX。
    container: { x: 0, y: 500, slideX: -400, scale: 1.3, rotate: -20, duration: 0.42 },

    // 蛇杖遮挡层 sz1。点击 sz1 后，最底层 sz2 弹出。
    sz1: { x: 5, y: -410, width: 630 },

    // 蛇杖最底层 sz2。popY 控制点击 sz1 后的弹出距离；负数向上、正数向下。
    sz2: { x: 0, y: -480, width: 300, popY: -280 },

    // 最上层蛇眼发光 syfg。默认隐藏，只在插卡后点击 sz2 并播放卡片音效时显示。
    // showForTuning=true 可常亮显示，方便单独调位置和大小。
    syfg: { x: -10, y: -470, width: 190, duration: 1, showForTuning: false },

    // 中间层：沿用当前红框卡槽有效区，位置和插卡规则不改。
    // 只允许卡片从红框上方往下跨过顶部边界进入；左右/下方都不能触发插入。
    cardSlot: {
      // 调试：显示蛇杖红色插卡区域，位置/大小确认后可改回 false。
      showDebug: false,
      x: 0,
      y: -670,
      width: 290,
      height: 380,
      // 插入后卡片在槽内的大小与位置。超出 cardSlot 的部分会被裁切，不会穿帮。
      cardX: 0,
      cardY: 18,
      cardWidth: 280,
    },

    // KPC 手动拖出参数：抽出约一半时播放 chouka，完全抽出后才交接为自由拖动。
    kpcDrag: {
      dropHitPadding: 24,
      // 整张卡右边缘必须完全离开卡盒左边界后才算抽出；可微调额外安全距离。
      fullExtractPadding: 6,
      // 抽出到完整距离的多少比例时播放 chouka；0.5 = 一半。
      choukaTriggerRatio: 0.5,
      // 卡片从“上方入口”向下跨过卡槽上边缘时，横向至少需要这么多像素重叠。
      slotEnterThreshold: 8,
      // PWA 指针帧允许的顶部边界容差；只有整张卡上一帧位于卡槽上方，才允许从顶部插入。
      slotTopEntryTolerance: 4,
      // 100% 完全抽出后直接显示所选卡片正面的宽度。
      flippedWidth: 350,
      // 正面卡片重新拖动的真实触碰区。红框与实际命中区使用同一套参数。
      hitArea: {
        // true = 显示红色触碰区域；确认后改 false 即可隐藏。
        showDebug: false,
        // 相对卡片中心偏移，单位为设计坐标。
        offsetX: 0,
        offsetY: 0,
        // 0 = 自动跟随正面卡片真实宽/高；填正数可直接自定义触碰区域尺寸。
        width: 0,
        height: 0,
      },
    },

    // 蛇杖弹出期间，下方 ws 区域虚化强度。
    wsBlur: 7,
  },
  beltLayers: {
    up: { x: -20, y: 0 },
    down: { x: -25, y: 0 },
  },
  card: {
    start: { x: 0, y: 500 },
    insert: { x: 0, y: 0 },
    width: 485,
    duration: 1.25,
    // charu 完成后，卡盒从腰带内拖出超过这个距离就算抽出成功。
    extract: { threshold: 210 },
    // 整卡盒从腰带抽出后的 iPhone/PWA 触碰区域。
    // 不依赖 DOM hit-test；paddingX / paddingY 会在视觉卡盒四周扩展数学命中区。
    drag: {
      // 先经过腰带右侧的平行位置，再允许插入凹槽。
      parallel: { x: 360, y: -950, toleranceX: 100, toleranceY: 220 },
      // 凹槽中心沿用 move + card.insert，只在此范围内判定插入成功。
      slotTolerance: { x: 75, y: 90 },
    },
    layers: {
      // kpc：正数向右/向下，width 控制大小（原图宽 437）。
      middle: { x: -20, y: 0, width: 437 },
      // khfg：正数向右/向下，width 控制大小（原图宽 339）。
      glow: { x: 0, y: 0, width: 339 },
      // khzd：正数向右/向下，width 控制大小（原图宽 485）。
      cover: { x: 0, y: 0, width: 485 },
    },
  },
  // ydfg：正数向右/向下，width 控制大小（原图宽 777）。
  beltGlow: { x: -25, y: -80, width: 777 },
};

// 音效文件放在仓库 assets/audio/ 下；如文件格式不同，只改这里即可。
const AUDIO_CONFIG = {
  kh1: "./assets/audio/kh1.mp3?av=123",
  ydmusic: "./assets/audio/ydmusic.mp3?av=123",
  charu: "./assets/audio/charu.mp3?av=123",
  mocha: "./assets/audio/mocha.mp3?av=123",
  chouka: "./assets/audio/chouka.mp3?av=123",
  chaka: "./assets/audio/chaka.mp3?av=123",
  huagai1: "./assets/audio/huagai1.mp3?av=123",
  huagai2: "./assets/audio/huagai2.mp3?av=123",
  guo: "./assets/audio/guo.mp3?av=123",
  huhuan: "./assets/audio/huhuan.mp3?av=123",
  jingshijie: "./assets/audio/jingshijie.mp3?av=123",
  timeout: "./assets/audio/timeout.mp3?av=123",
  boxing: "./assets/audio/boxing.mp3?av=123",
  jianji: "./assets/audio/jianji.mp3?av=123",
  chaoxiao: "./assets/audio/chaoxiao.mp3?av=123",
  jiechu: "./assets/audio/jiechu.mp3?av=123",
  cardVoices: {
    1: "./assets/audio/j.mp3?av=123",
    2: "./assets/audio/s.mp3?av=123",
    3: "./assets/audio/f.mp3?av=123",
    4: "./assets/audio/huiwu.mp3?av=123",
    5: "./assets/audio/s.mp3?av=123",
    6: "./assets/audio/f.mp3?av=123",
    7: "./assets/audio/qx.mp3?av=123",
    8: "./assets/audio/s.mp3?av=123",
    9: "./assets/audio/f.mp3?av=123",
    10: "./assets/audio/rh.mp3?av=123",
    11: "./assets/audio/sd.mp3?av=123",
    12: "./assets/audio/f.mp3?av=123",
  },
  // 读卡追加音效：必须等对应基础卡片音效真正 ended 后再播放。
  cardVoiceFollowUps: {
    1: "./assets/audio/jianjianglin.mp3?av=123-jj2",
    // WS2：s 基础音效 ended 后接 shejiao，绝不重叠。
    2: "./assets/audio/shejiao.mp3?av=123",
    // WS3：f 基础音效 ended 后接 bsj，绝不重叠。
    3: "./assets/audio/bsj.mp3?av=123",
    // WS4：j 完整播放结束后接 jianjianglin。
    4: "./assets/audio/jianjianglin.mp3?av=123-jj2",
    // WS5 只播放基础 s，不追加后续音效。
    // WS6：f 完整播放结束后接 moguiyu。
    6: "./assets/audio/moguiyu.mp3?av=123",
    // WS7：j 完整播放结束后接 jianjianglin。
    7: "./assets/audio/jianjianglin.mp3?av=123-jj2",
    // WS8：s 完整播放结束后接 xiniujiao。
    8: "./assets/audio/xiniujiao.mp3?av=123",
    // WS9：f 基础音效完整播放结束后，再接 niujianglin。
    9: "./assets/audio/niujianglin.mp3?av=123",
    // WS10：rh 基础音效完整播放结束后，再接 rhjianglin。
    10: "./assets/audio/rhjianglin.mp3?av=123",
  },
};

const PHONE_VIEWPORT = { width: 440, height: 956 };
const SOURCE_SCENE = { width: 1179, height: 2556 };
const SOURCE_BELT_WIDTH = 1115;
const STAGE_TWO_WAVE_DURATION = 1.5;
// 第二阶段水波位移峰值；v33 为 30，在 iPhone 上过弱。v34 提高至 72。
const WATER_MAX_DISPLACEMENT = 170;

// 镜面碎裂分片：12 个不规则区域覆盖完整画面，不依赖额外图片素材。
const SHATTER_POLYGONS = [
  "polygon(0 0, 28% 0, 25% 28%, 0 38%)",
  "polygon(28% 0, 55% 0, 50% 32%, 25% 28%)",
  "polygon(55% 0, 80% 0, 75% 25%, 50% 32%)",
  "polygon(80% 0, 100% 0, 100% 38%, 75% 25%)",
  "polygon(0 38%, 25% 28%, 30% 62%, 0 68%)",
  "polygon(25% 28%, 50% 32%, 48% 66%, 30% 62%)",
  "polygon(50% 32%, 75% 25%, 70% 62%, 48% 66%)",
  "polygon(75% 25%, 100% 38%, 100% 68%, 70% 62%)",
  "polygon(0 68%, 30% 62%, 26% 100%, 0 100%)",
  "polygon(30% 62%, 48% 66%, 52% 100%, 26% 100%)",
  "polygon(48% 66%, 70% 62%, 76% 100%, 52% 100%)",
  "polygon(70% 62%, 100% 68%, 100% 100%, 76% 100%)",
];

const SHATTER_MOTION = [
  [-110, -75, -17, -28, 18], [-42, -110, 12, 34, -14], [36, -112, -11, -30, 16], [112, -72, 18, 30, -18],
  [-128, -18, 14, -36, 12], [-48, -12, -9, 28, -16], [52, 8, 10, -26, 15], [130, -8, -15, 34, -13],
  [-105, 78, 16, -32, 20], [-38, 105, -12, 26, -18], [44, 108, 13, -28, 16], [108, 76, -18, 34, -20],
];

const scene = document.querySelector("#scene");
const belt = document.querySelector("#belt");
const beltEffect = document.querySelector("#beltEffect");
const cardBox = document.querySelector("#cardBox");
const cardTrigger = document.querySelector("#cardTrigger");
const bg4Center = document.querySelector(".character-merge-center");
const wsPanel = document.querySelector("#wsPanel");
const wsButtons = [...document.querySelectorAll(".ws-card")];
const kpcLayer = document.querySelector("#kpcLayer");
const bsButton = document.querySelector("#bsButton");
const auxDock = document.querySelector("#auxDock");
const sz1Button = document.querySelector("#sz1Button");
const sz2Button = document.querySelector("#sz2Button");
const sz1Image = document.querySelector("#sz1Image");
const sz2Image = document.querySelector("#sz2Image");
const szCardSlotMask = document.querySelector("#szCardSlotMask");
const szInsertedCard = document.querySelector("#szInsertedCard");
const cardDragLayer = document.querySelector("#cardDragLayer");

// 仅刷新这次实际替换过的旧图片。
// index.html 仍由 PWA 导航缓存返回，因此由 Network First 的 script.js 在启动时覆盖图片 URL，
// 不需要升级整个 BUILD，也不会让其它图片重新下载。
const IMAGE_REFRESH = {
  kpc: "./assets/images/kpc.png?iv=2",
  sz1: "./assets/images/sz1.png?iv=2",
};

document
  .querySelectorAll('img[src="./assets/images/kpc.png"]')
  .forEach((image) => {
    image.src = IMAGE_REFRESH.kpc;
  });

if (sz1Image) {
  sz1Image.src = IMAGE_REFRESH.sz1;
}
const auxCardHitDebug = document.querySelector("#auxCardHitDebug");
const auxTransferCard = document.querySelector("#auxTransferCard");
const auxTransferCardImage = document.querySelector("#auxTransferCardImage");
const auxCardCoverMask = document.querySelector("#auxCardCoverMask");
const cardCoverLayer = cardBox?.querySelector(".card-cover");
const sideButtons = [...document.querySelectorAll(".side-control-button")];

// 第三颗中间圆形按钮直接由脚本补入，避免为了一个按钮改 index.html 导致 PWA 旧导航缓存卡住。
const centerActions = document.querySelector("#centerActions");
if (centerActions && !document.querySelector("#centerActionButton3")) {
  const button3 = document.createElement("button");
  button3.className = "center-action-button center-action-button-3";
  button3.id = "centerActionButton3";
  button3.type = "button";
  centerActions.appendChild(button3);
}
const centerActionButtons = [...document.querySelectorAll(".center-action-button")];

// 按钮视觉复用 Ryuki 的 an1 / an2 / an3 / an5-an8。
// OUJA 的 HTML 仍保留原按钮节点，第三颗 an3 由脚本补入。
const BUTTON_IMAGE_CONFIG = {
  center: [
    { src: "./assets/images/an1.png", label: "播放 boxing 音效" },
    { src: "./assets/images/an2.png", label: "播放 jianji 音效" },
    { src: "./assets/images/an3.png", label: "播放 chaoxiao 音效" },
  ],
  side: [
    { src: "./assets/images/an5.png", label: "播放 guo 音效" },
    { src: "./assets/images/an6.png", label: "播放 huhuan 音效" },
    { src: "./assets/images/an7.png", label: "播放 jingshijie 音效" },
    { src: "./assets/images/an8.png", label: "播放 timeout 音效" },
  ],
};

function applyRyukiButtonImages(buttons, configs) {
  buttons.forEach((button, index) => {
    const config = configs[index];
    if (!button || !config) return;

    button.setAttribute("aria-label", config.label);

    let image = button.querySelector("img");
    if (!image) {
      image = document.createElement("img");
      image.alt = "";
      button.appendChild(image);
    }
    image.src = config.src;
  });
}

applyRyukiButtonImages(centerActionButtons, BUTTON_IMAGE_CONFIG.center);
applyRyukiButtonImages(sideButtons, BUTTON_IMAGE_CONFIG.side);
const syfgImage = document.querySelector("#syfgImage");
const beltArt = document.querySelector("#beltArt");
const characterReveal = document.querySelector(".character-reveal");
const shatterCanvas = document.querySelector("#shatterCanvas");
const sceneImages = [...scene.querySelectorAll("img")];
const waterNoise = document.querySelector("#waterNoise");
const waterDisplacement = document.querySelector("#waterDisplacement");

let rippleAnimationFrame = 0;
let lastRippleUpdate = 0;
let sceneTimers = [];

// 主流程只允许一个明确阶段生效。关键异步事件必须同时通过 phase + runId 双重校验，
// 防止 Safari 延迟派发 ended / transition / animation 事件时越级进入后续流程。
const FLOW_PHASE = Object.freeze({
  IDLE: "idle",
  FIRST_STAGE: "first-stage",
  STAGE_TWO: "stage-two",
  CARD_DRAG: "card-drag",
  INSERTING: "inserting",
  INSERTED: "inserted",
  READY: "ready",
  EXTRACTING: "extracting",
  DETACHED: "detached",
  REPLAY_STAGE_TWO: "replay-stage-two",
});

let flowPhase = FLOW_PHASE.IDLE;
let insertionRunCounter = 0;
let activeInsertionRunId = 0;

function setFlowPhase(nextPhase) {
  flowPhase = nextPhase;
  scene.dataset.flowPhase = nextPhase;
}

function isFlowPhase(...phases) {
  return phases.includes(flowPhase);
}

let flowStarted = false;
let ydMusicInUse = false;
let insertionAudioInUse = false;
let sceneScale = 1;
let dragReady = false;
let isDragging = false;
let parallelReached = false;
let activePointerId = null;
let stageTwoFlipFallback = 0;
let stageTwoFinishFallback = 0;
let insertionAudioFallback = 0;
let insertionTimer = 0;
let charuFinished = true;
let bg4MergeStarted = false;
let bg4RunId = 0;
let bg4StartedAt = 0;
let bg5RunId = 0;
let centerActionsUnlocked = false;
let bg5TransitionTimer = 0;
let shatterCleanupTimer = 0;
let shatterAnimationFrame = 0;
let charuBg4SyncFrame = 0;
let selectedWs = null;
let selectedWsAspectRatio = null;
let cardVoiceRunToken = 0;
let extractReady = false;
let isExtracting = false;
let extractPointerId = null;
let cardWasExtracted = false;
let extractedStageTwoReplayActive = false;
let reinsertReady = false;
let suppressExtractedCardClick = false;
let suppressExtractedCardClickTimer = 0;
// 初始流程专用：腰带上移完成后，下一次“轻点卡盒”只播放一次 kh1。
// 拖动不消耗这次机会；一旦 kh1 播放过，后续点击都不再触发。
let postMoveKh1Ready = false;
let postMoveKh1Played = false;
let externalCardPointerTravel = 0;
// iPhone/PWA：整卡盒从腰带抽出后使用独立 Touch Session，不依赖 Pointer Events。
let extractPointerStart = { x: 0, y: 0 };
let extractOrigin = { x: 0, y: 0 };
let cardExtractPosition = { x: 0, y: 0 };
let pointerStart = { x: 0, y: 0 };
let dragOrigin = { x: 0, y: 0 };
let cardDragPosition = { x: ANIMATION_CONFIG.card.start.x, y: ANIMATION_CONFIG.card.start.y };
let auxOpen = false;
let auxArmed = false;
let auxCardInserted = false;
let auxKpcDragging = false;
let auxKpcPointerId = null;
let auxKpcCaptureTarget = null;
// iPhone/PWA 主通道：Touch Events 自己维护 identifier，不依赖 Pointer Capture。
let auxTouchDragActive = false;
let auxTouchIdentifier = null;
let auxTouchLastPoint = null;
let auxKpcPointerStart = { x: 0, y: 0 };
let auxKpcStartPosition = { left: 0, top: 0 };
let auxKpcPosition = { left: 0, top: 0 };
let auxKpcPullX = 0;
let auxKpcPullStartX = 0;
let auxKpcHasBeenPulled = false;
let auxKpcFullyExtracted = false;
let auxKpcFrontReady = false;
let auxKpcExtractStartCenterY = 0;
let auxKpcInitialLeft = 0;
let auxKpcOriginalRect = null;
let auxKpcFullExtractDistance = 0;
let auxKpcSize = { width: 0, height: 0 };
let auxKpcAspectRatio = 1;
let auxDockViewportOrigin = { left: 0, top: 0 };
let auxDragLayerViewportOrigin = { left: 0, top: 0 };
let auxChoukaPlayed = false;
let auxResultPlayed = false;
let auxReturning = false;
let sz2ReturnFallbackTimer = 0;
let sz2ReturnTransitionHandler = null;
let sz2ReturnToken = 0;
let syfgTimer = 0;

// mocha + charu 共用一个在第一阶段真实点击中解锁的 Web AudioContext。
// 两个关键音效的字节都带 build + session 参数并以 no-store 获取；同一 App 会话只使用这份确定的字节。
let criticalSfxContext = null;
const criticalSfxBuffers = { mocha: null, charu: null };
const criticalSfxDecodePromises = { mocha: null, charu: null };
const criticalSfxBytePromises = { mocha: null, charu: null };
const criticalSfxSources = { mocha: null, charu: null };
let charuPlaybackMode = null;
let charuPlaybackStartedAt = 0;
let charuPlaybackRunId = 0;

function getSessionAudioUrl(src, label) {
  const url = new URL(src, window.location.href);
  url.searchParams.set("sid", `${AUDIO_SESSION_ID}-${label}`);
  return url.href;
}

// 关键音效允许重试。旧版在页面启动时只 fetch 一次，首次网络/SW 抖动后会整轮 App 永久拿不到 buffer。
function getCriticalAudioBytes(name) {
  if (criticalSfxBytePromises[name]) return criticalSfxBytePromises[name];
  criticalSfxBytePromises[name] = fetch(getSessionAudioUrl(AUDIO_CONFIG[name], name), { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`${name} fetch ${response.status}`);
      return response.arrayBuffer();
    })
    .catch((error) => {
      console.warn(`${name} 关键音效读取失败，后续手势会重试：`, error);
      criticalSfxBytePromises[name] = null;
      return null;
    });
  return criticalSfxBytePromises[name];
}

function getCriticalSfxContext() {
  if (criticalSfxContext) return criticalSfxContext;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return null;
  try {
    criticalSfxContext = new AudioContextCtor();
  } catch (error) {
    console.warn("无法创建关键音效 AudioContext：", error);
    criticalSfxContext = null;
  }
  return criticalSfxContext;
}

function decodeCriticalSfx(name) {
  if (criticalSfxBuffers[name]) return Promise.resolve(criticalSfxBuffers[name]);
  if (criticalSfxDecodePromises[name]) return criticalSfxDecodePromises[name];
  const context = getCriticalSfxContext();
  if (!context) return Promise.resolve(null);

  criticalSfxDecodePromises[name] = getCriticalAudioBytes(name)
    .then((bytes) => {
      if (!bytes) return null;
      return new Promise((resolve, reject) => {
        context.decodeAudioData(bytes.slice(0), resolve, reject);
      });
    })
    .then((buffer) => {
      if (!buffer) {
        criticalSfxDecodePromises[name] = null;
        return null;
      }
      criticalSfxBuffers[name] = buffer;
      return buffer;
    })
    .catch((error) => {
      console.warn(`${name} Web Audio 解码失败，后续手势会重试：`, error);
      criticalSfxDecodePromises[name] = null;
      criticalSfxBytePromises[name] = null;
      return null;
    });
  return criticalSfxDecodePromises[name];
}

async function prepareCriticalSfxFromGesture(names = ["mocha", "charu"]) {
  const context = getCriticalSfxContext();
  if (!context) return false;
  try {
    if (context.state === "suspended") await context.resume();
  } catch (error) {
    console.warn("关键音效 AudioContext resume 失败：", error);
    return false;
  }
  await Promise.all(names.map((name) => decodeCriticalSfx(name)));
  return context.state === "running" && names.every((name) => Boolean(criticalSfxBuffers[name]));
}

function stopCriticalSfx(name) {
  const source = criticalSfxSources[name];
  if (!source) return;
  try { source.onended = null; source.stop(); } catch {}
  source.disconnect?.();
  criticalSfxSources[name] = null;
}

function startCriticalSfx(name, onended = null) {
  const context = criticalSfxContext;
  const buffer = criticalSfxBuffers[name];
  if (!context || context.state !== "running" || !buffer) return false;
  stopCriticalSfx(name);
  try {
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.onended = () => {
      if (criticalSfxSources[name] === source) criticalSfxSources[name] = null;
      source.disconnect?.();
      onended?.();
    };
    criticalSfxSources[name] = source;
    source.start(0);
    return true;
  } catch (error) {
    console.warn(`${name} Web Audio 播放失败：`, error);
    return false;
  }
}

let chakaSfxContext = null;
let chakaSfxBuffer = null;
let chakaSfxDecodePromise = null;
let chakaSfxBytePromise = null;
let chakaSfxSource = null;

function getChakaAudioBytes() {
  if (chakaSfxBytePromise) return chakaSfxBytePromise;
  chakaSfxBytePromise = fetch(AUDIO_CONFIG.chaka, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`chaka fetch ${response.status}`);
      return response.arrayBuffer();
    })
    .catch((error) => {
      console.warn("chaka 读取失败，后续手势会重试：", error);
      chakaSfxBytePromise = null;
      return null;
    });
  return chakaSfxBytePromise;
}

const kh1Audio = new Audio(AUDIO_CONFIG.kh1);
const ydMusicAudio = new Audio(AUDIO_CONFIG.ydmusic);
const mochaAudio = new Audio(AUDIO_CONFIG.mocha);
const choukaAudio = new Audio(AUDIO_CONFIG.chouka);
const chakaAudio = new Audio(AUDIO_CONFIG.chaka);
const huagai1Audio = new Audio(AUDIO_CONFIG.huagai1);
const huagai2Audio = new Audio(AUDIO_CONFIG.huagai2);
const guoAudio = new Audio(AUDIO_CONFIG.guo);
const huhuanAudio = new Audio(AUDIO_CONFIG.huhuan);
const jingshijieAudio = new Audio(AUDIO_CONFIG.jingshijie);
const timeoutAudio = new Audio(AUDIO_CONFIG.timeout);
const boxingAudio = new Audio(AUDIO_CONFIG.boxing);
const jianjiAudio = new Audio(AUDIO_CONFIG.jianji);
const chaoxiaoAudio = new Audio(AUDIO_CONFIG.chaoxiao);
const jiechuAudio = new Audio(AUDIO_CONFIG.jiechu);
const cardVoiceAudios = Object.fromEntries(
  Object.entries(AUDIO_CONFIG.cardVoices).map(([key, src]) => [key, new Audio(src)]),
);
const cardVoiceFollowUpAudios = Object.fromEntries(
  Object.entries(AUDIO_CONFIG.cardVoiceFollowUps).map(([key, src]) => [key, new Audio(src)]),
);

kh1Audio.preload = "auto";
ydMusicAudio.preload = "auto";
mochaAudio.preload = "auto";
choukaAudio.preload = "auto";
chakaAudio.preload = "auto";
huagai1Audio.preload = "auto";
huagai2Audio.preload = "auto";
guoAudio.preload = "auto";
huhuanAudio.preload = "auto";
jingshijieAudio.preload = "auto";
timeoutAudio.preload = "auto";
boxingAudio.preload = "auto";
jianjiAudio.preload = "auto";
chaoxiaoAudio.preload = "auto";
jiechuAudio.preload = "auto";
Object.values(cardVoiceAudios).forEach((audio) => { audio.preload = "auto"; });
Object.values(cardVoiceFollowUpAudios).forEach((audio) => { audio.preload = "auto"; });
[
  kh1Audio, ydMusicAudio, mochaAudio, choukaAudio, chakaAudio,
  huagai1Audio, huagai2Audio, guoAudio, huhuanAudio, jingshijieAudio, timeoutAudio,
  boxingAudio, jianjiAudio, chaoxiaoAudio, jiechuAudio,
  ...Object.values(cardVoiceAudios),
  ...Object.values(cardVoiceFollowUpAudios),
].forEach((audio) => audio.load());

function applyPhoneLayout() {
  // 背景覆盖完整动态视口；前景继续按 iPhone 16 Pro Max 的 440:956
  // 设计坐标等比缩放并居中，避免 Safari 地址栏改变高度时被拉伸。
  const targetRatio = PHONE_VIEWPORT.width / PHONE_VIEWPORT.height;
  const currentRatio = scene.clientWidth / scene.clientHeight;

  if (Math.abs(currentRatio - targetRatio) > 0.002) {
    console.warn("当前画布比例偏离 iPhone 16 Pro Max：", currentRatio);
  }

  const scale = Math.min(
    scene.clientWidth / SOURCE_SCENE.width,
    scene.clientHeight / SOURCE_SCENE.height,
  );
  sceneScale = scale;

  const { sequenceDuration, stageTwo, move, bg3, bg4, bg5, shatter, ws, sideButtons, centerButtons, auxDevice, beltLayers, card, beltGlow } = ANIMATION_CONFIG;

  scene.style.setProperty("--belt-width", `${SOURCE_BELT_WIDTH * scale}px`);
  scene.style.setProperty("--final-x", `${move.x * scale}px`);
  scene.style.setProperty("--final-y", `${move.y * scale}px`);
  scene.style.setProperty("--bg3-x", `${bg3.x * scale}px`);
  scene.style.setProperty("--bg3-y", `${bg3.y * scale}px`);
  scene.style.setProperty("--bg3-width", `${bg3.width}%`);
  scene.style.setProperty("--bg3-height-scale", String(bg3.height / 100));
  scene.style.setProperty("--bg3-duration", `${bg3.duration}s`);
  scene.style.setProperty("--bg4-spread", `${bg4.spread * scale}px`);
  scene.style.setProperty("--bg4-entry", `${bg4.entryDistance * scale}px`);
  scene.style.setProperty("--bg4-duration", `${bg4.duration}s`);
  scene.style.setProperty("--bg5-duration", `${bg5.duration}s`);
  scene.style.setProperty("--shatter-duration", `${shatter.duration}s`);
  scene.style.setProperty("--ws-x", `${ws.x * scale}px`);
  scene.style.setProperty("--ws-y", `${ws.y * scale}px`);
  scene.style.setProperty("--ws-card-width", `${ws.cardWidth * scale}px`);
  scene.style.setProperty("--ws-gap-x", `${ws.gapX * scale}px`);
  scene.style.setProperty("--ws-gap-y", `${ws.gapY * scale}px`);
  scene.style.setProperty("--ws-entry", `${ws.entryDistance * scale}px`);
  scene.style.setProperty("--ws-duration", `${ws.duration}s`);
  scene.style.setProperty("--side-buttons-x", `${sideButtons.x * scale}px`);
  scene.style.setProperty("--side-buttons-y", `${sideButtons.y * scale}px`);
  scene.style.setProperty("--side-button-size", `${sideButtons.size * scale}px`);
  scene.style.setProperty("--side-button-gap", `${sideButtons.gap * scale}px`);
  scene.style.setProperty("--center-buttons-x", `${centerButtons.x * scale}px`);
  scene.style.setProperty("--center-buttons-y", `${centerButtons.y * scale}px`);
  scene.style.setProperty("--center-button-1-x", `${centerButtons.button1.x * scale}px`);
  scene.style.setProperty("--center-button-1-y", `${centerButtons.button1.y * scale}px`);
  scene.style.setProperty("--center-button-1-size", `${centerButtons.button1.size * scale}px`);
  scene.style.setProperty("--center-button-2-x", `${centerButtons.button2.x * scale}px`);
  scene.style.setProperty("--center-button-2-y", `${centerButtons.button2.y * scale}px`);
  scene.style.setProperty("--center-button-2-size", `${centerButtons.button2.size * scale}px`);
  scene.style.setProperty("--center-button-3-x", `${centerButtons.button3.x * scale}px`);
  scene.style.setProperty("--center-button-3-y", `${centerButtons.button3.y * scale}px`);
  scene.style.setProperty("--center-button-3-size", `${centerButtons.button3.size * scale}px`);
  scene.style.setProperty("--bs-x", `${auxDevice.bs.x * scale}px`);
  scene.style.setProperty("--bs-y", `${auxDevice.bs.y * scale}px`);
  scene.style.setProperty("--bs-width", `${auxDevice.bs.width * scale}px`);

  // 蛇杖整体缩放只作用于蛇杖本体与卡槽，不改变 container 的整体落点和 slideX。
  // rotate 为整个蛇杖绕 container 基准点的整体旋转角度：负数逆时针，正数顺时针。
  const snakeScaleValue = Number(auxDevice.container.scale);
  const snakeScale = Number.isFinite(snakeScaleValue) && snakeScaleValue > 0 ? snakeScaleValue : 1;
  const snakeUnit = scale * snakeScale;
  const snakeRotateValue = Number(auxDevice.container.rotate);
  const snakeRotate = Number.isFinite(snakeRotateValue) ? snakeRotateValue : 0;
  const snakeRotateRad = snakeRotate * Math.PI / 180;
  const snakeRotateCos = Math.cos(snakeRotateRad);
  const snakeRotateSin = Math.sin(snakeRotateRad);
  const rotateSnakeOffset = (x = 0, y = 0) => ({
    x: x * snakeRotateCos - y * snakeRotateSin,
    y: x * snakeRotateSin + y * snakeRotateCos,
  });

  const sz1Offset = rotateSnakeOffset(auxDevice.sz1.x, auxDevice.sz1.y);
  const sz2Offset = rotateSnakeOffset(auxDevice.sz2.x, auxDevice.sz2.y);
  const sz2PopOffset = rotateSnakeOffset(0, auxDevice.sz2.popY || 0);
  const syfgOffset = rotateSnakeOffset(auxDevice.syfg.x, auxDevice.syfg.y);
  const cardSlotOffset = rotateSnakeOffset(auxDevice.cardSlot.x, auxDevice.cardSlot.y);

  scene.style.setProperty("--sz-container-x", `${(auxDevice.container.x || 0) * scale}px`);
  scene.style.setProperty("--sz-container-y", `${(auxDevice.container.y || 0) * scale}px`);
  scene.style.setProperty("--sz-slide-x", `${auxDevice.container.slideX * scale}px`);
  scene.style.setProperty("--sz-rotate", `${snakeRotate}deg`);
  scene.style.setProperty("--sz-duration", `${auxDevice.container.duration}s`);

  scene.style.setProperty("--sz1-x", `${sz1Offset.x * snakeUnit}px`);
  scene.style.setProperty("--sz1-y", `${sz1Offset.y * snakeUnit}px`);
  scene.style.setProperty("--sz1-width", `${auxDevice.sz1.width * snakeUnit}px`);

  scene.style.setProperty("--sz2-x", `${sz2Offset.x * snakeUnit}px`);
  scene.style.setProperty("--sz2-y", `${sz2Offset.y * snakeUnit}px`);
  scene.style.setProperty("--sz2-width", `${auxDevice.sz2.width * snakeUnit}px`);
  scene.style.setProperty("--sz2-pop-x", `${sz2PopOffset.x * snakeUnit}px`);
  scene.style.setProperty("--sz2-pop-y", `${sz2PopOffset.y * snakeUnit}px`);

  scene.style.setProperty("--syfg-x", `${syfgOffset.x * snakeUnit}px`);
  scene.style.setProperty("--syfg-y", `${syfgOffset.y * snakeUnit}px`);
  scene.style.setProperty("--syfg-width", `${auxDevice.syfg.width * snakeUnit}px`);
  scene.style.setProperty("--syfg-duration", `${auxDevice.syfg.duration}s`);
  scene.style.setProperty("--card-slot-x", `${cardSlotOffset.x * snakeUnit}px`);
  scene.style.setProperty("--card-slot-y", `${cardSlotOffset.y * snakeUnit}px`);
  scene.style.setProperty("--card-slot-width", `${auxDevice.cardSlot.width * snakeUnit}px`);
  scene.style.setProperty("--card-slot-height", `${auxDevice.cardSlot.height * snakeUnit}px`);
  // cardX / cardY 位于已经旋转后的卡槽内部坐标系，不再二次旋转。
  scene.style.setProperty("--card-slot-card-x", `${auxDevice.cardSlot.cardX * snakeUnit}px`);
  scene.style.setProperty("--card-slot-card-y", `${auxDevice.cardSlot.cardY * snakeUnit}px`);
  scene.style.setProperty("--card-slot-card-width", `${auxDevice.cardSlot.cardWidth * snakeUnit}px`);
  scene.classList.toggle("show-card-slot-debug", Boolean(auxDevice.cardSlot.showDebug));
  scene.classList.toggle("show-syfg-tuning", Boolean(auxDevice.syfg.showForTuning));
  scene.style.setProperty("--aux-ws-blur", `${auxDevice.wsBlur}px`);
  scene.style.setProperty("--card-start-x", `${card.start.x * scale}px`);
  scene.style.setProperty("--card-start-y", `${card.start.y * scale}px`);
  scene.style.setProperty("--card-drag-x", `${cardDragPosition.x * scale}px`);
  scene.style.setProperty("--card-drag-y", `${cardDragPosition.y * scale}px`);
  // 内层卡盒在腰带上移后接棒；减去 move 可让接棒前后保持同一屏幕坐标。
  scene.style.setProperty("--card-nested-start-x", `${(card.start.x - move.x) * scale}px`);
  scene.style.setProperty("--card-nested-start-y", `${(card.start.y - move.y) * scale}px`);
  scene.style.setProperty("--card-insert-x", `${card.insert.x * scale}px`);
  scene.style.setProperty("--card-insert-y", `${card.insert.y * scale}px`);
  scene.style.setProperty("--card-width", `${card.width * scale}px`);
  scene.style.setProperty("--card-insert-duration", `${card.duration}s`);
  scene.style.setProperty("--kpc-x", `${card.layers.middle.x * scale}px`);
  scene.style.setProperty("--kpc-y", `${card.layers.middle.y * scale}px`);
  scene.style.setProperty("--kpc-pull-x", `${auxKpcPullX * scale}px`);
  scene.style.setProperty("--kpc-width", `${card.layers.middle.width * scale}px`);
  scene.style.setProperty("--card-extract-x", `${cardExtractPosition.x * scale}px`);
  scene.style.setProperty("--card-extract-y", `${cardExtractPosition.y * scale}px`);
  scene.style.setProperty("--khfg-x", `${card.layers.glow.x * scale}px`);
  scene.style.setProperty("--khfg-y", `${card.layers.glow.y * scale}px`);
  scene.style.setProperty("--khfg-width", `${card.layers.glow.width * scale}px`);
  scene.style.setProperty("--khzd-x", `${card.layers.cover.x * scale}px`);
  scene.style.setProperty("--khzd-y", `${card.layers.cover.y * scale}px`);
  scene.style.setProperty("--khzd-width", `${card.layers.cover.width * scale}px`);
  scene.style.setProperty("--ydfg-x", `${beltGlow.x * scale}px`);
  scene.style.setProperty("--ydfg-y", `${beltGlow.y * scale}px`);
  scene.style.setProperty("--ydfg-width", `${beltGlow.width * scale}px`);

  belt.style.setProperty("--sequence-duration", `${sequenceDuration}s`);
  belt.style.setProperty("--stage-two-wave-duration", `${stageTwo.backHold}s`);
  belt.style.setProperty("--stage-two-flip-duration", `${stageTwo.flipDuration}s`);
  belt.style.setProperty("--move-x", `${move.x * scale}px`);
  belt.style.setProperty("--move-y", `${move.y * scale}px`);
  belt.style.setProperty("--move-duration", `${move.duration}s`);
  belt.style.setProperty("--up-x", `${beltLayers.up.x * scale}px`);
  belt.style.setProperty("--up-y", `${beltLayers.up.y * scale}px`);
  belt.style.setProperty("--down-x", `${beltLayers.down.x * scale}px`);
  belt.style.setProperty("--down-y", `${beltLayers.down.y * scale}px`);
}

function runWaterRipple(startTime) {
  const waterPhaseDuration = STAGE_TWO_WAVE_DURATION * 1000;
  lastRippleUpdate = 0;

  function update(now) {
    // iPhone 上将昂贵的 SVG 位移滤镜限制到约 30fps，腰带主体动画仍保持原帧率。
    if (lastRippleUpdate && now - lastRippleUpdate < 33) {
      rippleAnimationFrame = requestAnimationFrame(update);
      return;
    }
    lastRippleUpdate = now;

    const progress = Math.min(1, (now - startTime) / waterPhaseDuration);
    const fade = 1 - progress;
    const pulse = 0.72 + Math.sin(progress * Math.PI * 10) * 0.28;
    const strength = Math.max(0, WATER_MAX_DISPLACEMENT * fade * pulse);
    const horizontalFrequency = 0.007 + Math.sin(progress * Math.PI * 5) * 0.0022;
    const verticalFrequency = 0.023 + Math.cos(progress * Math.PI * 6) * 0.006;

    waterDisplacement.setAttribute("scale", strength.toFixed(2));
    waterNoise.setAttribute(
      "baseFrequency",
      `${horizontalFrequency.toFixed(4)} ${verticalFrequency.toFixed(4)}`,
    );

    if (progress < 1 && belt.classList.contains("is-stage-two")) {
      rippleAnimationFrame = requestAnimationFrame(update);
    } else {
      waterDisplacement.setAttribute("scale", "0");
    }
  }

  rippleAnimationFrame = requestAnimationFrame(update);
}

function clearSceneTimers() {
  sceneTimers.forEach((timer) => clearTimeout(timer));
  sceneTimers = [];
}

function stopAudio(audio) {
  audio.pause();
  try {
    audio.currentTime = 0;
  } catch {
    // Safari 在音频元数据尚未载入时可能不允许设置 currentTime。
  }
}

function playAudio(audio) {
  stopAudio(audio);
  try {
    const playPromise = audio.play();
    return playPromise instanceof Promise ? playPromise : Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

function primeAudio(audio, isInUse) {
  audio.muted = true;
  let playPromise;
  try {
    playPromise = audio.play();
  } catch (error) {
    audio.muted = false;
    return Promise.resolve(false);
  }

  if (!(playPromise instanceof Promise)) {
    if (!isInUse()) {
      audio.pause();
      audio.currentTime = 0;
    }
    audio.muted = false;
    return Promise.resolve(true);
  }

  return playPromise
    .then(() => {
      if (!isInUse()) {
        audio.pause();
        audio.currentTime = 0;
      }
      audio.muted = false;
      return true;
    })
    .catch(() => {
      audio.muted = false;
      return false;
    });
}


// 卡盒每次按下只触发一次 mocha。正常情况下它已在第一阶段点击中完成 Context 解锁和解码，
// 所以第二阶段第一次拖动不再同时承担“解锁 + 解码 + 播放”三件事。
function playMochaOnCardBoxPress() {
  // 已解码时直接走 Web Audio，延迟最低。
  if (startCriticalSfx("mocha")) return;

  // 首次尚未解码时，HTMLAudio.play() 必须在当前真实 pointerdown 调用栈里立即执行。
  // 不能等异步 decode 完成后再 play，否则 iPhone PWA 可能把它判定为脱离用户手势。
  mochaAudio.muted = false;
  playAudio(mochaAudio).catch((error) => {
    console.warn("mocha HTMLAudio 首次播放失败：", error);
  });

  // 同时后台准备 Web Audio，下一次按卡盒直接使用 buffer；本次不再二次补播，避免重复声音。
  prepareCriticalSfxFromGesture(["mocha"]).catch((error) => {
    console.warn("mocha Web Audio 准备失败：", error);
  });
}

function stopMochaAudioCompletely() {
  stopCriticalSfx("mocha");
  stopAudio(mochaAudio);
}

function stopCharuPlayback() {
  charuPlaybackRunId = 0;
  charuPlaybackMode = null;
  charuPlaybackStartedAt = 0;
  clearTimeout(insertionAudioFallback);
  insertionAudioFallback = 0;
  stopCriticalSfx("charu");
}

function getCharuPlaybackTime(runId) {
  if (
    runId !== activeInsertionRunId ||
    runId !== charuPlaybackRunId ||
    charuPlaybackMode !== "webaudio" ||
    !criticalSfxContext
  ) return -1;
  return Math.max(0, criticalSfxContext.currentTime - charuPlaybackStartedAt);
}


function getChakaAudioContext() {
  if (chakaSfxContext) return chakaSfxContext;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return null;
  try {
    chakaSfxContext = new AudioContextCtor();
  } catch (error) {
    console.warn("无法创建 chaka Web AudioContext：", error);
    chakaSfxContext = null;
  }
  return chakaSfxContext;
}

async function prepareChakaSfxFromGesture() {
  const context = getChakaAudioContext();
  if (!context) return false;

  try {
    if (context.state === "suspended") await context.resume();
  } catch (error) {
    console.warn("chaka AudioContext resume 失败：", error);
    return false;
  }

  if (chakaSfxBuffer) return context.state === "running";
  if (!chakaSfxDecodePromise) {
    chakaSfxDecodePromise = getChakaAudioBytes()
      .then((bytes) => {
        if (!bytes) {
          chakaSfxDecodePromise = null;
          return null;
        }
        return new Promise((resolve, reject) => {
          context.decodeAudioData(bytes.slice(0), resolve, reject);
        });
      })
      .then((buffer) => {
        chakaSfxBuffer = buffer;
        return buffer;
      })
      .catch((error) => {
        console.warn("chaka Web Audio 解码失败，后续手势会重试：", error);
        chakaSfxDecodePromise = null;
        chakaSfxBytePromise = null;
        return null;
      });
  }

  await chakaSfxDecodePromise;
  return Boolean(chakaSfxBuffer && context.state === "running");
}

function startChakaBufferNow() {
  const context = chakaSfxContext;
  if (!context || context.state !== "running" || !chakaSfxBuffer) return false;
  try {
    if (chakaSfxSource) {
      try { chakaSfxSource.stop(); } catch {}
      chakaSfxSource.disconnect?.();
    }
    const source = context.createBufferSource();
    source.buffer = chakaSfxBuffer;
    source.connect(context.destination);
    source.onended = () => {
      if (chakaSfxSource === source) chakaSfxSource = null;
      source.disconnect?.();
    };
    chakaSfxSource = source;
    source.start(0);
    return true;
  } catch (error) {
    console.warn("chaka Web Audio 播放失败：", error);
    return false;
  }
}

function playChakaReliable() {
  if (startChakaBufferNow()) return Promise.resolve(true);

  // chaka 触发点本身就在真实拖动 pointermove 中。首次 buffer 未就绪时必须现在就调用 play()，
  // 不能等异步 decode 结束后才播放，否则 iPhone PWA 可能丢失用户手势权限。
  const immediatePlay = playAudio(chakaAudio).then(() => true);
  prepareChakaSfxFromGesture().catch((error) => {
    console.warn("chaka Web Audio 后台准备失败：", error);
  });
  return immediatePlay;
}

function setCardDragPosition(x, y) {
  cardDragPosition = { x, y };
  scene.style.setProperty("--card-drag-x", `${x * sceneScale}px`);
  scene.style.setProperty("--card-drag-y", `${y * sceneScale}px`);
}

function setCardExtractPosition(x, y) {
  cardExtractPosition = { x, y };
  scene.style.setProperty("--card-extract-x", `${x * sceneScale}px`);
  scene.style.setProperty("--card-extract-y", `${y * sceneScale}px`);
}

function parseShatterPolygon(polygon, rect) {
  const body = polygon.slice(polygon.indexOf("(") + 1, polygon.lastIndexOf(")"));
  return body.split(",").map((pair) => {
    const [x, y] = pair.trim().split(/\s+/);
    return {
      x: rect.x + (parseFloat(x) / 100) * rect.width,
      y: rect.y + (parseFloat(y) / 100) * rect.height,
    };
  });
}

function effectiveOpacity(element) {
  let opacity = 1;
  let node = element;
  while (node && node !== scene) {
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return 0;
    opacity *= Number.parseFloat(style.opacity || "1");
    node = node.parentElement;
  }
  return opacity;
}

function drawDomImageToCanvas(ctx, image, sceneRect) {
  if (!image?.complete || !image.naturalWidth || !image.naturalHeight) return;
  const rect = image.getBoundingClientRect();
  if (rect.width < 0.5 || rect.height < 0.5) return;
  const alpha = effectiveOpacity(image);
  if (alpha <= 0.001) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    image,
    rect.left - sceneRect.left,
    rect.top - sceneRect.top,
    rect.width,
    rect.height,
  );
  ctx.restore();
}

function buildShatterSnapshot() {
  const sceneRect = scene.getBoundingClientRect();
  const cssWidth = Math.max(1, sceneRect.width);
  const cssHeight = Math.max(1, sceneRect.height);
  // iPhone / PWA 优先：碎裂只有不到 1 秒，宁可牺牲一点 Retina 清晰度也不要触发 WebKit Canvas 内存回收。
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
  const dpr = (isIOS || isStandalone) ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

  const source = document.createElement("canvas");
  source.width = Math.round(cssWidth * dpr);
  source.height = Math.round(cssHeight * dpr);
  const sourceCtx = source.getContext("2d", { alpha: true });
  if (!sourceCtx) return null;
  sourceCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  sourceCtx.clearRect(0, 0, cssWidth, cssHeight);

  const targets = [];

  if (scene.classList.contains("show-bg3")) {
    const bg3Image = characterReveal.querySelector(".character-image");
    const rect = characterReveal.getBoundingClientRect();
    drawDomImageToCanvas(sourceCtx, bg3Image, sceneRect);
    targets.push({
      kind: "bg3",
      rect: {
        x: rect.left - sceneRect.left,
        y: rect.top - sceneRect.top,
        width: rect.width,
        height: rect.height,
      },
    });
  }

  // 只绘制腰带本体图片，明确排除内部卡盒；卡盒拖出后留在最前景。
  const beltRect = beltArt.getBoundingClientRect();
  [...beltArt.querySelectorAll("img")]
    .filter((image) => !image.closest("#cardBox"))
    .forEach((image) => drawDomImageToCanvas(sourceCtx, image, sceneRect));
  targets.push({
    kind: "belt",
    rect: {
      x: beltRect.left - sceneRect.left,
      y: beltRect.top - sceneRect.top,
      width: beltRect.width,
      height: beltRect.height,
    },
  });

  return { source, sceneRect, cssWidth, cssHeight, dpr, targets };
}

function createCanvasShard(targetRect, polygon, motion, index) {
  const absolutePoints = parseShatterPolygon(polygon, targetRect);
  const centroid = absolutePoints.reduce(
    (acc, point) => ({
      x: acc.x + point.x / absolutePoints.length,
      y: acc.y + point.y / absolutePoints.length,
    }),
    { x: 0, y: 0 },
  );

  return {
    points: absolutePoints,
    cx: centroid.x,
    cy: centroid.y,
    dx: motion[0] * sceneScale,
    dy: motion[1] * sceneScale,
    rz: motion[2] * (Math.PI / 180),
    delay: index * 8,
  };
}

function drawCanvasCracks(ctx, targetRect, progress) {
  if (progress >= 0.34) return;
  const flash = progress < 0.1
    ? progress / 0.1
    : Math.max(0, 1 - (progress - 0.1) / 0.24);
  if (flash <= 0) return;

  const cx = targetRect.x + targetRect.width * 0.52;
  const cy = targetRect.y + targetRect.height * 0.5;
  const rays = [
    [-0.48, -0.36], [-0.2, -0.52], [0.16, -0.48], [0.46, -0.28],
    [0.5, 0.14], [0.27, 0.46], [-0.12, 0.5], [-0.43, 0.28],
  ];

  ctx.save();
  ctx.globalAlpha = flash * 0.92;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = Math.max(0.8, 1.25 * sceneScale);
  ctx.lineCap = "round";
  rays.forEach(([rx, ry], index) => {
    const ex = cx + targetRect.width * rx;
    const ey = cy + targetRect.height * ry;
    const mx = cx + (ex - cx) * 0.48 + (index % 2 ? 7 : -7) * sceneScale;
    const my = cy + (ey - cy) * 0.48 + (index % 3 - 1) * 8 * sceneScale;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(mx, my);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    if (index % 2 === 0) {
      ctx.globalAlpha = flash * 0.55;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + (index < 4 ? 18 : -18) * sceneScale, my + 12 * sceneScale);
      ctx.stroke();
      ctx.globalAlpha = flash * 0.92;
    }
  });
  ctx.restore();
}

function clearMirrorShatter() {
  clearTimeout(shatterCleanupTimer);
  shatterCleanupTimer = 0;
  if (shatterAnimationFrame) {
    cancelAnimationFrame(shatterAnimationFrame);
    shatterAnimationFrame = 0;
  }
  shatterCanvas.classList.remove("is-active");
  const ctx = shatterCanvas.getContext("2d");
  ctx?.clearRect(0, 0, shatterCanvas.width, shatterCanvas.height);
  scene.classList.remove("is-shattering");
  belt.classList.remove("is-shatter-hidden");
}

function startMirrorShatter() {
  if (!flowStarted || scene.classList.contains("is-shattering")) return;

  const snapshot = buildShatterSnapshot();
  if (!snapshot) {
    // Canvas 真不可用时才退回普通隐藏，但不让流程卡死。
    scene.classList.remove("show-bg3", "show-final-background");
    belt.classList.add("is-shatter-hidden");
    return;
  }

  clearTimeout(shatterCleanupTimer);
  if (shatterAnimationFrame) cancelAnimationFrame(shatterAnimationFrame);

  const { source, cssWidth, cssHeight, dpr, targets } = snapshot;
  shatterCanvas.width = Math.max(1, Math.round(cssWidth * dpr));
  shatterCanvas.height = Math.max(1, Math.round(cssHeight * dpr));
  const ctx = shatterCanvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 关键修复：这里只保存几何数据，不再为 24 块碎片各创建一个离屏 Canvas。
  // iPhone PWA 运行时常驻仅 source + shatterCanvas 两块画布。
  const shards = targets.flatMap((target) =>
    SHATTER_POLYGONS.map((polygon, index) =>
      createCanvasShard(target.rect, polygon, SHATTER_MOTION[index], index),
    ),
  );

  const durationMs = ANIMATION_CONFIG.shatter.duration * 1000;
  scene.classList.add("is-shattering");
  shatterCanvas.classList.add("is-active");

  // jiechu 与破碎动画绑定：只有破碎 Canvas 已成功建立并正式进入 is-shattering 时才播放。
  // 不再绑定“卡盒拖出完成”事件。
  playAudio(jiechuAudio).catch((error) => {
    console.warn("破碎动画 jiechu 音效播放失败：", error);
  });

  function drawFrame(elapsed) {
    const overall = Math.min(1, Math.max(0, elapsed / durationMs));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    shards.forEach((shard) => {
      const local = Math.max(0, Math.min(1, (elapsed - shard.delay) / durationMs));
      const eased = 1 - Math.pow(1 - local, 3);
      const alpha = 1 - Math.pow(local, 1.55);
      const scale = 1.015 - eased * 0.23;

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.translate(shard.cx + shard.dx * eased, shard.cy + shard.dy * eased);
      ctx.rotate(shard.rz * eased);
      ctx.scale(scale, scale);
      ctx.translate(-shard.cx, -shard.cy);

      ctx.beginPath();
      shard.points.forEach((point, pointIndex) => {
        if (pointIndex === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(source, 0, 0, cssWidth, cssHeight);
      ctx.restore();
    });

    targets.forEach((target) => drawCanvasCracks(ctx, target.rect, overall));
  }

  // 先把完整快照画到 Canvas。此时真实 bg3/腰带还在，因此即使 WebKit 首帧延迟也不会出现“直接重置”的空窗。
  drawFrame(0);

  let startedAt = 0;
  const render = (now) => {
    if (!scene.classList.contains("is-shattering")) {
      shatterAnimationFrame = 0;
      return;
    }

    if (!startedAt) startedAt = now;
    const elapsed = now - startedAt;
    drawFrame(elapsed);

    if (elapsed < durationMs) {
      shatterAnimationFrame = requestAnimationFrame(render);
      return;
    }

    shatterAnimationFrame = 0;
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    shatterCanvas.classList.remove("is-active");
    scene.classList.remove("is-shattering");
  };

  // 下一帧才把真实对象隐藏并恢复默认背景。这样 Canvas 至少已经成功提交过一帧。
  shatterAnimationFrame = requestAnimationFrame(() => {
    scene.classList.remove("show-bg3", "show-final-background");
    belt.classList.add("is-shatter-hidden");
    shatterAnimationFrame = requestAnimationFrame(render);
  });

  shatterCleanupTimer = setTimeout(() => {
    if (shatterAnimationFrame) {
      cancelAnimationFrame(shatterAnimationFrame);
      shatterAnimationFrame = 0;
    }
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    shatterCanvas.classList.remove("is-active");
    scene.classList.remove("is-shattering");
    shatterCleanupTimer = 0;
  }, durationMs + 260);
}

function syncCenterActionButtons() {
  const cardStillInBelt = cardBox.classList.contains("is-inserted") || cardBox.classList.contains("is-inserting");
  const shouldShow = Boolean(
    centerActionsUnlocked &&
    flowStarted &&
    cardStillInBelt &&
    !auxOpen &&
    !isExtracting &&
    !cardWasExtracted
  );
  scene.classList.toggle("show-center-actions", shouldShow);
}

function setCenterActionsUnlocked(unlocked) {
  centerActionsUnlocked = Boolean(unlocked);
  syncCenterActionButtons();
}

function hideWsPanel() {
  scene.classList.remove("show-ws");
  wsButtons.forEach((button) => button.classList.remove("is-selected"));
  selectedWs = null;
  selectedWsAspectRatio = null;
  cardVoiceRunToken += 1;
  cardBox.classList.remove("is-kpc-ejected");
  if (auxOpen || auxArmed || auxCardInserted || auxKpcHasBeenPulled || auxKpcDragging) resetAuxDevice();
}

function showWsPanel() {
  if (!flowStarted) return;
  scene.classList.add("show-ws");
}

function enableCardExtraction() {
  if (!flowStarted || (!cardBox.classList.contains("is-inserted") && !cardBox.classList.contains("is-inserting"))) return;
  // 即使 charu 极短、刚好早于插卡 transition 的兜底计时结束，也直接把卡盒锁定到卡槽位置。
  cardBox.classList.remove("is-inserting", "is-handoff");
  cardBox.classList.add("is-inserted");
  extractReady = true;
  isExtracting = false;
  extractPointerId = null;
  setCardExtractPosition(0, 0);
  cardBox.classList.add("is-extractable");
}

function updateSelectedWsAspectRatio(button) {
  const image = button?.querySelector("img");
  if (!image) {
    selectedWsAspectRatio = null;
    return;
  }

  const applyNaturalRatio = () => {
    if (button.dataset.ws !== String(selectedWs)) return;
    if (image.naturalWidth > 0 && image.naturalHeight > 0) {
      selectedWsAspectRatio = image.naturalWidth / image.naturalHeight;
    }
  };

  applyNaturalRatio();
  if (!selectedWsAspectRatio) {
    image.decode?.().then(applyNaturalRatio).catch(() => undefined);
  }
}

function selectWsCard(event) {
  if (!flowStarted || !scene.classList.contains("show-ws")) return;
  const button = event.currentTarget;
  selectedWs = button.dataset.ws;
  selectedWsAspectRatio = null;
  updateSelectedWsAspectRatio(button);
  wsButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
  // 选卡只记录卡种与正面真实宽高比，不再自动把腰带里的 KPC 向左推出。
  cardBox.classList.remove("is-kpc-ejected");
}

async function playSelectedCardVoiceWithSyfg() {
  const cardId = selectedWs ? String(selectedWs) : "";
  const audio = cardId ? cardVoiceAudios[cardId] || null : null;
  const followUpAudio = cardId ? cardVoiceFollowUpAudios[cardId] || null : null;
  const runToken = ++cardVoiceRunToken;

  // 每次新读卡先停止所有上一轮基础/追加音效。旧 ended listener 即使晚到也会被 token 拦住。
  Object.values(cardVoiceAudios).forEach(stopAudio);
  Object.values(cardVoiceFollowUpAudios).forEach(stopAudio);

  clearTimeout(syfgTimer);
  syfgTimer = 0;
  syfgImage?.classList.remove("is-active");

  if (!audio) return;

  const detachBaseListeners = () => {
    audio.removeEventListener("ended", handleBaseVoiceEnded);
    audio.removeEventListener("error", handleBaseVoiceError);
  };

  const cleanupCurrentRun = () => {
    detachBaseListeners();
    if (runToken === cardVoiceRunToken) syfgImage?.classList.remove("is-active");
  };

  const handleBaseVoiceEnded = () => {
    if (runToken !== cardVoiceRunToken) {
      detachBaseListeners();
      return;
    }
    cleanupCurrentRun();
    // WS1：j→jianjianglin；WS3：f→shejiao；WS4：l→longjiao；WS5：f→bsj。追加音效只在基础音效 ended 后开始。
    if (followUpAudio) {
      playAudio(followUpAudio).catch((error) => {
        console.warn(`WS${cardId} 追加音效播放失败：`, error);
      });
    }
  };

  const handleBaseVoiceError = () => {
    if (runToken !== cardVoiceRunToken) {
      detachBaseListeners();
      return;
    }
    cleanupCurrentRun();
  };

  audio.addEventListener("ended", handleBaseVoiceEnded, { once: true });
  audio.addEventListener("error", handleBaseVoiceError, { once: true });

  try {
    await playAudio(audio);
    if (runToken !== cardVoiceRunToken) return;
    // 只有基础卡片音效真正开始播放后才显示 syfg。
    syfgImage?.classList.add("is-active");
  } catch (error) {
    cleanupCurrentRun();
    console.warn(`WS${cardId} 对应卡片音效播放失败：`, error);
  }
}


function setAuxKpcPosition(left, top) {
  auxKpcPosition = { left, top };
  if (!auxTransferCard) return;
  // PWA 优先：拖动只更新 transform，不再每帧修改 left/top 触发布局重排。
  auxTransferCard.style.setProperty("--aux-card-x", `${left}px`);
  auxTransferCard.style.setProperty("--aux-card-y", `${top}px`);
  syncAuxCardHitDebug();
}

function setAuxKpcPullX(x) {
  auxKpcPullX = Math.min(0, x);
  scene.style.setProperty("--kpc-pull-x", `${auxKpcPullX * sceneScale}px`);
}

function stopAuxKpcDrag(pointerId = null) {
  if (!auxKpcDragging) return;
  if (pointerId !== null && auxKpcPointerId !== null && pointerId !== auxKpcPointerId) return;

  // PWA / iPhone Safari：每一轮手势由真正被按下的元素自己持有 capture。
  // 抽卡轮由 kpcLayer 持有；松手后再拖正面卡则由 auxTransferCard 持有。
  // 同一轮手势绝不中途换 capture，避免快速 release -> scene recapture 造成延迟。
  const activeId = auxKpcPointerId;
  const captureTarget = auxKpcCaptureTarget;
  if (activeId !== null && captureTarget?.hasPointerCapture?.(activeId)) {
    try {
      captureTarget.releasePointerCapture(activeId);
    } catch (error) {
      // pointercancel 后 Safari 可能已经自动释放，无需重复抛错。
    }
  }

  const endedPointerId = auxKpcPointerId;
  auxKpcDragging = false;
  auxKpcPointerId = null;
  auxKpcCaptureTarget = null;
  auxTransferCard?.classList.remove("is-dragging");

  if (typeof endedPointerId === "string" && endedPointerId.startsWith("touch:")) {
    auxTouchDragActive = false;
    auxTouchIdentifier = null;
  }
}

function resetAuxDevice(options = {}) {
  cancelSz2ReturnWait();
  clearTimeout(syfgTimer);
  syfgTimer = 0;
  stopAuxKpcDrag(auxKpcPointerId);
  auxOpen = false;
  auxArmed = false;
  auxCardInserted = false;
  auxKpcHasBeenPulled = false;
  auxKpcFullyExtracted = false;
  auxKpcFrontReady = false;
  auxKpcExtractStartCenterY = 0;
  auxKpcInitialLeft = 0;
  auxKpcOriginalRect = null;
  auxKpcFullExtractDistance = 0;
  auxKpcSize = { width: 0, height: 0 };
  auxKpcAspectRatio = 1;
  auxDockViewportOrigin = { left: 0, top: 0 };
  auxDragLayerViewportOrigin = { left: 0, top: 0 };
  auxKpcPullX = 0;
  auxKpcPullStartX = 0;
  setAuxKpcPullX(0);
  auxChoukaPlayed = false;
  auxResultPlayed = false;
  auxKpcPosition = { left: 0, top: 0 };
  scene.classList.remove("is-aux-open", "is-aux-armed", "is-aux-card-inserted", "is-aux-playing");
  auxDock?.classList.remove("is-open", "is-armed", "is-card-inserted", "is-playing");
  auxTransferCard?.classList.remove("is-visible", "is-dragging", "is-inserted", "is-fully-extracted", "is-consumed");
  cardDragLayer?.classList.remove("is-active");
  auxCardHitDebug?.classList.remove("is-visible");
  hideInsertedCardInSlot();
  sz2Button?.classList.remove("is-result-ready");
  auxCardCoverMask?.classList.remove("is-visible");
  if (auxTransferCardImage) auxTransferCardImage.src = IMAGE_REFRESH.kpc;
  syfgImage?.classList.remove("is-active");
  if (auxTransferCard) {
    auxTransferCard.style.removeProperty("--aux-card-x");
    auxTransferCard.style.removeProperty("--aux-card-y");
    auxTransferCard.style.removeProperty("width");
    auxTransferCard.style.removeProperty("height");
    }
  if (auxCardCoverMask) {
    auxCardCoverMask.style.removeProperty("left");
    auxCardCoverMask.style.removeProperty("top");
    auxCardCoverMask.style.removeProperty("width");
    auxCardCoverMask.style.removeProperty("height");
  }
  if (!options.keepKpcHidden) cardBox.classList.remove("is-kpc-aux-hidden");
  syncCenterActionButtons();
}

function toggleAuxDock(event) {
  event?.preventDefault();
  event?.stopPropagation();
  // 必须先选中一张下方卡，BS 才开启对应卡种的流程。
  if (!flowStarted || !scene.classList.contains("show-ws") || !selectedWs) return;

  if (auxOpen) {
    resetAuxDevice();
    return;
  }

  auxOpen = true;
  syncCenterActionButtons();
  auxArmed = false;
  auxCardInserted = false;
  auxKpcHasBeenPulled = false;
  auxKpcFullyExtracted = false;
  auxKpcOriginalRect = null;
  setAuxKpcPullX(0);
  auxKpcFrontReady = false;
  auxChoukaPlayed = false;
  auxResultPlayed = false;
  scene.classList.remove("is-aux-playing");
  auxDock?.classList.remove("is-playing");
  scene.classList.add("is-aux-open");
  auxDock?.classList.add("is-open");
}

function cancelSz2ReturnWait() {
  sz2ReturnToken += 1;
  auxReturning = false;
  clearTimeout(sz2ReturnFallbackTimer);
  sz2ReturnFallbackTimer = 0;
  if (sz2ReturnTransitionHandler && sz2Image) {
    sz2Image.removeEventListener("transitionend", sz2ReturnTransitionHandler);
    sz2Image.removeEventListener("webkitTransitionEnd", sz2ReturnTransitionHandler);
  }
  sz2ReturnTransitionHandler = null;
}

function waitForSz2Return() {
  cancelSz2ReturnWait();
  auxReturning = true;
  const token = sz2ReturnToken;

  const finish = () => {
    if (token !== sz2ReturnToken || !auxReturning) return;
    requestAnimationFrame(() => {
      if (token !== sz2ReturnToken || !auxReturning) return;
      cancelSz2ReturnWait();
    });
  };

  sz2ReturnTransitionHandler = (event) => {
    if (event.target !== sz2Image || event.propertyName !== "transform") return;
    finish();
  };

  sz2Image?.addEventListener("transitionend", sz2ReturnTransitionHandler);
  sz2Image?.addEventListener("webkitTransitionEnd", sz2ReturnTransitionHandler);

  // iPhone / PWA 兜底：极少数 WebKit 情况下 transitionend 可能缺失。
  const durationMs = Math.max(0, Number(ANIMATION_CONFIG.auxDevice.container.duration || 0.42) * 1000);
  sz2ReturnFallbackTimer = window.setTimeout(finish, durationMs + 140);
}

function handleSz1Click(event) {
  event?.preventDefault();
  event?.stopPropagation();
  if (!flowStarted || !auxOpen || auxReturning || auxArmed) return;
  prepareChakaSfxFromGesture().catch(() => undefined);

  // 蛇杖第一步：点击遮挡层 sz1，让最底层 sz2 弹出，并同步触发 huagai1。
  auxArmed = true;
  auxResultPlayed = false;
  scene.classList.remove("is-aux-playing");
  auxDock?.classList.remove("is-playing");
  scene.classList.add("is-aux-armed");
  auxDock?.classList.add("is-armed");
  playAudio(huagai1Audio).catch((error) => {
    console.warn("蛇杖 sz1 / huagai1 音效播放失败：", error);
  });
}

function handleSz2Click(event) {
  event?.preventDefault();
  event?.stopPropagation();
  if (!flowStarted || !auxOpen || !auxArmed || auxReturning) return;

  const hadInsertedCard = auxCardInserted;
  auxArmed = false;
  auxCardInserted = false;
  scene.classList.remove("is-aux-armed", "is-aux-card-inserted");
  auxDock?.classList.remove("is-armed", "is-card-inserted");
  sz2Button?.classList.remove("is-result-ready");

  // 蛇杖第二步：
  // 没有插卡时，点击 sz2 与 sz1 一样播放 huagai1；
  // 只有蛇杖中真正有卡片时，点击 sz2 才播放 huagai2。
  const sz2Audio = hadInsertedCard ? huagai2Audio : huagai1Audio;
  const sz2AudioName = hadInsertedCard ? "huagai2" : "huagai1";
  playAudio(sz2Audio).catch((error) => {
    console.warn(`蛇杖 sz2 / ${sz2AudioName} 音效播放失败：`, error);
  });


  // 只有真正插入卡片后，点击 sz2 才显示 syfg。
  // syfg 的显示与 OUJA 的 lyfg 规则一致：卡片基础音效开始时出现，音效 ended 时消失。
  if (hadInsertedCard && selectedWs) {
    auxResultPlayed = true;
    scene.classList.add("is-aux-playing");
    auxDock?.classList.add("is-playing");
    playSelectedCardVoiceWithSyfg();
    auxTransferCard?.classList.add("is-consumed");
    cardDragLayer?.classList.remove("is-active");
    auxTransferCard?.classList.remove("is-inserted");
    hideInsertedCardInSlot();
  } else {
    auxResultPlayed = false;
    scene.classList.remove("is-aux-playing");
    auxDock?.classList.remove("is-playing");
    syfgImage?.classList.remove("is-active");
  }

  waitForSz2Return();
}

function getSelectedWsImageSrc() {
  if (!selectedWs) return null;
  const button = wsButtons.find((item) => item.dataset.ws === String(selectedWs));
  return button?.querySelector("img")?.getAttribute("src") || null;
}

function getSelectedWsAspectRatio() {
  if (Number.isFinite(selectedWsAspectRatio) && selectedWsAspectRatio > 0) {
    return selectedWsAspectRatio;
  }
  if (!selectedWs) return null;
  const button = wsButtons.find((item) => item.dataset.ws === String(selectedWs));
  const image = button?.querySelector("img");
  if (image?.naturalWidth > 0 && image.naturalHeight > 0) {
    selectedWsAspectRatio = image.naturalWidth / image.naturalHeight;
    return selectedWsAspectRatio;
  }
  return null;
}

function handoffAuxKpcToFloatingCard(event) {
  if (!auxTransferCard || !kpcLayer || !auxKpcOriginalRect || auxKpcFullyExtracted) return false;

  // v96：浮动卡从页面初始化开始就是 cardDragLayer 的固定子元素。
  // 100% 抽出时只切换视觉与坐标，不再在活跃触摸期间 reparent DOM。

  // pointermove 内不再读取布局。当前位置由抽卡起始 rect + 当前 pullX 算出。
  const scale = sceneScale || 1;
  const cardRect = {
    left: auxKpcOriginalRect.left + auxKpcPullX * scale,
    top: auxKpcOriginalRect.top,
    width: auxKpcOriginalRect.width,
    height: auxKpcOriginalRect.height,
  };
  const left = cardRect.left - auxDragLayerViewportOrigin.left;
  const top = cardRect.top - auxDragLayerViewportOrigin.top;

  const selectedSrc = getSelectedWsImageSrc();
  if (auxTransferCardImage) auxTransferCardImage.src = selectedSrc || IMAGE_REFRESH.kpc;
  auxTransferCard.classList.remove("is-consumed", "is-inserted");
  sz2Button?.classList.remove("is-result-ready");

  // 完全抽出这一帧直接变成所选卡片正面，不执行 rotateY / animation。
  // v98：正面外层容器必须使用“所选 WS 图片真实宽高比”。
  // 旧版沿用 KPC 背面比例，导致图片视觉高度大于容器高度，出现“下半张看得到但摸不到”。
  const originalAspectRatio = cardRect.height > 0 ? cardRect.width / cardRect.height : 1;
  auxKpcAspectRatio = getSelectedWsAspectRatio() || originalAspectRatio;
  const configuredFrontWidth = ANIMATION_CONFIG.auxDevice.kpcDrag?.flippedWidth;
  const frontWidth = Number.isFinite(configuredFrontWidth) && configuredFrontWidth > 0
    ? configuredFrontWidth * scale
    : cardRect.width;
  const frontHeight = auxKpcAspectRatio > 0 ? frontWidth / auxKpcAspectRatio : cardRect.height;
  const centerX = left + cardRect.width / 2;
  const centerY = top + cardRect.height / 2;

  auxKpcSize = { width: frontWidth, height: frontHeight };
  auxTransferCard.style.width = `${frontWidth}px`;
  auxTransferCard.style.height = `${frontHeight}px`;
  setAuxKpcPosition(centerX - frontWidth / 2, centerY - frontHeight / 2);
  auxKpcFrontReady = true; // 正面已就绪，用于允许蛇杖插卡。
  auxTransferCard.classList.add("is-visible", "is-fully-extracted", "is-dragging");
  // 自由卡出现后，iPhone 的全屏拖卡层接管后续 touchstart。
  cardDragLayer?.classList.add("is-active");
  syncAuxCardHitDebug();

  // 原 KPC 只负责视觉退场；浮动卡 DOM 始终固定在 cardDragLayer，不发生父级切换。
  cardBox.classList.add("is-kpc-aux-hidden");
  auxKpcFullyExtracted = true;

  // 同一个 pointermove 立即继续自由拖动，不 return 等待下一帧。
  auxKpcPointerStart = { x: event.clientX, y: event.clientY };
  auxKpcStartPosition = { ...auxKpcPosition };
  return true;
}
function updateAuxKpcExtractionState(event) {
  if (auxKpcFullyExtracted || auxKpcFullExtractDistance <= 0) return false;
  // auxKpcPullX 是场景源坐标，达到预先算好的完整抽出距离才交接。
  if (-auxKpcPullX >= auxKpcFullExtractDistance) {
    return handoffAuxKpcToFloatingCard(event);
  }
  return false;
}
function prepareAuxKpcCard() {
  if (!kpcLayer || !cardBox) return false;
  if (auxKpcHasBeenPulled) return true;

  // 只在开始抽卡时读一次尺寸，之后 pointermove 纯数学计算，避免 iPhone/PWA 强制重排。
  const startRect = kpcLayer.getBoundingClientRect();
  const boxRect = cardBox.getBoundingClientRect();
  const dragLayerRect = cardDragLayer?.getBoundingClientRect?.() || scene.getBoundingClientRect();
  const dockRect = auxDock?.getBoundingClientRect();
  auxDragLayerViewportOrigin = { left: dragLayerRect.left, top: dragLayerRect.top };
  if (dockRect) auxDockViewportOrigin = { left: dockRect.left, top: dockRect.top };
  auxKpcOriginalRect = {
    left: startRect.left,
    top: startRect.top,
    width: startRect.width,
    height: startRect.height,
  };
  auxKpcExtractStartCenterY = startRect.top + startRect.height / 2;
  auxKpcHasBeenPulled = true;
  auxKpcFullyExtracted = false;
  setAuxKpcPullX(0);

  const padding = (ANIMATION_CONFIG.auxDevice.kpcDrag?.fullExtractPadding || 0) * sceneScale;
  const clearDistancePx = Math.max(startRect.width, startRect.right - boxRect.left + padding);
  auxKpcFullExtractDistance = clearDistancePx / (sceneScale || 1);

  auxTransferCard?.classList.remove("is-visible", "is-fully-extracted", "is-consumed", "is-inserted");
  auxCardCoverMask?.classList.remove("is-visible");
  cardBox.classList.remove("is-kpc-aux-hidden");
  return true;
}
function beginAuxKpcDrag(event, fromTransferCard = false, options = {}) {
  if (!flowStarted || !auxOpen || !auxArmed || auxCardInserted) return;
  if (!cardBox.classList.contains("is-inserted")) return;
  if (fromTransferCard && !auxKpcFullyExtracted) return;

  if (!prepareAuxKpcCard()) return;

  event.preventDefault();
  event.stopPropagation();

  auxKpcDragging = true;
  auxKpcPointerId = event.pointerId;
  auxKpcPointerStart = { x: event.clientX, y: event.clientY };
  auxKpcStartPosition = { ...auxKpcPosition };
  auxKpcPullStartX = auxKpcPullX;
  if (auxKpcFullyExtracted || fromTransferCard) auxTransferCard?.classList.add("is-dragging");

  // iPhone/PWA 的 touch 主通道完全不使用 pointer capture；
  // 桌面鼠标/触控笔才保留元素自身 capture。
  const usePointerCapture = options.usePointerCapture !== false;
  auxKpcCaptureTarget = usePointerCapture ? (fromTransferCard ? auxTransferCard : kpcLayer) : null;
  if (usePointerCapture) {
    try {
      auxKpcCaptureTarget?.setPointerCapture?.(event.pointerId);
    } catch (error) {
      // capture 失败时仍允许当前桌面手势继续；iPhone touch 路径根本不会走这里。
    }
  }
}

function moveAuxKpcDrag(event) {
  if (!auxKpcDragging || auxKpcPointerId !== event.pointerId) return;
  event.preventDefault();

  // 卡还在卡盒里：只能水平向左抽，Y 轴完全锁死。
  if (!auxKpcFullyExtracted) {
    const dx = (event.clientX - auxKpcPointerStart.x) / sceneScale;
    setAuxKpcPullX(Math.min(0, auxKpcPullStartX + dx));

    // chouka 与“完全抽出”分离：默认抽出到一半时就播放一次。
    const triggerRatio = Math.min(1, Math.max(0, ANIMATION_CONFIG.auxDevice.kpcDrag?.choukaTriggerRatio ?? 0.5));
    if (!auxChoukaPlayed && auxKpcFullExtractDistance > 0 && -auxKpcPullX >= auxKpcFullExtractDistance * triggerRatio) {
      auxChoukaPlayed = true;
      playAudio(choukaAudio).catch((error) => {
        console.warn("chouka 音效播放失败：", error);
      });
    }

    const handedOff = updateAuxKpcExtractionState(event);
    if (!handedOff) return;
    // 100% 抽出的同一个 pointermove 立即落入自由拖动分支，不等下一帧。
  }

  // 完全离开卡盒后使用 compositor transform 跟手，不触发布局重排。
  // 正面卡片允许持续拖动；这里保留移动前的屏幕 rect，用来判断是否真正“从上往下”跨过卡槽入口。
  const previousCardRect = auxKpcFrontReady ? getAuxFloatingCardRect() : null;
  const dx = event.clientX - auxKpcPointerStart.x;
  const dy = event.clientY - auxKpcPointerStart.y;
  setAuxKpcPosition(auxKpcStartPosition.left + dx, auxKpcStartPosition.top + dy);

  // 只有从红框上方往下接触顶部入口线才允许插入；碰线即 chaka + 自动吸入。
  if (auxKpcFrontReady) tryInsertAuxKpcIntoSlot(event, previousCardRect);
}

function getAuxCardSlotRect() {
  if (!auxDock) return null;
  const { cardSlot: slot, container } = ANIMATION_CONFIG.auxDevice;
  const scale = sceneScale || 1;
  const snakeScaleValue = Number(container.scale);
  const snakeScale = Number.isFinite(snakeScaleValue) && snakeScaleValue > 0 ? snakeScaleValue : 1;
  const snakeUnit = scale * snakeScale;
  const angleDegValue = Number(container.rotate);
  const angleDeg = Number.isFinite(angleDegValue) ? angleDegValue : 0;
  const angleRad = angleDeg * Math.PI / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const rotatedSlotX = slot.x * cos - slot.y * sin;
  const rotatedSlotY = slot.x * sin + slot.y * cos;
  const width = slot.width * snakeUnit;
  const height = slot.height * snakeUnit;
  const centerX = auxDockViewportOrigin.left
    + ((container.x || 0) + (container.slideX || 0)) * scale
    + rotatedSlotX * snakeUnit;
  const centerY = auxDockViewportOrigin.top
    + (container.y || 0) * scale
    + rotatedSlotY * snakeUnit;

  // left/right/top/bottom 保留外接矩形，调试与兼容代码仍可读取；
  // 真正的插卡判定在旋转后的卡槽局部坐标系中完成。
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const absCos = Math.abs(cos);
  const absSin = Math.abs(sin);
  const aabbHalfWidth = halfWidth * absCos + halfHeight * absSin;
  const aabbHalfHeight = halfWidth * absSin + halfHeight * absCos;

  return {
    left: centerX - aabbHalfWidth,
    right: centerX + aabbHalfWidth,
    top: centerY - aabbHalfHeight,
    bottom: centerY + aabbHalfHeight,
    width,
    height,
    halfWidth,
    halfHeight,
    centerX,
    centerY,
    angleDeg,
    angleRad,
  };
}

function getRectBoundsInAuxSlotSpace(rect, slotRect) {
  const angle = -(slotRect?.angleRad || 0);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const toLocal = (x, y) => {
    const dx = x - slotRect.centerX;
    const dy = y - slotRect.centerY;
    return {
      x: dx * cos - dy * sin,
      y: dx * sin + dy * cos,
    };
  };

  const corners = [
    toLocal(rect.left, rect.top),
    toLocal(rect.right, rect.top),
    toLocal(rect.right, rect.bottom),
    toLocal(rect.left, rect.bottom),
  ];
  const center = toLocal(rect.centerX, rect.centerY);
  return {
    minX: Math.min(...corners.map((point) => point.x)),
    maxX: Math.max(...corners.map((point) => point.x)),
    minY: Math.min(...corners.map((point) => point.y)),
    maxY: Math.max(...corners.map((point) => point.y)),
    centerX: center.x,
    centerY: center.y,
  };
}
function getAuxFloatingCardRect() {
  // v96：auxTransferCard 永远位于固定全屏 cardDragLayer，因此只使用拖卡层坐标原点。
  const left = auxDragLayerViewportOrigin.left + auxKpcPosition.left;
  const top = auxDragLayerViewportOrigin.top + auxKpcPosition.top;
  return {
    left,
    top,
    right: left + auxKpcSize.width,
    bottom: top + auxKpcSize.height,
    width: auxKpcSize.width,
    height: auxKpcSize.height,
    centerX: left + auxKpcSize.width / 2,
    centerY: top + auxKpcSize.height / 2,
  };
}

function getAuxFloatingCardHitRect() {
  // v100：这是自由正面卡唯一的真实触碰矩形；调试框默认隐藏。
  // 不读取 transform DOM，完全使用内部坐标，避免 iPhone Safari 合成层时序影响命中。
  const cardRect = getAuxFloatingCardRect();
  const config = ANIMATION_CONFIG.auxDevice.kpcDrag?.hitArea || {};
  const scale = sceneScale || 1;

  const configuredWidth = Number(config.width);
  const configuredHeight = Number(config.height);
  const width = Number.isFinite(configuredWidth) && configuredWidth > 0
    ? configuredWidth * scale
    : cardRect.width;
  const height = Number.isFinite(configuredHeight) && configuredHeight > 0
    ? configuredHeight * scale
    : cardRect.height;
  const centerX = cardRect.centerX + (Number(config.offsetX) || 0) * scale;
  const centerY = cardRect.centerY + (Number(config.offsetY) || 0) * scale;

  return {
    left: centerX - width / 2,
    top: centerY - height / 2,
    right: centerX + width / 2,
    bottom: centerY + height / 2,
    width,
    height,
    centerX,
    centerY,
  };
}

function syncAuxCardHitDebug() {
  if (!auxCardHitDebug) return;
  const config = ANIMATION_CONFIG.auxDevice.kpcDrag?.hitArea || {};
  const shouldShow = Boolean(
    config.showDebug &&
    auxKpcFrontReady &&
    !auxCardInserted &&
    auxTransferCard?.classList.contains("is-visible")
  );

  auxCardHitDebug.classList.toggle("is-visible", shouldShow);
  if (!shouldShow) return;

  const rect = getAuxFloatingCardHitRect();
  const left = rect.left - auxDragLayerViewportOrigin.left;
  const top = rect.top - auxDragLayerViewportOrigin.top;
  auxCardHitDebug.style.width = `${rect.width}px`;
  auxCardHitDebug.style.height = `${rect.height}px`;
  auxCardHitDebug.style.setProperty("--aux-hit-x", `${left}px`);
  auxCardHitDebug.style.setProperty("--aux-hit-y", `${top}px`);
}

function isAuxKpcEnteringSlot(previousCardRect = null) {
  if (!auxTransferCard || !auxKpcFullyExtracted || !previousCardRect) return false;

  const cardRect = getAuxFloatingCardRect();
  const targetRect = getAuxCardSlotRect();
  if (!targetRect) return false;

  const scale = sceneScale || 1;
  const snakeScaleValue = Number(ANIMATION_CONFIG.auxDevice.container.scale);
  const snakeScale = Number.isFinite(snakeScaleValue) && snakeScaleValue > 0 ? snakeScaleValue : 1;
  const snakeUnit = scale * snakeScale;
  const threshold = (ANIMATION_CONFIG.auxDevice.kpcDrag?.slotEnterThreshold || 0) * snakeUnit;
  const topTolerance = (ANIMATION_CONFIG.auxDevice.kpcDrag?.slotTopEntryTolerance || 0) * snakeUnit;

  const currentLocal = getRectBoundsInAuxSlotSpace(cardRect, targetRect);
  const previousLocal = getRectBoundsInAuxSlotSpace(previousCardRect, targetRect);
  const slotTop = -targetRect.halfHeight;
  const slotLeft = -targetRect.halfWidth;
  const slotRight = targetRect.halfWidth;

  // “从上往下”跟随蛇杖旋转后的卡槽方向，不再按屏幕垂直方向死判。
  const movingDownIntoSlot = currentLocal.centerY > previousLocal.centerY + 0.5;
  if (!movingDownIntoSlot) return false;

  // 上一帧整张卡仍在旋转后卡槽的上沿之外。
  const wasAboveTopGate = previousLocal.maxY <= slotTop + topTolerance;
  if (!wasAboveTopGate) return false;

  // 卡片第一次碰到旋转后的真实上沿线即命中。
  const touchedTopEdge = currentLocal.maxY >= slotTop;
  if (!touchedTopEdge) return false;

  const overlapX = Math.min(currentLocal.maxX, slotRight) - Math.max(currentLocal.minX, slotLeft);
  const horizontallyAligned = currentLocal.centerX >= slotLeft && currentLocal.centerX <= slotRight;
  return horizontallyAligned && overlapX >= threshold;
}

function showInsertedCardInSlot() {
  if (!szInsertedCard || !auxTransferCardImage) return;
  const slotRect = getAuxCardSlotRect();
  const cardRect = getAuxFloatingCardRect();
  if (!slotRect) return;

  const scale = sceneScale || 1;
  const slot = ANIMATION_CONFIG.auxDevice.cardSlot;
  const snakeScaleValue = Number(ANIMATION_CONFIG.auxDevice.container.scale);
  const snakeScale = Number.isFinite(snakeScaleValue) && snakeScaleValue > 0 ? snakeScaleValue : 1;
  const snakeUnit = scale * snakeScale;
  const finalX = (slot.cardX || 0) * snakeUnit;
  const finalY = (slot.cardY || 0) * snakeUnit;
  const finalWidth = (slot.cardWidth || 280) * snakeUnit;

  szInsertedCard.src = auxTransferCardImage.currentSrc || auxTransferCardImage.src;

  // 第一步：在“刚碰到旋转后上沿线”的屏幕位置完成层级切换。
  // 卡槽父层已经旋转，因此先把屏幕坐标逆旋转回卡槽局部坐标。
  const slotAngle = -(slotRect.angleRad || 0);
  const slotCos = Math.cos(slotAngle);
  const slotSin = Math.sin(slotAngle);
  const deltaX = cardRect.centerX - slotRect.centerX;
  const deltaY = cardRect.centerY - slotRect.centerY;
  const localX = deltaX * slotCos - deltaY * slotSin;
  const localY = deltaX * slotSin + deltaY * slotCos;
  szInsertedCard.style.width = `${auxKpcSize.width}px`;
  szInsertedCard.style.transform = `translate(-50%, -50%) translate3d(${localX}px, ${localY}px, 0)`;
  // 切层瞬间先抵消父卡槽旋转，下一帧再跟随吸入一起转正到蛇杖角度。
  szInsertedCard.style.rotate = `${-(slotRect.angleDeg || 0)}deg`;
  szInsertedCard.classList.remove("is-auto-intake");
  szCardSlotMask?.classList.add("is-active");
  auxTransferCard?.classList.add("is-consumed");

  // 强制记录起始姿态后，下一帧自动吸入最终卡槽位置。
  void szInsertedCard.offsetWidth;
  requestAnimationFrame(() => {
    if (!auxCardInserted || !szInsertedCard) return;
    szInsertedCard.classList.add("is-auto-intake");
    szInsertedCard.style.width = `${finalWidth}px`;
    szInsertedCard.style.rotate = "0deg";
    szInsertedCard.style.transform = `translate(-50%, -50%) translate3d(${finalX}px, ${finalY}px, 0)`;
  });
}
function hideInsertedCardInSlot() {
  szCardSlotMask?.classList.remove("is-active");
  if (szInsertedCard) {
    szInsertedCard.classList.remove("is-auto-intake");
    szInsertedCard.src = IMAGE_REFRESH.kpc;
    szInsertedCard.style.removeProperty("width");
    szInsertedCard.style.removeProperty("transform");
    szInsertedCard.style.removeProperty("rotate");
  }
}

function completeAuxCardInsertion(event) {
  if (auxCardInserted || !auxKpcFrontReady || !auxArmed) return false;
  auxCardInserted = true;
  stopAuxKpcDrag(event?.pointerId ?? auxKpcPointerId);
  scene.classList.add("is-aux-card-inserted");
  auxDock?.classList.add("is-card-inserted");
  auxTransferCard?.classList.add("is-inserted");
  cardDragLayer?.classList.remove("is-active");
  auxCardHitDebug?.classList.remove("is-visible");
  showInsertedCardInSlot();
  sz2Button?.classList.add("is-result-ready");
  // 卡片下边缘碰到卡槽上沿线即视为插卡成功：立刻 chaka，并自动吸入槽内。
  // PWA 优先：pointermove 里不用 HTMLAudio 作为主通道，直接播放已在真实手势中解锁的 Web Audio Buffer。
  playChakaReliable().catch((error) => {
    console.warn("蛇杖插卡 chaka 音效播放失败：", error);
  });
  return true;
}

function tryInsertAuxKpcIntoSlot(event, previousCardRect = null) {
  if (!auxKpcFrontReady || auxCardInserted || !auxArmed) return false;
  if (!isAuxKpcEnteringSlot(previousCardRect)) return false;
  return completeAuxCardInsertion(event);
}

function endAuxKpcDrag(event) {
  if (!auxKpcDragging || auxKpcPointerId !== event.pointerId) return;

  // 与开场卡盒保持一致：pointerup 只负责结束当前手势，不额外 preventDefault/stopPropagation。
  // iPhone PWA 可以立即开始下一轮 pointerdown，不等待旧事件链收尾。
  if (!auxKpcFullyExtracted) updateAuxKpcExtractionState(event);
  if (auxCardInserted) return;

  // 完全抽出时已经直接切成正面；松手只结束当前拖动，不触发动画、不进入等待状态。
  stopAuxKpcDrag(event.pointerId);
}

// PWA / iPhone 保险：Safari 即使暂时没有把视觉上的正面卡命中为 target，
// window 仍能按卡片当前真实矩形识别触点；真正的 pointer capture 仍交给 auxTransferCard 自己。
function handleAuxFloatingCardGlobalPointerDown(event) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  if (!auxKpcFullyExtracted || !auxKpcFrontReady || auxCardInserted || auxKpcDragging) return;
  if (!auxOpen || !auxArmed || !auxTransferCard?.classList.contains("is-visible")) return;

  const rect = getAuxFloatingCardHitRect();
  const inside =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;
  if (!inside) return;

  prepareChakaSfxFromGesture().catch(() => undefined);
  beginAuxKpcDrag(event, true);
}


function pointInsideRect(x, y, rect) {
  return Boolean(rect) && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function makeAuxTouchEvent(touch, originalEvent) {
  return {
    pointerId: `touch:${touch.identifier}`,
    pointerType: "touch",
    clientX: touch.clientX,
    clientY: touch.clientY,
    preventDefault: () => originalEvent?.preventDefault?.(),
    stopPropagation: () => {},
  };
}

function findTouchByIdentifier(touchList, identifier) {
  if (identifier === null || identifier === undefined || !touchList) return null;
  for (let i = 0; i < touchList.length; i += 1) {
    if (touchList[i].identifier === identifier) return touchList[i];
  }
  return null;
}

// iPhone Safari / PWA 专用拖卡入口。
// 只用 touch.identifier + 屏幕坐标维持手势，不 set/releasePointerCapture，也不依赖 Safari DOM hit-test。
function clearAuxTouchSession() {
  // 单指 PWA 模型：只要结束/重开一轮，就立即把所有 touch 拖动状态归零。
  // 不等待 Safari 的 identifier 生命周期，也不判断 identifier 是否被复用。
  if (auxKpcDragging && typeof auxKpcPointerId === "string" && auxKpcPointerId.startsWith("touch:")) {
    stopAuxKpcDrag(auxKpcPointerId);
  }
  auxTouchDragActive = false;
  auxTouchIdentifier = null;
  auxTouchLastPoint = null;
  if (typeof auxKpcPointerId === "string" && auxKpcPointerId.startsWith("touch:")) auxKpcPointerId = null;
  auxKpcCaptureTarget = null;
  auxTransferCard?.classList.remove("is-dragging");
}

function handleAuxTouchStart(event) {
  const touch = event.changedTouches?.[0];
  if (!touch) return;

  // v98：本项目只支持单指拖卡。每一次新的 touchstart 都是新会话。
  // 即使上一轮状态因为 WebKit 时序残留，也先清掉再立即开始，不存在等待窗口。
  if (auxTouchDragActive || auxKpcDragging || auxTouchIdentifier !== null) {
    clearAuxTouchSession();
  }

  if (!flowStarted || !auxOpen || !auxArmed || auxCardInserted) return;
  if (!cardBox.classList.contains("is-inserted")) return;

  // 每轮新触摸只刷新固定拖卡层的原点；卡片本身的命中矩形完全用内部坐标计算。
  const dragLayerRect = cardDragLayer?.getBoundingClientRect?.();
  if (dragLayerRect) auxDragLayerViewportOrigin = { left: dragLayerRect.left, top: dragLayerRect.top };

  let fromTransferCard = false;

  if (auxKpcFullyExtracted && auxKpcFrontReady && auxTransferCard?.classList.contains("is-visible")) {
    // 不读 auxTransferCard.getBoundingClientRect()，避免 Safari transform 合成层同步延迟。
    if (!pointInsideRect(touch.clientX, touch.clientY, getAuxFloatingCardHitRect())) return;
    fromTransferCard = true;
  } else if (!auxKpcFullyExtracted) {
    // KPC 还在卡盒里时它没有自由 transform，只在这一阶段读取一次稳定的静态 DOM 矩形。
    const kpcRect = kpcLayer?.getBoundingClientRect?.();
    if (!pointInsideRect(touch.clientX, touch.clientY, kpcRect)) return;
  } else {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  prepareChakaSfxFromGesture().catch(() => undefined);

  auxTouchIdentifier = touch.identifier;
  auxTouchLastPoint = { identifier: touch.identifier, clientX: touch.clientX, clientY: touch.clientY };
  auxTouchDragActive = true;
  beginAuxKpcDrag(makeAuxTouchEvent(touch, event), fromTransferCard, { usePointerCapture: false });

  if (!auxKpcDragging) clearAuxTouchSession();
}

function handleAuxTouchMove(event) {
  if (!auxTouchDragActive || !auxKpcDragging || auxTouchIdentifier === null) return;
  const touch = findTouchByIdentifier(event.touches, auxTouchIdentifier);
  if (!touch) {
    // Safari 偶发更换/丢失 identifier 时，单指应用直接采用当前唯一触点继续，不中断拖动。
    if (event.touches?.length !== 1) return;
    const onlyTouch = event.touches[0];
    auxTouchIdentifier = onlyTouch.identifier;
    auxKpcPointerId = `touch:${onlyTouch.identifier}`;
    auxTouchLastPoint = { identifier: onlyTouch.identifier, clientX: onlyTouch.clientX, clientY: onlyTouch.clientY };
    event.preventDefault();
    event.stopPropagation();
    moveAuxKpcDrag(makeAuxTouchEvent(onlyTouch, event));
    return;
  }

  auxTouchLastPoint = { identifier: touch.identifier, clientX: touch.clientX, clientY: touch.clientY };
  event.preventDefault();
  event.stopPropagation();
  moveAuxKpcDrag(makeAuxTouchEvent(touch, event));
}

function handleAuxTouchEnd(event) {
  if (!auxTouchDragActive && !auxKpcDragging) return;

  // 单指模型：收到任何 touchend/touchcancel 就立即结束本轮。
  // 不再检查 event.touches 是否还短暂残留旧 identifier。
  const changed = findTouchByIdentifier(event.changedTouches, auxTouchIdentifier)
    || event.changedTouches?.[0]
    || auxTouchLastPoint;

  if (auxKpcDragging && changed) {
    endAuxKpcDrag(makeAuxTouchEvent(changed, event));
  }

  clearAuxTouchSession();
}

function handleAuxTouchEnvironmentReset() {
  // blur / 切后台时 Pointer Events 不一定补发 pointercancel。
  // 无论当前是 iPhone touch 还是桌面 pointer，都必须完整结束这一轮单卡拖动。
  if (auxKpcDragging) stopAuxKpcDrag(auxKpcPointerId);
  auxTouchDragActive = false;
  auxTouchIdentifier = null;
  auxTouchLastPoint = null;
  auxKpcCaptureTarget = null;
  auxTransferCard?.classList.remove("is-dragging");
}

function resetPrimaryPointerEnvironment() {
  // 外部整卡盒：只结束当前手势并保留当前位置，不偷偷推进/回退主流程。
  if (activePointerId !== null) {
    try {
      if (typeof activePointerId === "number" && cardTrigger.hasPointerCapture?.(activePointerId)) {
        cardTrigger.releasePointerCapture(activePointerId);
      }
    } catch {}
    activePointerId = null;
    isDragging = false;
    cardTrigger.classList.remove("is-dragging");
  }

  // 腰带内整卡盒：切后台相当于本轮抽出手势取消，安全回到卡槽。
  if (extractPointerId !== null || isExtracting || isFlowPhase(FLOW_PHASE.EXTRACTING)) {
    const pointerId = extractPointerId;
    try {
      if (pointerId !== null && cardBox.hasPointerCapture?.(pointerId)) cardBox.releasePointerCapture(pointerId);
    } catch {}
    extractPointerId = null;
    isExtracting = false;
    cardBox.classList.remove("is-extracting");
    if (isFlowPhase(FLOW_PHASE.EXTRACTING)) {
      setFlowPhase(FLOW_PHASE.READY);
      setCardExtractPosition(0, 0);
    }
    syncCenterActionButtons();
  }
}

function handleInteractionEnvironmentReset() {
  resetPrimaryPointerEnvironment();
  handleAuxTouchEnvironmentReset();
}

function resetCardGesture() {
  clearTimeout(insertionTimer);
  insertionTimer = 0;
  dragReady = false;
  isDragging = false;
  parallelReached = false;
  activePointerId = null;
  cardTrigger.classList.remove("is-draggable", "is-dragging", "is-replay-waiting");
  cardTrigger.setAttribute("aria-label", "启动卡盒与腰带动画");
  setCardDragPosition(ANIMATION_CONFIG.card.start.x, ANIMATION_CONFIG.card.start.y);
}

function resetToCard() {
  clearSceneTimers();
  clearTimeout(stageTwoFlipFallback);
  stageTwoFlipFallback = 0;
  clearTimeout(stageTwoFinishFallback);
  stageTwoFinishFallback = 0;
  clearTimeout(insertionAudioFallback);
  insertionAudioFallback = 0;
  clearTimeout(bg5TransitionTimer);
  bg5TransitionTimer = 0;
  clearTimeout(shatterCleanupTimer);
  shatterCleanupTimer = 0;
  shatterCanvas.classList.remove("is-active");
  if (shatterAnimationFrame) {
    cancelAnimationFrame(shatterAnimationFrame);
    shatterAnimationFrame = 0;
  }
  shatterCanvas.getContext("2d")?.clearRect(0, 0, shatterCanvas.width, shatterCanvas.height);
  cancelAnimationFrame(rippleAnimationFrame);
  cancelCharuBg4Sync();
  cancelBgSequence();
  waterDisplacement.setAttribute("scale", "0");
  stopAudio(kh1Audio);
  stopAudio(ydMusicAudio);
  activeInsertionRunId = 0;
  stopCharuPlayback();
  stopMochaAudioCompletely();
  stopAudio(choukaAudio);
  stopAudio(chakaAudio);
  stopAudio(guoAudio);
  stopAudio(huhuanAudio);
  stopAudio(jingshijieAudio);
  stopAudio(timeoutAudio);
  stopAudio(boxingAudio);
  stopAudio(jianjiAudio);
  stopAudio(chaoxiaoAudio);
  stopAudio(jiechuAudio);
  stopAudio(huagai1Audio);
  stopAudio(huagai2Audio);
  Object.values(cardVoiceAudios).forEach(stopAudio);
  Object.values(cardVoiceFollowUpAudios).forEach(stopAudio);
  resetAuxDevice();
  ydMusicInUse = false;
  insertionAudioInUse = false;
  charuFinished = true;
  bg4MergeStarted = false;
  bg4RunId = 0;
  bg4StartedAt = 0;
  bg5RunId = 0;
  centerActionsUnlocked = false;
  scene.classList.remove("show-center-actions");
  selectedWs = null;
  selectedWsAspectRatio = null;
  extractReady = false;
  isExtracting = false;
  extractPointerId = null;
  cardWasExtracted = false;
  extractedStageTwoReplayActive = false;
  reinsertReady = false;
  suppressExtractedCardClick = false;
  clearTimeout(suppressExtractedCardClickTimer);
  suppressExtractedCardClickTimer = 0;
  postMoveKh1Ready = false;
  postMoveKh1Played = false;
  setCardExtractPosition(0, 0);
  flowStarted = false;
  setFlowPhase(FLOW_PHASE.IDLE);
  resetCardGesture();

  scene.classList.add("is-resetting");
  scene.classList.remove("show-final-background", "show-bg4", "show-bg5", "show-bg3", "show-ws", "is-shattering", "is-aux-open", "is-aux-armed", "is-aux-card-inserted");
  belt.classList.remove("is-ready", "is-stage-two", "is-stage-two-front", "is-moving", "is-card-powered", "is-shatter-hidden");
  cardBox.classList.remove("is-handoff", "is-inserting", "is-inserted", "is-card-powered", "is-extractable", "is-extracting", "is-detached", "is-kpc-ejected", "is-kpc-aux-hidden");
  wsButtons.forEach((button) => button.classList.remove("is-selected"));
  cardTrigger.classList.remove("is-waiting", "is-hidden", "is-replay-waiting");
  void scene.offsetWidth;
  scene.classList.remove("is-resetting");
  cardTrigger.classList.add("is-ready");
}

function completeCardInsertion(pointerId) {
  if (
    !isFlowPhase(FLOW_PHASE.CARD_DRAG) ||
    !dragReady ||
    !isDragging ||
    !parallelReached
  ) return;

  const runId = ++insertionRunCounter;
  activeInsertionRunId = runId;
  setFlowPhase(FLOW_PHASE.INSERTING);

  dragReady = false;
  isDragging = false;
  cardWasExtracted = false;
  reinsertReady = false;
  extractedStageTwoReplayActive = false;
  cancelBgSequence();
  bg4RunId = runId;
  setCenterActionsUnlocked(false);
  insertionAudioInUse = false;
  cancelCharuBg4Sync();
  stopCharuPlayback();
  clearTimeout(bg5TransitionTimer);
  bg5TransitionTimer = 0;
  charuFinished = false;

  if (typeof pointerId === "number" && cardTrigger.hasPointerCapture?.(pointerId)) {
    cardTrigger.releasePointerCapture(pointerId);
  }

  const handoffX = cardDragPosition.x - ANIMATION_CONFIG.move.x;
  const handoffY = cardDragPosition.y - ANIMATION_CONFIG.move.y;
  scene.style.setProperty("--card-handoff-x", `${handoffX * sceneScale}px`);
  scene.style.setProperty("--card-handoff-y", `${handoffY * sceneScale}px`);

  cardBox.classList.remove("is-inserting", "is-inserted", "is-card-powered", "is-extractable", "is-extracting", "is-detached", "is-kpc-ejected");
  setCardExtractPosition(0, 0);
  hideWsPanel();
  belt.classList.remove("is-card-powered");
  cardBox.classList.add("is-handoff");
  void cardBox.offsetWidth;

  cardTrigger.classList.remove("is-draggable", "is-dragging", "is-waiting");
  cardTrigger.classList.add("is-hidden");
  activePointerId = null;

  // 先提交插入视觉状态，再启动 charu。声音不会早于卡盒开始吸入。
  requestAnimationFrame(() => {
    if (
      !flowStarted ||
      runId !== activeInsertionRunId ||
      !isFlowPhase(FLOW_PHASE.INSERTING)
    ) return;

    scene.classList.add("show-final-background");
    cardBox.classList.remove("is-handoff");
    cardBox.classList.add("is-inserting", "is-card-powered");
    belt.classList.add("is-card-powered");

    playInsertionAudio(runId);

    clearTimeout(insertionTimer);
    insertionTimer = setTimeout(() => {
      if (
        runId !== activeInsertionRunId ||
        !isFlowPhase(FLOW_PHASE.INSERTING, FLOW_PHASE.INSERTED)
      ) return;
      cardBox.classList.remove("is-inserting");
      cardBox.classList.add("is-inserted");
      if (isFlowPhase(FLOW_PHASE.INSERTING)) setFlowPhase(FLOW_PHASE.INSERTED);
    }, ANIMATION_CONFIG.card.duration * 1000);
  });
}

function cancelCharuBg4Sync() {
  if (charuBg4SyncFrame) {
    cancelAnimationFrame(charuBg4SyncFrame);
    charuBg4SyncFrame = 0;
  }
}

function startCharuBg4Sync(runId) {
  cancelCharuBg4Sync();

  const timecode = ANIMATION_CONFIG.bg4.startTimecode || { seconds: 1, frames: 0, fps: 30 };
  const fps = Math.max(1, Number(timecode.fps) || 30);
  const targetTime = (Number(timecode.seconds) || 0) + (Number(timecode.frames) || 0) / fps;

  const sync = () => {
    if (
      runId !== activeInsertionRunId ||
      runId !== charuPlaybackRunId ||
      !insertionAudioInUse ||
      !isFlowPhase(FLOW_PHASE.INSERTING, FLOW_PHASE.INSERTED)
    ) {
      charuBg4SyncFrame = 0;
      return;
    }

    const playbackTime = getCharuPlaybackTime(runId);
    if (playbackTime >= targetTime) {
      charuBg4SyncFrame = 0;
      startBg4Merge(runId);
      return;
    }

    charuBg4SyncFrame = requestAnimationFrame(sync);
  };

  sync();
}

function cancelBgSequence({ forceBg3 = false } = {}) {
  bg4MergeStarted = false;
  bg4RunId = 0;
  bg4StartedAt = 0;
  bg5RunId = 0;
  clearTimeout(bg5TransitionTimer);
  bg5TransitionTimer = 0;
  scene.classList.remove("show-bg4", "show-bg5");
  if (forceBg3) scene.classList.add("show-bg3");
}

function startBg4Merge(runId = activeInsertionRunId) {
  if (
    !flowStarted ||
    runId !== activeInsertionRunId ||
    !isFlowPhase(FLOW_PHASE.INSERTING, FLOW_PHASE.INSERTED, FLOW_PHASE.READY) ||
    bg4MergeStarted
  ) return;

  bg4MergeStarted = true;
  bg4RunId = runId;
  bg4StartedAt = performance.now();
  bg5RunId = 0;
  scene.classList.remove("show-bg3", "show-bg5");
  scene.classList.add("show-bg4");

  // timeout 同样绑定本轮 runId。旧轮次的兜底定时器晚到时不能结束新一轮 bg4。
  sceneTimers.push(
    setTimeout(() => finishBg4Merge(null, runId, true), ANIMATION_CONFIG.bg4.duration * 1000 + 80),
  );
}

function finishBg5Transition(runId = bg5RunId) {
  if (
    !flowStarted ||
    runId !== activeInsertionRunId ||
    runId !== bg5RunId ||
    !scene.classList.contains("show-bg5")
  ) return;
  scene.classList.remove("show-bg5");
  scene.classList.add("show-bg3");
}

function finishBg4Merge(event, runId = bg4RunId, fromFallback = false) {
  if (event && event.animationName !== "bg4-merge-center") return;
  if (
    !flowStarted ||
    !bg4MergeStarted ||
    runId !== activeInsertionRunId ||
    runId !== bg4RunId ||
    scene.classList.contains("show-bg5") ||
    scene.classList.contains("show-bg3")
  ) return;

  // Safari 偶尔会把上一轮 animationend 晚派发到下一轮。新 bg4 尚未跑够最短时间时直接忽略该旧事件。
  if (!fromFallback) {
    const elapsed = performance.now() - bg4StartedAt;
    if (elapsed < ANIMATION_CONFIG.bg4.duration * 1000 - 90) return;
  }

  scene.classList.remove("show-bg4", "show-bg3");
  scene.classList.add("show-bg5");
  bg5RunId = runId;
  setCenterActionsUnlocked(true);
  clearTimeout(bg5TransitionTimer);
  bg5TransitionTimer = setTimeout(
    () => finishBg5Transition(runId),
    ANIMATION_CONFIG.bg5.duration * 1000,
  );
}

function hideInsertionGlows() {
  charuFinished = true;
  cardBox.classList.remove("is-card-powered");
  belt.classList.remove("is-card-powered");
}

function completeInsertionAfterCharu(runId) {
  if (
    runId !== activeInsertionRunId ||
    !isFlowPhase(FLOW_PHASE.INSERTING, FLOW_PHASE.INSERTED)
  ) return;

  clearTimeout(insertionAudioFallback);
  insertionAudioFallback = 0;
  cancelCharuBg4Sync();
  if (!bg4MergeStarted) startBg4Merge(runId);

  hideInsertionGlows();
  insertionAudioInUse = false;
  charuPlaybackRunId = 0;
  charuPlaybackMode = null;
  setFlowPhase(FLOW_PHASE.READY);
  showWsPanel();
  enableCardExtraction();
}

function handleCharuEnded(runId) {
  // 只接受当前这一轮“真正插卡”产生的 ended。任何旧 source、reset 后晚到的 ended 都作废。
  if (
    runId !== activeInsertionRunId ||
    runId !== charuPlaybackRunId ||
    !insertionAudioInUse ||
    charuPlaybackMode !== "webaudio" ||
    !isFlowPhase(FLOW_PHASE.INSERTING, FLOW_PHASE.INSERTED)
  ) return;
  completeInsertionAfterCharu(runId);
}

function recoverInsertionWithoutCharu(runId) {
  if (
    runId !== activeInsertionRunId ||
    !insertionAudioInUse ||
    !isFlowPhase(FLOW_PHASE.INSERTING, FLOW_PHASE.INSERTED)
  ) return;

  console.warn("charu 在限定时间内未能启动，启用视觉流程兜底，避免界面卡死。");
  insertionAudioInUse = false;
  charuPlaybackRunId = 0;
  charuPlaybackMode = null;
  cancelCharuBg4Sync();
  if (!bg4MergeStarted) startBg4Merge(runId);

  // 音频真的不可用时也不让状态机永久卡在 INSERTING；等主要 bg4/bg5 视觉完成后再开放后续操作。
  sceneTimers.push(setTimeout(() => {
    if (
      runId !== activeInsertionRunId ||
      !isFlowPhase(FLOW_PHASE.INSERTING, FLOW_PHASE.INSERTED)
    ) return;
    hideInsertionGlows();
    setFlowPhase(FLOW_PHASE.READY);
    showWsPanel();
    enableCardExtraction();
  }, (ANIMATION_CONFIG.bg4.duration + ANIMATION_CONFIG.bg5.duration) * 1000));
}

function playInsertionAudio(runId) {
  if (
    !flowStarted ||
    runId !== activeInsertionRunId ||
    !isFlowPhase(FLOW_PHASE.INSERTING, FLOW_PHASE.INSERTED) ||
    insertionAudioInUse
  ) return;

  insertionAudioInUse = true;
  charuPlaybackRunId = runId;

  const startWebAudio = () => {
    if (
      runId !== activeInsertionRunId ||
      !insertionAudioInUse ||
      !isFlowPhase(FLOW_PHASE.INSERTING, FLOW_PHASE.INSERTED)
    ) return false;

    stopCriticalSfx("charu");
    charuPlaybackRunId = runId;
    charuPlaybackMode = "webaudio";
    const started = startCriticalSfx("charu", () => handleCharuEnded(runId));
    if (!started) {
      charuPlaybackMode = null;
      return false;
    }

    clearTimeout(insertionAudioFallback);
    insertionAudioFallback = 0;
    charuPlaybackStartedAt = criticalSfxContext.currentTime;
    startCharuBg4Sync(runId);
    return true;
  };

  if (startWebAudio()) return;

  // 此时 Context 正常情况下已在第一阶段点击或第二阶段 pointerdown 中解锁。
  // 如果 buffer 尚未完成，允许重试读取/解码，但不再创建第二个 HTMLAudio charu 播放通道。
  prepareCriticalSfxFromGesture(["charu"])
    .then((ready) => {
      if (
        runId !== activeInsertionRunId ||
        !insertionAudioInUse ||
        !isFlowPhase(FLOW_PHASE.INSERTING, FLOW_PHASE.INSERTED)
      ) return;
      if (ready) startWebAudio();
    })
    .catch((error) => {
      console.warn("charu 关键音效准备失败：", error);
    });

  clearTimeout(insertionAudioFallback);
  insertionAudioFallback = setTimeout(() => recoverInsertionWithoutCharu(runId), 1800);
}

function enableCardDrag(options = {}) {
  const preservePosition = options.preservePosition ?? cardWasExtracted;
  setFlowPhase(FLOW_PHASE.CARD_DRAG);
  dragReady = true;
  isDragging = false;
  parallelReached = false;
  if (!preservePosition) {
    setCardDragPosition(ANIMATION_CONFIG.card.start.x, ANIMATION_CONFIG.card.start.y);
  }
  cardTrigger.classList.remove("is-waiting", "is-replay-waiting");
  cardTrigger.classList.add("is-draggable");
  cardTrigger.setAttribute(
    "aria-label",
    reinsertReady
      ? "拖动卡盒至腰带右侧，再插入凹槽"
      : cardWasExtracted
        ? "点击卡盒重新启动第二阶段；也可继续拖动"
        : "按住并拖动卡盒至腰带右侧，再插入凹槽",
  );
}

function canDragExternalCardBox() {
  // 初次插卡前是 CARD_DRAG；整卡盒从腰带抽出后保持 DETACHED，
  // 但外部卡盒仍必须可以立即继续拖动。
  return isFlowPhase(FLOW_PHASE.CARD_DRAG, FLOW_PHASE.DETACHED);
}

function suppressExtractedCardSyntheticClick(duration = 420) {
  suppressExtractedCardClick = true;
  clearTimeout(suppressExtractedCardClickTimer);
  suppressExtractedCardClickTimer = setTimeout(() => {
    suppressExtractedCardClick = false;
    suppressExtractedCardClickTimer = 0;
  }, duration);
}


function handleCardPointerDown(event) {
  // 复用 main(47) 已在 iPhone PWA 真机验证稳定的拖动方式：
  // cardTrigger 自己持有整个 Pointer 会话，不再把 move/up 转交给 window。
  if (isFlowPhase(FLOW_PHASE.CARD_DRAG, FLOW_PHASE.DETACHED)) {
    prepareCriticalSfxFromGesture(["mocha", "charu"]).catch(() => undefined);
  }
  if (isFlowPhase(FLOW_PHASE.IDLE, FLOW_PHASE.CARD_DRAG, FLOW_PHASE.DETACHED)) {
    playMochaOnCardBoxPress();
  }
  if (
    !canDragExternalCardBox() ||
    !dragReady ||
    !cardTrigger.classList.contains("is-draggable")
  ) return;

  event.preventDefault();
  event.stopPropagation();
  activePointerId = event.pointerId;
  pointerStart = { x: event.clientX, y: event.clientY };
  externalCardPointerTravel = 0;
  dragOrigin = { ...cardDragPosition };
  isDragging = true;
  cardTrigger.classList.add("is-dragging");

  try {
    cardTrigger.setPointerCapture?.(event.pointerId);
  } catch {
    // Safari 某些边界状态可能拒绝 capture；后续事件仍由元素监听器兜底。
  }
}

function handleCardPointerMove(event) {
  if (!canDragExternalCardBox() || !dragReady || activePointerId !== event.pointerId) return;

  const deltaX = event.clientX - pointerStart.x;
  const deltaY = event.clientY - pointerStart.y;
  externalCardPointerTravel = Math.max(externalCardPointerTravel, Math.hypot(deltaX, deltaY));

  event.preventDefault();
  const nextX = Math.max(
    -SOURCE_SCENE.width / 2,
    Math.min(SOURCE_SCENE.width / 2, dragOrigin.x + deltaX / sceneScale),
  );
  const nextY = Math.max(
    -SOURCE_SCENE.height / 2,
    Math.min(SOURCE_SCENE.height / 2, dragOrigin.y + deltaY / sceneScale),
  );
  setCardDragPosition(nextX, nextY);

  const { parallel, slotTolerance } = ANIMATION_CONFIG.card.drag;
  if (
    nextX >= parallel.x - parallel.toleranceX &&
    Math.abs(nextY - parallel.y) <= parallel.toleranceY
  ) {
    parallelReached = true;
  }

  const slotX = ANIMATION_CONFIG.move.x + ANIMATION_CONFIG.card.insert.x;
  const slotY = ANIMATION_CONFIG.move.y + ANIMATION_CONFIG.card.insert.y;
  if (
    (!cardWasExtracted || reinsertReady) &&
    parallelReached &&
    Math.abs(nextX - slotX) <= slotTolerance.x &&
    Math.abs(nextY - slotY) <= slotTolerance.y
  ) {
    completeCardInsertion(event.pointerId);
  }
}

function handleCardPointerEnd(event) {
  if (activePointerId !== event.pointerId) return;

  try {
    if (cardTrigger.hasPointerCapture?.(event.pointerId)) {
      cardTrigger.releasePointerCapture(event.pointerId);
    }
  } catch {
    // pointercancel 后 Safari 可能已经自动释放。
  }

  isDragging = false;
  activePointerId = null;
  cardTrigger.classList.remove("is-dragging");

  // 沿用 main(47) 的做法：只抑制紧跟当前拖动产生的 click，
  // 下一次 pointerdown 不受影响，因此任何时候都能重新拖动。
  if (cardWasExtracted && externalCardPointerTravel > 8) {
    suppressExtractedCardClick = true;
    clearTimeout(suppressExtractedCardClickTimer);
    suppressExtractedCardClickTimer = setTimeout(() => {
      suppressExtractedCardClick = false;
      suppressExtractedCardClickTimer = 0;
    }, 0);
  }
}

function handleExtractPointerDown(event) {
  if (!isFlowPhase(FLOW_PHASE.READY) || !extractReady || !cardBox.classList.contains("is-extractable")) return;
  if (auxOpen) return;
  if (event.target === kpcLayer && (cardBox.classList.contains("is-kpc-ejected") || auxArmed)) return;

  event.preventDefault();
  event.stopPropagation();
  extractPointerId = event.pointerId;
  extractPointerStart = { x: event.clientX, y: event.clientY };
  extractOrigin = { ...cardExtractPosition };
  isExtracting = true;
  setFlowPhase(FLOW_PHASE.EXTRACTING);
  cardBox.classList.add("is-extracting");
  syncCenterActionButtons();
  playMochaOnCardBoxPress();

  // 只做静音解锁，不触发声音。真正的 jiechu 只在破碎动画正式启动时播放。
  // 这样避免 iPhone/PWA 因动画启动已离开 pointerdown 调用栈而拒绝 HTMLAudio.play()。
  primeAudio(jiechuAudio, () => scene.classList.contains("is-shattering")).catch(() => undefined);

  cardBox.setPointerCapture?.(event.pointerId);
}

function handleExtractPointerMove(event) {
  if (!isFlowPhase(FLOW_PHASE.EXTRACTING) || !extractReady || !isExtracting || extractPointerId !== event.pointerId) return;
  event.preventDefault();
  event.stopPropagation();

  const deltaX = (event.clientX - extractPointerStart.x) / sceneScale;
  // v61：卡盒插入腰带后只能沿水平方向向右抽出。
  // Y 轴永久锁在卡槽位置，向上/向下拖都不产生视觉位移，也不会再出现松手回弹。
  const nextX = Math.max(0, extractOrigin.x + deltaX);
  setCardExtractPosition(nextX, 0);
}

function completeCardExtraction(pointerId) {
  setFlowPhase(FLOW_PHASE.DETACHED);
  extractReady = false;
  isExtracting = false;
  cardWasExtracted = true;
  syncCenterActionButtons();
  reinsertReady = false;
  extractedStageTwoReplayActive = false;

  if (pointerId !== null && cardBox.hasPointerCapture?.(pointerId)) {
    cardBox.releasePointerCapture(pointerId);
  }

  // 把腰带内部卡盒当前屏幕位置交接给外层 cardTrigger，避免抽出完成时跳位。
  const externalX = ANIMATION_CONFIG.move.x + ANIMATION_CONFIG.card.insert.x + cardExtractPosition.x;
  const externalY = ANIMATION_CONFIG.move.y + ANIMATION_CONFIG.card.insert.y + cardExtractPosition.y;
  setCardDragPosition(externalX, externalY);

  cardBox.classList.remove("is-extracting", "is-extractable", "is-kpc-ejected");
  cardBox.classList.add("is-detached");
  cardTrigger.classList.remove("is-hidden", "is-ready", "is-waiting", "is-dragging");
  // 腰带内 cardBox → 外部 cardTrigger 的交接必须瞬时完成。
  // 若继续继承 card-unit 的 1.25s transform transition，视觉卡盒会在旧位置与
  // cardDragPosition 最终位置之间滑动，导致触碰区与看到的位置短暂分离。
  cardTrigger.classList.add("is-draggable");
  cardTrigger.setAttribute("aria-label", "点击卡盒重新启动第二阶段；也可继续拖动");
  dragReady = true;
  activePointerId = null;
  parallelReached = false;
  hideWsPanel();

  // 卡盒真正离开腰带后，彻底作废这一轮仍未结束的 bg4/bg5 回调。
  // 先固定到 bg3 再做碎裂，避免旧 animationend/timeout 在下一轮流程里重新塞回背景。
  cancelBgSequence({ forceBg3: true });

  // 卡盒向右抽出成功：bg3 + 腰带镜面碎裂消失，同时恢复开始时默认背景。
  startMirrorShatter();
}

function handleExtractPointerEnd(event) {
  if (!isFlowPhase(FLOW_PHASE.EXTRACTING) || extractPointerId !== event.pointerId) return;


  if (cardBox.hasPointerCapture?.(event.pointerId)) {
    cardBox.releasePointerCapture(event.pointerId);
  }

  const rightDistance = cardExtractPosition.x;
  cardBox.classList.remove("is-extracting");
  isExtracting = false;
  extractPointerId = null;
  syncCenterActionButtons();

  // 只有向右拖够阈值才算成功，上下位移不参与抽出判定。
  if (rightDistance >= ANIMATION_CONFIG.card.extract.threshold) {
    completeCardExtraction(event.pointerId);
    return;
  }

  // 未拖够距离则回到腰带卡槽。
  setFlowPhase(FLOW_PHASE.READY);
  setCardExtractPosition(0, 0);
}

function cancelStageTwoAudioSync() {
  clearTimeout(stageTwoFlipFallback);
  stageTwoFlipFallback = 0;
  clearTimeout(stageTwoFinishFallback);
  stageTwoFinishFallback = 0;
}

function showStageTwoFront() {
  if (!flowStarted || !isFlowPhase(FLOW_PHASE.STAGE_TWO, FLOW_PHASE.REPLAY_STAGE_TWO) || !belt.classList.contains("is-stage-two")) return;
  belt.classList.add("is-stage-two-front");
}

function finishStageTwo() {
  if (
    !flowStarted ||
    !isFlowPhase(FLOW_PHASE.STAGE_TWO, FLOW_PHASE.REPLAY_STAGE_TWO) ||
    !belt.classList.contains("is-stage-two") ||
    belt.classList.contains("is-moving")
  ) return;

  cancelStageTwoAudioSync();
  ydMusicInUse = false;
  belt.classList.add("is-moving");

  const replayWillUnlockReinsert = cardWasExtracted && extractedStageTwoReplayActive;
  const finishingPhase = flowPhase;
  const { move } = ANIMATION_CONFIG;
  sceneTimers.push(
    setTimeout(() => {
      if (!flowStarted || flowPhase !== finishingPhase) return;
      // 抽出卡盒后点击重播第二阶段：腰带上移完成后，才解锁再次插入。
      if (replayWillUnlockReinsert) {
        reinsertReady = true;
      }
      enableCardDrag({ preservePosition: cardWasExtracted });

      // 每一轮第二阶段结束、腰带真正上移停止后，都重新开放一次 kh1。
      // 包括：首次流程，以及卡盒拖出后重新循环的 REPLAY_STAGE_TWO。
      // 这样每一轮腰带重新出现到上方后，下一次轻点都能且只能触发一次 kh1。
      if (
        finishingPhase === FLOW_PHASE.STAGE_TWO ||
        finishingPhase === FLOW_PHASE.REPLAY_STAGE_TWO
      ) {
        postMoveKh1Ready = true;
        postMoveKh1Played = false;
        cardTrigger.setAttribute("aria-label", "点击一次播放 kh1；也可拖动卡盒插入腰带");
      }

      extractedStageTwoReplayActive = false;
    }, move.duration * 1000),
  );
}

function playStageTwoAudio() {
  if (!flowStarted || !isFlowPhase(FLOW_PHASE.STAGE_TWO, FLOW_PHASE.REPLAY_STAGE_TWO) || !belt.classList.contains("is-stage-two") || ydMusicInUse) return;

  ydMusicInUse = true;
  ydMusicAudio.muted = false;

  playAudio(ydMusicAudio).catch((error) => {
    console.warn("ydmusic 音效播放失败：", error);
    ydMusicInUse = false;
    // 总流程兜底由 startStageTwo() 统一管理，这里不再创建第二套计时器。
  });
}

function startStageTwo() {
  if (!flowStarted) return;

  setFlowPhase(extractedStageTwoReplayActive ? FLOW_PHASE.REPLAY_STAGE_TWO : FLOW_PHASE.STAGE_TWO);

  // PWA 循环关键修复：每次进入第二阶段都先真正移除 is-stage-two，强制重启
  // belt-materialize / energy-aura / water-roll。否则第二圈 class 没变化，Safari 不会重播波浪 CSS 动画。
  cancelStageTwoAudioSync();
  cancelAnimationFrame(rippleAnimationFrame);
  waterDisplacement.setAttribute("scale", "0");
  belt.classList.remove("is-stage-two", "is-stage-two-front", "is-moving");
  void belt.offsetWidth;
  belt.classList.add("is-ready", "is-stage-two");
  runWaterRipple(performance.now());

  stageTwoFlipFallback = setTimeout(
    showStageTwoFront,
    ANIMATION_CONFIG.stageTwo.backHold * 1000,
  );

  // 音效仍在第二阶段出现时启动，但只负责声音和正常 ended 结束点。
  playStageTwoAudio();

  // 无论 Safari 的 play Promise / ended 事件是否异常，第二阶段最长到 sequenceDuration 必须继续。
  // 这是单一总兜底，不再使用旧版无效的 80ms 二次 play。
  clearTimeout(stageTwoFinishFallback);
  stageTwoFinishFallback = setTimeout(
    finishStageTwo,
    ANIMATION_CONFIG.sequenceDuration * 1000,
  );
}

function finishFirstStage() {
  if (!flowStarted || !isFlowPhase(FLOW_PHASE.FIRST_STAGE) || belt.classList.contains("is-stage-two")) return;

  stopAudio(kh1Audio);
  startStageTwo();
}

function replayStageTwoFromExtractedCard(event) {
  if (!flowStarted || !isFlowPhase(FLOW_PHASE.DETACHED) || !cardWasExtracted || extractedStageTwoReplayActive || reinsertReady) return;
  if (suppressExtractedCardClick) return;

  event?.preventDefault();
  event?.stopPropagation();
  extractedStageTwoReplayActive = true;
  reinsertReady = false;

  // 第二阶段播放期间锁住外部卡盒位置；音效结束 + 腰带上移完成后再允许拖动插入。
  dragReady = false;
  isDragging = false;
  activePointerId = null;
  cardTrigger.classList.remove("is-draggable", "is-dragging");
  cardTrigger.classList.add("is-replay-waiting");
  cardTrigger.setAttribute("aria-label", "第二阶段播放中，完成后可重新插入卡盒");

  clearMirrorShatter();
  hideWsPanel();
  cancelBgSequence();
  scene.classList.remove("show-bg3", "show-final-background", "is-shattering");
  belt.classList.remove("is-moving", "is-card-powered", "is-stage-two-front", "is-shatter-hidden");
  cardBox.classList.remove("is-card-powered", "is-kpc-ejected");

  stopAudio(ydMusicAudio);
  ydMusicInUse = false;
  startStageTwo();
}

function startFromCard(event) {
  event?.stopPropagation();

  // 卡盒已经从腰带抽出后，再点击同一张卡盒，直接重新播放第二阶段。
  if (cardWasExtracted && !reinsertReady && cardTrigger.classList.contains("is-draggable")) {
    replayStageTwoFromExtractedCard(event);
    return;
  }

  // 每一轮第二阶段结束并且腰带已经上移停止后：
  // 只接受一次真正“轻点”来播放 kh1。首次流程和卡盒拖出后的循环流程都适用。
  // 拖动卡盒不会误触发，也不会消耗这次机会。
  if (
    postMoveKh1Ready &&
    !postMoveKh1Played &&
    isFlowPhase(FLOW_PHASE.CARD_DRAG) &&
    externalCardPointerTravel <= 8
  ) {
    postMoveKh1Ready = false;
    postMoveKh1Played = true;
    cardTrigger.setAttribute("aria-label", "拖动卡盒至腰带右侧，再插入凹槽");
    playAudio(kh1Audio).catch((error) => {
      console.warn("腰带上移后 kh1 音效播放失败：", error);
    });
    return;
  }

  if (flowStarted || !isFlowPhase(FLOW_PHASE.IDLE) || !cardTrigger.classList.contains("is-ready")) {
    return;
  }

  flowStarted = true;
  cardTrigger.classList.remove("is-ready");
  cardTrigger.classList.add("is-waiting");

  // 第一次点击不再播放 kh1，也不再等待旧第一阶段。
  // 仍在真实用户手势中预解锁后续关键音效，然后立即进入第二阶段。
  ydMusicInUse = false;
  insertionAudioInUse = false;
  prepareCriticalSfxFromGesture(["mocha", "charu"]).catch(() => undefined);
  prepareChakaSfxFromGesture().catch(() => undefined);

  startStageTwo();
}

async function waitForSceneImages() {
  await Promise.all(
    sceneImages.map((image) => {
      const loaded = image.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
        });

      return loaded.then(() => image.decode?.().catch(() => undefined));
    }),
  );
}

// PWA 启动优先：初始卡盒不能依赖所有图片 decode 完成才出现。
// 第一帧先把 cardTrigger 设为 ready；图片随后全部就绪时只做安全的布局校准。
requestAnimationFrame(() => {
  if (!flowStarted) {
    applyPhoneLayout();
    resetToCard();
  }
});

waitForSceneImages().then(() => {
  applyPhoneLayout();
  if (!flowStarted && !cardTrigger.classList.contains("is-ready")) resetToCard();
});

cardTrigger.addEventListener("click", startFromCard);
cardTrigger.addEventListener("pointerdown", handleCardPointerDown);
cardTrigger.addEventListener("pointermove", handleCardPointerMove);
cardTrigger.addEventListener("pointerup", handleCardPointerEnd);
cardTrigger.addEventListener("pointercancel", handleCardPointerEnd);
cardTrigger.addEventListener("contextmenu", (event) => event.preventDefault());
// 兼容旧 FIRST_STAGE 的保底监听保留；当前初始流程已不进入 FIRST_STAGE，
// 因此腰带上移后单独播放 kh1 结束时不会触发任何后续流程。
kh1Audio.addEventListener("ended", finishFirstStage);
ydMusicAudio.addEventListener("ended", finishStageTwo);
window.addEventListener("resize", applyPhoneLayout);
window.visualViewport?.addEventListener("resize", applyPhoneLayout);
cardBox.addEventListener("pointerdown", handleExtractPointerDown);
cardBox.addEventListener("pointermove", handleExtractPointerMove);
cardBox.addEventListener("pointerup", handleExtractPointerEnd);
cardBox.addEventListener("pointercancel", handleExtractPointerEnd);
cardBox.addEventListener("contextmenu", (event) => event.preventDefault());
wsButtons.forEach((button) => button.addEventListener("click", selectWsCard));
kpcLayer.addEventListener("pointerdown", (event) => {
  // iPhone/触屏走下面独立的 Touch Events 主通道，避免 Pointer Capture 生命周期造成松手后延迟。
  if (event.pointerType === "touch") return;
  if (auxOpen && auxArmed) {
    prepareChakaSfxFromGesture().catch(() => undefined);
    beginAuxKpcDrag(event, false, { usePointerCapture: true });
    return;
  }
  if (cardBox.classList.contains("is-kpc-ejected")) event.stopPropagation();
});

// iPhone / PWA 主通道：单一 Touch Session + JS 数学命中。
// 不使用 pointer capture，也不读取自由卡 transform DOM 的 hit-test 几何。
window.addEventListener("touchstart", handleAuxTouchStart, { capture: true, passive: false });
window.addEventListener("touchmove", handleAuxTouchMove, { capture: true, passive: false });
window.addEventListener("touchend", handleAuxTouchEnd, { capture: true, passive: false });
window.addEventListener("touchcancel", handleAuxTouchEnd, { capture: true, passive: false });
window.addEventListener("blur", handleInteractionEnvironmentReset);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) handleInteractionEnvironmentReset();
});
window.addEventListener("pagehide", handleInteractionEnvironmentReset);

// Pointer Events 只保留给鼠标/触控笔，不参与 iPhone touch 拖卡。
window.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch") return;
  handleAuxFloatingCardGlobalPointerDown(event);
}, { capture: true, passive: false });
window.addEventListener("pointermove", (event) => {
  if (event.pointerType === "touch") return;
  moveAuxKpcDrag(event);
}, { capture: true, passive: false });
window.addEventListener("pointerup", (event) => {
  if (event.pointerType === "touch") return;
  endAuxKpcDrag(event);
}, { capture: true, passive: false });
window.addEventListener("pointercancel", (event) => {
  if (event.pointerType === "touch") return;
  endAuxKpcDrag(event);
}, { capture: true, passive: false });

auxTransferCard?.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch") return;
  if (event.pointerType === "mouse" && event.button !== 0) return;
  if (!auxKpcFullyExtracted || !auxKpcFrontReady || auxCardInserted || auxKpcDragging) return;
  if (!auxOpen || !auxArmed) return;
  prepareChakaSfxFromGesture().catch(() => undefined);
  beginAuxKpcDrag(event, true, { usePointerCapture: true });
});
sideButtons[0]?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  playAudio(guoAudio).catch((error) => {
    console.warn("guo 音效播放失败：", error);
  });
});

sideButtons[1]?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  playAudio(huhuanAudio).catch((error) => {
    console.warn("huhuan 音效播放失败：", error);
  });
});

sideButtons[2]?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  playAudio(jingshijieAudio).catch((error) => {
    console.warn("jingshijie 音效播放失败：", error);
  });
});

sideButtons[3]?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  playAudio(timeoutAudio).catch((error) => {
    console.warn("timeout 音效播放失败：", error);
  });
});
centerActionButtons[0]?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  playAudio(boxingAudio).catch((error) => {
    console.warn("boxing 音效播放失败：", error);
  });
});
centerActionButtons[1]?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  playAudio(jianjiAudio).catch((error) => {
    console.warn("jianji 音效播放失败：", error);
  });
});

centerActionButtons[2]?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  playAudio(chaoxiaoAudio).catch((error) => {
    console.warn("chaoxiao 音效播放失败：", error);
  });
});
auxTransferCard?.addEventListener("contextmenu", (event) => event.preventDefault());
bsButton?.addEventListener("click", toggleAuxDock);
sz1Button?.addEventListener("click", handleSz1Click);
sz2Button?.addEventListener("click", handleSz2Click);
bg4Center.addEventListener("animationend", finishBg4Merge);
bg4Center.addEventListener("webkitAnimationEnd", finishBg4Merge);
applyPhoneLayout();

if ("serviceWorker" in navigator) {
  // 稳定更新策略：当前页面运行期间绝不主动切换 Service Worker，也绝不刷新页面。
  // 新 build 完整安装后保持 waiting；当旧页面真正关闭后由浏览器自然激活，
  // 下一次打开 PWA 才整体进入新版本，避免使用过程中突然回到初始卡盒。
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(`./sw.js?v=${PWA_BUILD}`, {
        updateViaCache: "none",
      });
      await registration.update();
    } catch (error) {
      console.warn("PWA 离线服务注册失败：", error);
    }
  });
}
