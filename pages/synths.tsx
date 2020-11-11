import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { AssetContainer } from 'sections/synths/AssetContainer';

const SynthsPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('synths.page-title')}</title>
			</Head>
			<AssetContainer title={t('synths.synths.title')} />
			<AssetContainer title={t('synths.non-synths.title')} />
		</>
	);
};

export default SynthsPage;
