const CACHE_NAME = 'iwwiw-v1'
const LESSON_CACHE = 'iwwiw-lessons-v1'

// Assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/home',
  '/learn',
  '/games',
  '/shop',
  '/manifest.json',
]

// Install: pre-cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME && k !== LESSON_CACHE).map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// Fetch: network-first for API, cache-first for lessons
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Cache lesson API responses for offline replay
  if (url.pathname.startsWith('/api/lessons/') && event.request.method === 'GET') {
    event.respondWith(
      caches.open(LESSON_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request)
        if (cached) return cached
        try {
          const response = await fetch(event.request)
          if (response.ok) cache.put(event.request, response.clone())
          return response
        } catch {
          return cached ?? new Response('Offline', { status: 503 })
        }
      })
    )
    return
  }

  // Skip non-GET and API requests
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) return

  // Network-first for HTML pages
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    )
    return
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()))
        }
        return response
      })
    })
  )
})
