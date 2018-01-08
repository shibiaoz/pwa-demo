/**
 * 如果要预缓存的文件内容发生改变，则需要更改cacheName,来保证sw 文件修改
 * 从而导致sw 重新执行安装等，达到缓存文件及时更新等木的
 */
var cacheName = 'bund-1';
var expectedCaches = [cacheName];
var preCacheUrls = [
    '/js/bundle.js',
    '/stylesheets/style.css'
]
var isValidResponse = function (response) {
    return response && response.status >= 200 && response.status < 400;
};


self.addEventListener('install', event => {
    console.log('安装service worker...-----');
    var _that = self;
    _that.skipWaiting();
    event.waitUntil(
        caches.open(cacheName)
        .then(function (cache) {
            return cache.addAll(preCacheUrls).then(function () {
                console.log('安装complete')
            }, function (error) {
                console.log(error);
            })
        })
    );
});


self.addEventListener('activate', function (event) {
    console.log('Activated');
    self.clients.claim();
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map(key => {
                    if (!expectedCaches.includes(key)) {
                        return caches.delete(key);
                    }
                })
            )
        }).then(() => {
            console.log("skipWaiting handle ！");
        })
    );

});


function fetchApi(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function (response) {
            console.log('url....', event.request.url);
            if (response) {
                console.log('缓存返回 <=> ' + event.request.url);
                fetch(event.request)
                    .then(function (response) {
                        // Check a valid response
                        if (isValidResponse(response)) {
                            caches
                                .open(cacheName)
                                .then(function (cache) {
                                    cache.put(event.request, response);
                                });
                        } else {
                            console.log('Update cache ' + event.request.url + ' fail: ' + response.message);
                        }
                    })
                    .catch(function (err) {
                        console.log('Update cache ' + event.request.url + ' fail: ' + err.message)
                    });
                return response;
            }
            return fetch(event.request);
        }, function () {
            console.log('catches not match...')
        })
    );
}

self.addEventListener('fetch', (event) => {
    var len = preCacheUrls.length;
    for (var i = 0; i < len; i++) {
        if (event.request.url.indexOf(preCacheUrls[i]) > -1) {
            fetchApi(event);
            break;
        }
    }
});