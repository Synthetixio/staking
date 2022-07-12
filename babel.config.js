module.exports = function (api) {
	api.cache.using(() => process.env.NODE_ENV);

	if (api.env('test')) {
		return {
			presets: [
				[
					'@babel/preset-react',
					{
						runtime: 'automatic',
					},
				],
				[
					'@babel/preset-env',
					{
						modules: 'commonjs',
						targets: { node: 'current' },
						ignoreBrowserslistConfig: true,
					},
				],
				'@babel/preset-typescript',
			],
			plugins: [['styled-components', { ssr: true, displayName: true, preprocess: false }]],
		};
	}

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

		plugins: [['styled-components', { ssr: true, displayName: true, preprocess: false }]],
	};
};
