import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import StatBox from 'components/StatBox';
import styled from 'styled-components';
import { StatsSection, LineSpacer } from 'styles/common';
import { formatNumber } from 'utils/formatters/number';

import useTotalDebtWeighted from 'sections/gov/hooks/useTotalDebtWeighted';
import useIndividualDebtWeighted from 'sections/gov/hooks/useIndividualDebtWeighted';

import useProposals from 'queries/gov/useProposals';

import MainContent from 'sections/gov';
import useActiveProposalCount from 'sections/gov/hooks/useActiveProposalCount';
import { SPACE_KEY } from 'constants/snapshot';

type GovProps = {};

const Gov: React.FC<GovProps> = ({}) => {
	const { t } = useTranslation();
	const councilProposals = useProposals(SPACE_KEY.COUNCIL);

	const [latestElectionBlock, setLatestElectionBlock] = useState<number | null>(null);
	const activeProposals = useActiveProposalCount();

	const total = useTotalDebtWeighted(latestElectionBlock);
	const individual = useIndividualDebtWeighted(latestElectionBlock);

	useEffect(() => {
		if (councilProposals.data && !latestElectionBlock) {
			let latest = 0;
			councilProposals.data.map((proposal) => {
				if (parseInt(proposal.msg.payload.snapshot) > latest) {
					latest = parseInt(proposal.msg.payload.snapshot);
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
					value={formatNumber(individual ?? 0)}
					tooltipContent={t('common.stat-box.voting-power.tooltip', {
						blocknumber: formatNumber(latestElectionBlock ?? 0, { decimals: 0 }),
					})}
				/>
				<ActiveProposals
					title={t('common.stat-box.active-proposals')}
					value={activeProposals ?? 0}
				/>
				<TotalVotingPower
					title={t('common.stat-box.total-voting-power.title')}
					value={formatNumber(total ?? 0)}
					tooltipContent={t('common.stat-box.voting-power.tooltip', {
						blocknumber: formatNumber(latestElectionBlock ?? 0, { decimals: 0 }),
					})}
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
