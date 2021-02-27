import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import { walletAddressState } from 'store/wallet';
import { Loan } from 'queries/loans/types';
import Notify from 'containers/Notify';
import { SYNTH_BY_CURRENCY_KEY } from 'sections/loans/constants';
import { tx } from 'utils/transactions';
import Wrapper from './Wrapper';

type RepayProps = {
	loanId: number;
	loanTypeIsETH: boolean;
	loan: Loan;
	loanContract: ethers.Contract;
};

const Repay: React.FC<RepayProps> = ({ loan, loanId, loanTypeIsETH, loanContract }) => {
	const address = useRecoilValue(walletAddressState);
	const { monitorHash } = Notify.useContainer();

	const [isWorking, setIsWorking] = useState<string>('');
	const [repayAmountString, setRepayAmount] = useState<string>('0');
	const debtAsset = SYNTH_BY_CURRENCY_KEY[loan.currency];
	const debtAssetDecimals = 18;

	const repayAmount = useMemo(() => ethers.utils.parseUnits(repayAmountString, debtAssetDecimals), [
		repayAmountString,
	]);
	const remainingAmount = useMemo(() => loan.amount.sub(repayAmount), [loan.amount, repayAmount]);
	const remainingAmountString = useMemo(
		() => ethers.utils.formatUnits(remainingAmount, debtAssetDecimals),
		[remainingAmount]
	);
	const isRepayingFully = useMemo(() => remainingAmount.isZero(), [remainingAmount]);

	const onSetAAmount = (amount: string) =>
		!amount
			? setRepayAmount('0')
			: ethers.utils.parseUnits(amount, debtAssetDecimals).gt(loan.amount)
			? onSetAMaxAmount()
			: setRepayAmount(amount);
	const onSetAMaxAmount = () => setRepayAmount(ethers.utils.formatUnits(loan.amount));

	const getTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!(loanContract && !repayAmount.isZero())) return null;
			return [loanContract, 'repay', [address, loanId, repayAmount, gas]];
		},
		[loanContract, address, loanId, repayAmount]
	);

	const repay = async (gas: Record<string, number>) => {
		try {
			setIsWorking('repaying');
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

				aLabel: 'loans.modify-loan.repay.a-label',
				aAsset: debtAsset,
				aAmountNumber: repayAmountString,
				onSetAAmount,
				onSetAMaxAmount,

				bLabel: 'loans.modify-loan.repay.b-label',
				bAsset: debtAsset,
				bAmountNumber: remainingAmountString,

				buttonLabel: `loans.modify-loan.repay.button-labels.${
					isWorking ? isWorking : isRepayingFully ? 'repaying-fully-error' : 'default'
				}`,
				buttonIsDisabled: !!isWorking || isRepayingFully,
				onButtonClick: repay,
			}}
		/>
	);
};

export default Repay;
