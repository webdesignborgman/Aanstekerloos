const CACHE_NAME = 'aanstekerloos-v1';

self.addEventListener("install", (event) => {
    console.log("🔧 Service Worker installed");
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll([
          '/',
          '/dashboard',
          '/manifest.json',
          '/icons/android-chrome-192x192.png',
          '/icons/android-chrome-512x512.png',
          '/icons/apple-touch-icon.png'
        ]);
      })
    );
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (event) => {
    console.log("🚀 Service Worker activated");
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });

  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  
  self.addEventListener("push", (event) => {
    const data = event.data?.json() || { title: "Nieuw bericht", body: "Je hebt een melding!" };
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: "/icons/android-chrome-192x192.png",
      })
    );
  });
  