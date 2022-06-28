// next.config.js
const withPlugins = require('next-compose-plugins');
const optimizedImages = require('next-optimized-images');

module.exports = withPlugins([[optimizedImages, { images: { optimize: false } }]], {
	webpack: (config) => {
		config.resolve.mainFields = ['module', 'browser', 'main'];
		if (process.env.GENERATE_BUNDLE_REPORT === 'true') {
			const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
			const plugin = new BundleAnalyzerPlugin({
				analyzerMode: 'static',
				reportFilename: 'reports/webpack.html',
				openAnalyzer: false,
				generateStatsFile: false,
			});
			config.plugins.push(plugin);
		}
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
