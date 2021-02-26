import { useState, useMemo } from 'react';
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

	const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
	const [withdrawalAmount, setWithdrawalAmount] = useState<string>('0');
	const collateralAsset = loanTypeIsETH ? 'ETH' : 'renBTC';
	const remainingAmount = useMemo(
		() =>
			ethers.utils.formatUnits(
				loan.collateral.sub(ethers.utils.parseUnits(withdrawalAmount, 18)),
				18
			),
		[loan.collateral, withdrawalAmount]
	);

	const onSetBAmount = (amount: string) =>
		!amount
			? setWithdrawalAmount('0')
			: ethers.utils.parseUnits(amount, 18).gt(loan.collateral)
			? onSetBMaxAmount()
			: setWithdrawalAmount(amount);
	const onSetBMaxAmount = () => setWithdrawalAmount(ethers.utils.formatUnits(loan.collateral));

	const withdraw = async () => {
		try {
			setIsWithdrawing(true);
			await tx(
				() => [loanContract, 'withdraw', [loanId, ethers.utils.parseUnits(withdrawalAmount, 18)]],
				{
					showErrorNotification: (e: string) => console.log(e),
					showProgressNotification: (hash: string) =>
						monitorHash({
							txHash: hash,
							onTxConfirmed: () => {},
						}),
				}
			);
			loan.collateral = ethers.utils.parseUnits(remainingAmount, 18);
		} catch {
		} finally {
			setIsWithdrawing(false);
		}
	};

	return (
		<Wrapper
			{...{
				loan,
				loanTypeIsETH,
				showCRatio: true,

				aLabel: 'loans.modify-loan.withdraw.a-label',
				aAsset: collateralAsset,
				aAmountNumber: remainingAmount,

				bLabel: 'loans.modify-loan.withdraw.b-label',
				bAsset: collateralAsset,
				bAmountNumber: withdrawalAmount,
				onSetBAmount,
				onSetBMaxAmount,

				buttonLabel: isWithdrawing
					? 'loans.modify-loan.withdraw.progress-label'
					: 'loans.modify-loan.withdraw.button-label',
				buttonIsDisabled: isWithdrawing,
				onButtonClick: withdraw,
			}}
		/>
	);
};

export default Withdraw;
