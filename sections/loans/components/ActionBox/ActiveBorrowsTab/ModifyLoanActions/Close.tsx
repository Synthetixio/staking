import { useState } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';

import { LoanEntity } from 'queries/loans/types';
import { SYNTH_BY_CURRENCY_KEY } from 'sections/loans/constants';
import { tx } from 'utils/transactions';
import Wrapper from './Wrapper';

type CloseProps = {
	loanId: number;
	loanTypeIsETH: boolean;
	loan: LoanEntity;
	loanContract: ethers.Contract;
};

const Close: React.FC<CloseProps> = ({ loan, loanId, loanTypeIsETH, loanContract }) => {
	const [isClosing, setIsClosing] = useState<boolean>(false);
	const router = useRouter();

	const onSetAAmount = () => {};
	const onSetBAmount = () => {};

	const close = async () => {
		try {
			setIsClosing(true);
			await tx(() => [loanContract, 'close', [loanId]], {
				showErrorNotification: (e: string) => console.log(e),
			});
			router.push('/loans/list');
		} catch {
		} finally {
			setIsClosing(false);
		}
	};

	return (
		<Wrapper
			{...{
				loan,
				loanTypeIsETH,
				showInterestAccrued: true,

				aLabel: 'loans.modify-loan.close.repay-label',
				aAsset: SYNTH_BY_CURRENCY_KEY[loan.currency],
				aAmountNumber: ethers.utils.formatUnits(loan.amount, 18),
				onSetAAmount,

				bLabel: 'loans.modify-loan.close.receive-label',
				bAsset: loanTypeIsETH ? 'ETH' : 'renBTC',
				bAmountNumber: ethers.utils.formatUnits(loan.collateral, 18),
				onSetBAmount,

				buttonLabel: isClosing
					? 'loans.modify-loan.close.progress-label'
					: 'loans.modify-loan.close.button-label',
				buttonIsDisabled: isClosing,
				onButtonClick: close,
			}}
		/>
	);
};

export default Close;
