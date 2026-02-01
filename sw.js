const CACHE_NAME = 'molscreen-seamless-v1';

// ფაილები, რომლებიც აუცილებლად უნდა დაქეშდეს
const urlsToCache = [
  './index.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  // ძველი ქეშების წაშლა, რომ წარწერები ან ძველი შეცდომები არ დარჩეს
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // ვიდეოების და საიტის ქეშირების ლოგიკა
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // თუ ქეშშია, მომენტალურად ვაძლევთ
      }
      return fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // ვიწერთ Dropbox-ის ვიდეოებს მომავალი ოფლაინ მუშაობისთვის
          if (event.request.url.includes('dropbox') || event.request.url.includes('index.html')) {
            cache.put(event.request, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    })
  );
});
