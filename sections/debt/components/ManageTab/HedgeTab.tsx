import Connector from 'containers/Connector';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Button from 'components/Button';
import {
	dSNXContract,
	getSUSDdSNXPool,
	Immutables,
	quoterContract,
	routerContract,
	sUSDContract,
} from 'constants/uniswap';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { walletAddressState } from 'store/wallet';
import { StyledInput } from '../../../staking/components/common';
import { BigNumber, constants, utils } from 'ethers';
import Loader from 'components/Loader';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import GasSelector from 'components/GasSelector';
import { Pool } from '@uniswap/v3-sdk';
import { dSNXBalance } from 'store/debt';
import { formatCryptoCurrency } from 'utils/formatters/number';
import { wei } from '@synthetixio/wei';
import { ExternalLink } from 'styles/common';

export default function HedgeTap() {
	const { t } = useTranslation();
	const [buttonLoading, setButtonLoading] = useState(true);
	const [outputLoading, setOutputLoading] = useState(false);
	const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
	const [amountToSend, setAmountToSend] = useState(BigNumber.from(0));
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
	const setdSNXBalance = useSetRecoilState(dSNXBalance);
	const approveTx = useContractTxn(
		sUSDContract,
		'approve',
		[routerContract.address, constants.MaxUint256],
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
				amountToSend,
				expectedAmountOut,
				0,
			],
		],
		swapGasCost,
		{
			onSettled: () => {
				setAmountToSend(BigNumber.from(0));
				setButtonLoading(false);
				dSNXContract
					.connect(provider!)
					.balanceOf(walletAddress)
					.then((balance: BigNumber) => {
						setdSNXBalance(balance.mul(utils.parseUnits(pool!.token0Price.toSignificant(2), 18)));
					});
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
		if (amountToSend.gt(0) && provider && immutables) {
			setOutputLoading(true);
			needsToApprove();
			quoterContract
				.connect(provider)
				.callStatic.quoteExactInputSingle(
					immutables.token0,
					immutables.token1,
					immutables.fee,
					amountToSend,
					0
				)
				.then((amountOutBalance: BigNumber) => {
					setExpectedAmountOut(amountOutBalance);
					setOutputLoading(false);
				})
				.catch(() => {
					setExpectedAmountOut(BigNumber.from(0));
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
			setApproved(amount.gte(amountToSend));
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
					amountToSend,
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
		<StyledHedgeWrapper>
			<StyledHedgeInputWrapper>
				<StyledInput
					type="number"
					placeholder={utils.formatUnits(sUSDBalance, 18).concat(' sUSD')}
					onChange={(e) => {
						let hasError: boolean = false;
						try {
							hasError = false;
							const val = utils.parseUnits(e.target.value || '0', 18);
							if (val.gte(constants.MaxUint256)) hasError = true;
						} catch {
							hasError = true;
						}
						if (!hasError) {
							setAmountToSend(utils.parseUnits(e.target.value ? e.target.value : '0', 18));
						}
					}}
					// todo @mf found a way to dont get fucked by the comma
					value={amountToSend.eq(0) ? '' : utils.formatUnits(amountToSend, 18)}
				/>
				<StyledMaxButton
					variant="solid"
					onClick={() => {
						setAmountToSend(sUSDBalance);
					}}
				>
					{t('debt.actions.manage.max')}
				</StyledMaxButton>
				<StyledSUSDBalance>
					{t('debt.actions.manage.sUSD-balance')}
					{formatCryptoCurrency(wei(sUSDBalance), { maxDecimals: 1, minDecimals: 2 })}
				</StyledSUSDBalance>
				<StyledImg src="https://raw.githubusercontent.com/Synthetixio/synthetix-assets/v2.0.12/synths/sUSD.svg" />
			</StyledHedgeInputWrapper>
			<GasSelector
				gasLimitEstimate={approved ? swapTx.gasLimit : approveTx.gasLimit}
				onGasPriceChange={approved ? setSwapGasCost : setApproveGasCost}
				optimismLayerOneFee={null}
				altVersion
			/>
			{buttonLoading ? (
				<Loader inline />
			) : (
				<StyledButton
					onClick={approved ? swapTokens : approveRouter}
					variant="primary"
					disabled={amountToSend.eq(0)}
				>
					{approved ? t('debt.actions.manage.swap') : t('debt.actions.manage.approve')}
				</StyledButton>
			)}
			{outputLoading ? (
				<Loader inline />
			) : (
				<>
					<span>{t('debt.actions.manage.output')}</span>
					<StyledOutput>{utils.formatUnits(expectedAmountOut, 18).slice(0, 12)} dSNX</StyledOutput>
				</>
			)}
			<StyledUniswapLink href="https://info.uniswap.org/#/pools/0x9957c4795ab663622db54fc48fda874da59150ff">
				Uniswap pool
			</StyledUniswapLink>
		</StyledHedgeWrapper>
	);
}

const StyledHedgeWrapper = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	> * {
		margin: 8px;
	}
`;

const StyledHedgeInputWrapper = styled.div`
	position: relative;
	display: flex;
	justify-content: center;
	width: 100%;
	height: 50px;
`;

const StyledButton = styled(Button)`
	width: 100%;
	margin-right: 16px;
`;

const StyledMaxButton = styled(Button)`
	position: absolute;
	right: 0px;
	bottom: 0px;
`;

const StyledImg = styled.img`
	position: absolute;
	top: -30px;
	width: 32px;
	height: 32px;
`;

const StyledOutput = styled.span`
	text-transform: none;
`;

const StyledSUSDBalance = styled.span`
	position: absolute;
	bottom: -15px;
	right: 0px;
	font-size: 10px;
`;

const StyledUniswapLink = styled(ExternalLink)`
	font-size: 10px;
	align-self: flex-end;
`;
