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
import { SPACE_KEY } from 'constants/snapshot';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { numOfCouncilSeatsState } from 'store/gov';
import { ethers } from 'ethers';
import Connector from 'containers/Connector';
import councilDilution from 'contracts/councilDilution';
import { appReadyState } from 'store/app';
import useActiveProposalsQuery from 'queries/gov/useActiveProposalsQuery';
import useVotingWeightQuery from 'queries/gov/useVotingWeightQuery';
import useLatestSnapshotQuery from 'queries/gov/useLatestSnapshotQuery';

const Gov: React.FC = () => {
	const { t } = useTranslation();
	const { provider } = Connector.useContainer();
	const { setTitle } = UIContainer.useContainer();
	const activeProposals = useActiveProposalsQuery();
	const latestSnapshot = useLatestSnapshotQuery();
	const walletVotingWeight = useVotingWeightQuery(
		SPACE_KEY.COUNCIL,
		latestSnapshot.data ? parseInt(latestSnapshot.data.latestSnapshot) : 0
	);
	const setNumOfCouncilSeats = useSetRecoilState(numOfCouncilSeatsState);
	const isAppReady = useRecoilValue(appReadyState);

	useEffect(() => {
		if (isAppReady && provider) {
			const getNumberOfCouncilSeats = async () => {
				let contract = new ethers.Contract(
					councilDilution.address,
					councilDilution.abi,
					provider as ethers.providers.Provider
				);

				const numOfCouncilMembersBN = await contract.numOfSeats();

				const numOfCouncilMembers = Number(numOfCouncilMembersBN);
				setNumOfCouncilSeats(numOfCouncilMembers);
			};

			getNumberOfCouncilSeats();
		}
	}, [isAppReady, provider, setNumOfCouncilSeats]);

	// header title
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
					value={formatNumber(walletVotingWeight.data ? walletVotingWeight.data[0] : 0)}
					tooltipContent={t('common.stat-box.voting-power.tooltip', {
						blocknumber: latestSnapshot.data
							? formatNumber(latestSnapshot.data.latestSnapshot, { decimals: 0 })
							: 0,
					})}
				/>
				<ActiveProposals
					title={t('common.stat-box.active-proposals')}
					value={activeProposals.data ?? 0}
				/>
				<TotalVotingPower
					title={t('common.stat-box.delegated-voting-power.title')}
					value={formatNumber(walletVotingWeight.data ? walletVotingWeight.data[1] : 0)}
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

const ActiveProposals = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.green};
	}
	.value {
		text-shadow: ${(props) => props.theme.colors.greenTextShadow};
		color: #073124;
	}
`;

export default Gov;
