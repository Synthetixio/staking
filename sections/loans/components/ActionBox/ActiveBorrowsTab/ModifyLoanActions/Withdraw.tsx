import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';

import { Loan } from 'queries/loans/types';
import Notify from 'containers/Notify';
import { tx } from 'utils/transactions';
import Wrapper from './Wrapper';

type WithdrawProps = {
	loanId: number;
	loanTypeIsETH: boolean;
	loan: Loan;
	loanContract: ethers.Contract;
};

const Withdraw: React.FC<WithdrawProps> = ({ loan, loanId, loanTypeIsETH, loanContract }) => {
	const { monitorHash } = Notify.useContainer();

	const [isWorking, setIsWorking] = useState<string>('');
	const [withdrawalAmountString, setWithdrawalAmount] = useState<string>('0');
	const collateralAsset = loanTypeIsETH ? 'ETH' : 'renBTC';
	const collateralDecimals = loanTypeIsETH ? 18 : 8; // todo

	const collateralAmount = useMemo(
		() =>
			ethers.utils.parseUnits(ethers.utils.formatUnits(loan.collateral, 18), collateralDecimals), // normalize collateral decimals
		[loan.collateral, collateralDecimals]
	);
	const withdrawalAmount = useMemo(
		() => ethers.utils.parseUnits(withdrawalAmountString, collateralDecimals),
		[withdrawalAmountString, collateralDecimals]
	);
	const remainingAmount = useMemo(() => collateralAmount.sub(withdrawalAmount), [
		collateralAmount,
		withdrawalAmount,
	]);
	const remainingAmountString = useMemo(
		() => ethers.utils.formatUnits(remainingAmount, collateralDecimals),
		[remainingAmount, collateralDecimals]
	);

	const onSetAAmount = (amount: string) =>
		!amount
			? setWithdrawalAmount('0')
			: ethers.utils.parseUnits(amount, collateralDecimals).gt(collateralAmount)
			? onSetAMaxAmount()
			: setWithdrawalAmount(amount);
	const onSetAMaxAmount = () =>
		setWithdrawalAmount(ethers.utils.formatUnits(collateralAmount, collateralDecimals));

	const getTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!(loanContract && !withdrawalAmount.isZero())) return null;
			return [loanContract, 'withdraw', [loanId, withdrawalAmount, gas]];
		},
		[loanContract, loanId, withdrawalAmount]
	);

	const withdraw = async (gas: Record<string, number>) => {
		try {
			setIsWorking('withdrawing');
			await tx(() => getTxData(gas), {
				showErrorNotification: (e: string) => console.log(e),
				showProgressNotification: (hash: string) =>
					monitorHash({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
			});
		} catch {
		} finally {
			setIsWorking('');
		}
	};

	return (
		<Wrapper
			{...{
				getTxData,

				loan,
				loanTypeIsETH,
				showCRatio: true,

				aLabel: 'loans.modify-loan.withdraw.a-label',
				aAsset: collateralAsset,
				aAmountNumber: withdrawalAmountString,
				onSetAAmount,
				onSetAMaxAmount,

				bLabel: 'loans.modify-loan.withdraw.b-label',
				bAsset: collateralAsset,
				bAmountNumber: remainingAmountString,

				buttonLabel: `loans.modify-loan.withdraw.button-labels.${
					isWorking ? isWorking : 'default'
				}`,
				buttonIsDisabled: !!isWorking,
				onButtonClick: withdraw,
			}}
		/>
	);
};

export default Withdraw;
