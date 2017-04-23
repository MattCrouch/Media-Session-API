var version = 1;
var dataCacheName = 'podcasts-' + version;
var cacheName = 'media-session-api-' + version;

var filesToCache = [
    '/',
    '/podcasts',
    '/static/manifest.json',
    '/static/js/main.js',
    '/static/js/Player.js',
    '/static/js/Playlist.js',
    '/static/js/PlaylistItem.js',
    '/static/css/style.css',
    '/static/assets/default-icon.png',
    '/static/assets/loading.png',
    '/static/assets/now-playing-placeholder.png',
    '/static/assets/pause.png',
    '/static/assets/play.png',
    '/static/assets/icons/icon-1x.png',
    '/static/assets/icons/icon-2x.png'
];

function parseUrl(url) {
  var split = url.split("/");
  split.splice(0, 3);
  return `/${split.join("/")}`;
}

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log(`${key} !== ${cacheName} ` + '[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var parsedUrl = parseUrl(e.request.url);
  console.log('[ServiceWorker] Fetch', e.request.url);
  if(filesToCache.indexOf(parsedUrl) !== -1) {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  } else {
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return cache.match(e.request).then(function(response) {
          if(response) {
            return response;
          }

          return fetch(e.request).then(function(response){
            cache.put(e.request.url, response.clone());
            return response;
          });
        });
      })
    );
  }
});