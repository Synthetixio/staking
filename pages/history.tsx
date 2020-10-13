import Head from 'next/head';
import { useTranslation } from 'react-i18next';

const HistoryPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('History.page-title')}</title>
			</Head>
			<div>History</div>
		</>
	);
};

export default HistoryPage;
