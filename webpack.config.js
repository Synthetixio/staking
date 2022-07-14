const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const htmlPlugin = new HtmlWebpackPlugin({
	template: './index.html',
	scriptLoading: 'defer',
	minify: false,
	hash: false,
	xhtml: true,
});

const tsxRule = {
	test: /\.tsx?$/,
	use: {
		loader: require.resolve('swc-loader'),
		options: {
			test: '.tsx?$',
			sourceMaps: true,
			env: {
				mode: 'entry',
				coreJs: '3.22',
			},
			jsc: {
				baseUrl: path.resolve(__dirname),
				paths: {
					i18n: [path.resolve(__dirname, 'i18n.ts')],
					'assets/*': [path.resolve(__dirname, 'assets', '*')],
					'components/*': [path.resolve(__dirname, 'components', '*')],
					'constants/*': [path.resolve(__dirname, 'constants', '*')],
					containers: [path.resolve(__dirname, 'containers')],
					'containers/*': [path.resolve(__dirname, 'containers', '*')],
					'content/*': [path.resolve(__dirname, 'content', '*')],
					contracts: [path.resolve(__dirname, 'contracts')],
					'contracts/*': [path.resolve(__dirname, 'contracts', '*')],
					'hoc/*': [path.resolve(__dirname, 'hoc', '*')],
					'hooks/*': [path.resolve(__dirname, 'hooks', '*')],
					'lib/*': [path.resolve(__dirname, 'lib', '*')],
					'mutations/*': [path.resolve(__dirname, 'mutations', '*')],
					'queries/*': [path.resolve(__dirname, 'queries', '*')],
					'scripts/*': [path.resolve(__dirname, 'scripts', '*')],
					'sections/*': [path.resolve(__dirname, 'sections', '*')],
					'store/*': [path.resolve(__dirname, 'store', '*')],
					'styles/*': [path.resolve(__dirname, 'styles', '*')],
					'translations/*': [path.resolve(__dirname, 'translations', '*')],
					'typings/*': [path.resolve(__dirname, 'typings', '*')],
					'utils/*': [path.resolve(__dirname, 'utils', '*')],
				},
				parser: {
					syntax: 'typescript',
					tsx: true,
					decorators: false,
					dynamicImport: true,
				},
				transform: {
					react: {
						runtime: 'automatic',
					},
					optimizer: {
						globals: {
							vars: {
								'process.env.NEXT_PUBLIC_PORTIS_APP_ID': JSON.stringify(
									process.env.NEXT_PUBLIC_PORTIS_APP_ID
								),
								'process.env.NEXT_PUBLIC_BN_NOTIFY_API_KEY': JSON.stringify(
									process.env.NEXT_PUBLIC_BN_NOTIFY_API_KEY
								),
								'process.env.NEXT_PUBLIC_BN_ONBOARD_API_KEY': JSON.stringify(
									process.env.NEXT_PUBLIC_BN_ONBOARD_API_KEY
								),
								'process.env.NEXT_PUBLIC_INFURA_PROJECT_ID': JSON.stringify(
									process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
								),
								'process.env.NODE_ENV': JSON.stringify('development'),
							},
						},
					},
				},
			},
		},
	},
};

const svgRule = {
	test: /\.svg$/,
	use: '@svgr/webpack',
};

const imgRule = {
	test: /\.(png|jpg|ico|gif|woff|woff2|ttf|eot|doc|pdf|zip|wav|avi|txt|webp)$/,
	type: 'asset',
	parser: {
		dataUrlCondition: {
			maxSize: 4 * 1024, // 4kb
		},
	},
};

const cssRule = {
	test: /\.css$/,
	use: ['style-loader', 'css-loader'],
};

const devServer = {
	port: '3000',

	hot: true,
	liveReload: false,

	historyApiFallback: {
		index: '/index.html',
	},

	devMiddleware: {
		writeToDisk: true,
		publicPath: '/',
	},

	client: {
		logging: 'log',
		overlay: false,
		progress: false,
	},

	allowedHosts: 'all',
	open: false,
	compress: true,
};

module.exports = {
	devtool: 'eval',
	devServer,
	mode: 'development',
	entry: './index.ts',

	plugins: [htmlPlugin],

	resolve: {
		alias: {
			'next/head': 'react-helmet',
			'next/link': require.resolve(`./no-next/next-link.tsx`),
			'next/router': require.resolve(`./no-next/next-router.ts`),
		},
		fallback: {
			stream: false,
			crypto: false,
			http: false,
			https: false,
			os: false,
		},
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
	},

	module: {
		rules: [tsxRule, svgRule, imgRule, cssRule],
	},
};
