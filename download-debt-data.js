const csv = require('csvtojson');
const axios = require('axios');
const path = require('path');
const { writeFileSync, mkdirSync } = require('fs');
axios
	.get('https://www.dropbox.com/s/0v6z67eqqzxrwco/data.csv?dl=1')
	.then((x) => csv().fromString(x.data))
	.then((json) => {
		const OUTPUT_FOLDER = path.resolve(__dirname, 'debt-data');
		mkdirSync(OUTPUT_FOLDER);
		writeFileSync(path.resolve(OUTPUT_FOLDER, 'data.json'), JSON.stringify(json));
	});
