/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="optimized-images-loader" />

declare global {
	interface Window {
		ethereum: Provider | undefined;
	}
}

export {};
