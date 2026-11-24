/* Lectura sin internet: las páginas se piden primero a la red y, si no hay conexión,
   se sirven desde la copia guardada. Versión 81270450 */
var CACHE = 'libro-' + (self.registration.scope.split('/').filter(Boolean).pop() || 'libro');
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  var esPagina = req.mode === 'navigate' || /\.html?(\?|$)|\/$/.test(req.url);
  if (esPagina) {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(function (r) {
      var c = r.clone(); caches.open(CACHE).then(function (k) { k.put(req, c); }); return r;
    }).catch(function () { return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match('index.html'); }); }));
  } else {
    /* los recursos llevan versión en la dirección (?v=…): se usa la copia exacta; si no hay, se baja; sin red, cualquier versión guardada */
    e.respondWith(caches.match(req).then(function (r) {
      return r || fetch(req).then(function (resp) { if (resp.ok) { var c = resp.clone(); caches.open(CACHE).then(function (k) { k.put(req, c); }); } return resp; })
        .catch(function () { return caches.match(req, { ignoreSearch: true }); });
    }));
  }
});
