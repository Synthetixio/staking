import synthetix from 'lib/synthetix';
import { NumericValue, toBigNumber, zeroBN } from 'utils/formatters/number';
import use1InchQuoteQuery from 'queries/1inch/use1InchQuoteQuery';
import use1InchSwapQuery, { SwapTxData } from 'queries/1inch/use1InchSwapQuery';
import { ethAddress } from 'constants/1inch';
import { BigNumber } from 'bignumber.js';

type ClearDebtCalculations = {
	needToBuy: boolean;
	debtBalanceWithBuffer: NumericValue;
	missingSUSDWithBuffer: NumericValue;
	quoteAmount: NumericValue;
	swapData: SwapTxData | null;
};

const useClearDebtCalculations = (
	debtBalance: BigNumber,
	sUSDBalance: BigNumber,
	walletAddress: string
): ClearDebtCalculations => {
	const needToBuy = debtBalance.minus(sUSDBalance).isPositive();
	const debtBalanceWithBuffer: NumericValue = toBigNumber(
		debtBalance.plus(debtBalance.multipliedBy(0.0005)).toFixed(18)
	);
	const missingSUSDWithBuffer: NumericValue = toBigNumber(
		debtBalanceWithBuffer.minus(sUSDBalance).toFixed(18)
	);

	const sUSDAddress = synthetix.tokensMap!.sUSD.address;

	const quoteQuery = use1InchQuoteQuery(sUSDAddress, ethAddress, missingSUSDWithBuffer);
	const quoteData = quoteQuery.isSuccess && quoteQuery.data != null ? quoteQuery.data : null;
	const quoteAmount = quoteData?.toTokenAmount ?? zeroBN;

	const swapQuery = use1InchSwapQuery(ethAddress, sUSDAddress, quoteAmount, walletAddress!, 50);
	const swapData = swapQuery.isSuccess && swapQuery.data != null ? swapQuery.data : null;

	return {
		needToBuy,
		debtBalanceWithBuffer,
		missingSUSDWithBuffer,
		quoteAmount,
		swapData,
	};
};

export default useClearDebtCalculations;
