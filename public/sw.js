/* NellMusic Service Worker */
const CACHE = 'nellmusic-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// Show notification triggered by page
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'NOTIFY') {
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/favicon.svg',
      badge: '/favicon.svg',
      image: data.image,
      tag: data.tag || 'nellmusic',
      data: { url: data.url || '/' },
      vibrate: [120, 60, 120],
    });
  }
});

// Push event (FCM/web-push). Payload: { title, body, image, url }
self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { title: 'NellMusic', body: event.data?.text() || '' }; }
  const title = payload.title || payload.notification?.title || 'NellMusic';
  const body = payload.body || payload.notification?.body || '';
  const image = payload.image || payload.notification?.image;
  const url = payload.url || payload.data?.url || '/';
  event.waitUntil(
    self.registration.showNotification(title, {
      body, image, icon: '/favicon.svg', badge: '/favicon.svg',
      data: { url }, vibrate: [120, 60, 120],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ('focus' in w) { w.navigate(url).catch(() => {}); return w.focus(); }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
