const CACHE_NAME = 'road-of-days-v7.7';
const ASSETS = [
  './',
  './index.html',
  './Road_of_Days_Chiangrai_v4.css',
  './Road_of_Days_Chiangrai_v4.js',
  './Road_of_Days_Models.js',
  './Road_of_Days_UX.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.includes('supabase.co')) return;

  event.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});

// รับคำสั่งแสดงการแจ้งเตือนบนแถบแจ้งเตือนระบบ (Android / Desktop Notification Bar)
self.addEventListener('message', event => {
  const data = event.data;
  if (data && data.type === 'SHOW_NOTIFICATION') {
    event.waitUntil(
      self.registration.showNotification(data.title || 'Road of Days · เส้นทางความทรงจำ', {
        body: data.body || 'แวะพักเขียนบันทึกเรื่องราวของวันนี้กันนะครับ',
        icon: './icon-192.png',
        badge: './icon-192.png',
        tag: data.tag || 'road-of-days-notify',
        vibrate: [180, 80, 180],
        data: { action: data.action || 'write' }
      })
    );
  }
});

// เมื่อผู้ใช้แตะที่แถบแจ้งเตือนด้านบนของมือถือ ให้เปิดหน้าแอปขึ้นมาทันที
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetAction = event.notification.data && event.notification.data.action;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({ type: 'NOTIFICATION_CLICKED', action: targetAction });
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('./index.html#home');
      }
    })
  );
});
