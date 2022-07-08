const withPlugins = require('next-compose-plugins');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.GENERATE_BUNDLE_REPORT === 'true',
});

function optimiseContracts(config, { webpack }) {
	const networks = ['kovan', 'kovan-ovm', 'mainnet', 'mainnet-ovm'];
	const generate = require('./scripts/minify-synthetix-contract');
	const out = require('path').resolve(__dirname, '.next/tmp');
	require('fs').mkdirSync(out, { recursive: true });
	generate({ networks, out });

	networks.forEach((network) =>
		config.plugins.push(
			new webpack.NormalModuleReplacementPlugin(
				new RegExp(`/synthetix/publish/deployed/${network}/deployment.json`),
				require.resolve(`${out}/${network}.json`)
			)
		)
	);
	config.plugins.push(
		new webpack.NormalModuleReplacementPlugin(
			new RegExp(`/synthetix/publish/deployed/(goerli|local)`),
			require.resolve('./scripts/noop')
		)
	);
	config.plugins.push(
		new webpack.NormalModuleReplacementPlugin(/^synthetix$/, require.resolve('synthetix/index.js'))
	);
}

module.exports = withPlugins([withBundleAnalyzer], {
	webpack: (config, context) => {
		config.resolve.mainFields = ['module', 'browser', 'main'];
		optimiseContracts(config, context);

		config.module.rules.push({
			test: /\.(svg|png|jpg|ico|gif|woff|woff2|ttf|eot|doc|pdf|zip|wav|avi|txt|webp)$/,
			use: [
				{
					loader: 'url-loader',
					options: {
						limit: 4 * 1024, // 4kb
					},
				},
			],
		});

		return config;
	},
	trailingSlash: !!process.env.NEXT_PUBLIC_TRAILING_SLASH_ENABLED,
	exportPathMap: function (defaultPathMap) {
		return {
			...defaultPathMap,

			// all the dynamic pages need to be defined here (this needs to be imported from the routes)
			'/staking': { page: '/staking/[[...action]]' },
			'/staking/burn': { page: '/staking/[[...action]]' },
			'/staking/mint': { page: '/staking/[[...action]]' },

			'/earn': { page: '/earn/[[...pool]]' },
			'/earn/claim': { page: '/earn/[[...pool]]' },
			'/earn/curve-LP': { page: '/earn/[[...pool]]' },
			'/earn/iBTC-LP': { page: '/earn/[[...pool]]' },
			'/earn/iETH-LP': { page: '/earn/[[...pool]]' },

			'/pools/weth-snx': { page: '/pools/[[...pool]]' },
		};
	},
});
