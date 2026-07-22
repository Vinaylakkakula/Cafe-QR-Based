// ── Service Worker for MAHA FAST FOOD COURT PWA ──────────────────────────────
const CACHE_NAME = 'maha-pos-v4';

// Core files to cache for offline use
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/customer-order.html',
  '/supabase-config.js',
  '/supabase.js',
  '/auth.js',
  '/admin-panel.js',
  '/kitchen-display.js',
  '/qr-orders.js',
  '/staff.js',
  '/mobile-fix.js',
  '/qrcode.min.js',
  '/icon-512.png',
  '/hero.jpeg'
];

// Install — cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching core assets');
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network-first strategy for API calls, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Network-first for Supabase API calls (always need fresh data)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// ── Push Notification Support ────────────────────────────────────────────────
// Handle messages from the main app to show notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, data } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: '/icon-512.png',
        badge: '/icon-512.png',
        tag: tag || 'maha-pos-notification',
        requireInteraction: true,
        vibrate: [300, 100, 300, 100, 300],
        data: data || {},
        actions: [
          { action: 'view', title: '👀 View Order' },
          { action: 'dismiss', title: '✕ Dismiss' }
        ]
      })
    );
  }
});

// Handle notification click — focus the app or open it
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  // Focus existing window or open new one
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing POS window
      for (const client of clientList) {
        if (client.url.includes('index.html') || client.url.endsWith('/')) {
          return client.focus();
        }
      }
      // No existing window — open new one
      return self.clients.openWindow('/');
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// ── Remote Web Push Event Listener ──────────────────────────────────────────
// Wakes up the service worker when a push payload is received from FCM/APNs
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  let data = { title: '🔔 New QR Order', body: 'A new order has been placed!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: '🔔 New QR Order', body: event.data.text() };
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-512.png',
      badge: '/icon-512.png',
      tag: data.tag || 'maha-pos-notification',
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300],
      data: data.data || {},
      actions: [
        { action: 'view', title: '👀 View Order' },
        { action: 'dismiss', title: '✕ Dismiss' }
      ]
    })
  );
});

