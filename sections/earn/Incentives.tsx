import { FC, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';

import useSNXLockedValueQuery from 'queries/staking/useSNXLockedValueQuery';

import useFeePeriodTimeAndProgress from 'hooks/useFeePeriodTimeAndProgress';
import useLPData from 'hooks/useLPData';

import ROUTES from 'constants/routes';
import { CryptoCurrency, Synths } from 'constants/currency';

import IncentivesTable from './IncentivesTable';
import ClaimTab from './ClaimTab';
import LPTab from './LPTab';
import { isWalletConnectedState } from 'store/wallet';

import { Tab, LP } from './types';
import { zeroBN } from 'utils/formatters/number';

export const NOT_APPLICABLE = 'n/a';

type IncentivesProps = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
	totalRewards: BigNumber;
	stakingAPR: number;
	stakedAmount: number;
	hasClaimed: boolean;
};

const VALID_TABS = Object.values(Tab);

const Incentives: FC<IncentivesProps> = ({
	tradingRewards,
	stakingRewards,
	totalRewards,
	stakingAPR,
	stakedAmount,
	hasClaimed,
}) => {
	const { t } = useTranslation();
	const router = useRouter();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

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
							title: t('earn.incentives.options.snx.title'),
							subtitle: t('earn.incentives.options.snx.subtitle'),
							apr: stakingAPR,
							tvl: useSNXLockedValue.data ?? 0,
							staked: {
								balance: stakedAmount,
								asset: CryptoCurrency.SNX,
							},
							rewards: stakingRewards.toNumber(),
							periodStarted: currentFeePeriodStarted.getTime(),
							periodFinish: nextFeePeriodStarts.getTime(),
							claimed: hasClaimed,
							now,
							tab: Tab.Claim,
							route: ROUTES.Earn.Claim,
						},
						{
							title: t('earn.incentives.options.ieth.title'),
							subtitle: t('earn.incentives.options.ieth.subtitle'),
							apr: lpData[Synths.iETH].APR,
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
							needsToSettle: lpData[Synths.iETH].data?.needsToSettle,
						},
						{
							title: t('earn.incentives.options.ibtc.title'),
							subtitle: t('earn.incentives.options.ibtc.subtitle'),
							apr: lpData[Synths.iBTC].APR,
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
							needsToSettle: lpData[Synths.iBTC].data?.needsToSettle,
						},
						{
							title: t('earn.incentives.options.stsla.title'),
							subtitle: t('earn.incentives.options.stsla.subtitle'),
							apr: lpData[LP.BALANCER_sTSLA].APR,
							tvl: lpData[LP.BALANCER_sTSLA].TVL,
							staked: {
								balance: lpData[LP.BALANCER_sTSLA].data?.staked ?? 0,
								asset: LP.BALANCER_sTSLA,
							},
							rewards: lpData[LP.BALANCER_sTSLA].data?.rewards ?? 0,
							periodStarted: now - (lpData[LP.BALANCER_sTSLA].data?.duration ?? 0),
							periodFinish: lpData[LP.BALANCER_sTSLA].data?.periodFinish ?? 0,
							claimed: (lpData[LP.BALANCER_sTSLA].data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
							now,
							route: ROUTES.Earn.sTLSA_LP,
							tab: Tab.sTLSA_LP,
						},
						{
							title: t('earn.incentives.options.curve.title'),
							subtitle: t('earn.incentives.options.curve.subtitle'),
							apr: lpData[LP.CURVE_sUSD].APR,
							tvl: lpData[LP.CURVE_sUSD].TVL,
							staked: {
								balance: lpData[LP.CURVE_sUSD].data?.staked ?? 0,
								asset: LP.CURVE_sUSD,
							},
							rewards: lpData[LP.CURVE_sUSD].data?.rewards ?? 0,
							periodStarted: now - (lpData[LP.CURVE_sUSD].data?.duration ?? 0),
							periodFinish: lpData[LP.CURVE_sUSD].data?.periodFinish ?? 0,
							claimed: (lpData[LP.CURVE_sUSD].data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
							now,
							route: ROUTES.Earn.sUSD_LP,
							tab: Tab.sUSD_LP,
							externalLink: ROUTES.Earn.sUSD_EXTERNAL,
						},
				  ]
				: [],
		[
			stakingAPR,
			stakedAmount,
			useSNXLockedValue.data,
			nextFeePeriodStarts,
			stakingRewards,
			hasClaimed,
			lpData,
			currentFeePeriodStarted,
			now,
			t,
			isWalletConnected,
		]
	);

	const incentivesTable = (
		<IncentivesTable
			activeTab={activeTab}
			data={incentives}
			isLoaded={
				lpData[LP.CURVE_sUSD].data &&
				lpData[LP.CURVE_sEURO].data &&
				lpData[Synths.iBTC].data &&
				lpData[Synths.iETH].data &&
				lpData[LP.BALANCER_sTSLA].data
					? true
					: false
			}
		/>
	);

	return activeTab == null ? (
		<>{incentivesTable}</>
	) : (
		<Container>
			{incentivesTable}
			<TabContainer>
				{activeTab === Tab.Claim && (
					<ClaimTab
						tradingRewards={tradingRewards}
						stakingRewards={stakingRewards}
						totalRewards={totalRewards}
					/>
				)}
				{activeTab === Tab.iETH_LP && (
					<LPTab
						userBalance={lpData[Synths.iETH].data?.userBalance ?? 0}
						userBalanceBN={lpData[Synths.iETH].data?.userBalanceBN ?? zeroBN}
						stakedAsset={Synths.iETH}
						allowance={lpData[Synths.iETH].data?.allowance ?? null}
						tokenRewards={incentives[1].rewards}
						staked={incentives[1].staked.balance}
						stakedBN={lpData[Synths.iETH].data?.stakedBN ?? zeroBN}
						needsToSettle={incentives[1].needsToSettle}
					/>
				)}
				{activeTab === Tab.iBTC_LP && (
					<LPTab
						userBalance={lpData[Synths.iBTC].data?.userBalance ?? 0}
						userBalanceBN={lpData[Synths.iBTC].data?.userBalanceBN ?? zeroBN}
						stakedAsset={Synths.iBTC}
						allowance={lpData[Synths.iBTC].data?.allowance ?? null}
						tokenRewards={incentives[2].rewards}
						staked={incentives[2].staked.balance}
						stakedBN={lpData[Synths.iBTC].data?.stakedBN ?? zeroBN}
						needsToSettle={incentives[2].needsToSettle}
					/>
				)}
				{activeTab === Tab.sTLSA_LP && (
					<LPTab
						userBalance={lpData[LP.BALANCER_sTSLA].data?.userBalance ?? 0}
						userBalanceBN={lpData[LP.BALANCER_sTSLA].data?.userBalanceBN ?? zeroBN}
						stakedAsset={LP.BALANCER_sTSLA}
						allowance={lpData[LP.BALANCER_sTSLA].data?.allowance ?? null}
						tokenRewards={incentives[3].rewards}
						staked={incentives[3].staked.balance}
						stakedBN={lpData[LP.BALANCER_sTSLA].data?.stakedBN ?? zeroBN}
						needsToSettle={incentives[3].needsToSettle}
					/>
				)}
			</TabContainer>
		</Container>
	);
};

const Container = styled.div`
	background-color: ${(props) => props.theme.colors.navy};
	display: grid;
	grid-template-columns: auto 639.5px;
`;

const TabContainer = styled.div`
	background-color: ${(props) => props.theme.colors.navy};
	min-height: 380px;
`;

export default Incentives;
