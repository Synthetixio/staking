import { useState } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';

import { Loan } from 'queries/loans/types';
import Notify from 'containers/Notify';
import { SYNTH_BY_CURRENCY_KEY } from 'sections/loans/constants';
import { tx } from 'utils/transactions';
import Wrapper from './Wrapper';

type CloseProps = {
	loanId: number;
	loanTypeIsETH: boolean;
	loan: Loan;
	loanContract: ethers.Contract;
};

const Close: React.FC<CloseProps> = ({ loan, loanId, loanTypeIsETH, loanContract }) => {
	const router = useRouter();
	const { monitorHash } = Notify.useContainer();

	const [isWorking, setIsWorking] = useState<string>('');

	const close = async () => {
		try {
			setIsWorking('closing');
			await tx(() => [loanContract, 'close', [loanId]], {
				showErrorNotification: (e: string) => console.log(e),
				showProgressNotification: (hash: string) =>
					monitorHash({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
			});
			router.push('/loans/list');
		} catch {
		} finally {
			setIsWorking('');
		}
	};

	return (
		<Wrapper
			{...{
				loan,
				loanTypeIsETH,
				showInterestAccrued: true,

				aLabel: 'loans.modify-loan.close.a-label',
				aAsset: SYNTH_BY_CURRENCY_KEY[loan.currency],
				aAmountNumber: ethers.utils.formatUnits(loan.amount, 18),

				bLabel: 'loans.modify-loan.close.b-label',
				bAsset: loanTypeIsETH ? 'ETH' : 'renBTC',
				bAmountNumber: ethers.utils.formatUnits(loan.collateral, 18),

				buttonLabel: `loans.modify-loan.close.button-labels.${isWorking ? isWorking : 'default'}`,
				buttonIsDisabled: !!isWorking,
				onButtonClick: close,
			}}
		/>
	);
};

export default Close;
