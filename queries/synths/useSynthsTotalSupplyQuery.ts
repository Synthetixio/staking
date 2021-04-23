import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey, Synths } from 'constants/currency';

import { appReadyState } from 'store/app';

import { toBigNumber, zeroBN } from 'utils/formatters/number';

export type SynthTotalSupply = {
	name: CurrencyKey;
	value: BigNumber;
	totalSupply: BigNumber;
	poolProportion: BigNumber;
};

export type SynthsTotalSupplyData = {
	supplyData: { [name: string]: SynthTotalSupply };
	totalValue: BigNumber;
};

const useSynthsTotalSupplyQuery = (options?: QueryConfig<SynthsTotalSupplyData>) => {
	const isAppReady = useRecoilValue(appReadyState);

	return useQuery<SynthsTotalSupplyData>(
		QUERY_KEYS.Synths.TotalSupply,
		async () => {
			const {
				contracts: { SynthUtil, ExchangeRates, CollateralManager },
				utils,
			} = synthetix.js!;

			const [
				synthTotalSupplies,
				unformattedEthShorts,
				unformattedBtcShorts,
				unformattedBtcPrice,
				unformattedEthPrice,
			] = await Promise.all([
				SynthUtil.synthsTotalSupplies(),
				CollateralManager.short(utils.formatBytes32String(Synths.sETH)),
				CollateralManager.short(utils.formatBytes32String(Synths.sBTC)),
				ExchangeRates.rateForCurrency(utils.formatBytes32String(Synths.sBTC)),
				ExchangeRates.rateForCurrency(utils.formatBytes32String(Synths.sETH)),
			]);

			const [ethShorts, btcShorts, btcPrice, ethPrice] = [
				unformattedEthShorts,
				unformattedBtcShorts,
				unformattedBtcPrice,
				unformattedEthPrice,
			].map((val) => toBigNumber(utils.formatEther(val)));

			let totalValue = toBigNumber(0);

			const supplyData: SynthTotalSupply[] = [];
			for (let i = 0; i < synthTotalSupplies[0].length; i++) {
				const value = toBigNumber(utils.formatEther(synthTotalSupplies[2][i]));
				const name = utils.parseBytes32String(synthTotalSupplies[0][i]);
				const totalSupply = toBigNumber(utils.formatEther(synthTotalSupplies[1][i]));

				let combinedWithShortsValue = value;
				if (name === Synths.iETH) {
					combinedWithShortsValue = combinedWithShortsValue.plus(ethShorts.times(ethPrice));
				} else if (name === Synths.iBTC) {
					combinedWithShortsValue = combinedWithShortsValue.plus(btcShorts.times(btcPrice));
				}
				supplyData.push({
					name,
					totalSupply,
					value: combinedWithShortsValue,
					poolProportion: zeroBN, // true value to be computed in next step
				});
				totalValue = totalValue.plus(value);
			}

			// Add proportion data to each SynthTotalSupply object
			const supplyDataWithProportions = supplyData.map((datum) => ({
				...datum,
				poolProportion: totalValue.isGreaterThan(0) ? datum.value.dividedBy(totalValue) : zeroBN,
			}));

			const supplyDataMap: { [name: string]: SynthTotalSupply } = {};
			for (const synthSupply of supplyDataWithProportions) {
				supplyDataMap[synthSupply.name] = synthSupply;
			}

			return {
				totalValue,
				supplyData: supplyDataMap,
			};
		},
		{
			enabled: isAppReady,
			...options,
		}
	);
};

export default useSynthsTotalSupplyQuery;
