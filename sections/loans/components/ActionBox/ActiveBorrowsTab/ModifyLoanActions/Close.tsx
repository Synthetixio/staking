import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';

import { Loan } from 'queries/loans/types';
import TransactionNotifier from 'containers/TransactionNotifier';
import { SYNTH_BY_CURRENCY_KEY } from 'sections/loans/constants';
import { tx } from 'utils/transactions';
import { useLoans } from 'sections/loans/contexts/loans';
import Wrapper from './Wrapper';

type CloseProps = {
	loanId: number;
	loanTypeIsETH: boolean;
	loan: Loan;
	loanContract: ethers.Contract;
};

const Close: React.FC<CloseProps> = ({ loan, loanId, loanTypeIsETH, loanContract }) => {
	const router = useRouter();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { reloadPendingWithdrawals } = useLoans();

	const [isWorking, setIsWorking] = useState<string>('');
	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const getTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!loanContract) return null;
			return [loanContract, 'close', [loanId, gas]];
		},
		[loanContract, loanId]
	);

	const close = async (gas: Record<string, number>) => {
		try {
			setIsWorking('closing');
			setTxModalOpen(true);
			await tx(() => getTxData(gas), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) =>
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
			});
			await reloadPendingWithdrawals();
			router.push('/loans/list');
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
				showInterestAccrued: true,

				leftColLabel: 'loans.modify-loan.close.left-col-label',
				leftColAssetName: SYNTH_BY_CURRENCY_KEY[loan.currency],
				leftColAmount: ethers.utils.formatUnits(loan.amount, 18),

				rightColLabel: 'loans.modify-loan.close.right-col-label',
				rightColAssetName: loanTypeIsETH ? 'ETH' : 'renBTC',
				rightColAmount: ethers.utils.formatUnits(loan.collateral, 18),

				buttonLabel: `loans.modify-loan.close.button-labels.${isWorking ? isWorking : 'default'}`,
				buttonIsDisabled: !!isWorking,
				onButtonClick: close,

				error,
				setError,

				txModalOpen,
				setTxModalOpen,
			}}
		/>
	);
};

export default Close;
