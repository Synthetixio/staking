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

import { Tab } from './types';

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
							title: t('earn.incentives.options.curve.title'),
							subtitle: t('earn.incentives.options.curve.subtitle'),
							apr: lpData[Synths.sUSD].APR,
							tvl: lpData[Synths.sUSD].TVL,
							staked: {
								balance: lpData[Synths.sUSD].data?.staked ?? 0,
								asset: Synths.sUSD,
							},
							rewards: lpData[Synths.sUSD].data?.rewards ?? 0,
							periodStarted: now - (lpData[Synths.sUSD].data?.duration ?? 0),
							periodFinish: lpData[Synths.sUSD].data?.periodFinish ?? 0,
							claimed: (lpData[Synths.sUSD].data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
							now,
							route: ROUTES.Earn.sUSD_LP,
							tab: Tab.sUSD_LP,
							externalLink: ROUTES.Earn.sUSD_EXTERNAL,
						},
						{
							title: t('earn.incentives.options.seur.title'),
							subtitle: t('earn.incentives.options.seur.subtitle'),
							apr: lpData[Synths.sEUR].APR,
							tvl: lpData[Synths.sEUR].TVL,
							staked: {
								balance: lpData[Synths.sEUR].data?.staked ?? 0,
								asset: Synths.sEUR,
							},
							rewards: lpData[Synths.sEUR].data?.rewards ?? 0,
							periodStarted: now - (lpData[Synths.sEUR].data?.duration ?? 0),
							periodFinish: lpData[Synths.sEUR].data?.periodFinish ?? 0,
							claimed: (lpData[Synths.sEUR].data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
							now,
							route: ROUTES.Earn.sEURO_LP,
							tab: Tab.sEURO_LP,
							externalLink: ROUTES.Earn.sEURO_EXTERNAL,
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
				lpData[Synths.sUSD].data &&
				lpData[Synths.sEUR].data &&
				lpData[Synths.iBTC].data &&
				lpData[Synths.iETH].data
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
						stakedAsset={Synths.iETH}
						allowance={lpData[Synths.iETH].data?.allowance ?? null}
						tokenRewards={incentives[1].rewards}
						staked={incentives[1].staked.balance}
						needsToSettle={incentives[1].needsToSettle}
					/>
				)}
				{activeTab === Tab.iBTC_LP && (
					<LPTab
						userBalance={lpData[Synths.iBTC].data?.userBalance ?? 0}
						stakedAsset={Synths.iBTC}
						allowance={lpData[Synths.iBTC].data?.allowance ?? null}
						tokenRewards={incentives[2].rewards}
						staked={incentives[2].staked.balance}
						needsToSettle={incentives[2].needsToSettle}
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
