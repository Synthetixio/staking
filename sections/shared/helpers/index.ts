import { header } from '../../../translations/en.json';

export function headerInfo(path: string) {
	let headerTitle = 'home',
		headerSubtitle = null;
	type headerKey = keyof typeof header;

	const paths = path.split('/').filter((item) => item !== '');

	const titleKey = paths[0] as headerKey;
	const subTitleKey = paths[1] as headerKey;

	if (titleKey) {
		headerTitle = header[titleKey];
	}

	if (subTitleKey) {
		const str = `${titleKey}/${subTitleKey}` as headerKey;
		headerSubtitle = header[str];
	}

	return { headerTitle, headerSubtitle };
}
