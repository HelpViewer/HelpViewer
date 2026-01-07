// DŮVOD: SW: robustnější offline‑first cache strategie a waitUntil pro asynchronní operace.
// PROBLÉM: Původní implementace používala jednoduchý cache.match a nerekonstruovala klíče cache podle pathname/query, navíc asynchronní operace v message/activate/install nečekaly na dokončení (chybělo event.waitUntil). To může vést k nekonzistencím cache, nekorektnímu obnovení obsahu a chybám při mazání cache.
// VÍCE INFO: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

const CACHE_NAME = 'helpviewer-cache-v1';
const CACHE_FILES = [ '/index.html' ];

function normalizeRequest(request) {
  try {
    const url = new URL(request.url);
    // Normalizujeme cache key tak, aby se pro statické soubory ignorovaly query parametry.
    return new Request(url.origin + url.pathname, {
      method: request.method,
      headers: request.headers,
      mode: request.mode,
      credentials: request.credentials,
      redirect: request.redirect
    });
  } catch (e) {
    return request;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHE_FILES).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const accept = req.headers.get('Accept') || '';
  // Pro navigace (HTML) použijeme network-first, aby uživatel dostal nejnovější obsah.
  if (accept.includes('text/html')) {
    event.respondWith(
      fetch(req).then((networkResponse) => {
        // Aktualizuj cache na pozadí
        event.waitUntil(
          caches.open(CACHE_NAME).then(cache => cache.put(normalizeRequest(req), networkResponse.clone()).catch(() => {}))
        );
        return networkResponse;
      }).catch(() => caches.match(normalizeRequest(req)))
    );
    return;
  }

  // Pro ostatní GET požadavky použijeme stale-while-revalidate pattern.
  event.respondWith(
    caches.match(normalizeRequest(req)).then((cached) => {
      const networkPromise = fetch(req).then((networkResponse) => {
        event.waitUntil(
          caches.open(CACHE_NAME).then(cache => cache.put(normalizeRequest(req), networkResponse.clone()).catch(() => {}))
        );
        return networkResponse;
      }).catch(() => undefined);

      // Pokud máme cache, vrať ji hned, jinak čekej na síť.
      return cached || networkPromise;
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.action === 'clearCache') {
    // DŮVOD: Zajistit, že mazání cache proběhne a worker na to čeká.
    event.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(name => caches.delete(name))
        );
      })
    );
  }
});
