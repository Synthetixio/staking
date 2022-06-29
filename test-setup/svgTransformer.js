module.exports = {
	process: (contents, filename) => ({
		code: `module.exports = props => require('react').createElement('svg', {}, '${filename}');`,
	}),
};
