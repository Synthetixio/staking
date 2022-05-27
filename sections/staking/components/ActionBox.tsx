import React, { useMemo, FC, useEffect } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import StructuredTab from 'components/StructuredTab';

import BurnTab from './BurnTab';
import MintTab from './MintTab';
import Burn from 'assets/svg/app/burn.svg';
import Mint from 'assets/svg/app/mint.svg';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { burnTypeState, StakingPanelType, mintTypeState } from 'store/staking';
import SelfLiquidateTab from './SelfLiquidateTab';
import useStakingCalculations from '../hooks/useStakingCalculations';
import { notNill } from 'utils/ts-helpers';
import ROUTES from 'constants/routes';
import useSynthetixQueries from '@synthetixio/queries';
import { delegateWalletState, walletAddressState } from 'store/wallet';
import Wei, { wei } from '@synthetixio/wei';
import { Synths } from 'constants/currency';

type ActionBoxProps = {
	currentTab: string;
};

const ActionBox: FC<ActionBoxProps> = ({ currentTab }) => {
	const { t } = useTranslation();
	const router = useRouter();
	const onMintTypeChange = useSetRecoilState(mintTypeState);
	const onBurnTypeChange = useSetRecoilState(burnTypeState);
	const walletAddress = useRecoilValue(walletAddressState);
	const delegateWallet = useRecoilValue(delegateWalletState);
	const { useSynthsBalancesQuery } = useSynthetixQueries();

	const {
		percentageCurrentCRatio,
		percentageTargetCRatio,
		isLoading,
		debtBalance,
		issuableSynths,
	} = useStakingCalculations();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress, { staleTime: 5000 });
	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? wei(0);
	const burnAmountToFixCRatio = wei(Wei.max(debtBalance.sub(issuableSynths), wei(0)));

	useEffect(() => {
		if (currentTab === StakingPanelType.MINT) {
			onBurnTypeChange(null);
		} else {
			onMintTypeChange(null);
		}
	}, [currentTab, onBurnTypeChange, onMintTypeChange]);

	const showSelfLiquidationTab =
		percentageCurrentCRatio.gt(0) &&
		percentageCurrentCRatio.lt(percentageTargetCRatio) &&
		sUSDBalance.lt(burnAmountToFixCRatio) &&
		delegateWallet?.address === undefined;

	useEffect(() => {
		if (isLoading) return;

		const isOnSelLiquidateTab = router.query?.action?.[0] === StakingPanelType.SELF_LIQUIDATE;
		if (isOnSelLiquidateTab && !showSelfLiquidationTab) {
			// If user is on the self liquidate tab and isn't staking, navigate back staking home tab
			router.replace(ROUTES.Staking.Home);
		}
	});
	const tabData = useMemo(
		() =>
			[
				{
					title: t('staking.actions.mint.title'),
					icon: <Svg src={Mint} />,
					tabChildren: <MintTab />,
					blue: true,
					key: StakingPanelType.MINT,
				},
				{
					title: t('staking.actions.burn.title'),
					icon: <Svg src={Burn} />,
					tabChildren: <BurnTab />,
					blue: false,
					key: StakingPanelType.BURN,
				},
				showSelfLiquidationTab
					? {
							title: 'Self Liquidate',
							icon: <Svg src={Burn} />,
							tabChildren: <SelfLiquidateTab />,
							blue: false,
							key: StakingPanelType.SELF_LIQUIDATE,
					  }
					: undefined,
			].filter(notNill),
		[showSelfLiquidationTab, t]
	);

	return (
		<StructuredTab
			boxPadding={20}
			boxHeight={450}
			tabData={tabData}
			setPanelType={(key) => router.push(`/staking/${key}`)}
			currentPanel={currentTab}
		/>
	);
};

export default ActionBox;
