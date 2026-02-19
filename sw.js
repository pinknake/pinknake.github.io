/* ================= VERSION ================= */
const CACHE_NAME = "kitchen-manager-v3";

/* ================= APP SHELL ================= */
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.JPG",
  "./icons/icon-512.JPG"
];


/* ================= INSTALL ================= */
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
  );
});


/* ================= ACTIVATE ================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
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
    url.origin.includes("google-analytics")
  ) return;

  event.respondWith(

    caches.match(event.request).then(cached => {

      const networkFetch = fetch(event.request)
        .then(response => {

          // Save fresh copy
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }

          return response;
        })
        .catch(() => cached);

      // ⚡ Instant load from cache
      return cached || networkFetch;
    })
  );
});
