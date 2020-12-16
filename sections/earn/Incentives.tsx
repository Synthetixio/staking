import { FC, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import Img from 'react-optimized-image';
import { useTranslation, Trans } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';

import useIETHPoolQuery_1 from 'queries/liquidityPools/useIETHPoolQuery_1';
import useIBTCPoolQuery_1 from 'queries/liquidityPools/useIBTCPoolQuery_1';
import useCurvePoolQuery_1 from 'queries/liquidityPools/useCurvePoolQuery_1';
import useSNXLockedValueQuery from 'queries/staking/useSNXLockedValueQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import useFeePeriodTimeAndProgress from 'hooks/useFeePeriodTimeAndProgress';

import useClaimedStatus from 'sections/hooks/useClaimedStatus';

import ROUTES from 'constants/routes';
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
import { isWalletConnectedState } from 'store/wallet';

import { Tab } from './types';

export const NOT_APPLICABLE = 'n/a';

type IncentivesProps = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
	totalRewards: BigNumber;
	stakingAPR: number;
	stakedValue: number;
};

const VALID_TABS = Object.values(Tab);

const Incentives: FC<IncentivesProps> = ({
	tradingRewards,
	stakingRewards,
	totalRewards,
	stakingAPR,
	stakedValue,
}) => {
	const { t } = useTranslation();
	const router = useRouter();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const claimedSNX = useClaimedStatus();
	const useiETHPool = useIETHPoolQuery_1();
	const useiBTCPool = useIBTCPoolQuery_1();
	const useCurvePool = useCurvePoolQuery_1();
	const useSNXLockedValue = useSNXLockedValueQuery();
	const { nextFeePeriodStarts, currentFeePeriodStarted } = useFeePeriodTimeAndProgress();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;

	const iETHTVL = (useiETHPool.data?.balance ?? 0) * (useiETHPool.data?.price ?? 0);
	const iETHAPY = (((useiETHPool.data?.distribution ?? 0) * SNXRate) / iETHTVL) * WEEKS_IN_YEAR;

	const iBTCTVL = (useiBTCPool.data?.balance ?? 0) * (useiBTCPool.data?.price ?? 0);
	const iBTCAPY = (((useiBTCPool.data?.distribution ?? 0) * SNXRate) / iBTCTVL) * WEEKS_IN_YEAR;

	const curveTVL = (useCurvePool.data?.balance ?? 0) * (useCurvePool.data?.price ?? 0);
	const curveAPY =
		(((useCurvePool.data?.distribution ?? 0) * SNXRate) / curveTVL) * WEEKS_IN_YEAR +
		(useCurvePool.data?.swapAPY ?? 0) +
		(useCurvePool.data?.rewardsAPY ?? 0);

	const now = useMemo(() => new Date().getTime(), []);

	const activeTab = useMemo(
		() =>
			isWalletConnected &&
			Array.isArray(router.query.pool) &&
			router.query.pool.length &&
			VALID_TABS.includes(router.query.pool[0] as Tab)
				? (router.query.pool[0] as Tab)
				: null,
		[router.query.pool, isWalletConnected]
	);

	const incentives = useMemo(
		() =>
			isWalletConnected
				? [
						{
							icon: <Img src={snxSVG} />,
							title: t('earn.incentives.options.snx.title'),
							subtitle: t('earn.incentives.options.snx.subtitle'),
							apy: stakingAPR,
							tvl: useSNXLockedValue.data ?? 0,
							staked: {
								balance: stakedValue,
								asset: CryptoCurrency.SNX,
							},
							rewards: stakingRewards.toNumber(),
							periodStarted: currentFeePeriodStarted.getTime(),
							periodFinish: nextFeePeriodStarts.getTime(),
							claimed: claimedSNX,
							now,
							tab: Tab.Claim,
							route: ROUTES.Earn.Claim,
						},
						{
							icon: <Img src={curveSVG} />,
							title: t('earn.incentives.options.curve.title'),
							subtitle: t('earn.incentives.options.curve.subtitle'),
							apy: curveAPY,
							tvl: curveTVL,
							staked: {
								balance: useCurvePool.data?.staked ?? 0,
								asset: CryptoCurrency.CurveLPToken,
							},
							rewards: useCurvePool.data?.rewards ?? 0,
							periodStarted: now - (useCurvePool.data?.duration ?? 0),
							periodFinish: useCurvePool.data?.periodFinish ?? 0,
							claimed: (useCurvePool.data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
							now,
							route: ROUTES.Earn.Curve_LP,
							tab: Tab.Curve_LP,
						},
						{
							icon: <Img src={iETHSVG} />,
							title: t('earn.incentives.options.ieth.title'),
							subtitle: t('earn.incentives.options.ieth.subtitle'),
							apy: iETHAPY,
							tvl: iETHTVL,
							staked: {
								balance: useiETHPool.data?.staked ?? 0,
								asset: Synths.iETH,
							},
							rewards: useiETHPool.data?.rewards ?? 0,
							periodStarted: now - (useiETHPool.data?.duration ?? 0),
							periodFinish: useiETHPool.data?.periodFinish ?? 0,
							claimed: (useiETHPool.data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
							now,
							tab: Tab.iETH_LP,
							route: ROUTES.Earn.iETH_LP,
						},
						{
							icon: <Img src={iBTCSVG} />,
							title: t('earn.incentives.options.ibtc.title'),
							subtitle: t('earn.incentives.options.ibtc.subtitle'),
							apy: iBTCAPY,
							tvl: iBTCTVL,
							staked: {
								balance: useiBTCPool.data?.staked ?? 0,
								asset: Synths.iBTC,
							},
							rewards: useiBTCPool.data?.rewards ?? 0,
							periodStarted: now - (useiBTCPool.data?.duration ?? 0),
							periodFinish: useiBTCPool.data?.periodFinish ?? 0,
							claimed: (useiBTCPool.data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
							now,
							tab: Tab.iBTC_LP,
							route: ROUTES.Earn.iBTC_LP,
						},
				  ]
				: [],
		[
			stakingAPR,
			stakedValue,
			useSNXLockedValue.data,
			nextFeePeriodStarts,
			stakingRewards,
			claimedSNX,
			curveAPY,
			curveTVL,
			iBTCAPY,
			iBTCTVL,
			iETHAPY,
			iETHTVL,
			useiETHPool.data,
			useCurvePool.data,
			useiBTCPool.data,
			currentFeePeriodStarted,
			now,
			t,
			isWalletConnected,
		]
	);

	return (
		<FlexDiv>
			<IncentivesTable
				activeTab={activeTab}
				data={incentives}
				isLoaded={useCurvePool.data && useiBTCPool.data && useiETHPool.data ? true : false}
			/>
			{activeTab != null ? (
				<TabContainer>
					{activeTab === Tab.Claim && (
						<ClaimTab
							tradingRewards={tradingRewards}
							stakingRewards={stakingRewards}
							totalRewards={totalRewards}
						/>
					)}
					{activeTab === Tab.Curve_LP && (
						<LPTab
							userBalance={useCurvePool.data?.userBalance ?? 0}
							stakedAsset={CryptoCurrency.CurveLPToken}
							allowance={useCurvePool.data?.allowance ?? null}
							icon={incentives[1].icon}
							tokenRewards={incentives[1].rewards}
							staked={incentives[1].staked.balance}
							title={
								<Trans
									i18nKey="earn.incentives.options.snx.description"
									components={[<StyledLink />]}
								/>
							}
						/>
					)}
					{activeTab === Tab.iETH_LP && (
						<LPTab
							userBalance={useiETHPool.data?.userBalance ?? 0}
							stakedAsset={Synths.iETH}
							allowance={useiETHPool.data?.allowance ?? null}
							icon={incentives[2].icon}
							tokenRewards={incentives[2].rewards}
							staked={incentives[2].staked.balance}
							title={
								<Trans
									i18nKey="earn.incentives.options.snx.description"
									components={[<StyledLink />]}
								/>
							}
						/>
					)}
					{activeTab === Tab.iBTC_LP && (
						<LPTab
							userBalance={useiBTCPool.data?.userBalance ?? 0}
							stakedAsset={Synths.iBTC}
							allowance={useiBTCPool.data?.allowance ?? null}
							icon={incentives[3].icon}
							tokenRewards={incentives[3].rewards}
							staked={incentives[3].staked.balance}
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
