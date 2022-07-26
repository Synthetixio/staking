import { useState, useMemo, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { wei } from '@synthetixio/wei';

import { Loan } from 'containers/Loans/types';
import TransactionNotifier from 'containers/TransactionNotifier';
import { tx } from 'utils/transactions';
import Wrapper from './Wrapper';
import { useRouter } from 'next/router';
import ROUTES from 'constants/routes';
import { getRenBTCToken } from 'contracts/renBTCToken';
import { getETHToken } from 'contracts/ethToken';
import Connector from 'containers/Connector';

type DepositProps = {
	loanId: number;
	loanTypeIsETH: boolean;
	loan: Loan;
	loanContract: ethers.Contract;
	collateralAssetContract: ethers.Contract;
};

const Deposit: React.FC<DepositProps> = ({
	loan,
	loanId,
	loanTypeIsETH,
	loanContract,
	collateralAssetContract,
}) => {
	const router = useRouter();
	const { walletAddress } = Connector.useContainer();

	const { monitorTransaction } = TransactionNotifier.useContainer();

	const [isWorking, setIsWorking] = useState<string>('');
	const [isApproved, setIsApproved] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const collateralAsset = loanTypeIsETH ? 'ETH' : 'renBTC';
	const collateralDecimals = loanTypeIsETH ? getETHToken().decimals : getRenBTCToken().decimals;

	const [depositAmountString, setDepositalAmount] = useState<string | null>(null);

	const collateralAmount = wei(wei(loan.collateral), collateralDecimals);
	const depositAmount = depositAmountString ? wei(depositAmountString, collateralDecimals) : wei(0);

	const totalAmount = collateralAmount.add(depositAmount);
	const totalAmountString = ethers.utils.formatUnits(totalAmount.toBN(), collateralDecimals);

	const loanContractAddress = loanContract?.address;

	const onSetLeftColAmount = (amount: string) =>
		!amount ? setDepositalAmount(null) : setDepositalAmount(amount);
	const onSetLeftColMaxAmount = (amount: string) => setDepositalAmount(amount);

	const getApproveTxData = useCallback(() => {
		if (!(collateralAssetContract && !depositAmount.eq(0))) return null;
		return [collateralAssetContract, 'approve', [loanContractAddress, depositAmount.toBN()]];
	}, [collateralAssetContract, loanContractAddress, depositAmount]);

	const getDepositTxData = useCallback(() => {
		if (!(loanContract && !depositAmount.eq(0))) return null;
		return [
			loanContract,
			'deposit',
			[walletAddress, loanId, ...(loanTypeIsETH ? [] : [depositAmount.toBN()])],
			{ value: loanTypeIsETH ? depositAmount.toBN() : 0 },
		];
	}, [loanContract, walletAddress, loanId, loanTypeIsETH, depositAmount]);

	const getTxData = useMemo(
		() => (!isApproved ? getApproveTxData : getDepositTxData),
		[isApproved, getApproveTxData, getDepositTxData]
	);

	const onApproveOrDeposit = async () => {
		setError(null);
		!isApproved ? approve() : deposit();
	};

	const approve = async () => {
		try {
			setIsWorking('approving');
			setTxModalOpen(true);
			await tx(() => getApproveTxData(), {
				showProgressNotification: (hash: string) =>
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
			});

			if (loanTypeIsETH || !(loanContractAddress && walletAddress)) return setIsApproved(true);
			const allowance = await collateralAssetContract.allowance(walletAddress, loanContractAddress);
			setIsApproved(allowance.gte(depositAmount));
		} catch {
		} finally {
			setIsWorking('');
			setTxModalOpen(false);
		}
	};

	const deposit = async () => {
		try {
			setIsWorking('depositing');
			setTxModalOpen(true);
			await tx(() => getDepositTxData(), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) =>
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
			});
			setIsWorking('');
			setTxModalOpen(false);
			router.push(ROUTES.Loans.List);
		} catch {
		} finally {
			setIsWorking('');
			setTxModalOpen(false);
		}
	};

	useEffect(() => {
		let isMounted = true;
		(async () => {
			if (loanTypeIsETH || !(collateralAssetContract && loanContractAddress && walletAddress)) {
				return setIsApproved(true);
			}
			const allowance = await collateralAssetContract.allowance(walletAddress, loanContractAddress);
			if (isMounted) setIsApproved(allowance.gte(depositAmount));
		})();
		return () => {
			isMounted = false;
		};
	}, [loanTypeIsETH, collateralAssetContract, walletAddress, loanContractAddress, depositAmount]);

	return (
		<Wrapper
			{...{
				getTxData,

				loan,
				loanTypeIsETH,
				showCRatio: true,

				leftColLabel: 'loans.modify-loan.deposit.left-col-label',
				leftColAssetName: collateralAsset,
				leftColAmount: depositAmountString,
				onSetLeftColAmount,
				onSetLeftColMaxAmount,

				rightColLabel: 'loans.modify-loan.deposit.right-col-label',
				rightColAssetName: collateralAsset,
				rightColAmount: totalAmountString,

				buttonLabel: `loans.modify-loan.deposit.button-labels.${isWorking ? isWorking : 'default'}`,
				buttonIsDisabled: !!isWorking,
				onButtonClick: onApproveOrDeposit,

				error,
				setError,

				txModalOpen,
				setTxModalOpen,
			}}
		/>
	);
};

export default Deposit;
