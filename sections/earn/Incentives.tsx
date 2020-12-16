import { FC, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import Img from 'react-optimized-image';
import { useTranslation, Trans } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';

import useSNXLockedValueQuery from 'queries/staking/useSNXLockedValueQuery';

import useFeePeriodTimeAndProgress from 'hooks/useFeePeriodTimeAndProgress';

import useClaimedStatus from 'sections/hooks/useClaimedStatus';
import useLPData from 'hooks/useLPData';

import ROUTES from 'constants/routes';
import { CryptoCurrency, Synths } from 'constants/currency';

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
	const lpData = useLPData();
	const useSNXLockedValue = useSNXLockedValueQuery();
	const { nextFeePeriodStarts, currentFeePeriodStarted } = useFeePeriodTimeAndProgress();

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
							apy: lpData[CryptoCurrency.CurveLPToken].APR,
							tvl: lpData[CryptoCurrency.CurveLPToken].TVL,
							staked: {
								balance: lpData[CryptoCurrency.CurveLPToken].data?.staked ?? 0,
								asset: CryptoCurrency.CurveLPToken,
							},
							rewards: lpData[CryptoCurrency.CurveLPToken].data?.rewards ?? 0,
							periodStarted: now - (lpData[CryptoCurrency.CurveLPToken].data?.duration ?? 0),
							periodFinish: lpData[CryptoCurrency.CurveLPToken].data?.periodFinish ?? 0,
							claimed:
								(lpData[CryptoCurrency.CurveLPToken].data?.rewards ?? 0) > 0
									? false
									: NOT_APPLICABLE,
							now,
							route: ROUTES.Earn.Curve_LP,
							tab: Tab.Curve_LP,
						},
						{
							icon: <Img src={iETHSVG} />,
							title: t('earn.incentives.options.ieth.title'),
							subtitle: t('earn.incentives.options.ieth.subtitle'),
							apy: lpData[Synths.iETH].APR,
							tvl: lpData[Synths.iETH].TVL,
							staked: {
								balance: lpData[Synths.iETH].data?.staked ?? 0,
								asset: Synths.iETH,
							},
							rewards: lpData[Synths.iETH].data?.rewards ?? 0,
							periodStarted: now - (lpData[Synths.iETH].data?.duration ?? 0),
							periodFinish: lpData[Synths.iETH].data?.periodFinish ?? 0,
							claimed: (lpData[Synths.iETH].data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
							now,
							tab: Tab.iETH_LP,
							route: ROUTES.Earn.iETH_LP,
						},
						{
							icon: <Img src={iBTCSVG} />,
							title: t('earn.incentives.options.ibtc.title'),
							subtitle: t('earn.incentives.options.ibtc.subtitle'),
							apy: lpData[Synths.iBTC].APR,
							tvl: lpData[Synths.iBTC].TVL,
							staked: {
								balance: lpData[Synths.iBTC].data?.staked ?? 0,
								asset: Synths.iBTC,
							},
							rewards: lpData[Synths.iBTC].data?.rewards ?? 0,
							periodStarted: now - (lpData[Synths.iBTC].data?.duration ?? 0),
							periodFinish: lpData[Synths.iBTC].data?.periodFinish ?? 0,
							claimed: (lpData[Synths.iBTC].data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
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
			lpData,
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
				isLoaded={
					lpData[CryptoCurrency.CurveLPToken].data &&
					lpData[Synths.iBTC].data &&
					lpData[Synths.iETH].data
						? true
						: false
				}
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
							userBalance={lpData[CryptoCurrency.CurveLPToken].data?.userBalance ?? 0}
							stakedAsset={CryptoCurrency.CurveLPToken}
							allowance={lpData[CryptoCurrency.CurveLPToken].data?.allowance ?? null}
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
							userBalance={lpData[Synths.iETH].data?.userBalance ?? 0}
							stakedAsset={Synths.iETH}
							allowance={lpData[Synths.iETH].data?.allowance ?? null}
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
							userBalance={lpData[Synths.iBTC].data?.userBalance ?? 0}
							stakedAsset={Synths.iBTC}
							allowance={lpData[Synths.iBTC].data?.allowance ?? null}
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
