const CACHE_VERSION = "v3";
const STATIC_CACHE = "km-static-" + CACHE_VERSION;
const DYNAMIC_CACHE = "km-dynamic-" + CACHE_VERSION;

const STATIC_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./offline.html"
];

/* INSTALL */
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_FILES))
  );
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* FETCH */
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request)
      .then(cacheRes => {
        return cacheRes || fetch(event.request).then(fetchRes => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request.url, fetchRes.clone());
            return fetchRes;
          });
        });
      })
      .catch(() => caches.match("./offline.html"))
  );
});

  // Cache first for static
  event.respondWith(
    caches.match(event.request)
      .then(cacheRes => {
        if (cacheRes) return cacheRes;

        return fetch(event.request)
          .then(fetchRes => {

            if (!fetchRes || fetchRes.status !== 200 || fetchRes.type !== "basic") {
              return fetchRes;
            }

            const resClone = fetchRes.clone();

            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, resClone);
                limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
              });

            return fetchRes;
          })
          .catch(() => caches.match("./offline.html"));
      })
  );
});

/* ================= LIMIT CACHE SIZE ================= */

function limitCacheSize(name, size) {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(() => limitCacheSize(name, size));
      }
    });
  });
}

/* ================= BACKGROUND SYNC ================= */

self.addEventListener("sync", event => {
  if (event.tag === "syncData") {
    event.waitUntil(syncData());
  }
});

function syncData() {
  return new Promise(resolve => {
    console.log("Background Sync Running...");
    resolve();
  });
}

/* ================= PUSH NOTIFICATION ================= */

self.addEventListener("push", event => {

  const data = event.data ? event.data.text() : "Kitchen Manager Update";

  const options = {
    body: data,
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png"
  };

  event.waitUntil(
    self.registration.showNotification("Kitchen Manager", options)
  );
});

/* ================= NOTIFICATION CLICK ================= */

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("./index.html")
  );
});
