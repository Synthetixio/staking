import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';

import { Loan } from 'containers/Loans/types';
import TransactionNotifier from 'containers/TransactionNotifier';
import { tx } from 'utils/transactions';
import Loans from 'containers/Loans';
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
	const { reloadPendingWithdrawals } = Loans.useContainer();

	const [isWorking, setIsWorking] = useState<string>('');
	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const getTxData = useCallback(() => {
		if (!loanContract) return null;
		return [loanContract, 'close', [loanId]];
	}, [loanContract, loanId]);

	const close = async () => {
		try {
			setIsWorking('closing');
			setTxModalOpen(true);
			await tx(() => getTxData(), {
				showErrorNotification: (e: string) => {
					setError(e);
				},
				showProgressNotification: (hash: string) =>
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
			});
			await reloadPendingWithdrawals();
			setIsWorking('');
			setTxModalOpen(false);
			router.push('/loans/list');
		} catch {
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
				leftColAssetName: loan.currency,
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
