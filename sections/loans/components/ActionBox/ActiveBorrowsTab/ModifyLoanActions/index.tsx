import { FC, useMemo } from 'react';
import { ethers } from 'ethers';
import synthetix from 'lib/synthetix';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import Spinner from 'assets/svg/app/loader.svg';
import { useLoans } from 'sections/loans/contexts/loans';

import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Repay from './Repay';
import Draw from './Draw';
import Close from './Close';

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
	const { renBTCContract } = useLoans();
	const { isLoadingLoans, loans } = useLoans();

	const Action = ACTIONS[loanAction];

	const loan = useMemo(() => loans.find((l) => l.id.toString() === loanId), [loans, loanId]);

	const collateralAssetContract = useMemo(() => {
		const {
			contracts: { ProxysBTC: sBTC, ProxysETH: sETH, ProxyERC20sUSD: sUSD },
		} = synthetix.js!;
		const tokens: Record<string, ethers.Contract> = { sBTC, sETH, sUSD };
		const collateralAsset = loanTypeIsETH ? 'ETH' : 'renBTC';
		return tokens[collateralAsset];
	}, [loanTypeIsETH]);

	const loanContract = useMemo(() => {
		const {
			contracts: { CollateralEth: ethLoanContract, CollateralErc20: erc20LoanContract },
		} = synthetix.js!;
		return loanTypeIsETH ? ethLoanContract : erc20LoanContract;
	}, [loanTypeIsETH]);

	const loanStateContract = useMemo(() => {
		const {
			contracts: {
				CollateralStateEth: ethLoanStateContract,
				CollateralStateErc20: erc20LoanStateContract,
			},
		} = synthetix.js!;
		return loanTypeIsETH ? ethLoanStateContract : erc20LoanStateContract;
	}, [loanTypeIsETH]);

	const debtAssetContract = useMemo(() => {
		return loanTypeIsETH ? null : renBTCContract;
	}, [loanTypeIsETH, renBTCContract]);

	return isLoadingLoans ? (
		<StyledSpinner src={Spinner} />
	) : !loan ? null : (
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

const StyledSpinner = styled(Svg)`
	display: block;
	margin: 30px auto;
`;
