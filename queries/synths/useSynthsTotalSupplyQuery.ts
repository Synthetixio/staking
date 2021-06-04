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
				contracts: { SynthUtil, ExchangeRates, CollateralManager, EtherWrapper },
				utils,
			} = synthetix.js!;

			const [
				synthTotalSupplies,
				unformattedEthShorts,
				unformattedBtcShorts,
				unformattedBtcPrice,
				unformattedEthPrice,
				unformattedIssuedWETHWrapperSETH,
			] = await Promise.all([
				SynthUtil.synthsTotalSupplies(),
				CollateralManager.short(utils.formatBytes32String(Synths.sETH)),
				CollateralManager.short(utils.formatBytes32String(Synths.sBTC)),
				ExchangeRates.rateForCurrency(utils.formatBytes32String(Synths.sBTC)),
				ExchangeRates.rateForCurrency(utils.formatBytes32String(Synths.sETH)),
				EtherWrapper.sETHIssued(),
			]);

			const [ethShorts, btcShorts, btcPrice, ethPrice, issuedWETHWrapperSETH] = [
				unformattedEthShorts,
				unformattedBtcShorts,
				unformattedBtcPrice,
				unformattedEthPrice,
				unformattedIssuedWETHWrapperSETH,
			].map((val) => toBigNumber(utils.formatEther(val)));

			let totalValue = toBigNumber(0);

			const supplyData: SynthTotalSupply[] = [];
			for (let i = 0; i < synthTotalSupplies[0].length; i++) {
				let value = toBigNumber(utils.formatEther(synthTotalSupplies[2][i]));
				const name = utils.parseBytes32String(synthTotalSupplies[0][i]);
				let totalSupply = toBigNumber(utils.formatEther(synthTotalSupplies[1][i]));

				switch (name) {
					case Synths.iETH:
						value = value.plus(ethShorts.times(ethPrice));
						break;

					case Synths.iBTC:
						value = value.plus(btcShorts.times(btcPrice));
						break;

					case Synths.sETH:
						// we deduct sETH amount issued by EthWrappr
						// because it's not really part of the debt pool
						// https://contracts.synthetix.io/EtherWrapper
						totalSupply = totalSupply.minus(issuedWETHWrapperSETH);
						value = totalSupply.times(ethPrice);
						break;

					default:
				}

				supplyData.push({
					name,
					totalSupply,
					value,
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
