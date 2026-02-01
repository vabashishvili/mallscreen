const CACHE_NAME = 'molscreen-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // ჩვენი ვიდეოების ქეშირების ლოგიკა
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // მხოლოდ ჩვენი ვიდეოები და index.html დავაქეშოთ
          if (event.request.url.includes('dropbox') || event.request.url.includes('index.html')) {
            cache.put(event.request, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    })
  );
});
