import Head from 'next/head';
import { useTranslation } from 'react-i18next';

const EscrowPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('Escrow.page-title')}</title>
			</Head>
			<div>Escrow</div>
		</>
	);
};

export default EscrowPage;
