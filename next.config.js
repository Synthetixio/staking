// next.config.js
const withPlugins = require('next-compose-plugins');
const optimizedImages = require('next-optimized-images');

// all the dynamic pages need to be defined here (this needs to be imported from the routes)

const stakingPages = ['/staking', '/staking/burn', '/staking/mint'].reduce((pages, page) => {
	pages[page] = {
		page: '/staking/[[...action]]',
	};

	return pages;
}, {});

const earnPages = [
	'/earn',
	'/earn/claim',
	'/earn/curve-LP',
	'/earn/iBTC-LP',
	'/earn/iETH-LP',
].reduce((pages, page) => {
	pages[page] = {
		page: '/earn/[[...pool]]',
	};

	return pages;
}, {});

module.exports = withPlugins([[optimizedImages]], {
	webpack: (config) => {
		config.resolve.mainFields = ['module', 'browser', 'main'];
		return config;
	},
	trailingSlash: !!process.env.NEXT_PUBLIC_TRAILING_SLASH_ENABLED,
	exportPathMap: function (defaultPathMap) {
		return {
			...defaultPathMap,
			...stakingPages,
			...earnPages,
		};
	},
});
