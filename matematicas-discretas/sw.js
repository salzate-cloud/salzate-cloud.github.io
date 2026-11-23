/* Lectura sin internet: las páginas se piden primero a la red y, si no hay conexión,
   se sirven desde la copia guardada. Versión 84564516 */
var CACHE = 'libro-' + (self.registration.scope.split('/').filter(Boolean).pop() || 'libro');
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  var esPagina = req.mode === 'navigate' || /\.html?(\?|$)|\/$/.test(req.url);
  if (esPagina) {
    e.respondWith(fetch(req).then(function (r) {
      var c = r.clone(); caches.open(CACHE).then(function (k) { k.put(req, c); }); return r;
    }).catch(function () { return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match('index.html'); }); }));
  } else {
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (r) {
      var red = fetch(req).then(function (resp) { if (resp.ok) { var c = resp.clone(); caches.open(CACHE).then(function (k) { k.put(req, c); }); } return resp; });
      return r || red;
    }));
  }
});
