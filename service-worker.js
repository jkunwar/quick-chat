const CACHE_NAME = 'version1';

self.addEventListener('install', (event) => {

    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            cache.addAll([
                '/',
                '/index.html',
                '/styles/styles.css',
                '/js/main.js',
                '/js/notification.js',
                '/js/firebase.js',
                '/js/storage.js',
                '/manifest.json',
                '/icons/favicon-196.png',
                '/icons/manifest-icon-196.maskable.png',
                '/images/chat.png',
            ])
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim())

    event.waitUntil(caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.filter(cacheName => cacheName != CACHE_NAME).map(item => caches.delete(item)))
    }))
});

self.addEventListener('fetch', (event) => {

    // STALE WHILE REVALIDATE
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then(cachedResponse => {
                const fetchedResponse = fetch(event.request).then(networkResponse => {
                    if (event.request.method == 'GET') {
                        cache.put(event.request, networkResponse.clone())
                    }
                    return networkResponse
                })
                return cachedResponse || fetchedResponse
            })
        })
    )
});


//Listens for notification click event
self.addEventListener('notificationclick', event => {
    event.notification.close();
    // This looks to see if the current is already open and focuses if it is
    event.waitUntil(lients.matchAll({ type: "window" })
        .then(function (clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url == '/' && 'focus' in client)
                    return client.focus();
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
})

// function postMessage(message) {
//     self.clients.matchAll().then(clients => {
//         clients.forEach(client => {
//             client.postMessage(message)
//         });
//     })
// }

// Background synchronization event listenere
self.addEventListener('sync', event => {
    console.log('[SW Background sync]: ', event.tag)
    if (event.tag == 'add-message') {
        addMessage()
    }
})

function addMessage() {
    console.log('add message to firebase')
    // // Fire a post message to sync the messages from local storage to firebase
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage('sync-message')
        })
    })
}