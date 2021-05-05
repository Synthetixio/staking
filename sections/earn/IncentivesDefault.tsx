import { FC, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';

import ROUTES from 'constants/routes';
import { CryptoCurrency } from 'constants/currency';
import media from 'styles/media';
import { isWalletConnectedState } from 'store/wallet';
import useSNXLockedValueQuery from 'queries/staking/useSNXLockedValueQuery';
import useFeePeriodTimeAndProgress from 'hooks/useFeePeriodTimeAndProgress';

import IncentivesTable from './IncentivesTable';
import ClaimTab from './ClaimTab';
import { Tab } from './types';
import { DesktopOrTabletView } from 'components/Media';

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
								ticker: CryptoCurrency.SNX,
							},
							rewards: stakingRewards.toNumber(),
							periodStarted: currentFeePeriodStarted.getTime(),
							periodFinish: nextFeePeriodStarts.getTime(),
							claimed: hasClaimed,
							now,
							tab: Tab.Claim,
							route: ROUTES.Earn.Claim,
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
			currentFeePeriodStarted,
			now,
			t,
			isWalletConnected,
		]
	);

	const incentivesTable = (
		<IncentivesTable activeTab={activeTab} data={incentives} isLoaded={true} />
	);

	return activeTab == null ? (
		<>{incentivesTable}</>
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
			</TabContainer>
		</Container>
	);
};

const Container = styled.div`
	background-color: ${(props) => props.theme.colors.navy};
	display: grid;
	${media.greaterThan('mdUp')`
		display: grid;
		grid-template-columns: 1fr 2fr;
	`}
`;

const TabContainer = styled.div`
	background-color: ${(props) => props.theme.colors.navy};
	min-height: 380px;
`;

export default Incentives;
