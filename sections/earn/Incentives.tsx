import { FC, useState, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import Img from 'react-optimized-image';
import { useTranslation, Trans } from 'react-i18next';

import useIETHPoolQuery_1 from 'queries/liquidityPools/useIETHPoolQuery_1';
import useIBTCPoolQuery_1 from 'queries/liquidityPools/useIBTCPoolQuery_1';
import useCurvePoolQuery_1 from 'queries/liquidityPools/useCurvePoolQuery_1';
import useSNXLockedValueQuery from 'queries/staking/useSNXLockedValueQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import useFeePeriodTimeAndProgress from 'hooks/useFeePeriodTimeAndProgress';

import useClaimedStatus from 'sections/hooks/useClaimedStatus';
import { CryptoCurrency, Synths } from 'constants/currency';
import { WEEKS_IN_YEAR } from 'constants/date';

import { FlexDiv } from 'styles/common';

import curveSVG from 'assets/svg/incentives/pool-curve.svg';
import iBTCSVG from 'assets/svg/incentives/pool-ibtc.svg';
import iETHSVG from 'assets/svg/incentives/pool-ieth.svg';
import snxSVG from 'assets/svg/incentives/pool-snx.svg';

import IncentivesTable from './IncentivesTable';
import ClaimTab from './ClaimTab';
import LPTab from './LPTab';
import { StyledLink } from './common';

export const NOT_APPLICABLE = 'n/a';

type IncentivesProps = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
	totalRewards: BigNumber;
	stakingAPR: number;
	stakedValue: number;
};

