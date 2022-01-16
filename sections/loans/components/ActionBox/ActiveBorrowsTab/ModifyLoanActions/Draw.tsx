import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { Loan } from 'containers/Loans/types';
import TransactionNotifier from 'containers/TransactionNotifier';
import { tx } from 'utils/transactions';
import Wrapper from './Wrapper';

type RepayProps = {
	loanId: number;
	loanTypeIsETH: boolean;
	loan: Loan;
	loanContract: ethers.Contract;
};

const Repay: React.FC<RepayProps> = ({ loan, loanId, loanTypeIsETH, loanContract }) => {
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const [isWorking, setIsWorking] = useState<string>('');
	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [drawAmountString, setRepayAmount] = useState<string | null>(null);

	const debtAsset = loan.currency;
	const debtAssetDecimals = 18;

	const drawAmount = useMemo(
		() =>
			drawAmountString
				? ethers.utils.parseUnits(drawAmountString, debtAssetDecimals)
				: ethers.BigNumber.from(0),
		[drawAmountString]
	);
	const newTotalAmount = useMemo(() => loan.amount.add(drawAmount), [loan.amount, drawAmount]);
	const newTotalAmountString = useMemo(
		() => ethers.utils.formatUnits(newTotalAmount, debtAssetDecimals),
		[newTotalAmount]
	);

	const onSetLeftColAmount = (amount: string) =>
		!amount
			? setRepayAmount(null)
			: ethers.utils.parseUnits(amount, debtAssetDecimals).gt(loan.amount)
			? onSetLeftColMaxAmount()
			: setRepayAmount(amount);
	const onSetLeftColMaxAmount = () => setRepayAmount(ethers.utils.formatUnits(loan.amount));

	const getTxData = useCallback(() => {
		if (!(loanContract && !drawAmount.eq(0))) return null;

		return [loanContract, 'draw', [loanId, drawAmount]];
	}, [loanContract, loanId, drawAmount]);

	const draw = async () => {
		try {
			setIsWorking('drawing');
			setTxModalOpen(true);
			await tx(() => getTxData(), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) =>
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
			});
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

				leftColLabel: 'loans.modify-loan.draw.left-col-label',
				leftColAssetName: debtAsset,
				leftColAmount: drawAmountString,
				onSetLeftColAmount,
				onSetLeftColMaxAmount,

				rightColLabel: 'loans.modify-loan.draw.right-col-label',
				rightColAssetName: debtAsset,
				rightColAmount: newTotalAmountString,

				buttonLabel: `loans.modify-loan.draw.button-labels.${isWorking ? isWorking : 'default'}`,
				buttonIsDisabled: !!isWorking,
				onButtonClick: draw,

				error,
				setError,

				txModalOpen,
				setTxModalOpen,
			}}
		/>
	);
};

export default Repay;
