module.exports = {
	roots: ['<rootDir>'],
	modulePaths: ['<rootDir>'],
	moduleDirectories: ['node_modules'],
	globalSetup: './test-setup/global.js',
	setupFilesAfterEnv: ['./test-setup/setup.js'],
	testEnvironment: 'jest-environment-jsdom',
	transform: {
		'\\.svg$': '<rootDir>/test-setup/svgTransformer.js',
		'\\.[jt]sx?$': 'babel-jest',
	},
	moduleNameMapper: {
		'^.+\\.svg\\?(sprite|include)(.+)?$': '<rootDir>/test-setup/svgMock.js',
	},
	testMatch: ['<rootDir>/**/*.test.{js,jsx,ts,tsx}'],
	collectCoverageFrom: [
		'<rootDir>/**/*.{js,jsx,ts,tsx}',
		'!<rootDir>/*.{js,jsx,ts,tsx}',
		'!<rootDir>/**/*.d.{ts,tsx}',
		'!<rootDir>/out/**/*.{js,jsx,ts,tsx}',
		'!<rootDir>/.next/**/*.{js,jsx,ts,tsx}',
	],
};
