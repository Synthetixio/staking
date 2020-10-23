import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { MintBurnBox } from 'sections/staking';

const StakingPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('staking.page-title')}</title>
			</Head>
			<MintBurnBox />
		</>
	);
};

export default StakingPage;
