const CACHE_NAME = 'soulove-pwa-v4'
const ASSETS_TO_CACHE = [
  '/',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-http/https, API routes, Vite dev requests, and non-GET
  if (
    !url.protocol.startsWith('http') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/@') ||
    url.pathname.includes('node_modules') ||
    event.request.method !== 'GET'
  ) {
    return
  }

  // Network-First: Always fetch fresh live data, fallback to cache if offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (networkResponse.type === 'basic' || networkResponse.type === 'cors')
        ) {
          const clone = networkResponse.clone()
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, clone))
            .catch(() => {}) // Silently handle any cache put errors
        }
        return networkResponse
      })
      .catch(() => {
        return caches.match(event.request)
      })
  )
})
