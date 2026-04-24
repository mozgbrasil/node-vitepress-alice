const VERSION = 'mozg-site-alice-v10';
const HOME_PATH = '/node-vitepress-alice/';
const APP_SHELL = [
  '/node-vitepress-alice/',
  '/node-vitepress-alice/manifest.json',
  '/node-vitepress-alice/logo-mini.svg',
  '/node-vitepress-alice/logo-mini.png',
  '/node-vitepress-alice/og.jpg',
  '/node-vitepress-alice/data/site-catalog.json',
  '/node-vitepress-alice/data/site-audit.json',
  '/node-vitepress-alice/data/site-discovery.json',
  '/node-vitepress-alice/data/site-portfolio.json',
  '/node-vitepress-alice/data/site-projects.json',
  '/node-vitepress-alice/data/site-capabilities.json',
  '/node-vitepress-alice/data/site-stacks.json',
  '/node-vitepress-alice/data/site-operations.json',
  '/node-vitepress-alice/data/site-journeys.json',
  '/node-vitepress-alice/data/site-trust.json',
  '/node-vitepress-alice/llms.txt',
  '/node-vitepress-alice/robots.txt',
  '/node-vitepress-alice/contato',
  '/node-vitepress-alice/presenca',
  '/node-vitepress-alice/en/',
  '/node-vitepress-alice/en/contact',
  '/node-vitepress-alice/en/presence',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => (key === VERSION ? null : caches.delete(key))),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            event.waitUntil(
              caches.open(VERSION).then((cache) => {
                cache.put(HOME_PATH, responseClone);
              }),
            );
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(VERSION);
          return cache.match(HOME_PATH) || Response.error();
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            event.waitUntil(
              caches.open(VERSION).then((cache) => {
                cache.put(event.request, responseClone);
              }),
            );
          }
          return response;
        })
        .catch(() => cachedResponse || Response.error());

      return cachedResponse || networkFetch;
    }),
  );
});
