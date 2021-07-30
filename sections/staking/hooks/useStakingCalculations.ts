import { useMemo } from 'react';

import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';

const useStakingCalculations = () => {
	const walletAddress = useRecoilValue(walletAddressState);
	const {
		useExchangeRatesQuery,
		useGetDebtDataQuery,
		useEscrowDataQuery,
		useTokenSaleEscrowQuery,
	} = useSynthetixQueries();

	const exchangeRatesQuery = useExchangeRatesQuery();
	const debtDataQuery = useGetDebtDataQuery(walletAddress);
	const rewardEscrowQuery = useEscrowDataQuery(walletAddress);
	const tokenSaleEscrowQuery = useTokenSaleEscrowQuery(walletAddress);

	const debtData = debtDataQuery?.data ?? null;
	const exchangeRates = exchangeRatesQuery.data ?? null;
	const rewardEscrowBalance = rewardEscrowQuery.data ?? null;
	const tokenSaleEscrowBalance = tokenSaleEscrowQuery.data ?? null;

	const results = useMemo(() => {
		const SNXRate = wei(exchangeRates?.SNX ?? 0);
		const collateral = wei(debtData?.collateral ?? 0);
		const targetCRatio = wei(debtData?.targetCRatio ?? 0);
		const targetThreshold = wei(debtData?.targetCRatio ?? 0);
		const currentCRatio = wei(debtData?.currentCRatio ?? 0);
		const transferableCollateral = wei(debtData?.transferable ?? 0);
		const debtBalance = wei(debtData?.debtBalance ?? 0);
		const stakingEscrow = wei(rewardEscrowBalance?.totalEscrowed ?? 0);
		const tokenSaleEscrow = wei(tokenSaleEscrowBalance?.totalEscrowed ?? 0);
		const issuableSynths = wei(debtData?.issuableSynths ?? 0);
		const balance = wei(debtData?.balance ?? 0);

		const stakedCollateral = collateral.mul(
			Math.min(1, currentCRatio.div(targetCRatio).toNumber())
		);
		const stakedCollateralValue = stakedCollateral.mul(SNXRate);
		const lockedCollateral = collateral.sub(transferableCollateral);
		const unstakedCollateral = collateral.sub(stakedCollateral);
		const totalEscrowBalance = stakingEscrow.add(tokenSaleEscrow);

		const debtEscrowBalance = Wei.max(
			debtBalance.add(totalEscrowBalance.mul(SNXRate).mul(targetCRatio)).sub(issuableSynths),
			wei(0)
		);

		const percentageCurrentCRatio = currentCRatio.eq(0) ? wei(0) : wei(1).div(currentCRatio);
		const percentageTargetCRatio = targetCRatio.eq(0) ? wei(0) : wei(1).div(targetCRatio);
		const percentCurrentCRatioOfTarget = percentageCurrentCRatio.div(percentageTargetCRatio);

		return {
			collateral,
			targetCRatio,
			targetThreshold,
			percentageTargetCRatio,
			currentCRatio,
			percentageCurrentCRatio,
			transferableCollateral,
			debtBalance,
			stakedCollateral,
			stakedCollateralValue,
			lockedCollateral,
			unstakedCollateral,
			SNXRate,
			totalEscrowBalance,
			issuableSynths,
			percentCurrentCRatioOfTarget,
			stakingEscrow,
			debtEscrowBalance,
			balance,
		};
	}, [debtData, exchangeRates, rewardEscrowBalance, tokenSaleEscrowBalance]);

	return results;
};

export default useStakingCalculations;
