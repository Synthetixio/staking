import { useState, useMemo, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import { walletAddressState } from 'store/wallet';
import { Loan } from 'queries/loans/types';
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

	const [isWorking, setIsWorking] = useState<string>('');
	const [isApproved, setIsApproved] = useState(false);

	const collateralAsset = loanTypeIsETH ? 'ETH' : 'renBTC';

	const [depositAmountString, setDepositalAmount] = useState<string>('0');
	const depositAmount = useMemo(
		() => ethers.utils.parseUnits(depositAmountString, loanTypeIsETH ? 18 : 8),
		[depositAmountString]
	);

	const totalAmount = useMemo(
		() => ethers.utils.formatUnits(loan.collateral.add(depositAmount), 18),
		[loan.collateral, depositAmount]
	);

	const loanContractAddress = loanContract?.address;

	const onSetBAmount = (amount: string) =>
		!amount ? setDepositalAmount('0') : setDepositalAmount(amount);
	const onSetBMaxAmount = (amount: string) => setDepositalAmount(amount);

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

	const onApproveOrDeposit = async (e: Event) => {
		e.preventDefault();
		!isApproved ? approve() : deposit();
	};

	const approve = async () => {
		try {
			setIsWorking('approving');
			await tx(() => [collateralAssetContract, 'approve', [loanContractAddress, depositAmount]]);

			if (loanTypeIsETH || !(loanContractAddress && address)) return setIsApproved(true);
			const allowance = await collateralAssetContract.allowance(address, loanContractAddress);
			setIsApproved(allowance.gte(depositAmount));
		} catch {
		} finally {
			setIsWorking('');
		}
	};

	const deposit = async () => {
		try {
			setIsWorking('depositing');
			await tx(
				() => [
					loanContract,
					'deposit',
					[address, loanId, loanTypeIsETH ? { value: depositAmount } : depositAmount],
				],
				{
					showErrorNotification: (e: string) => console.log(e),
				}
			);
			loan.collateral = ethers.utils.parseUnits(totalAmount, 18);
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
				showCRatio: true,

				aLabel: 'loans.modify-loan.deposit.a-label',
				aAsset: collateralAsset,
				aAmountNumber: totalAmount,

				bLabel: 'loans.modify-loan.deposit.b-label',
				bAsset: collateralAsset,
				bAmountNumber: depositAmountString,
				onSetBAmount,
				onSetBMaxAmount,

				buttonLabel: `loans.modify-loan.deposit.${
					isWorking ? isWorking : !isApproved ? 'approve' : 'button'
				}-label`,
				buttonIsDisabled: !!isWorking,
				onButtonClick: onApproveOrDeposit,
			}}
		/>
	);
};

export default Deposit;
