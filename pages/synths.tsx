import Head from 'next/head';
import { useTranslation } from 'react-i18next';

const SynthsPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('Synths.page-title')}</title>
			</Head>
			<div>Synths</div>
		</>
	);
};

export default SynthsPage;
