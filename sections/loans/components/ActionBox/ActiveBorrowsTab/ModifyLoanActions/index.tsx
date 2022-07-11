import { FC, useMemo } from 'react';
import styled from 'styled-components';

import Spinner from 'assets/svg/app/loader.svg';
import Loans from 'containers/Loans';

import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Repay from './Repay';
import Draw from './Draw';
import Close from './Close';
import Connector from 'containers/Connector';

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
	const { synthetixjs } = Connector.useContainer();
	const { renBTCContract, isLoadingLoans, loans } = Loans.useContainer();

	const Action = ACTIONS[loanAction];

	const loan = useMemo(() => loans.find((l) => l.id.toString() === loanId), [loans, loanId]);

	const collateralAssetContract = useMemo(() => {
		const {
			contracts: { ProxysBTC: sBTC, ProxysETH: sETH, ProxyERC20sUSD: sUSD },
		} = synthetixjs!;
		const tokens: Record<string, typeof sBTC> = { sBTC, sETH, sUSD };
		const collateralAsset = loanTypeIsETH ? 'ETH' : 'renBTC';
		return tokens[collateralAsset];
	}, [loanTypeIsETH, synthetixjs]);

	const loanContract = useMemo(() => {
		const {
			contracts: { CollateralEth: ethLoanContract, CollateralErc20: erc20LoanContract },
		} = synthetixjs!;
		return loanTypeIsETH ? ethLoanContract : erc20LoanContract;
	}, [loanTypeIsETH, synthetixjs]);

	const loanStateContract = useMemo(() => {
		const {
			contracts: {
				CollateralStateEth: ethLoanStateContract,
				CollateralStateErc20: erc20LoanStateContract,
			},
		} = synthetixjs!;
		return loanTypeIsETH ? ethLoanStateContract : erc20LoanStateContract;
	}, [loanTypeIsETH, synthetixjs]);

	const debtAssetContract = useMemo(() => {
		return loanTypeIsETH ? null : renBTCContract;
	}, [loanTypeIsETH, renBTCContract]);

	return isLoadingLoans ? (
		<StyledSpinner width="38" />
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

const StyledSpinner = styled(Spinner)`
	display: block;
	margin: 30px auto;
`;
