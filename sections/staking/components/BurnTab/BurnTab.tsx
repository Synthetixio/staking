import { FC, useMemo, useEffect } from 'react';
import Wei, { wei } from '@synthetixio/wei';
import { CryptoCurrency, Synths } from 'constants/currency';
import UIContainer from 'containers/UI';

import { formatCurrency } from 'utils/formatters/number';
import { BurnActionType } from 'store/staking';
import useBurnTx from 'sections/staking/hooks/useBurnTx';
import BurnTiles from 'sections/staking/components/BurnTiles';
import StakingInput from 'sections/staking/components/StakingInput';
import { TabContainer } from 'sections/staking/components/common';

const BurnTab: FC = () => {
	const {
		debtBalance,
		sUSDBalance,
		issuableSynths,
		onBurnChange,
		txn,
		burnType,
		needToBuy,
		amountToBurn,
		onBurnTypeChange,
		debtBalanceWithBuffer,
		swapTxn,
		quoteAmount,
		missingSUSDWithBuffer,
		percentageTargetCRatio,
		error,
		txModalOpen,
		setTxModalOpen,
		setGasPrice,
	} = useBurnTx();

	const { setTitle } = UIContainer.useContainer();

	// header title
	useEffect(() => {
		setTitle('staking', 'burn');
	}, [setTitle]);

	const returnPanel = useMemo(() => {
		let handleSubmit;
		let inputValue: string = '0';
		let isLocked;
		let etherNeededToBuy;
		let sUSDNeededToBuy;
		let sUSDNeededToBurn;

		/* If a user has more sUSD than the debt balance, the max burn amount is their debt balance, else it is just the balance they have */
		const maxBurnAmount = debtBalance.gt(sUSDBalance) ? wei(sUSDBalance) : debtBalance;

		const burnAmountToFixCRatio = wei(Math.max(debtBalance.sub(issuableSynths).toNumber(), 0));

		switch (burnType) {
			case BurnActionType.MAX:
				onBurnChange(maxBurnAmount.toString());
				handleSubmit = () => {
					txn.mutate();
				};
				inputValue = maxBurnAmount.toString();
				isLocked = true;
				break;
			case BurnActionType.TARGET:
				const calculatedTargetBurn = Wei.max(debtBalance.sub(issuableSynths), wei(0));
				onBurnChange(calculatedTargetBurn.toString());
				handleSubmit = () => {
					txn.mutate();
				};
				inputValue = calculatedTargetBurn.toString();
				isLocked = true;
				break;
			case BurnActionType.CUSTOM:
				handleSubmit = () => txn.mutate();
				inputValue = amountToBurn;
				isLocked = false;
				break;
			case BurnActionType.CLEAR:
				if (!needToBuy) {
					onBurnTypeChange(BurnActionType.MAX);
					handleSubmit = () => {
						txn.mutate();
					};
					inputValue = maxBurnAmount.toString();
					isLocked = true;
					break;
				}
				onBurnChange(debtBalanceWithBuffer.toString());
				handleSubmit = () => swapTxn.mutate();
				inputValue = debtBalanceWithBuffer.toString();
				isLocked = true;
				if (quoteAmount) {
					etherNeededToBuy = formatCurrency(CryptoCurrency.ETH, quoteAmount, {
						currencyKey: CryptoCurrency.ETH,
					});
				}
				sUSDNeededToBuy = formatCurrency(Synths.sUSD, missingSUSDWithBuffer);
				sUSDNeededToBurn = formatCurrency(Synths.sUSD, debtBalanceWithBuffer);
				break;
			default:
				return (
					<BurnTiles
						percentageTargetCRatio={percentageTargetCRatio}
						burnAmountToFixCRatio={burnAmountToFixCRatio}
					/>
				);
		}
		return (
			<StakingInput
				onSubmit={handleSubmit}
				inputValue={inputValue}
				isLocked={isLocked}
				isMint={false}
				onBack={onBurnTypeChange}
				error={error || swapTxn.errorMessage || txn.errorMessage}
				txModalOpen={txModalOpen}
				setTxModalOpen={setTxModalOpen}
				gasLimitEstimate={txn.gasLimit}
				setGasPrice={setGasPrice}
				onInputChange={onBurnChange}
				txHash={txn.hash}
				transactionState={txn.txnStatus}
				resetTransaction={txn.refresh}
				maxBurnAmount={maxBurnAmount}
				burnAmountToFixCRatio={burnAmountToFixCRatio}
				etherNeededToBuy={etherNeededToBuy}
				sUSDNeededToBuy={sUSDNeededToBuy}
				sUSDNeededToBurn={sUSDNeededToBurn}
			/>
		);
	}, [
		burnType,
		txModalOpen,
		amountToBurn,
		debtBalance,
		issuableSynths,
		onBurnChange,
		onBurnTypeChange,
		percentageTargetCRatio,
		sUSDBalance,
		debtBalanceWithBuffer,
		missingSUSDWithBuffer,
		needToBuy,
		quoteAmount,
		error,
		txn,
		swapTxn,
		setGasPrice,
		setTxModalOpen,
	]);

	return <TabContainer>{returnPanel}</TabContainer>;
};

export default BurnTab;
