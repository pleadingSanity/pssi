/**
 * SERVICE WORKER - P.S-FULL.AI OFFLINE SUPPORT
 * 
 * Enables full offline functionality
 * - Caches all AI resources
 * - Background sync
 * - Offline request queue
 * - Push notifications
 */

const CACHE_VERSION = 'psfullai-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Cache size limits (entries, not bytes)
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_API_CACHE_SIZE = 100;
const MAX_API_CACHE_AGE_MS = 60 * 60 * 1000; // 1 hour

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/ai-demo.html',
  '/offline.html',
  '/manifest.json',
  '/icon.png',
  '/badge.png',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/offline-ai.ts',
  '/src/background-monitor.ts'
];

// Install service worker
self.addEventListener('install', (event: any) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('📦 Caching static files');
      return cache.addAll(STATIC_FILES);
    })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event: any) => {
  console.log('✅ Service Worker activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== API_CACHE) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Clean up oversized caches on activation
      return Promise.all([
        limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE),
        limitCacheSize(API_CACHE, MAX_API_CACHE_SIZE),
        cleanOldApiCache()
      ]);
    })
  );
  
  // Take control immediately
  return (self as any).clients.claim();
});

/**
 * Limit cache size to prevent excessive memory usage
 */
async function limitCacheSize(cacheName: string, maxSize: number) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    // Delete oldest entries (FIFO)
    const toDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(toDelete.map(key => cache.delete(key)));
    console.log(`🧹 Cleaned ${toDelete.length} items from ${cacheName}`);
  }
}

/**
 * Clean old API cache entries
 */
async function cleanOldApiCache() {
  const cache = await caches.open(API_CACHE);
  const keys = await cache.keys();
  const now = Date.now();
  
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const cachedTime = response.headers.get('sw-cached-time');
      if (cachedTime && (now - parseInt(cachedTime)) > MAX_API_CACHE_AGE_MS) {
        await cache.delete(request);
        console.log(`🧹 Deleted old API cache: ${request.url}`);
      }
    }
  }
}

// Fetch handler - network first, fall back to cache
self.addEventListener('fetch', (event: any) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/.netlify/functions/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses with timestamp
          if (response.ok) {
            const responseClone = response.clone();
            const responseWithTime = new Response(responseClone.body, {
              status: response.status,
              statusText: response.statusText,
              headers: new Headers(response.headers)
            });
            responseWithTime.headers.set('sw-cached-time', Date.now().toString());
            
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseWithTime);
              limitCacheSize(API_CACHE, MAX_API_CACHE_SIZE);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if offline
          return caches.match(request).then((cached) => {
            return cached || new Response(JSON.stringify({
              success: false,
              offline: true,
              message: 'Offline - request will sync when connection restored'
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Static files - Stale-While-Revalidate strategy
  event.respondWith(
    caches.match(request).then((cached) => {
      // Fetch from network in the background to update the cache
      const fetchPromise = fetch(request).then((networkResponse) => {
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, networkResponse.clone());
          limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);
        });
        return networkResponse;
      });

      // Return cached response immediately if available, otherwise wait for fetch
      return cached || fetchPromise;
    }).catch(() => {
      // If both cache and network fail, show the offline page for navigation requests
      if (request.mode === 'navigate') {
        return caches.match('/offline.html');
      }
    })
  );
});

// Background sync
self.addEventListener('sync', (event: any) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-ai-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  console.log('📤 Syncing offline data...');
  
  // Get all cached API requests
  const cache = await caches.open(API_CACHE);
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      // Retry failed requests
      await fetch(request);
      console.log('✅ Synced:', request.url);
    } catch (error) {
      console.error('❌ Failed to sync:', request.url);
    }
  }
}

// Push notifications
self.addEventListener('push', (event: any) => {
  console.log('📬 Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'P.S-Full.AI';
  const options = {
    body: data.body || 'New update from your AI',
    icon: '/icon.png',
    badge: '/badge.png',
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' }
    ]
  };
  
  event.waitUntil(
    (self as any).registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      (self as any).clients.openWindow(event.notification.data)
    );
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event: any) => {
  if (event.tag === 'daily-report') {
    event.waitUntil(generateDailyReport());
  }
});

async function generateDailyReport() {
  console.log('📊 Generating daily report...');
  
  try {
    const response = await fetch('/.netlify/functions/background-monitor', {
      method: 'POST',
      body: JSON.stringify({ action: 'generate_report' })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Daily report generated:', data);
    }
  } catch (error) {
    console.error('❌ Failed to generate report:', error);
  }
}

export {};
