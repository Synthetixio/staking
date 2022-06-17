module.exports = function (api) {
	api.cache.using(() => process.env.NODE_ENV);

	return {
		presets: [
			[
				'next/babel',
				{
					'preset-env': {
						modules: false,
						targets: {
							browsers: [
								'last 1 Chrome version',
								'last 1 Firefox version',
								'last 1 Edge version',
								'last 1 Opera version',
							],
						},
						ignoreBrowserslistConfig: true,
						debug: true,
					},
				},
			],
		],

		plugins: [
			['styled-components', { ssr: true, displayName: true, preprocess: false }],
			['react-optimized-image/plugin'],
		],
	};
};
