// OUJA：纯在线模式。
// 不预缓存、不写入 CacheStorage、不提供离线回退。
// 所有 GET 资源都直接请求网络，并要求浏览器跳过 HTTP 缓存。
const OUJA_CACHE_PREFIX = "ouja-pwa-";

async function clearOuJaCaches() {
  const names = await caches.keys();
  await Promise.all(
    names
      .filter((name) => name.startsWith(OUJA_CACHE_PREFIX))
      .map((name) => caches.delete(name)),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    // 安装新版 SW 时立即清掉 OUJA 以前留下的 CacheStorage。
    await clearOuJaCaches();

    // 这次是缓存机制切换，直接替换旧 SW，不再等待旧页面自然退出。
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // 再清一次，防止旧 SW 在切换期间又留下缓存。
    await clearOuJaCaches();

    // 立即接管当前 OUJA 页面。
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  // 纯在线模式：
  // 1. 不读取 CacheStorage
  // 2. 不写入 CacheStorage
  // 3. 不使用旧的 HTTP 缓存
  // 4. 网络失败就直接失败，不回退旧资源
  event.respondWith(fetch(request, { cache: "no-store" }));
});
