import { FC, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';

import { FlexDivCol, LineSpacer } from 'styles/common';
import { PossibleActions } from 'sections/dashboard';

import UIContainer from 'containers/UI';
import StatBox from 'components/StatBox';
import StatsSection from 'components/StatsSection';
import useUserStakingData from 'hooks/useUserStakingData';

import { formatFiatCurrency, formatPercent } from 'utils/formatters/number';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import StakedValue from 'sections/shared/modals/StakedValueModal/StakedValueBox';
import ActiveDebt from 'sections/shared/modals/DebtValueModal/DebtValueBox';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import useSynthetixQueries from '@synthetixio/queries';

const DashboardPage: FC = () => {
	const { t } = useTranslation();
	const walletAddress = useRecoilValue(walletAddressState);
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const { stakedValue, stakingAPR, debtBalance } = useUserStakingData(walletAddress);
	const { setTitle } = UIContainer.useContainer();
	const { L1DefaultProvider, L2DefaultProvider } = Connector.useContainer();
	const { useGetDebtL1, useGetDebtL2 } = useSynthetixQueries();
	const L1Query = useGetDebtL1(L1DefaultProvider);
	const L2Query = useGetDebtL2(L2DefaultProvider);
	useEffect(() => {
		if (L1Query.data?.length && L2Query.data?.length) {
			/* 			const L1synths: string[] = [];
			const result = L1Query.data.map((synth) => {
				for (const l2Synth of L2Query.data) {
					if (l2Synth.symbol === synth.symbol) {
						L1synths.push(synth.symbol);
						return {
							...synth,
							totalSupply: synth.totalSupply.add(l2Synth.totalSupply),
							inUSD: synth.inUSD.add(l2Synth.inUSD),
						};
					}
				}
				L1synths.push(synth.symbol);
				return synth;
			});
			L2Query.data.forEach((synth) => {
				if (!L1synths.includes(synth.symbol)) {
					result.push(synth);
				}
			});
			result.forEach((synth) => {
				console.log(
					synth.symbol,
					'debt: ',
					synth.totalSupply.toString(),
					'inUSD: ',
					synth.inUSD.toString()
				);
			}); */
			L1Query.data.forEach((synth) =>
				console.log('L1', synth.symbol, synth.totalSupply.toString(), synth.inUSD.toString())
			);
			L2Query.data.forEach((synth) =>
				console.log('L2	', synth.symbol, synth.totalSupply.toString(), synth.inUSD.toString())
			);
		}
	}, [L1Query.isSuccess, L2Query.isSuccess]);

	// header title
	useEffect(() => {
		setTitle('home');
	}, [setTitle]);

	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<Content>
				<StatsSection>
					<StakedValue
						title={t('common.stat-box.staked-value')}
						value={formatFiatCurrency(getPriceAtCurrentRate(stakedValue), {
							sign: selectedPriceCurrency.sign,
						})}
					/>
					<APR
						title={t('common.stat-box.earning')}
						value={formatPercent(stakingAPR ? stakingAPR : 0)}
						size="lg"
					/>
					<ActiveDebt
						title={t('common.stat-box.active-debt')}
						value={formatFiatCurrency(getPriceAtCurrentRate(debtBalance), {
							sign: selectedPriceCurrency.sign,
						})}
						isPink
					/>
				</StatsSection>
				<LineSpacer />
				<PossibleActions />
			</Content>
		</>
	);
};

const Content = styled(FlexDivCol)`
	width: 100%;
	max-width: 1200px;
`;

const APR = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.green};
	}
	.value {
		text-shadow: ${(props) => props.theme.colors.greenTextShadow};
		color: #073124;
	}
`;

export default DashboardPage;
