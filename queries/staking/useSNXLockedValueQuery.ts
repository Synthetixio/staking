import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';

import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

import { networkState } from 'store/wallet';
import synthetix from 'lib/synthetix';

const useSNXLockedValueQuery = (options?: QueryConfig<number>) => {
	const network = useRecoilValue(networkState);

	return useQuery<number>(
		QUERY_KEYS.Staking.SNXLockedValue(network?.id!),
		async () => {
			const [
				unformattedSnxPrice,
				unformattedSnxTotalSupply,
				unformattedLastDebtLedgerEntry,
				unformattedTotalIssuedSynths,
				unformattedIssuanceRatio,
				holders,
			] = await Promise.all([
				synthetix.js?.contracts.ExchangeRates.rateForCurrency(synthetix.js?.toBytes32('SNX')),
				synthetix.js?.contracts.Synthetix.totalSupply(),
				synthetix.js?.contracts.SynthetixState.lastDebtLedgerEntry(),
				synthetix.js?.contracts.Synthetix.totalIssuedSynthsExcludeEtherCollateral(
					synthetix.js?.toBytes32('sUSD')
				),
				synthetix.js?.contracts.SynthetixState.issuanceRatio(),
				snxData.snx.holders({ max: 1000 }),
			]);

			const lastDebtLedgerEntry = Number(
				synthetix.js?.utils.formatUnits(unformattedLastDebtLedgerEntry, 27)
			);

			const [totalIssuedSynths, issuanceRatio, usdToSnxPrice] = [
				unformattedTotalIssuedSynths,
				unformattedIssuanceRatio,
				unformattedSnxPrice,
			].map((val) => Number(synthetix.js?.utils.formatEther(val)));

			let snxTotal = 0;
			let snxLocked = 0;

			for (const { collateral, debtEntryAtIndex, initialDebtOwnership } of holders) {
				let debtBalance =
					((totalIssuedSynths * lastDebtLedgerEntry) / debtEntryAtIndex) * initialDebtOwnership;
				let collateralRatio = debtBalance / collateral / usdToSnxPrice;

				if (isNaN(debtBalance)) {
					debtBalance = 0;
					collateralRatio = 0;
				}
				const lockedSnx = collateral * Math.min(1, collateralRatio / issuanceRatio);

				snxTotal += Number(collateral);
				snxLocked += Number(lockedSnx);
			}

			const percentLocked = snxLocked / snxTotal;
			const totalSupply = Number(synthetix.js?.utils.formatEther(unformattedSnxTotalSupply));

			return totalSupply * percentLocked * usdToSnxPrice;
		},
		{
			enabled: snxData && synthetix.js,
			...options,
		}
	);
};

export default useSNXLockedValueQuery;
