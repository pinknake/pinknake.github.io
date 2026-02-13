const CACHE_NAME = "ghar-manager-v1";

self.addEventListener("install", event=>{
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>{
      return cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./app.js",
        "./manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", event=>{
  event.respondWith(
    caches.match(event.request).then(res=>res || fetch(event.request))
  );
});
