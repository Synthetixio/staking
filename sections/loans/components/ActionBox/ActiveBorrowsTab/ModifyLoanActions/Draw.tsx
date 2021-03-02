import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';

import { Loan } from 'queries/loans/types';
import Notify from 'containers/Notify';
import { tx } from 'utils/transactions';
import { SYNTH_BY_CURRENCY_KEY } from 'sections/loans/constants';
import Wrapper from './Wrapper';

type RepayProps = {
	loanId: number;
	loanTypeIsETH: boolean;
	loan: Loan;
	loanContract: ethers.Contract;
};

const Repay: React.FC<RepayProps> = ({ loan, loanId, loanTypeIsETH, loanContract }) => {
	const { monitorHash } = Notify.useContainer();

	const [isWorking, setIsWorking] = useState<string>('');
	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [drawAmountString, setRepayAmount] = useState<string>('0');

	const debtAsset = SYNTH_BY_CURRENCY_KEY[loan.currency];
	const debtAssetDecimals = 18;

	const drawAmount = useMemo(() => ethers.utils.parseUnits(drawAmountString, debtAssetDecimals), [
		drawAmountString,
	]);
	const newTotalAmount = useMemo(() => loan.amount.add(drawAmount), [loan.amount, drawAmount]);
	const newTotalAmountString = useMemo(
		() => ethers.utils.formatUnits(newTotalAmount, debtAssetDecimals),
		[newTotalAmount]
	);

	const onSetLeftColAmount = (amount: string) =>
		!amount
			? setRepayAmount('0')
			: ethers.utils.parseUnits(amount, debtAssetDecimals).gt(loan.amount)
			? onSetLeftColMaxAmount()
			: setRepayAmount(amount);
	const onSetLeftColMaxAmount = () => setRepayAmount(ethers.utils.formatUnits(loan.amount));

	const getTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!(loanContract && !drawAmount.isZero())) return null;

			return [loanContract, 'draw', [loanId, drawAmount, gas]];
		},
		[loanContract, loanId, drawAmount]
	);

	const draw = async (gas: Record<string, number>) => {
		try {
			setIsWorking('drawing');
			setTxModalOpen(true);
			await tx(() => getTxData(gas), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) =>
					monitorHash({
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
