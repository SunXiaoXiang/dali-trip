// 离线缓存：本站文件网络优先、失败回退缓存，保证弱网/无网时任务和应急页可用。
// 高德地图瓦片与接口不缓存（跨域且需实时数据）。
const CACHE = "mytrip-v2";
const SHELL = [
  "./", "./index.html", "./style.css", "./manifest.json", "./icon.svg",
  "./config.js", "./data.js", "./trip.js", "./app.js", "./assistant.js",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "no-cache" }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // no-cache：每次向服务器校验（ETag），避免浏览器 HTTP 缓存导致更新延迟
  e.respondWith(
    fetch(e.request, { cache: "no-cache" })
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
