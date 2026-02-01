const CACHE_NAME = 'molscreen-v5';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => {
      if (res) return res; // თუ ქეშშია, ეგრევე მიეცი (მომენტალურია)
      
      return fetch(event.request).then((networkRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.includes('dropbox')) {
            cache.put(event.request, networkRes.clone());
          }
          return networkRes;
        });
      });
    })
  );
});
