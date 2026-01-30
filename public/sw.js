const CACHE_NAME = 'reproductor-cache-v7';
const IMAGE_CACHE = 'reproductor-images-v4';
const urlsToCache = [
  '/',
  '/reproductor',
  '/seleccion-perfil',
  '/seleccion-pantalla',
];

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_IMAGES' && Array.isArray(event.data.images)) {
    caches.open(IMAGE_CACHE).then(async cache => {
      await Promise.all(event.data.images.map(url => cache.add(url).catch(() => {})));
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'CACHE_READY' });
        });
      });
    });
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME && name !== IMAGE_CACHE).map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.mode === 'navigate') {
    const url = new URL(request.url);
    event.respondWith(
      fetch(request).catch(async () => {
        if (url.pathname.startsWith('/seleccion-pantalla')) {
          return (await caches.match('/seleccion-pantalla')) || caches.match('/');
        }
        if (url.pathname.startsWith('/seleccion-perfil')) {
          return (await caches.match('/seleccion-perfil')) || caches.match('/');
        }
        if (url.pathname.startsWith('/reproductor')) {
          return (await caches.match('/reproductor')) || caches.match('/');
        }
        return caches.match('/')
      })
    );
    return;
  }

  if (request.url.includes('res.cloudinary.com')) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((response) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {});
          return response || fetchPromise;
        })
      )
    );
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              return new Response('', {
                status: 200,
                headers: { 'Content-Type': 'image/png' }
              });
            });
        })
      )
    );
    return;
  }

  if (request.url.includes('/api/images')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          const cached = await cache.match(request);
          if (cached) return cached;
          return new Response(JSON.stringify({ imagenes: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      })
    );
    return;
  }

  if (request.url.includes('/api/zonas')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          const cached = await cache.match(request);
          if (cached) return cached;
          return new Response(JSON.stringify({ zonas: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      })
    );
    return;
  }

  if (request.url.includes('/_next/static/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((response) => {
          return (
            response ||
            fetch(request).then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
          );
        })
      )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => response || fetch(request))
  );
}); 