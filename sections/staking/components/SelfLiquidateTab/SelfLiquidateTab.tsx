import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { Synths } from 'constants/currency';
import useGetSnxAmountToBeLiquidatedUsd from 'hooks/useGetSnxAmountToBeLiquidatedUsd';
import { useRecoilValue } from 'recoil';
import { TabContainer } from 'sections/staking/components/common';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { delegateWalletState, walletAddressState } from 'store/wallet';
import { useTranslation } from 'react-i18next';
import SelfLiquidationTabContent from './SelfLiquidationTabContent';

const SelfLiquidateTab = () => {
	const walletAddress = useRecoilValue(walletAddressState);
	const { t } = useTranslation();
	const {
		debtBalance,
		issuableSynths,
		percentageCurrentCRatio,
		percentageTargetCRatio,
		SNXRate,
		collateral,
	} = useStakingCalculations();
	const { useSynthsBalancesQuery, useGetLiquidationDataQuery } = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? wei(0);
	const liquidationDataQuery = useGetLiquidationDataQuery(walletAddress);
	const delegateWallet = useRecoilValue(delegateWalletState);

	const isDelegateWallet = Boolean(delegateWallet?.address);
	const canSelfLiquidate =
		percentageCurrentCRatio.gt(0) &&
		percentageCurrentCRatio.lt(percentageTargetCRatio) &&
		!isDelegateWallet;
	const liquidationAmountsToFixCollateralQuery = useGetSnxAmountToBeLiquidatedUsd(
		debtBalance,
		collateral.mul(SNXRate),
		liquidationDataQuery.data?.selfLiquidationPenalty,
		liquidationDataQuery.data?.liquidationPenalty,
		canSelfLiquidate
	);

	const burnAmountToFixCRatio = wei(Wei.max(debtBalance.sub(issuableSynths), wei(0)));
	const liquidationAmountsData = liquidationAmountsToFixCollateralQuery.data;
	if (!liquidationDataQuery.data || !liquidationAmountsData || synthsBalancesQuery.isLoading) {
		return null;
	}

	return (
		<TabContainer>
			<SelfLiquidationTabContent
				percentageCurrentCRatio={percentageCurrentCRatio}
				percentageTargetCRatio={percentageTargetCRatio}
				burnAmountToFixCRatio={burnAmountToFixCRatio}
				sUSDBalance={sUSDBalance}
				selfLiquidationPenalty={liquidationDataQuery.data.selfLiquidationPenalty}
				liquidationPenalty={liquidationDataQuery.data.liquidationPenalty}
				walletAddress={walletAddress}
				isDelegateWallet={isDelegateWallet}
				SNXRate={SNXRate}
				amountToSelfLiquidateUsd={
					liquidationAmountsToFixCollateralQuery.data?.amountToSelfLiquidateUsd
				}
			/>
		</TabContainer>
	);
};
export default SelfLiquidateTab;
