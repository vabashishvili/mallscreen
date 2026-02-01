const CACHE_NAME = 'molscreen-v3'; // ვერსია შევცვალეთ v3-ზე, რომ ბრაუზერმა განახლება დააფიქსიროს

self.addEventListener('install', (event) => {
  self.skipWaiting(); // აიძულებს ახალ ვერსიას მაშინვე გააქტიურდეს
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // ძველი ქეშის წაშლა (რომ წარწერა გაქრეს)
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // თუ ქეშში გვაქვს - ვაბრუნებთ ქეშიდან, თუ არა - ვიწერთ ინტერნეტიდან
      return response || fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // ვინახავთ მხოლოდ index.html-ს და Dropbox-ის ვიდეოებს
          if (event.request.url.includes('dropbox') || event.request.url.includes('index.html') || event.request.url.includes('github.io')) {
            cache.put(event.request, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    })
  );
});
