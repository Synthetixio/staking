import { useEffect, useState, FC } from 'react';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';
import synthetix from 'lib/synthetix';
import { walletAddressState } from 'store/wallet';
import { Loan } from 'queries/loans/types';
import { useConfig } from 'sections/loans/hooks/config';

import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Repay from './Repay';
import Draw from './Draw';
import Close from './Close';
import { SYNTH_BY_CURRENCY_KEY } from 'sections/loans/constants';

export const ACTIONS: Record<string, any> = {
	deposit: Deposit,
	withdraw: Withdraw,
	repay: Repay,
	draw: Draw,
	close: Close,
};

export const ACTION_NAMES: Array<string> = Object.keys(ACTIONS);

type ActionsProps = {
	loanId: string;
	loanAction: string;
	loanTypeIsETH: boolean;
};

const Actions: FC<ActionsProps> = ({ loanId, loanAction, loanTypeIsETH }) => {
	const address = useRecoilValue(walletAddressState);
	const { renBTCContract } = useConfig();

	const Action = ACTIONS[loanAction];
	const [loan, setLoan] = useState<Loan | null>(null);
	const [loanContract, setLoanContract] = useState<ethers.Contract | null>(null);
	const [loanStateContract, setLoanStateContract] = useState<ethers.Contract | null>(null);
	const [collateralAssetContract, setCollateralAssetContract] = useState<ethers.Contract | null>(
		null
	);
	const [debtAssetContract, setDebtAssetContract] = useState<ethers.Contract | null>(null);

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

					ProxysBTC: sBTC,
					ProxysETH: sETH,
					ProxyERC20sUSD: sUSD,
				},
			} = synthetix.js!;

			const contract = loanTypeIsETH ? ethLoanStateContract : erc20LoanStateContract;
			const loan: Loan = await contract.getLoan(address, loanId);
			const tokens: Record<string, ethers.Contract> = { sBTC, sETH, sUSD, renBTC: renBTCContract };
			const collateralAsset = loanTypeIsETH ? 'ETH' : 'renBTC';
			const debtAsset = SYNTH_BY_CURRENCY_KEY[loan.currency];

			if (isMounted) {
				setCollateralAssetContract(tokens[collateralAsset] ?? null);
				setDebtAssetContract(tokens[debtAsset]);
				setLoanStateContract(contract);
				setLoanContract(loanTypeIsETH ? ethLoanContract : erc20LoanContract);
				setLoan(loan);
			}
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [address]);

	return !loan ? null : (
		<Action
			{...{
				loanId,
				loanTypeIsETH,
				loan,
				loanContract,
				loanStateContract,
				collateralAssetContract,
				debtAssetContract,
			}}
		/>
	);
};

export default Actions;
