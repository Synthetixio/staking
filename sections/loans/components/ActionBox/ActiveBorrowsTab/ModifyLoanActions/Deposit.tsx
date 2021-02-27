import { useState, useMemo, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import { walletAddressState } from 'store/wallet';
import { Loan } from 'queries/loans/types';
import { tx } from 'utils/transactions';
import Notify from 'containers/Notify';
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
	const collateralDecimals = loanTypeIsETH ? 18 : 8;

	const [depositAmountString, setDepositalAmount] = useState<string>('0');
	const collateralAmount = useMemo(
		() =>
			ethers.utils.parseUnits(ethers.utils.formatUnits(loan.collateral, 18), collateralDecimals), // normalize collateral decimals
		[loan.collateral]
	);
	const depositAmount = useMemo(
		() => ethers.utils.parseUnits(depositAmountString, collateralDecimals),
		[depositAmountString]
	);

	const totalAmount = useMemo(
		() => ethers.utils.formatUnits(collateralAmount.add(depositAmount), collateralDecimals),
		[loan.collateral, depositAmount]
	);

	const loanContractAddress = loanContract?.address;

	const onSetAAmount = (amount: string) =>
		!amount ? setDepositalAmount('0') : setDepositalAmount(amount);
	const onSetAMaxAmount = (amount: string) => setDepositalAmount(amount);

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
			await tx(() => [collateralAssetContract, 'approve', [loanContractAddress, depositAmount]], {
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
					showProgressNotification: (hash: string) =>
						monitorHash({
							txHash: hash,
							onTxConfirmed: () => {},
						}),
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
				aAmountNumber: depositAmountString,
				onSetAAmount,
				onSetAMaxAmount,

				bLabel: 'loans.modify-loan.deposit.b-label',
				bAsset: collateralAsset,
				bAmountNumber: totalAmount,

				buttonLabel: `loans.modify-loan.deposit.button-labels.${isWorking ? isWorking : 'default'}`,
				buttonIsDisabled: !!isWorking,
				onButtonClick: onApproveOrDeposit,
			}}
		/>
	);
};

export default Deposit;
