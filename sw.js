// Service Worker for Trøjborg-appen (Push Notifications & Red Dot / App Badging)
const CACHE_NAME = 'trojborg-app-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Modtag push-notifikationer i baggrunden når telefonen er låst eller appen er lukket
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Ny opgave på Trøjborg-appen', body: event.data.text() };
    }
  }

  const title = data.title || 'Ny opgave på Trøjborg-appen';
  const options = {
    body: data.body || 'Der er oprettet en ny opgave på Trøjborg-appen.',
    icon: '/assets/neighborhood.svg',
    badge: '/assets/neighborhood.svg',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  // Sæt den røde notifikationsprik på hjemskærmens app-ikon (App Badging API)
  if ('setAppBadge' in navigator) {
    navigator.setAppBadge(1).catch((err) => console.log('AppBadge error:', err));
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Når brugeren trykker på notifikationen på sin telefon
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Fjern den røde prik på app-ikonet når der trykkes
  if ('clearAppBadge' in navigator) {
    navigator.clearAppBadge().catch(() => {});
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
