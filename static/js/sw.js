/**
 * Service Worker for Pivnice U Tygra
 * Progressive Web App implementation
 * AIAD Alpha Squad PWA Core
 */

const CACHE_NAME = 'u-tygra-v1.2.0';
const RUNTIME_CACHE = 'runtime-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/css/style.css',
  '/js/app.js',
  '/js/performance.js',
  '/img/logo.svg',
  '/img/favicon.ico',
  '/img/gallery/interior-main.jpg',
  '/img/gallery/beer-taps.jpg',
  '/img/gallery/food-chlebicky-1.jpg',
  '/site.webmanifest'
];

// Cache-first resources (long-term cache)
const CACHE_FIRST_URLS = [
  '/img/',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// Network-first resources (fresh data priority)
const NETWORK_FIRST_URLS = [
  'docs.google.com', // Google Sheets CSV
  'www.googletagmanager.com'
];

// Offline fallback content
const OFFLINE_FALLBACK = {
  page: '/offline.html',
  image: '/img/offline-placeholder.svg'
};

/**
 * Service Worker Installation
 * Pre-cache static assets
 */
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Pre-caching complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.error('❌ Pre-caching failed:', error);
      })
  );
});

/**
 * Service Worker Activation
 * Clean up old caches
 */
self.addEventListener('activate', event => {
  console.log('⚡ Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
            .map(cacheName => {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Claim all clients
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activated and ready');
    })
  );
});

/**
 * Fetch Event Handler
 * Implement caching strategies
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different resource types with appropriate strategies
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  } else if (isNetworkFirst(url)) {
    event.respondWith(networkFirst(request));
  } else if (url.pathname.endsWith('.jpg') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg')) {
    event.respondWith(cacheFirst(request, OFFLINE_FALLBACK.image));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

/**
 * Cache-first strategy for static assets
 */
async function cacheFirst(request, fallbackUrl = null) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    const response = await fetch(request);

    if (response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn('Cache-first failed:', error);

    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }

    throw error;
  }
}

/**
 * Network-first strategy for dynamic content
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    if (response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn('Network failed, trying cache:', error);

    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    throw error;
  }
}

/**
 * Stale-while-revalidate strategy
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.warn('Fetch failed in stale-while-revalidate:', error);
    return cached;
  });

  return cached || fetchPromise;
}

/**
 * Resource type detection helpers
 */
function isStaticAsset(url) {
  return CACHE_FIRST_URLS.some(pattern => url.href.includes(pattern)) ||
         url.pathname.startsWith('/css/') ||
         url.pathname.startsWith('/js/') ||
         url.pathname.startsWith('/img/');
}

function isNetworkFirst(url) {
  return NETWORK_FIRST_URLS.some(pattern => url.href.includes(pattern));
}

/**
 * Background Sync for offline forms
 */
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'contact-form') {
    event.waitUntil(processOfflineContactForms());
  }
});

/**
 * Process offline contact forms
 */
async function processOfflineContactForms() {
  try {
    const db = await openDatabase();
    const forms = await getPendingForms(db);

    for (const form of forms) {
      try {
        // Attempt to submit form data
        await submitForm(form.data);
        await removeForm(db, form.id);
        console.log('📝 Offline form submitted successfully');
      } catch (error) {
        console.warn('❌ Form submission failed:', error);
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

/**
 * Push notification handling
 */
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/img/android-chrome-192x192.png',
    badge: '/img/favicon-32x32.png',
    tag: 'u-tygra-notification',
    data: data.url,
    actions: [
      {
        action: 'view',
        title: 'Zobrazit',
        icon: '/img/favicon-16x16.png'
      },
      {
        action: 'close',
        title: 'Zavřít'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Pivnice U Tygra', options)
  );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

/**
 * IndexedDB helpers for offline functionality
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('u-tygra-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = event => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('contact-forms')) {
        const store = db.createObjectStore('contact-forms', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

function getPendingForms(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['contact-forms'], 'readonly');
    const store = transaction.objectStore('contact-forms');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeForm(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['contact-forms'], 'readwrite');
    const store = transaction.objectStore('contact-forms');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function submitForm(data) {
  return fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}