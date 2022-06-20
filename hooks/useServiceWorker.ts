import { useEffect } from 'react';

const swInit = () => {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/sw.js').then(
			function (registration) {
				console.log('Service Worker registration successful with scope: ', registration.scope);
			},
			function (err) {
				console.log('Service Worker registration failed: ', err);
			}
		);
	}
};

export default function useServiceWorker() {
	useEffect(() => {
		window.addEventListener('load', swInit);
		return () => {
			window.removeEventListener('load', swInit);
		};
	}, []);
}
