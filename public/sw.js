/* eslint-disable no-restricted-globals */
try {
	const PRECACHE = 'precache-v1';

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

	const IMAGES_CACHE = [
		'/images/browserWallet.png',
		'/images/browserWallet.svg',
		'/images/favicon.ico',
		'/images/staking-facebook.jpg',
		'/images/staking-twitter.jpg',
		'/images/synthetix-logo.svg',
		'/images/toros-white.png',
	];

	// The install handler takes care of precaching the resources we always need.
	self.addEventListener('install', (event) => {
		event.waitUntil(
			caches
				.open(PRECACHE)
				.then((cache) => cache.addAll([...FONTS_CACHE, ...IMAGES_CACHE]))
				.then(self.skipWaiting())
		);
	});

	// The activate handler takes care of cleaning up old caches.
	self.addEventListener('activate', (event) => {
		const currentCaches = [PRECACHE];
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
					// Cache first (if exists)
					if (cachedResponse) {
						return cachedResponse;
					}

					// Fall back to network
					return fetch(event.request).then((fetchResponse) => fetchResponse);
				})
			);
		}
	});
} catch (e) {
	console.log(e);
}
