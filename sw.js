// 收集箱：離線快取
// 工具本身：先試網絡（最多等 4 秒），失敗就用上次的版本，所以有網時永遠載入最新版。
// 外部元件（Supabase 程式庫、字型、YouTube 縮圖）：先用快取，背景更新。
// Supabase 的資料不經這裏，由工具自己處理離線暫存。

const CACHE = 'inbox-v1.9';
const SHELL = ['./', './index.html'];
const CDN_HOSTS = ['cdn.jsdelivr.net', 'unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'i.ytimg.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function networkFirst(req) {
  const network = fetch(req).then((res) => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put('./index.html', copy));
    }
    return res;
  });
  const timeout = new Promise((resolve) => setTimeout(resolve, 4000));
  return Promise.race([network.catch(() => null), timeout]).then(async (res) => {
    if (res) return res;
    const cached = await caches.match('./index.html');
    return cached || network;
  });
}

function staleWhileRevalidate(req) {
  return caches.open(CACHE).then(async (c) => {
    const cached = await c.match(req);
    const network = fetch(req)
      .then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; })
      .catch(() => cached);
    return cached || network;
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    const isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
    if (isPage) e.respondWith(networkFirst(req));
    return;
  }
  if (CDN_HOSTS.includes(url.hostname)) e.respondWith(staleWhileRevalidate(req));
});
