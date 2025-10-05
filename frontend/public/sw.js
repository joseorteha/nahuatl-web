// public/sw.js - Service Worker para PWA
const CACHE_NAME = 'nawatlahtol-v1.0.0';
const OFFLINE_URL = '/offline';

// Assets esenciales para cache
const ESSENTIAL_CACHE = [
  '/',
  '/offline',
  '/diccionario',
  '/login',
  '/logooo.png',
  '/manifest.json',
  // CSS y JS se cachearán automáticamente por Next.js
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching essential resources');
        return cache.addAll(ESSENTIAL_CACHE);
      })
      .then(() => {
        console.log('SW: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW: Installation failed', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('SW: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external URLs
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }

  // SKIP Next.js internal chunks and HMR in development
  if (url.pathname.includes('/_next/') || 
      url.pathname.includes('webpack-hmr') || 
      url.pathname.includes('__nextjs_original-stack-frame') ||
      url.pathname.includes('node_modules_') ||
      url.pathname.includes('_next/static/') ||
      url.pathname.includes('hot-reload') ||
      url.search.includes('hot-reload')) {
    // Let Next.js handle these directly - no service worker interference
    return;
  }

  // SKIP development mode completely to avoid interference
  if (url.hostname === 'localhost' || 
      url.hostname === '127.0.0.1' ||
      url.port === '3000' ||
      url.port === '3001') {
    console.log('SW: Skipping development request:', url.pathname);
    return;
  }

  // Handle API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for offline access
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Show offline page for navigation requests when network fails
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Handle static assets - cache first, network fallback
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Cache static assets
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('SW: Background sync triggered');
    // TODO: Implement background sync for offline actions
  }
});

// Push notifications - Evento push mejorado
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received', event);
  
  let notificationData = {
    title: 'Nawatlahtol',
    body: 'Nueva actividad en tu cuenta',
    icon: '/logooo.png',
    badge: '/logooo.png',
    data: { url: '/dashboard' }
  };

  // Parse data if available
  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/logooo.png',
    badge: notificationData.badge || '/logooo.png',
    vibrate: [200, 100, 200],
    data: notificationData.data || { url: '/dashboard' },
    actions: [
      {
        action: 'open',
        title: 'Ver',
        icon: '/logooo.png'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ],
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click - Manejo mejorado
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification click received', event);
  
  event.notification.close();

  const url = event.notification.data?.url || '/dashboard';

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window/tab open with the target URL
          for (const client of clientList) {
            if (client.url.includes(url) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // If no existing window, open a new one
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
  // 'close' action just closes the notification (already handled above)
});

console.log('SW: Service worker loaded');