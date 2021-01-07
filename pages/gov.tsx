import React from 'react';

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

type GovProps = {};

const Gov: React.FC<GovProps> = ({}) => {
	const { t } = useTranslation();
	const votingWeight = useScaledVotingWeightQuery();
	return (
		<>
			<Head>
				<title>{t('gov.page-title')}</title>
			</Head>
			<StatsSection>
				<WalletVotingPower
					title={t('common.stat-box.voting-power.title')}
					value={formatNumber(votingWeight?.data ?? 0)}
					tooltipContent={t('common.stat-box.voting-power.tooltip', { blocknumber: 123124 })}
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

export default Gov;
