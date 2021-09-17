import { FC, useMemo, useState } from 'react';
import Wei, { wei } from '@synthetixio/wei';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';

import useLPData from 'hooks/useLPData';
import ROUTES from 'constants/routes';
import { CryptoCurrency, Synths } from 'constants/currency';
import media from 'styles/media';
import useFeePeriodTimeAndProgress from 'hooks/useFeePeriodTimeAndProgress';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import useShortRewardsData from 'hooks/useShortRewardsData';
import { TabButton, TabList } from 'components/Tab';
import { CurrencyIconType } from 'components/Currency/CurrencyIcon/CurrencyIcon';
import { DesktopOrTabletView } from 'components/Media';

import IncentivesTable, { DualRewards, NOT_APPLICABLE } from './IncentivesTable';
import ClaimTab from './ClaimTab';
import LPTab from './LPTab';
import {
	Tab,
	LP,
	lpToTab,
	tabToLP,
	lpToSynthTranslationKey,
	lpToSynthIcon,
	lpToRoute,
} from './types';
import YearnVaultTab from './LPTab/YearnVaultTab';
import { YearnVaultData } from 'queries/liquidityPools/useYearnSNXVaultQuery';
import useSynthetixQueries from '@synthetixio/queries';

enum View {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}

type IncentivesProps = {
	tradingRewards: Wei;
	stakingRewards: Wei;
	totalRewards: Wei;
	stakingAPR: Wei;
	stakedAmount: Wei;
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
	const [view, setView] = useState<View>(View.ACTIVE);

	const walletAddress = useRecoilValue(walletAddressState);
	const { useGlobalStakingInfoQuery } = useSynthetixQueries();

	const lpData = useLPData();
	const shortData = useShortRewardsData(walletAddress);
	const globalStakingQuery = useGlobalStakingInfoQuery();

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

	const incentives = useMemo(() => {
		const balancerIncentives = (balancerLP: LP) => {
			const tab = lpToTab[balancerLP];
			const synthTransKey = lpToSynthTranslationKey[balancerLP];
			const route = lpToRoute[balancerLP];
			const currencyKey = lpToSynthIcon[balancerLP];

			const isDual = !!(lpData[balancerLP].data?.rewards as { a: Wei; b: Wei })?.a;

			return {
				title: t(`earn.incentives.options.${synthTransKey}.title`),
				subtitle: t(`earn.incentives.options.${synthTransKey}.subtitle`),
				apr: lpData[balancerLP].APR,
				tvl: lpData[balancerLP].TVL,
				staked: {
					balance: lpData[balancerLP].data?.staked ?? wei(0),
					asset: currencyKey,
					ticker: balancerLP,
				},
				rewards: lpData[balancerLP].data?.rewards ?? wei(0),
				periodStarted: now - (lpData[balancerLP].data?.duration ?? 0),
				periodFinish: lpData[balancerLP].data?.periodFinish ?? 0,
				claimed: (
					isDual
						? (lpData[balancerLP].data?.rewards as { a: Wei; b: Wei }).a.gt(0)
						: (lpData[balancerLP].data?.rewards as Wei)?.gt(0)
				)
					? false
					: NOT_APPLICABLE,
				now,
				route: route,
				tab: tab,
			};
		};

		return isWalletConnected
			? [
					{
						title: t('earn.incentives.options.snx.title'),
						subtitle: t('earn.incentives.options.snx.subtitle'),
						apr: stakingAPR,
						tvl: globalStakingQuery.data?.lockedValue ?? wei(0),
						staked: {
							balance: stakedAmount,
							asset: CryptoCurrency.SNX,
							ticker: CryptoCurrency.SNX,
						},
						rewards: stakingRewards,
						periodStarted: currentFeePeriodStarted.getTime(),
						periodFinish: nextFeePeriodStarts.getTime(),
						claimed: hasClaimed,
						now,
						tab: Tab.Claim,
						route: ROUTES.Earn.Claim,
					},
					{
						title: t('earn.incentives.options.yvsnx.title'),
						subtitle: t('earn.incentives.options.yvsnx.subtitle'),
						apr: lpData[LP.YEARN_SNX_VAULT].APR,
						tvl: lpData[LP.YEARN_SNX_VAULT].TVL,
						staked: {
							balance: (lpData[LP.YEARN_SNX_VAULT].data as YearnVaultData)?.stakedSNX ?? wei(0),
							asset: CryptoCurrency.SNX,
							ticker: CryptoCurrency.SNX,
							type: CurrencyIconType.TOKEN,
						},
						rewards: lpData[LP.YEARN_SNX_VAULT].data?.rewards ?? wei(0),
						periodStarted: now - (lpData[LP.YEARN_SNX_VAULT].data?.duration ?? 0),
						periodFinish: lpData[LP.YEARN_SNX_VAULT].data?.periodFinish ?? 0,
						claimed: NOT_APPLICABLE,
						now,
						route: ROUTES.Earn.yearn_SNX_VAULT,
						tab: Tab.yearn_SNX_VAULT,
						neverExpires: true,
					},
					{
						title: t('earn.incentives.options.ieth.title'),
						subtitle: t('earn.incentives.options.ieth.subtitle'),
						apr: lpData[Synths.iETH].APR,
						tvl: lpData[Synths.iETH].TVL,
						staked: {
							balance: lpData[Synths.iETH].data?.staked ?? wei(0),
							asset: Synths.iETH,
							ticker: Synths.iETH,
						},
						rewards: lpData[Synths.iETH].data?.rewards ?? wei(0),
						periodStarted: now - (lpData[Synths.iETH].data?.duration ?? 0),
						periodFinish: lpData[Synths.iETH].data?.periodFinish ?? 0,
						claimed: (lpData[Synths.iETH].data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
						now,
						tab: Tab.iETH_LP,
						route: ROUTES.Earn.iETH_LP,
						needsToSettle: lpData[Synths.iETH].data?.needsToSettle,
					},
					{
						title: t('earn.incentives.options.sbtc.title'),
						subtitle: t('earn.incentives.options.sbtc.subtitle'),
						apr: shortData[Synths.sBTC].APR,
						tvl: shortData[Synths.sBTC].OI,
						staked: {
							balance: shortData[Synths.sBTC].data?.staked ?? wei(0),
							asset: Synths.sBTC,
							ticker: Synths.sBTC,
						},
						rewards: shortData[Synths.sBTC].data?.rewards ?? wei(0),
						periodStarted: now - (shortData[Synths.sBTC].data?.duration ?? 0),
						periodFinish: shortData[Synths.sBTC].data?.periodFinish ?? 0,
						claimed: (shortData[Synths.sBTC].data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
						now,
						tab: Tab.sBTC_SHORT,
						route: ROUTES.Earn.sBTC_SHORT,
						externalLink: ROUTES.Earn.sBTC_EXTERNAL,
					},
					{
						title: t('earn.incentives.options.seth.title'),
						subtitle: t('earn.incentives.options.seth.subtitle'),
						apr: shortData[Synths.sETH].APR,
						tvl: shortData[Synths.sETH].OI,
						staked: {
							balance: shortData[Synths.sETH].data?.staked ?? wei(0),
							asset: Synths.sETH,
							ticker: Synths.sETH,
						},
						rewards: shortData[Synths.sETH].data?.rewards ?? wei(0),
						periodStarted: now - (shortData[Synths.sETH].data?.duration ?? 0),
						periodFinish: shortData[Synths.sETH].data?.periodFinish ?? 0,
						claimed: (shortData[Synths.sETH].data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
						now,
						tab: Tab.sETH_SHORT,
						route: ROUTES.Earn.sETH_SHORT,
						externalLink: ROUTES.Earn.sETH_EXTERNAL,
					},
					...[LP.BALANCER_sAAPL, LP.BALANCER_sTSLA].map(balancerIncentives),
					{
						title: t('earn.incentives.options.curve.title'),
						subtitle: t('earn.incentives.options.curve.subtitle'),
						apr: lpData[LP.CURVE_sUSD].APR,
						tvl: lpData[LP.CURVE_sUSD].TVL,
						staked: {
							balance: lpData[LP.CURVE_sUSD].data?.staked ?? wei(0),
							asset: CryptoCurrency.CRV,
							ticker: LP.CURVE_sUSD,
							type: CurrencyIconType.TOKEN,
						},
						rewards: lpData[LP.CURVE_sUSD].data?.rewards ?? wei(0),
						periodStarted: now - (lpData[LP.CURVE_sUSD].data?.duration ?? 0),
						periodFinish: lpData[LP.CURVE_sUSD].data?.periodFinish ?? 0,
						claimed: (lpData[LP.CURVE_sUSD].data?.rewards ?? 0) > 0 ? false : NOT_APPLICABLE,
						now,
						route: ROUTES.Earn.sUSD_LP,
						tab: Tab.sUSD_LP,
						externalLink: ROUTES.Earn.sUSD_EXTERNAL,
					},
					{
						title: t('earn.incentives.options.dht.title'),
						subtitle: t('earn.incentives.options.dht.subtitle'),
						apr: lpData[LP.UNISWAP_DHT].APR,
						tvl: lpData[LP.UNISWAP_DHT].TVL,
						staked: {
							balance: lpData[LP.UNISWAP_DHT].data?.staked ?? wei(0),
							asset: CryptoCurrency.DHT,
							ticker: LP.UNISWAP_DHT,
							type: CurrencyIconType.TOKEN,
						},
						rewards: lpData[LP.UNISWAP_DHT].data?.rewards ?? wei(0),
						dualRewards: true,
						periodStarted: now - (lpData[LP.UNISWAP_DHT].data?.duration ?? 0),
						periodFinish: lpData[LP.UNISWAP_DHT].data?.periodFinish ?? 0,
						claimed:
							((lpData[LP.UNISWAP_DHT].data?.rewards as DualRewards)?.a ?? wei(0)).gt(0) &&
							((lpData[LP.UNISWAP_DHT].data?.rewards as DualRewards)?.b ?? wei(0)).gt(0)
								? false
								: NOT_APPLICABLE,
						now,
						route: ROUTES.Earn.DHT_LP,
						tab: Tab.DHT_LP,
					},
			  ]
			: [];
	}, [
		stakingAPR,
		stakedAmount,
		globalStakingQuery.data,
		nextFeePeriodStarts,
		stakingRewards,
		hasClaimed,
		lpData,
		currentFeePeriodStarted,
		now,
		t,
		isWalletConnected,
		shortData,
	]);

	const incentivesTable = (
		<IncentivesTable
			activeTab={activeTab}
			data={
				view === View.ACTIVE
					? incentives.filter((e) => e.periodFinish > Date.now())
					: incentives.filter((e) => e.periodFinish <= Date.now())
			}
			isLoaded={
				lpData[LP.CURVE_sUSD].data &&
				lpData[LP.CURVE_sEURO].data &&
				shortData[Synths.sBTC].data &&
				shortData[Synths.sETH].data &&
				lpData[Synths.iETH].data &&
				lpData[Synths.iBTC].data &&
				lpData[LP.BALANCER_sTSLA].data
					? true
					: false
			}
		/>
	);

	const balancerTab = (selectedTab: Tab) => {
		const lp = tabToLP[selectedTab];
		const currencyKey = lpToSynthIcon[lp];

		return (
			activeTab === selectedTab && (
				<LPTab
					key={selectedTab}
					userBalance={lpData[lp].data?.userBalance ?? wei(0)}
					stakedAsset={lp}
					icon={currencyKey}
					allowance={lpData[lp].data?.allowance ?? null}
					tokenRewards={lpData[lp].data?.rewards ?? wei(0)}
					staked={lpData[lp].data?.staked ?? wei(0)}
					needsToSettle={lpData[lp].data?.needsToSettle}
				/>
			)
		);
	};

	return activeTab == null ? (
		<>
			<TabList noOfTabs={2}>
				<TabButton
					isSingle={false}
					tabHeight={50}
					inverseTabColor={true}
					blue={true}
					key={`active-button`}
					name={t('earn.tab.active')}
					active={view === View.ACTIVE}
					onClick={() => {
						setView(View.ACTIVE);
					}}
				>
					<TitleContainer>{t('earn.tab.active')}</TitleContainer>
				</TabButton>
				<TabButton
					isSingle={false}
					tabHeight={50}
					inverseTabColor={true}
					blue={false}
					key={`inactive-button`}
					name={t('earn.tab.inactive')}
					active={view === View.INACTIVE}
					onClick={() => {
						setView(View.INACTIVE);
					}}
				>
					<TitleContainer>{t('earn.tab.inactive')}</TitleContainer>
				</TabButton>
			</TabList>
			{incentivesTable}
		</>
	) : (
		<Container>
			<DesktopOrTabletView>{incentivesTable}</DesktopOrTabletView>
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
						userBalance={lpData[Synths.iETH].data?.userBalance ?? wei(0)}
						stakedAsset={Synths.iETH}
						allowance={lpData[Synths.iETH].data?.allowance ?? null}
						tokenRewards={lpData[Synths.iETH].data?.rewards ?? wei(0)}
						staked={lpData[Synths.iETH].data?.staked ?? wei(0)}
						needsToSettle={lpData[Synths.iETH].data?.needsToSettle}
					/>
				)}
				{/* {activeTab === Tab.sTLSA_LP && (
					<LPTab
						userBalance={lpData[LP.BALANCER_sTSLA].data?.userBalance ?? 0}
						userBalanceBN={lpData[LP.BALANCER_sTSLA].data?.userBalanceBN ?? zeroBN}
						stakedAsset={LP.BALANCER_sTSLA}
						icon={Synths.sTSLA}
						allowance={lpData[LP.BALANCER_sTSLA].data?.allowance ?? null}
						tokenRewards={lpData[LP.BALANCER_sTSLA].data?.rewards ?? 0}
						staked={lpData[LP.BALANCER_sTSLA].data?.staked ?? 0}
						stakedBN={lpData[LP.BALANCER_sTSLA].data?.stakedBN ?? zeroBN}
						needsToSettle={lpData[LP.BALANCER_sTSLA].data?.needsToSettle}
					/>
				)} */}
				{[
					Tab.sTLSA_LP,
					Tab.sFB_LP,
					Tab.sAAPL_LP,
					Tab.sAMZN_LP,
					Tab.sNFLX_LP,
					Tab.sGOOG_LP,
					Tab.sMSFT_LP,
					Tab.sCOIN_LP,
				].map(balancerTab)}
				{activeTab === Tab.DHT_LP && (
					<LPTab
						userBalance={lpData[LP.UNISWAP_DHT].data?.userBalance ?? wei(0)}
						stakedAsset={LP.UNISWAP_DHT}
						icon={CryptoCurrency.DHT}
						type={CurrencyIconType.TOKEN}
						allowance={lpData[LP.UNISWAP_DHT].data?.allowance ?? null}
						tokenRewards={lpData[LP.UNISWAP_DHT].data?.rewards ?? wei(0)}
						staked={lpData[LP.UNISWAP_DHT].data?.staked ?? wei(0)}
						needsToSettle={lpData[LP.UNISWAP_DHT].data?.needsToSettle}
						secondTokenRate={lpData[LP.UNISWAP_DHT].data?.price ?? wei(0)}
					/>
				)}
				{activeTab === Tab.iBTC_LP && (
					<LPTab
						userBalance={lpData[Synths.iBTC].data?.userBalance ?? wei(0)}
						stakedAsset={Synths.iBTC}
						allowance={lpData[Synths.iBTC].data?.allowance ?? null}
						tokenRewards={lpData[Synths.iBTC].data?.rewards ?? wei(0)}
						staked={lpData[Synths.iBTC].data?.staked ?? wei(0)}
						needsToSettle={lpData[Synths.iBTC].data?.needsToSettle}
					/>
				)}
				{activeTab === Tab.yearn_SNX_VAULT && (
					<YearnVaultTab
						userBalance={lpData[LP.YEARN_SNX_VAULT].data?.userBalance ?? wei(0)}
						stakedAsset={CryptoCurrency.SNX}
						allowance={lpData[LP.YEARN_SNX_VAULT].data?.allowance ?? null}
						tokenRewards={lpData[LP.YEARN_SNX_VAULT].data?.rewards ?? wei(0)}
						staked={lpData[LP.YEARN_SNX_VAULT].data?.staked ?? wei(0)}
						pricePerShare={
							(lpData[LP.YEARN_SNX_VAULT].data as YearnVaultData)?.pricePerShare ?? wei(0)
						}
					/>
				)}
			</TabContainer>
		</Container>
	);
};

const Container = styled.div`
	background-color: ${(props) => props.theme.colors.navy};
	${media.greaterThan('md')`
		display: grid;
		grid-template-columns: 1fr 2fr;
	`}
`;

const TabContainer = styled.div`
	background-color: ${(props) => props.theme.colors.navy};
	min-height: 380px;
`;

const TitleContainer = styled.p`
	margin-left: 8px;
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.extended};
	text-transform: uppercase;
`;

export default Incentives;
