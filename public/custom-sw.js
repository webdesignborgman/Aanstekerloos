// public/custom-sw.js

/* Push event: ontvang push van je server en toon een melding via serviceworker. */
self.addEventListener('push', (event) => {
  console.log('[Custom SW] Push event ontvangen');
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.warn('Push payload kon niet als JSON worden geparsed, fallback gebruikt.', e);
    data = { title: 'Aanstekerloos', body: 'Je hebt een nieuw bericht.' };
  }

  const options = {
    body: data.body || 'Je hebt een nieuw bericht.',
    icon: '/icons/android-chrome-192x192.png',
    badge: '/icons/favicon-32x32.png',
    vibrate: [200, 100, 200],
    tag: 'aanstekerloos-notificatie',
    renotify: true,
    actions: [
      { action: 'open_app', title: 'Open App' },
    ],
  };

  // Toon de notificatie via de serviceworker API.
  event.waitUntil(
    self.registration.showNotification(data.title || 'Aanstekerloos', options),
  );
});

/* Notification click event: afhandelen wanneer gebruiker op de melding klikt */
self.addEventListener('notificationclick', (event) => {
  console.log('[Custom SW] Notificatie geklikt.', event.notification.tag);
  event.notification.close();

  // Bepaal naar welke URL je wilt navigeren wanneer de notificatie wordt aangeklikt
  const url = '/';

  // Focus bestaande tab of open een nieuwe
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    }),
  );
});
