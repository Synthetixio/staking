import { useState } from 'react';
import { ethers } from 'ethers';
import { wei } from '@synthetixio/wei';

import { Loan } from 'containers/Loans/types';
import Wrapper from './Wrapper';
import { useRouter } from 'next/router';
import ROUTES from 'constants/routes';
import { getRenBTCToken } from 'contracts/renBTCToken';
import { getETHToken } from 'contracts/ethToken';
import Connector from 'containers/Connector';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import { useQuery } from 'react-query';

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
	const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);
	const { useSynthetixTxn } = useSynthetixQueries();
	const router = useRouter();
	const { walletAddress } = Connector.useContainer();

	const [isWorking, setIsWorking] = useState<string>('');
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

	const isApprovedQuery = useQuery(
		'isApproved',
		async () => {
			const allowance = await collateralAssetContract.allowance(walletAddress, loanContractAddress);
			return wei(allowance).gte(depositAmount);
		},
		{ enabled: Boolean(collateralAssetContract && loanContractAddress && walletAddress) }
	);
	const isApproved = loanTypeIsETH ? true : isApprovedQuery.data;

	const collateralAssetContractName = loanTypeIsETH ? 'ProxysETH' : 'ProxyERC20sUSD';

	const approveTxn = useSynthetixTxn(
		collateralAssetContractName,
		'approve',
		[loanContractAddress, depositAmount.toBN()],
		gasPrice,
		{
			enabled: isApproved === false && !loanTypeIsETH,
			onSuccess: async () => {
				await isApprovedQuery.refetch();
				setIsWorking('');
				setTxModalOpen(false);
			},
		}
	);

	const contractName = loanTypeIsETH ? 'CollateralEth' : 'CollateralErc20';

	const depositTxn = useSynthetixTxn(
		contractName,
		'deposit',
		[walletAddress, loanId, ...(loanTypeIsETH ? [] : [depositAmount.toBN()])],
		{ ...gasPrice, value: loanTypeIsETH ? depositAmount.toBN() : 0 },
		{
			enabled: isApproved && depositAmount.gt(0),
			onSuccess: () => {
				setIsWorking('');
				setTxModalOpen(false);
				router.push(ROUTES.Loans.List);
			},
			onError: () => {
				setIsWorking('');
				setTxModalOpen(false);
			},
		}
	);

	const approve = async () => {
		setIsWorking('approving');
		setTxModalOpen(true);
		approveTxn.mutate();
	};

	const deposit = async () => {
		setIsWorking('depositing');
		setTxModalOpen(true);
		depositTxn.mutate();
	};
	const onApproveOrDeposit = async () => {
		!isApproved ? approve() : deposit();
	};

	return (
		<Wrapper
			{...{
				gasLimit: isApproved ? depositTxn.gasLimit : approveTxn.gasLimit,
				optimismLayerOneFee: isApproved
					? depositTxn.optimismLayerOneFee
					: approveTxn.optimismLayerOneFee,
				onGasPriceChange: setGasPrice,
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
				buttonIsDisabled: !!isWorking || !isApproved || depositAmount.eq(0),
				onButtonClick: onApproveOrDeposit,

				error: depositTxn.errorMessage,

				txModalOpen,
				setTxModalOpen,
			}}
		/>
	);
};

export default Deposit;
