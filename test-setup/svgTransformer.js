const EMPTY_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

module.exports = {
	process: (_contents, _filename) => ({
		code: `module.exports = '${EMPTY_GIF}';`,
	}),
};
