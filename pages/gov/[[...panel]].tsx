import React, { useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import StatBox from 'components/StatBox';
import styled from 'styled-components';
import { LineSpacer } from 'styles/common';
import { formatNumber } from 'utils/formatters/number';
import UIContainer from 'containers/UI';
import StatsSection from 'components/StatsSection';
import MainContent from 'sections/gov';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';
import { useRecoilValue } from 'recoil';
import useSynthetixQueries from '@synthetixio/queries';
import { walletAddressState } from 'store/wallet';

const Gov: React.FC = () => {
	const { t } = useTranslation();
	const { setTitle } = UIContainer.useContainer();
	const walletAddress = useRecoilValue(walletAddressState);
	const { useVotingWeightQuery } = useSynthetixQueries();
	const walletVotingWeight = useVotingWeightQuery(
		snapshotEndpoint,
		SPACE_KEY.COUNCIL,
		walletAddress
	);

	useEffect(() => {
		setTitle('gov');
	}, [setTitle]);

	return (
		<>
			<Head>
				<title>{t('gov.page-title')}</title>
			</Head>
			<StatsSection>
				<WalletVotingPower
					title={t('common.stat-box.voting-power.title')}
					value={formatNumber(walletVotingWeight.data ? walletVotingWeight.data[1] : 0)}
				/>
				<TotalVotingPower
					title={t('common.stat-box.delegated-voting-power.title')}
					value={formatNumber(walletVotingWeight.data ? walletVotingWeight.data[0] : 0)}
					tooltipContent={t('common.stat-box.delegated-voting-power.tooltip')}
				/>
			</StatsSection>
			<LineSpacer />
			<MainContent />
		</>
	);
};

const WalletVotingPower = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.blue};
	}
`;

const TotalVotingPower = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.pink};
	}
`;
export default Gov;
