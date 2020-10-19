import Head from 'next/head';
import { useTranslation } from 'react-i18next';

const EscrowPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('escrow.page-title')}</title>
			</Head>
			<div>Escrow</div>
		</>
	);
};

export default EscrowPage;
