import { useEffect, useState, FC } from 'react';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';
import synthetix from 'lib/synthetix';
import { walletAddressState } from 'store/wallet';
import { LoanEntity } from 'queries/loans/types';

import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Repay from './Repay';
import Draw from './Draw';
import Close from './Close';

export const ACTIONS: Record<string, any> = {
	deposit: Deposit,
	withdraw: Withdraw,
	draw: Draw,
	repay: Repay,
	close: Close,
};

export const ACTION_NAMES: Array<string> = Object.keys(ACTIONS);

type ActionsProps = {
	loanId: string;
	loanAction: string;
	loanTypeIsEth: boolean;
};

const Actions: FC<ActionsProps> = ({ loanId, loanAction, loanTypeIsEth }) => {
	const address = useRecoilValue(walletAddressState);
	const Action = ACTIONS[loanAction];
	const [loan, setLoan] = useState<LoanEntity | null>(null);
	const [loanContract, setLoanContract] = useState<ethers.Contract | null>(null);
	const [loanStateContract, setLoanStateContract] = useState<ethers.Contract | null>(null);

	useEffect(() => {
		if (!address) return;

		let isMounted = true;
		const load = async () => {
			const {
				contracts: {
					CollateralEth: ethLoanContract,
					CollateralErc20: erc20LoanContract,

					CollateralStateEth: ethLoanStateContract,
					CollateralStateErc20: erc20LoanStateContract,
				},
			} = synthetix.js!;
			setLoanContract(loanTypeIsEth ? ethLoanContract : erc20LoanContract);

			const contract = loanTypeIsEth ? ethLoanStateContract : erc20LoanStateContract;
			setLoanStateContract(contract);

			const loan: LoanEntity = await contract.getLoan(address, loanId);
			if (isMounted) {
				setLoan(loan);
			}
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [address]);

	return !loan ? null : (
		<Action {...{ loanId, loanTypeIsEth, loan, loanContract, loanStateContract }} />
	);
};

export default Actions;