const Incentives: FC<IncentivesProps> = ({
	tradingRewards,
	stakingRewards,
	totalRewards,
	stakingAPR,
	stakedValue,
}) => {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<number | null>(null);

	const claimedSNX = useClaimedStatus();
	const useiETHPool = useIETHPoolQuery_1();
	const useiBTCPool = useIBTCPoolQuery_1();
	const useCurvePool = useCurvePoolQuery_1();
	const useSNXLockedValue = useSNXLockedValueQuery();
	const { nextFeePeriodStarts, currentFeePeriodStarted } = useFeePeriodTimeAndProgress();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;

	const iETHTVL = (useiETHPool.data?.balance ?? 0) * (useiETHPool.data?.price ?? 0);
	const iETHAPR = (((useiETHPool.data?.distribution ?? 0) * SNXRate) / iETHTVL) * WEEKS_IN_YEAR;

	const iBTCTVL = (useiBTCPool.data?.balance ?? 0) * (useiBTCPool.data?.price ?? 0);
	const iBTCAPR = (((useiBTCPool.data?.distribution ?? 0) * SNXRate) / iBTCTVL) * WEEKS_IN_YEAR;

	const curveTVL = (useCurvePool.data?.balance ?? 0) * (useCurvePool.data?.price ?? 0);
	const curveAPR =
		(((useCurvePool.data?.distribution ?? 0) * SNXRate) / curveTVL) * WEEKS_IN_YEAR +
		(useCurvePool.data?.swapAPY ?? 0) +
		(useCurvePool.data?.rewardsAPY ?? 0);

	const now = useMemo(() => new Date().getTime(), []);

	const incentives = useMemo(
		() => [
			{
				icon: <Img src={snxSVG} />,
				title: t('earn.incentives.options.snx.title'),
				subtitle: t('earn.incentives.options.snx.subtitle'),
				apr: stakingAPR,
				tvl: useSNXLockedValue.data ?? 0,
				staked: {
					balance: stakedValue,
					asset: CryptoCurrency.SNX,
				},
				rewards: stakingRewards.toNumber(),
				periodStarted: currentFeePeriodStarted.getTime(),
				periodFinish: nextFeePeriodStarts.getTime(),
				incentivesIndex: 0,
				claimed: claimedSNX,
				now,
			},
			{
				icon: <Img src={curveSVG} />,
				title: t('earn.incentives.options.curve.title'),
				subtitle: t('earn.incentives.options.curve.subtitle'),
				apr: curveAPR,
				tvl: curveTVL,
				staked: {
					balance: useCurvePool.data?.staked ?? 0,
					asset: Synths.sUSD,
				},
				rewards: useCurvePool.data?.rewards ?? 0,
				periodStarted: now - (useCurvePool.data?.duration ?? 0),
				periodFinish: useCurvePool.data?.periodFinish ?? 0,
				incentivesIndex: 1,
				claimed: (useCurvePool.data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
				now,
			},
			{
				icon: <Img src={iETHSVG} />,
				title: t('earn.incentives.options.ieth.title'),
				subtitle: t('earn.incentives.options.ieth.subtitle'),
				apr: iETHAPR,
				tvl: iETHTVL,
				staked: {
					balance: useiETHPool.data?.staked ?? 0,
					asset: Synths.iETH,
				},
				rewards: useiETHPool.data?.rewards ?? 0,
				periodStarted: now - (useiETHPool.data?.duration ?? 0),
				periodFinish: useiETHPool.data?.periodFinish ?? 0,
				incentivesIndex: 2,
				claimed: (useiETHPool.data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
				now,
			},
			{
				icon: <Img src={iBTCSVG} />,
				title: t('earn.incentives.options.ibtc.title'),
				subtitle: t('earn.incentives.options.ibtc.subtitle'),
				apr: iBTCAPR,
				tvl: iBTCTVL,
				staked: {
					balance: useiBTCPool.data?.staked ?? 0,
					asset: Synths.iBTC,
				},
				rewards: useiBTCPool.data?.rewards ?? 0,
				periodStarted: now - (useiBTCPool.data?.duration ?? 0),
				periodFinish: useiBTCPool.data?.periodFinish ?? 0,
				incentivesIndex: 3,
				claimed: (useiBTCPool.data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
				now,
			},
		],
		[
			stakingAPR,
			stakedValue,
			useSNXLockedValue.data,
			nextFeePeriodStarts,
			stakingRewards,
			claimedSNX,
			curveAPR,
			curveTVL,
			iBTCAPR,
			iBTCTVL,
			iETHAPR,
			iETHTVL,
			useiETHPool.data,
			useCurvePool.data,
			useiBTCPool.data,
			currentFeePeriodStarted,
			now,
			t,
		]
	);
	return (
		<FlexDiv>
			<IncentivesTable
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				data={incentives}
				isLoaded={useCurvePool.data && useiBTCPool.data && useiETHPool.data ? true : false}
			/>
			{activeTab != null ? (
				<TabContainer>
					{activeTab === 0 && (
						<ClaimTab
							tradingRewards={tradingRewards}
							stakingRewards={stakingRewards}
							totalRewards={totalRewards}
						/>
					)}
					{activeTab === 1 && (
						<LPTab
							userBalance={useCurvePool.data?.userBalance ?? 0}
							synth={Synths.sUSD}
							allowance={(1 || useCurvePool.data?.allowance) ?? null}
							icon={incentives[1].icon}
							tokenRewards={incentives[1].rewards}
							title={
								<Trans
									i18nKey="earn.incentives.options.snx.description"
									components={[<StyledLink />]}
								/>
							}
						/>
					)}
					{activeTab === 2 && (
						<LPTab
							userBalance={useiETHPool.data?.userBalance ?? 0}
							synth={Synths.iETH}
							allowance={useiETHPool.data?.allowance ?? null}
							icon={incentives[2].icon}
							tokenRewards={incentives[2].rewards}
							title={
								<Trans
									i18nKey="earn.incentives.options.snx.description"
									components={[<StyledLink />]}
								/>
							}
						/>
					)}
					{activeTab === 3 && (
						<LPTab
							userBalance={useiBTCPool.data?.userBalance ?? 0}
							synth={Synths.iBTC}
							allowance={useiBTCPool.data?.allowance ?? null}
							icon={incentives[3].icon}
							tokenRewards={incentives[3].rewards}
							title={
								<Trans
									i18nKey="earn.incentives.options.snx.description"
									components={[<StyledLink />]}
								/>
							}
						/>
					)}
				</TabContainer>
			) : null}
		</FlexDiv>
	);
};

const TabContainer = styled.div`
	width: 60%;
	background-color: ${(props) => props.theme.colors.navy};
`;

export default Incentives;
