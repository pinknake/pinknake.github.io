/* ================= VERSION ================= */
const CACHE_NAME = "kitchen-manager-v8";

/* ================= APP SHELL ================= */
const APP_SHELL = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/icons/icon192.png",
  "/icons/icon-512.png"
];

/* ================= INSTALL ================= */
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        APP_SHELL.map(url =>
          cache.add(url).catch(err => console.log("Cache fail:", url))
        )
      )
    )
  );
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

/* ================= FETCH ================= */
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // ❌ Skip ads & external scripts cache
  if (
    url.origin.includes("googlesyndication") ||
    url.origin.includes("doubleclick") ||
    url.origin.includes("google-analytics") ||
    url.origin.includes("iconify") ||
    url.origin.includes("simplesvg") ||
    url.origin.includes("unisvg")
  ) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(res => {
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
