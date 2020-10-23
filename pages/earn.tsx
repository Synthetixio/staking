import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import { LPBox } from 'sections/earn';

const Earn = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('earn.page-title')}</title>
			</Head>
			<LPBox />
		</>
	);
};

export default Earn;
