/// <reference lib="webworker" />
// @ts-check

const CACHE_VERSION = 'v2';
const CACHE_NAME = `audio-marker-${CACHE_VERSION}`;
const AUDIO_CACHE_NAME = `audio-marker-audio-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `audio-marker-static-${CACHE_VERSION}`;
const LISTEN_PAGE_CACHE_NAME = `audio-marker-listen-${CACHE_VERSION}`;
const TRPC_CACHE_NAME = `audio-marker-trpc-${CACHE_VERSION}`;

const AUDIO_API_REGEX = /^\/api\/audio\/[^\/]+\/file$/;
const LISTEN_PAGE_REGEX = /^\/(audios|playlists)\/[^\/]+\/listen/;
const TRPC_MARKER_REGEX = /marker\.getMarkers/;
const TRPC_AUDIO_REGEX = /audio\.(getUserAudioById|getPublicAudioById)/;
const TRPC_PLAYLIST_REGEX = /playlist\.(getUserPlaylistById|getPublicPlaylistById)/;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/audio-marker-logo.svg',
  '/manifest.json',
  '/offline.html'
];

// All valid cache names for cleanup
const VALID_CACHES = [
  CACHE_NAME,
  AUDIO_CACHE_NAME,
  STATIC_CACHE_NAME,
  LISTEN_PAGE_CACHE_NAME,
  TRPC_CACHE_NAME
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!VALID_CACHES.includes(cacheName)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle listen pages - Cache with network update (stale-while-revalidate)
  if (isListenPageRequest(request)) {
    event.respondWith(handleListenPageRequest(request));
    return;
  }

  // Handle tRPC requests for markers, audio, and playlist data
  if (isCacheableTrpcRequest(request)) {
    event.respondWith(handleTrpcRequest(request));
    return;
  }

  // Skip other non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Audio files - Cache First strategy with network fallback
  if (isAudioRequest(request)) {
    event.respondWith(
      caches.open(AUDIO_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[Service Worker] Serving audio from cache:', url.pathname);
            return cachedResponse;
          }

          console.log('[Service Worker] Fetching and caching audio:', url.pathname);
          return fetch(request).then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((error) => {
            console.error('[Service Worker] Audio fetch failed:', error);
            throw error;
          });
        });
      })
    );
    return;
  }

  // Static assets - Cache First strategy
  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // API and dynamic content - Network First strategy
  if (isApiRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response('Network error', { status: 503 });
          });
        })
    );
    return;
  }

  // Default - Network First with cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return new Response('Network error', { status: 503 });
        });
      })
  );
});

// Handle listen page requests with stale-while-revalidate
async function handleListenPageRequest(request) {
  const cache = await caches.open(LISTEN_PAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch fresh version in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        console.log('[Service Worker] Caching listen page:', new URL(request.url).pathname);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[Service Worker] Network unavailable for listen page:', error.message);
      return null;
    });
  
  // If we have cached version, return it immediately while updating in background
  if (cachedResponse) {
    console.log('[Service Worker] Serving listen page from cache');
    return cachedResponse;
  }
  
  // No cached version, wait for network
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }
  
  // Return offline page if completely offline
  return caches.match('/offline.html');
}

// Handle tRPC requests - cache POST requests for specific procedures
async function handleTrpcRequest(request) {
  const cache = await caches.open(TRPC_CACHE_NAME);
  const url = new URL(request.url);
  
  // Create a cache key based on the URL and body
  let cacheKey = request.url;
  if (request.method === 'POST') {
    try {
      const body = await request.clone().text();
      cacheKey = `${request.url}:${body}`;
    } catch {
      // Fall back to URL only
    }
  }
  
  // Try to get cached response
  const cachedResponse = await cache.match(cacheKey);
  
  // Fetch fresh version
  const fetchPromise = fetch(request.clone())
    .then(async (networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        console.log('[Service Worker] Caching tRPC response:', url.pathname);
        // Clone response for caching
        const responseToCache = networkResponse.clone();
        // Store with custom cache key
        await cache.put(cacheKey, responseToCache);
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[Service Worker] tRPC fetch failed:', error.message);
      return null;
    });
  
  // Stale-while-revalidate: return cached if available
  if (cachedResponse) {
    console.log('[Service Worker] Serving tRPC from cache');
    // Update cache in background
    fetchPromise.catch(() => {});
    return cachedResponse;
  }
  
  // Wait for network
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }
  
  // Return error response if offline and no cache
  return new Response(JSON.stringify({ error: 'Offline - data not cached' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Helper functions
function isAudioRequest(request) {
  const url = new URL(request.url);
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm'];
  const pathname = url.pathname.toLowerCase();
  
  // Check if it's the audio API endpoint
  if (pathname.match(AUDIO_API_REGEX)) {
    return true;
  }
  
  // Check file extension
  if (audioExtensions.some(ext => pathname.endsWith(ext))) {
    return true;
  }
  
  // Check content-type header if available
  const contentType = request.headers.get('accept');
  if (contentType && contentType.includes('audio/')) {
    return true;
  }
  
  return false;
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  const pathname = url.pathname.toLowerCase();
  
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

function isApiRequest(request) {
  const url = new URL(request.url);
  // Exclude audio file API and tRPC from general API handling
  if (url.pathname.match(AUDIO_API_REGEX)) {
    return false;
  }
  if (url.pathname.startsWith('/api/trpc')) {
    return false;
  }
  return url.pathname.startsWith('/api/');
}

function isListenPageRequest(request) {
  if (request.method !== 'GET') {
    return false;
  }
  const url = new URL(request.url);
  return LISTEN_PAGE_REGEX.test(url.pathname);
}

function isCacheableTrpcRequest(request) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/trpc')) {
    return false;
  }
  
  // Check URL for procedure names
  const fullUrl = url.toString();
  if (TRPC_MARKER_REGEX.test(fullUrl) || 
      TRPC_AUDIO_REGEX.test(fullUrl) || 
      TRPC_PLAYLIST_REGEX.test(fullUrl)) {
    return true;
  }
  
  return false;
}

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  const data = event.data;
  
  if (data && data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (data && data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[Service Worker] Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
  
  // Cache a listen page and its associated audio on demand
  if (data && data.type === 'CACHE_FOR_OFFLINE') {
    const { pageUrl, audioUrl, trpcUrls } = data;
    event.waitUntil(
      (async () => {
        try {
          // Cache the listen page
          if (pageUrl) {
            const pageCache = await caches.open(LISTEN_PAGE_CACHE_NAME);
            const pageResponse = await fetch(pageUrl);
            if (pageResponse.ok) {
              await pageCache.put(pageUrl, pageResponse);
              console.log('[Service Worker] Cached page for offline:', pageUrl);
            }
          }
          
          // Cache the audio file
          if (audioUrl) {
            const audioCache = await caches.open(AUDIO_CACHE_NAME);
            const audioResponse = await fetch(audioUrl);
            if (audioResponse.ok) {
              await audioCache.put(audioUrl, audioResponse);
              console.log('[Service Worker] Cached audio for offline:', audioUrl);
            }
          }
          
          // Cache tRPC responses if provided
          if (trpcUrls && Array.isArray(trpcUrls)) {
            const trpcCache = await caches.open(TRPC_CACHE_NAME);
            for (const trpcUrl of trpcUrls) {
              try {
                const response = await fetch(trpcUrl);
                if (response.ok) {
                  await trpcCache.put(trpcUrl, response);
                  console.log('[Service Worker] Cached tRPC for offline:', trpcUrl);
                }
              } catch (e) {
                console.warn('[Service Worker] Failed to cache tRPC:', trpcUrl, e);
              }
            }
          }
          
          // Notify clients that caching is complete
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({ type: 'CACHE_COMPLETE', pageUrl, audioUrl });
          });
        } catch (error) {
          console.error('[Service Worker] Error caching for offline:', error);
        }
      })()
    );
  }
  
  // Get list of cached listen pages and audios
  if (data && data.type === 'GET_CACHED_CONTENT') {
    event.waitUntil(
      (async () => {
        try {
          const cachedContent = {
            listenPages: [],
            audioFiles: [],
          };
          
          // Get cached listen pages
          const listenCache = await caches.open(LISTEN_PAGE_CACHE_NAME);
          const listenKeys = await listenCache.keys();
          cachedContent.listenPages = listenKeys.map(req => req.url);
          
          // Get cached audio files
          const audioCache = await caches.open(AUDIO_CACHE_NAME);
          const audioKeys = await audioCache.keys();
          cachedContent.audioFiles = audioKeys.map(req => req.url);
          
          // Reply to the requesting client
          if (event.source) {
            event.source.postMessage({ 
              type: 'CACHED_CONTENT_LIST', 
              data: cachedContent 
            });
          }
        } catch (error) {
          console.error('[Service Worker] Error getting cached content:', error);
        }
      })()
    );
  }
});