import Connector from 'containers/Connector';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';

const Landing = () => {
	const { t } = useTranslation();
	return (
		<>
			<Head>
				<title>{t('homepage.page-title')}</title>
			</Head>
			<div>Landing Page</div>
		</>
	);
};

export default Landing;
