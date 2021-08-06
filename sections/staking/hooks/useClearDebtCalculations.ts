import use1InchQuoteQuery from 'queries/1inch/use1InchQuoteQuery';
import use1InchSwapQuery, { SwapTxData } from 'queries/1inch/use1InchSwapQuery';
import { ethAddress } from 'constants/1inch';
import Wei, { wei } from '@synthetixio/wei';
import Connector from 'containers/Connector';

type ClearDebtCalculations = {
	needToBuy: boolean;
	debtBalanceWithBuffer: Wei;
	missingSUSDWithBuffer: Wei;
	quoteAmount: Wei;
	swapData: SwapTxData | null;
};

const useClearDebtCalculations = (
	debtBalance: Wei,
	sUSDBalance: Wei,
	walletAddress: string
): ClearDebtCalculations => {
	const { synthetixjs } = Connector.useContainer();

	const needToBuy = debtBalance.sub(sUSDBalance).gt(0);
	const debtBalanceWithBuffer = debtBalance.add(debtBalance.mul(0.0005));
	const missingSUSDWithBuffer = debtBalanceWithBuffer.sub(sUSDBalance);

	const sUSDAddress = synthetixjs!.contracts!.SynthsUSD.address;

	const quoteQuery = use1InchQuoteQuery(sUSDAddress, ethAddress, missingSUSDWithBuffer);
	const quoteData = quoteQuery.isSuccess && quoteQuery.data != null ? quoteQuery.data : null;
	const quoteAmount = wei(quoteData?.toTokenAmount ?? 0);

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
