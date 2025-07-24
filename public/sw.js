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
  console.log("[Service Worker] Push ontvangen.", event.data.text());
  const data = event.data?.json() || {
    title: "Aanstekerloos",
    body: "Dit is een testbericht.",
  };

  const options = {
    body: data.body,
    icon: "/icons/android-chrome-192x192.png",
    badge: "/icons/favicon-32x32.png", // Optioneel: voor de notificatiebalk
    vibrate: [200, 100, 200], // Optioneel: trilpatroon
    tag: "aanstekerloos-notificatie", // Groepeert notificaties
    renotify: true, // Toont nieuwe notificatie ook als tag overeenkomt
    actions: [ // Optioneel: knoppen in de notificatie
      { action: "open_app", title: "Open App" },
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificatie geklikt.', event.notification.tag);
  event.notification.close(); // Sluit de notificatie

  if (event.action === 'open_app') {
    event.waitUntil(
      clients.openWindow('/') // Opent de hoofdpagina van je app
    );
  }
});
  