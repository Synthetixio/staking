import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import DeleteSection from 'sections/staking/delete/delete';

const StakingPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('staking.page-title')}</title>
			</Head>
			<div>Staking</div>
			<DeleteSection />
		</>
	);
};

export default StakingPage;
