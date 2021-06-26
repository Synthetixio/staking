import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import StatBox from 'components/StatBox';
import styled from 'styled-components';
import { LineSpacer } from 'styles/common';
import { formatNumber } from 'utils/formatters/number';
import UIContainer from 'containers/UI';
import useProposals from 'queries/gov/useProposals';
import StatsSection from 'components/StatsSection';
import MainContent from 'sections/gov';
import { SPACE_KEY } from 'constants/snapshot';
import { Proposal } from 'queries/gov/types';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { numOfCouncilSeatsState } from 'store/gov';
import { ethers } from 'ethers';
import Connector from 'containers/Connector';
import councilDilution from 'contracts/councilDilution';
import { appReadyState } from 'store/app';
import useActiveProposalsQuery from 'queries/gov/useActiveProposalsQuery';
import useVotingWeight from 'queries/gov/useVotingWeight';
import useLatestElectionsQuery from 'queries/gov/useLatestElectionsQuery';

const Gov: React.FC = () => {
	const { t } = useTranslation();
	const councilProposals = useProposals(SPACE_KEY.COUNCIL);
	const { provider } = Connector.useContainer();
	const { setTitle } = UIContainer.useContainer();
	const [latestElectionBlock, setLatestElectionBlock] = useState<number | null>(null);
	const activeProposals = useActiveProposalsQuery();
	const latestElectionsQuery = useLatestElectionsQuery();
	const walletVotingWeight = useVotingWeight(
		SPACE_KEY.COUNCIL,
		latestElectionsQuery.data ? parseInt(latestElectionsQuery.data.latestElectionBlock) : 0
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

	useEffect(() => {
		if (councilProposals.data && isAppReady) {
			let latestProposal = {
				snapshot: '0',
			} as Partial<Proposal>;

			councilProposals.data.forEach((proposal) => {
				if (parseInt(proposal.snapshot) > parseInt(latestProposal.snapshot ?? '0')) {
					latestProposal = proposal;
				}
			});

			setLatestElectionBlock(parseInt(latestProposal.snapshot ?? '0'));
		}
	}, [councilProposals, isAppReady]);

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
						blocknumber: formatNumber(latestElectionBlock ?? 0, { decimals: 0 }),
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
