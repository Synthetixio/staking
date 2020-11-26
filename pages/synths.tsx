import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { StatsSection, LineSpacer } from 'styles/common';

import { AssetContainer } from 'sections/synths/AssetContainer';

import StatBox from 'components/StatBox';

const SynthsPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('synths.page-title')}</title>
			</Head>
			<StatsSection>
				{/* TODO: implement */}
				<TotalSynthValue title={t('common.stat-box.synth-value')} value="$9,000.08" size="lg" />
			</StatsSection>
			<LineSpacer />
			<AssetContainer title={t('synths.synths.title')} />
			<AssetContainer title={t('synths.non-synths.title')} />
		</>
	);
};

const TotalSynthValue = styled(StatBox)`
	.value {
		text-shadow: ${(props) => props.theme.colors.brightBlueTextShadow};
		color: ${(props) => props.theme.colors.darkBlue};
	}
`;

export default SynthsPage;
