/* eslint-disable no-restricted-globals */
try {
	const PRECACHE = 'precache-fonts';
	const RUNTIME = 'runtime';

	// A list of local fonts we always want to cache.
	const FONTS_CACHE = [
		'/fonts/Inter-Regular.woff2',
		'/fonts/Inter-SemiBold.woff2',
		'/fonts/Inter-Bold.woff2',
		'/fonts/GT-America-Mono-Bold.woff2',
		'/fonts/GT-America-Extended-Bold.woff2',
		'/fonts/GT-America-Condensed-Medium.woff2',
		'/fonts/GT-America-Condensed-Bold.woff2',
	];

	// The install handler takes care of precaching the resources we always need.
	self.addEventListener('install', (event) => {
		event.waitUntil(
			caches
				.open(PRECACHE)
				.then((cache) => cache.addAll(FONTS_CACHE))
				.then(self.skipWaiting())
		);
	});

	// The activate handler takes care of cleaning up old caches.
	self.addEventListener('activate', (event) => {
		const currentCaches = [PRECACHE, RUNTIME];
		event.waitUntil(
			caches
				.keys()
				.then((cacheNames) => {
					return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
				})
				.then((cachesToDelete) => {
					return Promise.all(
						cachesToDelete.map((cacheToDelete) => {
							return caches.delete(cacheToDelete);
						})
					);
				})
				.then(() => self.clients.claim())
		);
	});

	// This listens to other fetch calls and adds them to the runtime cache (unless cross origin)
	self.addEventListener('fetch', (event) => {
		// Skip cross-origin requests, like those for Google Analytics.
		if (event.request.url.startsWith(self.location.origin)) {
			event.respondWith(
				caches.match(event.request).then((cachedResponse) => {
					if (cachedResponse) {
						return cachedResponse;
					}

					return caches.open(RUNTIME).then((cache) => {
						return fetch(event.request, {}).then((response) => {
							// Put a copy of the response in the runtime cache.
							return cache.put(event.request, response.clone()).then(() => {
								return response;
							});
						});
					});
				})
			);
		}
	});
} catch (e) {
	console.log(e);
}
