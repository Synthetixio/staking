import Head from 'next/head';
import { useTranslation } from 'react-i18next';

const Earn = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('earn.page-title')}</title>
			</Head>
			<div>Earn</div>
		</>
	);
};

export default Earn;
