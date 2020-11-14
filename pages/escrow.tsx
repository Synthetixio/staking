import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import AppLayout from 'sections/shared/Layout/AppLayout';

const EscrowPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('escrow.page-title')}</title>
			</Head>
			<AppLayout>
				<div>Escrow</div>
			</AppLayout>
		</>
	);
};

export default EscrowPage;
