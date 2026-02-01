const CACHE_NAME = 'molscreen-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html'
];

// ინსტალაციისას ვინახავთ მხოლოდ ბაზისურ ფაილებს
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// ვიდეოების და სხვა რესურსების მართვა
self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // თუ მოთხოვნა არის ვიდეოზე (მაგალითად Dropbox-იდან)
    if (url.includes('.mp4') || url.includes('raw=1')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    // თუ უკვე გვაქვს ქეშში, ვაბრუნებთ მას
                    if (response) return response;

                    // თუ არა, ვიწერთ, ვინახავთ და ვაბრუნებთ
                    return fetch(event.request).then((networkResponse) => {
                        if (networkResponse.status === 200 || networkResponse.status === 206) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => {
                        // ინტერნეტის გარეშე მუშაობის მცდელობა
                        return cache.match(event.request);
                    });
                });
            })
        );
        return;
    }

    // სხვა სტანდარტული მოთხოვნებისთვის
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
