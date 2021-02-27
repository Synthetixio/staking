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

	const onSetAAmount = (amount: string) =>
		!amount
			? setRepayAmount('0')
			: ethers.utils.parseUnits(amount, debtAssetDecimals).gt(loan.amount)
			? onSetAMaxAmount()
			: setRepayAmount(amount);
	const onSetAMaxAmount = () => setRepayAmount(ethers.utils.formatUnits(loan.amount));

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

				aLabel: 'loans.modify-loan.draw.a-label',
				aAsset: debtAsset,
				aAmountNumber: drawAmountString,
				onSetAAmount,
				onSetAMaxAmount,

				bLabel: 'loans.modify-loan.draw.b-label',
				bAsset: debtAsset,
				bAmountNumber: newTotalAmountString,

				buttonLabel: `loans.modify-loan.draw.button-labels.${isWorking ? isWorking : 'default'}`,
				buttonIsDisabled: !!isWorking,
				onButtonClick: draw,
			}}
		/>
	);
};

export default Repay;
