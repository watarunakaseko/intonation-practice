/* Intonation Practice v35: network-first HTML navigation, offline fallback. */
const CACHE_NAME = 'intonation-nav-v38';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
 event.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter(n => n.startsWith('intonation-nav-') && n !== CACHE_NAME).map(n => caches.delete(n)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch', event => {
 const req = event.request;
 if (req.mode !== 'navigate' || new URL(req.url).origin !== self.location.origin) return;
 event.respondWith((async () => {
  const cache = await caches.open(CACHE_NAME);
  try {
   const network = await fetch(req, {cache:'no-store'});
   if (network.ok) await cache.put(req, network.clone());
   return network;
  } catch (err) {
   const cached = await cache.match(req, {ignoreSearch:true});
   if (cached) return cached;
   throw err;
  }
 })());
});
