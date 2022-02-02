import Connector from 'containers/Connector';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Button from 'components/Button';
import {
	getSUSDdSNXPool,
	Immutables,
	quoterContract,
	routerContract,
	sUSDContract,
} from 'constants/uniswap';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import { StyledInput } from '../../../staking/components/common';
import { BigNumber, utils } from 'ethers';
import Loader from 'components/Loader';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import GasSelector from 'components/GasSelector';
import { Pool } from '@uniswap/v3-sdk';
import { FlexDiv } from 'styles/common';

export default function HedgeTap() {
	const { t } = useTranslation();
	const [buttonLoading, setButtonLoading] = useState(true);
	const [outputLoading, setOutputLoading] = useState(false);
	const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
	const [amountToSend, setAmountToSend] = useState('');
	const [pool, setPool] = useState<Pool | undefined>(undefined);
	const [immutables, setImmutables] = useState<Immutables | undefined>(undefined);
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
				setButtonLoading(false);
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
				0,
			],
		],
		swapGasCost,
		{
			onSettled: () => {
				setAmountToSend('');
				setButtonLoading(false);
			},
			enabled: approved,
		}
	);

	useEffect(() => {
		if (provider && walletAddress) {
			setButtonLoading(true);
			const promises = [];
			promises.push(sUSDContract.connect(provider).balanceOf(walletAddress));
			promises.push(getSUSDdSNXPool(provider));
			promises.push(provider.getBlockNumber());
			Promise.all(promises)
				.then((value) => {
					setPool(value[1][0]);
					setImmutables(value[1][1]);
					setSUSDBalance(value[0]);
					setCurrentBlockNumber(value[2] * 1000);
					setButtonLoading(false);
				})
				.catch(() => setButtonLoading(false));
		}
	}, [provider, walletAddress]);

	useEffect(() => {
		if (!!amountToSend && provider && immutables) {
			setOutputLoading(true);
			needsToApprove();
			quoterContract
				.connect(provider)
				.callStatic.quoteExactInputSingle(
					immutables.token0,
					immutables.token1,
					immutables.fee,
					utils.parseUnits(amountToSend ? amountToSend : '0', 18),
					0
				)
				.then((amountOutBalance: BigNumber) => {
					setExpectedAmountOut(amountOutBalance);
					setOutputLoading(false);
				})
				.catch(() => {
					setOutputLoading(false);
				});
		}
	}, [amountToSend]);

	const needsToApprove = async () => {
		if (provider) {
			setButtonLoading(true);
			const amount: BigNumber = await sUSDContract
				.connect(provider)
				.allowance(walletAddress, routerContract.address);
			setApproved(amount.gte(utils.parseUnits(amountToSend ? amountToSend : '0', 18)));
			setButtonLoading(false);
		}
	};

	const approveRouter = async () => {
		setButtonLoading(true);
		await approveTx.refresh();
		approveTx.mutate();
	};

	const swapTokens = async () => {
		if (provider && immutables) {
			setButtonLoading(true);
			const balanceOut: BigNumber = await quoterContract
				.connect(provider)
				.callStatic.quoteExactInputSingle(
					immutables.token0,
					immutables.token1,
					immutables.fee,
					utils.parseUnits(amountToSend ? amountToSend : '0', 18),
					0
				);
			setExpectedAmountOut(balanceOut);
			const blockNumber = await provider!.getBlockNumber();
			setCurrentBlockNumber(blockNumber * 1000);
			await swapTx.refresh();
			swapTx.mutate();
		}
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
			{buttonLoading ? (
				<Loader inline />
			) : (
				<ButtonContainer>
					<StyledButton onClick={approved ? swapTokens : approveRouter} variant="primary">
						{approved ? t('debt.actions.manage.swap') : t('debt.actions.manage.approve')}
					</StyledButton>
					<Button
						variant="secondary"
						onClick={() => {
							setAmountToSend(sUSDBalance.toString());
						}}
					>
						{t('debt.actions.manage.max')}
					</Button>
				</ButtonContainer>
			)}
			{outputLoading ? (
				<Loader inline />
			) : (
				<>
					<span>{t('debt.actions.manage.output')}</span>
					<span>{utils.formatUnits(expectedAmountOut, 18).slice(0, 12)} dSNX</span>
				</>
			)}
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
	margin-right: 16px;
`;

const ButtonContainer = styled(FlexDiv)`
	align-items: center;
	width: 100%;
	margin: 16px;
	:first-child {
		margin-right: auto;
	}
`;
