import { useState, useMemo, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import { walletAddressState } from 'store/wallet';
import { Loan } from 'queries/loans/types';
import Notify from 'containers/Notify';
import { tx } from 'utils/transactions';
import Wrapper from './Wrapper';

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
	const address = useRecoilValue(walletAddressState);
	const { monitorHash } = Notify.useContainer();

	const [isWorking, setIsWorking] = useState<string>('');
	const [isApproved, setIsApproved] = useState(false);

	const collateralAsset = loanTypeIsETH ? 'ETH' : 'renBTC';
	const collateralDecimals = loanTypeIsETH ? 18 : 8; // todo

	const [depositAmountString, setDepositalAmount] = useState<string>('0');
	const collateralAmount = useMemo(
		() =>
			ethers.utils.parseUnits(ethers.utils.formatUnits(loan.collateral, 18), collateralDecimals), // normalize collateral decimals
		[loan.collateral, collateralDecimals]
	);
	const depositAmount = useMemo(
		() => ethers.utils.parseUnits(depositAmountString, collateralDecimals),
		[depositAmountString, collateralDecimals]
	);

	const totalAmount = useMemo(() => collateralAmount.add(depositAmount), [
		collateralAmount,
		depositAmount,
	]);
	const totalAmountString = useMemo(
		() => ethers.utils.formatUnits(totalAmount, collateralDecimals),
		[totalAmount, collateralDecimals]
	);

	const loanContractAddress = loanContract?.address;

	const onSetAAmount = (amount: string) =>
		!amount ? setDepositalAmount('0') : setDepositalAmount(amount);
	const onSetAMaxAmount = (amount: string) => setDepositalAmount(amount);

	const getApproveTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!(collateralAssetContract && !depositAmount.isZero())) return null;
			return [collateralAssetContract, 'approve', [loanContractAddress, depositAmount, gas]];
		},
		[collateralAssetContract, loanContractAddress, depositAmount]
	);

	const getDepositTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!(loanContract && !depositAmount.isZero())) return null;
			return [
				loanContract,
				'deposit',
				[
					address,
					loanId,
					...(loanTypeIsETH ? [{ value: depositAmount, ...gas }] : [depositAmount, gas]),
				],
			];
		},
		[loanContract, address, loanId, loanTypeIsETH, depositAmount]
	);

	const getTxData = useMemo(() => (!isApproved ? getApproveTxData : getDepositTxData), [
		isApproved,
		getApproveTxData,
		getDepositTxData,
	]);

	const onApproveOrDeposit = async (gas: Record<string, number>) => {
		!isApproved ? approve(gas) : deposit(gas);
	};

	const approve = async (gas: Record<string, number>) => {
		try {
			setIsWorking('approving');
			await tx(() => getApproveTxData(gas), {
				showProgressNotification: (hash: string) =>
					monitorHash({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
			});

			if (loanTypeIsETH || !(loanContractAddress && address)) return setIsApproved(true);
			const allowance = await collateralAssetContract.allowance(address, loanContractAddress);
			setIsApproved(allowance.gte(depositAmount));
		} catch {
		} finally {
			setIsWorking('');
		}
	};

	const deposit = async (gas: Record<string, number>) => {
		try {
			setIsWorking('depositing');
			await tx(() => getDepositTxData(gas), {
				showErrorNotification: (e: string) => console.log(e),
				showProgressNotification: (hash: string) =>
					monitorHash({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
			});
		} catch {
		} finally {
			setIsWorking('');
		}
	};

	useEffect(() => {
		let isMounted = true;
		(async () => {
			if (loanTypeIsETH || !(collateralAssetContract && loanContractAddress && address)) {
				return setIsApproved(true);
			}
			const allowance = await collateralAssetContract.allowance(address, loanContractAddress);
			if (isMounted) setIsApproved(allowance.gte(depositAmount));
		})();
		return () => {
			isMounted = false;
		};
	}, [loanTypeIsETH, collateralAssetContract, address, loanContractAddress, depositAmount]);

	return (
		<Wrapper
			{...{
				getTxData,

				loan,
				loanTypeIsETH,
				showCRatio: true,

				aLabel: 'loans.modify-loan.deposit.a-label',
				aAsset: collateralAsset,
				aAmountNumber: depositAmountString,
				onSetAAmount,
				onSetAMaxAmount,

				bLabel: 'loans.modify-loan.deposit.b-label',
				bAsset: collateralAsset,
				bAmountNumber: totalAmountString,

				buttonLabel: `loans.modify-loan.deposit.button-labels.${isWorking ? isWorking : 'default'}`,
				buttonIsDisabled: !!isWorking,
				onButtonClick: onApproveOrDeposit,
			}}
		/>
	);
};

export default Deposit;
