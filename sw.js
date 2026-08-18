// OUJA v119: atomic core update. Ryuki interaction base + 12 WS cards.
const BUILD = "119";
const CACHE_PREFIX = "ryuki-pwa-";
const CACHE_NAME = "ryuki-pwa-v119-stable";
const INSTALL_CACHE_NAME = `${CACHE_NAME}-install`;
const INDEX_FALLBACK = `./index.html?appv=${BUILD}`;

// 主流程所需文件必须作为同一个完整版本安装成功。
// 任意一项失败，install 直接失败，旧 Service Worker 与旧缓存继续完整运行。
const REQUIRED_ASSETS = [
  INDEX_FALLBACK,
  `./manifest.webmanifest?v=${BUILD}`,
  `./style.css?v=${BUILD}`,
  `./script.js?v=${BUILD}`,

  "./assets/images/bg.png",
  "./assets/images/bg2.png",
  "./assets/images/bg3.png",
  "./assets/images/bg4.png",
  "./assets/images/bg5.png",
  "./assets/images/ydbg.png",
  "./assets/images/ydup.png",
  "./assets/images/yddown.png",
  "./assets/images/khdc.png",
  "./assets/images/kpc.png",
  "./assets/images/khzd.png",
  "./assets/images/khfg.png",
  "./assets/images/ydfg.png",

  `./assets/audio/kh1.mp3?av=${BUILD}`,
  `./assets/audio/ydmusic.mp3?av=${BUILD}`,
  `./assets/audio/charu.mp3?av=${BUILD}`,
  `./assets/audio/mocha.mp3?av=${BUILD}`,
];

// 不影响第二阶段/整卡盒主流程的资源允许后续按需缓存。
const OPTIONAL_ASSETS = [
  "./assets/images/ws1.png",
  "./assets/images/ws2.png",
  "./assets/images/ws3.png",
  "./assets/images/ws4.png",
  "./assets/images/ws5.png",
  "./assets/images/ws6.png",
  "./assets/images/ws7.png",
  "./assets/images/ws8.png",
  "./assets/images/ws9.png",
  "./assets/images/ws10.png",
  "./assets/images/ws11.png",
  "./assets/images/ws12.png",
  "./assets/images/bs.png",
  "./assets/images/sz1.png",
  "./assets/images/sz2.png",
  "./assets/images/syfg.png",
  `./assets/audio/chouka.mp3?av=${BUILD}`,
  `./assets/audio/chaka.mp3?av=${BUILD}`,
  `./assets/audio/huagai1.mp3?av=${BUILD}`,
  `./assets/audio/huagai2.mp3?av=${BUILD}`,
  `./assets/audio/j.mp3?av=${BUILD}`,
  `./assets/audio/q.mp3?av=${BUILD}`,
  `./assets/audio/d.mp3?av=${BUILD}`,
  `./assets/audio/l.mp3?av=${BUILD}`,
  `./assets/audio/f.mp3?av=${BUILD}`,
  `./assets/audio/hc.mp3?av=${BUILD}`,
  `./assets/audio/jianjianglin.mp3?av=${BUILD}`,
  `./assets/audio/longjiao.mp3?av=${BUILD}`,
  `./assets/audio/bsj.mp3?av=${BUILD}`,
  `./assets/audio/guo.mp3?av=${BUILD}`,
  `./assets/audio/boxing.mp3?av=${BUILD}`,
  `./assets/audio/jianji.mp3?av=${BUILD}`,
  "./assets/icons/icon-192.png?v=50",
  "./assets/icons/icon-512.png?v=50",
  "./assets/icons/icon-maskable-512.png?v=50",
  "./assets/icons/apple-touch-icon.png?v=50",
];

const scopedUrl = (path) => new URL(path, self.location.href).href;

async function fetchFresh(path) {
  const response = await fetch(scopedUrl(path), { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} -> HTTP ${response.status}`);
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    // 安装阶段先写独立临时缓存。任何一步失败都会把本 build 的临时/半成品缓存清干净。
    await caches.delete(INSTALL_CACHE_NAME);
    try {
      const installCache = await caches.open(INSTALL_CACHE_NAME);

      for (const path of REQUIRED_ASSETS) {
        const response = await fetchFresh(path);
        await installCache.put(scopedUrl(path), response);
      }

      await Promise.allSettled(
        OPTIONAL_ASSETS.map(async (path) => {
          const response = await fetchFresh(path);
          await installCache.put(scopedUrl(path), response);
        }),
      );

      // 关键资源全部成功后才提交为正式缓存。
      await caches.delete(CACHE_NAME);
      const finalCache = await caches.open(CACHE_NAME);
      const requests = await installCache.keys();
      for (const request of requests) {
        const response = await installCache.match(request);
        if (!response) throw new Error(`install cache missing: ${request.url}`);
        await finalCache.put(request, response);
      }
      await caches.delete(INSTALL_CACHE_NAME);
    } catch (error) {
      await Promise.all([
        caches.delete(INSTALL_CACHE_NAME),
        caches.delete(CACHE_NAME),
      ]);
      throw error;
    }

    // 不主动 skipWaiting。旧页面在新 build 完整安装前后都不会被半途换零件。
  })());
});

self.addEventListener("message", (event) => {
  // 只允许同 build 页面请求激活。旧版本页面不能强行把新 SW 接管到当前运行中的 App。
  if (event.data?.type === "SKIP_WAITING" && String(event.data?.build) === BUILD) {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    // 只清理 Ryuki 自己的旧缓存，避免误删同一域名下其他 PWA/页面的 CacheStorage。
    await Promise.all(
      names
        .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .map((name) => caches.delete(name)),
    );
    // 激活只发生在旧页面已自然释放后；claim 用于让下一次打开的页面立即受当前完整 build 控制。
    await self.clients.claim();
  })());
});

function canonicalRequest(request) {
  const url = new URL(request.url);
  // sid 只用于区分浏览器媒体会话；同一 build 永远映射到安装时已经验证过的 canonical 字节。
  url.searchParams.delete("sid");
  return new Request(url.href, { method: "GET" });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  // 当前激活 build 的首页固定从其原子缓存返回。新 build 完整安装并接管后才整体换页。
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cachedIndex = await caches.match(scopedUrl(INDEX_FALLBACK));
      if (cachedIndex) return cachedIndex;
      return fetch(request, { cache: "no-store" });
    })());
    return;
  }

  // 带 ?av=BUILD 的音频属于不可变 build 资源：Cache First。
  // 这样同一次 v117 绝不会一会播放安装时的 charu、一会又被网络上的另一份覆盖。
  if (requestUrl.pathname.includes("/assets/audio/") && requestUrl.searchParams.get("av") === BUILD) {
    const cacheKey = canonicalRequest(request);
    event.respondWith((async () => {
      const cached = await caches.match(cacheKey);
      if (cached) return cached;
      const response = await fetch(request, { cache: "no-store" });
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(cacheKey, response.clone());
      }
      return response;
    })());
    return;
  }

  // 其余静态资源同样优先当前 build 缓存，未命中才请求网络并补入当前缓存。
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
