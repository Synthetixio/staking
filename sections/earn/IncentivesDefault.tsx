import { FC, useMemo } from 'react';
import Wei, { wei } from '@synthetixio/wei';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';

import ROUTES from 'constants/routes';
import { CryptoCurrency } from 'constants/currency';
import media from 'styles/media';
import { isWalletConnectedState } from 'store/wallet';
import useFeePeriodTimeAndProgress from 'hooks/useFeePeriodTimeAndProgress';

import IncentivesTable from './IncentivesTable';
import ClaimTab from './ClaimTab';
import { Tab } from './types';
import { DesktopOrTabletView } from 'components/Media';
import useSynthetixQueries from '@synthetixio/queries';
import Connector from 'containers/Connector';

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
	const { L1DefaultProvider } = Connector.useContainer();
	const { useSNXData } = useSynthetixQueries();

	const lockedSnxQuery = useSNXData(L1DefaultProvider);

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
							tvl: lockedSnxQuery.data?.lockedValue ?? wei(0),
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
				  ]
				: [],
		[
			stakingAPR,
			stakedAmount,
			lockedSnxQuery.data?.lockedValue,
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
	${media.greaterThan('md')`
		display: grid;
		grid-template-columns: 1fr 2fr;
	`}
`;

const TabContainer = styled.div`
	background-color: ${(props) => props.theme.colors.navy};
	min-height: 380px;
`;

export default Incentives;
