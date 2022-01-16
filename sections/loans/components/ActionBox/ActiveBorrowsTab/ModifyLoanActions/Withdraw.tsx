import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { Loan } from 'containers/Loans/types';
import TransactionNotifier from 'containers/TransactionNotifier';
import { tx } from 'utils/transactions';
import Loans from 'containers/Loans';
import Wrapper from './Wrapper';

type WithdrawProps = {
	loanId: number;
	loanTypeIsETH: boolean;
	loan: Loan;
	loanContract: ethers.Contract;
};

const Withdraw: React.FC<WithdrawProps> = ({ loan, loanId, loanTypeIsETH, loanContract }) => {
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { reloadPendingWithdrawals } = Loans.useContainer();

	const [isWorking, setIsWorking] = useState<string>('');
	const [withdrawalAmountString, setWithdrawalAmount] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const collateralAsset = loanTypeIsETH ? 'ETH' : 'renBTC';
	const collateralDecimals = loanTypeIsETH ? 18 : 8; // todo

	const collateralAmount = useMemo(
		() =>
			ethers.utils.parseUnits(ethers.utils.formatUnits(loan.collateral, 18), collateralDecimals), // normalize collateral decimals
		[loan.collateral, collateralDecimals]
	);
	const withdrawalAmount = useMemo(
		() =>
			withdrawalAmountString
				? ethers.utils.parseUnits(withdrawalAmountString, collateralDecimals)
				: ethers.BigNumber.from(0),
		[withdrawalAmountString, collateralDecimals]
	);
	const remainingAmount = useMemo(
		() => collateralAmount.sub(withdrawalAmount),
		[collateralAmount, withdrawalAmount]
	);
	const remainingAmountString = useMemo(
		() => ethers.utils.formatUnits(remainingAmount, collateralDecimals),
		[remainingAmount, collateralDecimals]
	);

	const onSetLeftColAmount = (amount: string) =>
		!amount
			? setWithdrawalAmount(null)
			: ethers.utils.parseUnits(amount, collateralDecimals).gt(collateralAmount)
			? onSetLeftColMaxAmount()
			: setWithdrawalAmount(amount);
	const onSetLeftColMaxAmount = () =>
		setWithdrawalAmount(ethers.utils.formatUnits(collateralAmount, collateralDecimals));

	const getTxData = useCallback(() => {
		if (!(loanContract && !withdrawalAmount.eq(0))) return null;
		return [loanContract, 'withdraw', [loanId, withdrawalAmount]];
	}, [loanContract, loanId, withdrawalAmount]);

	const withdraw = async () => {
		try {
			setIsWorking('withdrawing');
			setTxModalOpen(true);
			await tx(() => getTxData(), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) =>
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
			});
			await reloadPendingWithdrawals();
		} catch {
		} finally {
			setIsWorking('');
			setTxModalOpen(false);
		}
	};

	return (
		<Wrapper
			{...{
				getTxData,

				loan,
				loanTypeIsETH,
				showCRatio: true,

				leftColLabel: 'loans.modify-loan.withdraw.left-col-label',
				leftColAssetName: collateralAsset,
				leftColAmount: withdrawalAmountString,
				onSetLeftColAmount,
				onSetLeftColMaxAmount,

				rightColLabel: 'loans.modify-loan.withdraw.right-col-label',
				rightColAssetName: collateralAsset,
				rightColAmount: remainingAmountString,

				buttonLabel: `loans.modify-loan.withdraw.button-labels.${
					isWorking ? isWorking : 'default'
				}`,
				buttonIsDisabled: !!isWorking,
				onButtonClick: withdraw,

				error,
				setError,

				txModalOpen,
				setTxModalOpen,
			}}
		/>
	);
};

export default Withdraw;
