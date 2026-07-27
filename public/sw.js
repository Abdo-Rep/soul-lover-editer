const CACHE = 'soulove-pwa-v4'
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/maskable-512x512.png',
  '/apple-touch-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // SPA navigation fallback for offline support
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches
          .match(request)
          .then((res) => res || caches.match('/index.html') || Response.error()),
      ),
    )
    return
  }

  // Network-first for dynamic assets, cache fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (!response.ok || response.type === 'opaque') return response
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(request, copy))
        return response
      })
    }),
  )
})
