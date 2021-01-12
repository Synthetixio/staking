import React, { useEffect, useState } from 'react';

import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import StatBox from 'components/StatBox';
import styled from 'styled-components';
import { StatsSection, LineSpacer } from 'styles/common';
import {
	formatFiatCurrency,
	toBigNumber,
	formatPercent,
	formatNumber,
} from 'utils/formatters/number';
import { CRatioProgressBar } from './staking/[[...action]]';
import useScaledVotingWeightQuery from 'queries/gov/useScaledVotingWeightQuery';
import useSnapshotSpace from 'queries/gov/useSnapshotSpace';
import { SPACES } from 'queries/gov/types';
import useProposals from 'queries/gov/useProposals';
import useTotalDebtWeighted from 'sections/gov/hooks/useTotalDebtWeighted';

type GovProps = {};

const Gov: React.FC<GovProps> = ({}) => {
	const { t } = useTranslation();
	const votingWeight = useScaledVotingWeightQuery();
	const space = useSnapshotSpace(SPACES.COUNCIL);
	const councilProposals = useProposals(SPACES.COUNCIL);
	const govProposals = useProposals(SPACES.PROPOSAL);

	const [latestElectionBlock, setLatestElectionBlock] = useState<number | null>(null);
	const [activeProposals, setActiveProposals] = useState<number | null>(null);

	const totalWeightedDebt = useTotalDebtWeighted(latestElectionBlock);

	useEffect(() => {
		if (govProposals.data) {
			let count = 0;
			govProposals.data.map((proposal) => {
				if (proposal.msg.payload.end > Date.now()) {
					count++;
				}
			});
			setActiveProposals(count);
		}
	}, [govProposals]);

	useEffect(() => {
		if (councilProposals.data) {
			let latest = 0;
			councilProposals.data.map((proposal) => {
				if (proposal.msg.payload.snapshot > latest) {
					latest = proposal.msg.payload.snapshot;
				}
			});
			setLatestElectionBlock(latest);
		}
	}, [councilProposals]);

	return (
		<>
			<Head>
				<title>{t('gov.page-title')}</title>
			</Head>
			<StatsSection>
				<WalletVotingPower
					title={t('common.stat-box.voting-power.title')}
					value={formatNumber(votingWeight?.data ?? 0)}
					tooltipContent={t('common.stat-box.voting-power.tooltip', {
						blocknumber: formatNumber(latestElectionBlock ?? 0, { decimals: 0 }),
					})}
				/>
				<ActiveProposals
					title={t('common.stat-box.active-proposals')}
					value={formatNumber(activeProposals ?? 0)}
				/>
				<TotalVotingPower
					title={t('common.stat-box.total-voting-power.title')}
					value={formatNumber(totalWeightedDebt ?? 0)}
					tooltipContent={t('common.stat-box.voting-power.tooltip', {
						blocknumber: formatNumber(latestElectionBlock ?? 0, { decimals: 0 }),
					})}
				/>
			</StatsSection>
			<LineSpacer />
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
		color: ${(props) => props.theme.colors.blue};
	}
`;

const ActiveProposals = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.blue};
	}
`;

export default Gov;
