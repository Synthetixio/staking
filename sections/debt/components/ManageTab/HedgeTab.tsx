import Connector from 'containers/Connector';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Button from 'components/Button';
import { getSUSDdSNXPool, routerContract, sUSDContract } from 'constants/uniswap';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import { StyledInput } from '../../../staking/components/common';
import { BigNumber, utils } from 'ethers';
import Loader from 'components/Loader';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import GasSelector from 'components/GasSelector';
import { Pool } from '@uniswap/v3-sdk';

type AmountOutFuncType = (amountIn: BigNumber) => Promise<BigNumber>;

export default function HedgeTap() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(true);
	const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
	const [amountToSend, setAmountToSend] = useState('');
	const [pool, setPool] = useState<Pool | undefined>(undefined);
	const [amountOutFunc, setAmountOutFunc] = useState<undefined | AmountOutFuncType>(undefined);
	const [sUSDBalance, setSUSDBalance] = useState(BigNumber.from(0));
	const [approved, setApproved] = useState(false);
	const [approveGasCost, setApproveGasCost] = useState<GasPrice | undefined>(undefined);
	const [swapGasCost, setSwapGasCost] = useState<GasPrice | undefined>(undefined);
	const [expectedAmountOut, setExpectedAmountOut] = useState(BigNumber.from(0));
	const { provider } = Connector.useContainer();
	const walletAddress = useRecoilValue(walletAddressState);
	const { useContractTxn } = useSynthetixQueries();
	const approveTx = useContractTxn(
		sUSDContract,
		'approve',
		[routerContract.address, utils.parseUnits(amountToSend ? amountToSend : '0', 18)],
		approveGasCost,
		{
			onSettled: () => {
				needsToApprove();
				setLoading(false);
			},
			enabled: !!amountToSend,
		}
	);
	const swapTx = useContractTxn(
		routerContract,
		'exactInputSingle',
		[
			[
				pool?.token0.address || '',
				pool?.token1.address || '',
				pool?.fee || 300,
				walletAddress || '',
				currentBlockNumber + 100,
				utils.parseUnits(amountToSend ? amountToSend : '0', 18),
				expectedAmountOut,
				BigNumber.from(0),
			],
		],
		swapGasCost,
		{
			onSettled: () => {
				setAmountToSend('');
				setLoading(false);
			},
			enabled: !!amountToSend && !!pool?.fee && !!pool?.token0.address && !!pool?.token1.address,
		}
	);
	useEffect(() => {
		if (provider && walletAddress) {
			setLoading(true);
			sUSDContract
				.connect(provider)
				.balanceOf(walletAddress)
				.then((balance: BigNumber) => {
					setSUSDBalance(balance);
				});
			getSUSDdSNXPool(provider).then(([pool, amountOutFunc]) => {
				setPool(pool);
				setAmountOutFunc(amountOutFunc);
			});
			provider.getBlockNumber().then((blockNumber) => setCurrentBlockNumber(blockNumber * 1000));
			setLoading(false);
		}
	}, [provider, walletAddress]);

	useEffect(() => {
		if (!!amountToSend && !!amountOutFunc) {
			needsToApprove();
			amountOutFunc(utils.parseUnits(amountToSend ? amountToSend : '0', 18)).then(
				(amountOutBalance: BigNumber) => {
					setExpectedAmountOut(amountOutBalance);
				}
			);
		}
	}, [amountToSend]);

	const needsToApprove = async () => {
		if (provider) {
			setLoading(true);
			const amount: BigNumber = await sUSDContract
				.connect(provider)
				.allowance(walletAddress, routerContract.address);
			setApproved(amount.gte(utils.parseUnits(amountToSend ? amountToSend : '0', 18)));
			setLoading(false);
		}
	};

	const approveRouter = () => {
		setLoading(true);
		approveTx.mutate();
	};

	const swapTokens = async () => {
		setLoading(true);
		const [, amountOut] = await getSUSDdSNXPool(provider!);
		const amountOutBalance = await amountOut(
			utils.parseUnits(amountToSend ? amountToSend : '0', 18)
		);
		setExpectedAmountOut(amountOutBalance);
		const blockNumber = await provider!.getBlockNumber();
		setCurrentBlockNumber(blockNumber * 1000);
		await swapTx.refresh();
		swapTx.mutate();
	};
	return (
		<StyledInputWrapper>
			<StyledHedgeInput
				type="number"
				placeholder={utils.formatUnits(sUSDBalance, 18)}
				onChange={(e) => {
					setAmountToSend(e.target.value ? e.target.value : '0');
				}}
				value={amountToSend}
			/>
			<GasSelector
				gasLimitEstimate={approved ? swapTx.gasLimit : approveTx.gasLimit}
				onGasPriceChange={approved ? setSwapGasCost : setApproveGasCost}
				optimismLayerOneFee={null}
				altVersion
			/>
			{loading ? (
				<Loader inline />
			) : (
				<StyledButton onClick={approved ? swapTokens : approveRouter} variant="primary">
					{approved ? t('debt.actions.manage.swap') : t('debt.actions.manage.approve')}
				</StyledButton>
			)}
			<span>{utils.formatUnits(expectedAmountOut, 18)}</span>
		</StyledInputWrapper>
	);
}

const StyledInputWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	> * {
		margin: 8px;
	}
`;

const StyledHedgeInput = styled(StyledInput)``;

const StyledButton = styled(Button)`
	width: 100%;
`;
