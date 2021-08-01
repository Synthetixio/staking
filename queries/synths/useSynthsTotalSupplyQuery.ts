import { useQuery, QueryConfig } from 'react-query';
import { Contract } from 'ethers';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import synthetix from 'lib/synthetix';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey, Synths } from 'constants/currency';

import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';

import { toBigNumber, zeroBN } from 'utils/formatters/number';

export type SynthTotalSupply = {
	name: CurrencyKey;
	value: BigNumber;
	skewValue: BigNumber;
	totalSupply: BigNumber;
	poolProportion: BigNumber;
};

export type SynthsTotalSupplyData = {
	supplyData: { [name: string]: SynthTotalSupply };
	totalValue: BigNumber;
};

// Some contracts on L2 do not exist yet, or have missing methods
// In such cases, we can default to returning zero (or some other value).
const handleMissingL2Impl = async (
	contract: Contract,
	methodName: string,
	args: any[],
	isL2: boolean,
	defaultReturn: any = 0
) => {
	try {
		return contract[methodName](...args);
	} catch (e) {
		if (isL2) {
			return defaultReturn;
		}

		throw e;
	}
};

const useSynthsTotalSupplyQuery = (options?: QueryConfig<SynthsTotalSupplyData>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);

	return useQuery<SynthsTotalSupplyData>(
		QUERY_KEYS.Synths.TotalSupply,
		async () => {
			const {
				contracts: {
					SynthUtil,
					ExchangeRates,
					CollateralManagerState,
					EtherWrapper,
					EtherCollateral,
					EtherCollateralsUSD,
				},
				utils,
			} = synthetix.js!;

			const [sETHKey, sBTCKey, sUSDKey] = [Synths.sETH, Synths.sBTC, Synths.sUSD].map(
				utils.formatBytes32String
			);

			const [
				synthTotalSupplies,
				unformattedEthPrice,
				unformattedBtcPrice,
				[unformattedETHBorrows, unformattedETHShorts],
				[unformattedBTCBorrows, unformattedBTCShorts],
				[unformattedSUSDBorrows, unformattedSUSDShorts],

				unformattedWrapprSETH,
				unformattedWrapprSUSD,

				unformattedOldLoansETH,
				unformattedOldLoansSUSD,
			] = await Promise.all([
				SynthUtil.synthsTotalSupplies(),
				ExchangeRates.rateForCurrency(sETHKey),
				ExchangeRates.rateForCurrency(sBTCKey),
				handleMissingL2Impl(CollateralManagerState, 'totalIssuedSynths', [sETHKey], isL2, [0, 0]),
				handleMissingL2Impl(CollateralManagerState, 'totalIssuedSynths', [sBTCKey], isL2, [0, 0]),
				handleMissingL2Impl(CollateralManagerState, 'totalIssuedSynths', [sUSDKey], isL2, [0, 0]),

				handleMissingL2Impl(EtherWrapper, 'sETHIssued', [], isL2),
				handleMissingL2Impl(EtherWrapper, 'sETHIssued', [], isL2),

				EtherCollateral.totalIssuedSynths(),
				EtherCollateralsUSD.totalIssuedSynths(),
			]);

			const [
				ethPrice,
				btcPrice,

				ethBorrows,
				ethShorts,

				btcBorrows,
				btcShorts,

				susdBorrows,
				susdShorts,

				wrapprSETH,
				wrapprSUSD,

				oldLoansETH,
				oldLoansSUSD,
			] = [
				unformattedEthPrice,
				unformattedBtcPrice,

				unformattedETHShorts,
				unformattedETHBorrows,

				unformattedBTCShorts,
				unformattedBTCBorrows,

				unformattedSUSDShorts,
				unformattedSUSDBorrows,

				unformattedWrapprSETH,
				unformattedWrapprSUSD,

				unformattedOldLoansETH,
				unformattedOldLoansSUSD,
			].map((val) => toBigNumber(utils.formatEther(val)));

			let totalValue = toBigNumber(0);

			const supplyData: SynthTotalSupply[] = [];
			for (let i = 0; i < synthTotalSupplies[0].length; i++) {
				let value = toBigNumber(utils.formatEther(synthTotalSupplies[2][i]));
				const name = utils.parseBytes32String(synthTotalSupplies[0][i]);
				let totalSupply = toBigNumber(utils.formatEther(synthTotalSupplies[1][i]));

				switch (name) {
					case Synths.sBTC: {
						const negativeEntries = btcShorts.plus(btcBorrows);

						value = totalSupply.minus(negativeEntries).times(btcPrice);
						break;
					}

					case Synths.sETH: {
						const multiCollateralLoansETH = ethShorts.plus(ethBorrows);
						const negativeEntries = multiCollateralLoansETH.plus(oldLoansETH).plus(wrapprSETH);

						value = totalSupply.minus(negativeEntries).times(ethPrice);
						break;
					}

					case Synths.sUSD: {
						const multiCollateralLoansSUSD = susdShorts.plus(susdBorrows);
						const negativeEntries = multiCollateralLoansSUSD.plus(oldLoansSUSD).plus(wrapprSUSD);

						value = totalSupply.minus(negativeEntries);
						break;
					}

					default:
				}

				const skewValue = value;
				value = value.abs();

				supplyData.push({
					name,
					totalSupply,
					value,
					skewValue,
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
