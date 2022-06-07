import Connector from 'containers/Connector';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
	getSUSDdSNXPool,
	Immutables,
	quoterContract,
	routerContract,
	sUSDContract,
} from 'constants/uniswap';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import { BigNumber, constants, utils } from 'ethers';
import Loader from 'components/Loader';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import GasSelector from 'components/GasSelector';
import { formatCryptoCurrency } from 'utils/formatters/number';
import { wei } from '@synthetixio/wei';
import { Route, Trade, Pool } from '@uniswap/v3-sdk';
import { CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core';
import colors from 'styles/theme/colors';
import { Svg } from 'react-optimized-image';
import dhedge from 'assets/svg/app/dhedge.svg';
import useGetDSnxBalance from 'hooks/useGetDSnxBalance';
import {
	StyledBalance,
	StyledButton,
	StyledCryptoCurrencyBox,
	StyledCryptoCurrencyImage,
	StyledHedgeInput,
	StyledInputLabel,
	StyledMaxButton,
	StyledSpacer,
} from './hedge-tab-ui-components';

export default function HedgeTap() {
	const { t } = useTranslation();
	const [buttonLoading, setButtonLoading] = useState(true);
	const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
	const [amountToSend, setAmountToSend] = useState('');
	const [priceInfo, setPriceInfo] = useState<
		undefined | Trade<Token, Token, TradeType.EXACT_INPUT>
	>(undefined);
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

	const dSNXBalanceQuery = useGetDSnxBalance();
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
				utils.parseUnits(amountToSend || '0', 18),
				expectedAmountOut,
				0,
			],
		],
		swapGasCost,
		{
			onSettled: () => {
				setAmountToSend('');
				setButtonLoading(false);
				dSNXBalanceQuery.refetch();
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

	const needsToApprove = useCallback(async () => {
		if (provider) {
			setButtonLoading(true);
			const amount: BigNumber = await sUSDContract
				.connect(provider)
				.allowance(walletAddress, routerContract.address);
			if (!amount.eq(0)) {
				setApproved(amount.gte(utils.parseUnits(amountToSend || '0', 18)));
			}
			setButtonLoading(false);
		}
	}, [provider, walletAddress, amountToSend]);

	useEffect(() => {
		if (utils.parseUnits(amountToSend || '0', 18).gt(0) && provider && immutables) {
			const calc = async () => {
				const amountOutBalance: BigNumber = await quoterContract
					.connect(provider)
					.callStatic.quoteExactInputSingle(
						immutables.token0,
						immutables.token1,
						immutables.fee,
						utils.parseUnits(amountToSend, 18),
						0
					);
				setExpectedAmountOut(amountOutBalance);
				setPriceInfo(
					Trade.createUncheckedTrade({
						route: new Route([pool!], pool!.token0, pool!.token1),
						inputAmount: CurrencyAmount.fromRawAmount(
							pool!.token0,
							utils.parseUnits(amountToSend || '0', 18).toString()
						),
						outputAmount: CurrencyAmount.fromRawAmount(pool!.token1, amountOutBalance.toString()),
						tradeType: TradeType.EXACT_INPUT,
					})
				);
				needsToApprove();
			};
			try {
				calc();
			} catch (e) {
				setExpectedAmountOut(BigNumber.from(0));
			}
		} else {
			setExpectedAmountOut(BigNumber.from(0));
			setPriceInfo(undefined);
		}
	}, [amountToSend, immutables, needsToApprove, pool, provider]);

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
					utils.parseUnits(amountToSend || '0', 18),
					0
				);
			setExpectedAmountOut(balanceOut);
			const blockNumber = await provider.getBlockNumber();
			setCurrentBlockNumber(blockNumber * 1000);
			await swapTx.refresh();
			swapTx.mutate();
		}
	};

	return (
		<StyledHedgeWrapper>
			<StyledBackgroundTab>
				<StyledInputsWrapper>
					<StyledInputLabel>
						{t('debt.actions.manage.using')}
						<StyledCryptoCurrencyBox>
							<StyledCryptoCurrencyImage src="https://raw.githubusercontent.com/Synthetixio/synthetix-assets/v2.0.10/synths/sUSD.svg" />
							sUSD
						</StyledCryptoCurrencyBox>
					</StyledInputLabel>
					<StyledHedgeInput
						type="number"
						placeholder={formatCryptoCurrency(wei(sUSDBalance), {
							maxDecimals: 1,
							minDecimals: 2,
						})}
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
								setAmountToSend(e.target.value ? e.target.value : '');
							}
						}}
						value={amountToSend}
						autoFocus={true}
					/>
					<StyledBalance>
						{t('debt.actions.manage.balance-usd')}
						{formatCryptoCurrency(wei(sUSDBalance), {
							maxDecimals: 1,
							minDecimals: 2,
						})}
						<StyledMaxButton
							variant="text"
							isActive={true}
							onClick={() => {
								setAmountToSend(utils.formatUnits(sUSDBalance, 18));
							}}
						>
							{t('debt.actions.manage.max')}
						</StyledMaxButton>
					</StyledBalance>
					<StyledSpacer />
					<StyledInputLabel>
						{t('debt.actions.manage.buying')}
						<StyledCryptoCurrencyBox>
							<Svg src={dhedge} width={24} height={24} />
							dSNX
						</StyledCryptoCurrencyBox>
					</StyledInputLabel>
					<StyledHedgeInput type="number" value={utils.formatUnits(expectedAmountOut, 18)} />
					<StyledBalance>
						{t('debt.actions.manage.balance')}
						{formatCryptoCurrency(dSNXBalanceQuery.data || wei(0), {
							maxDecimals: 1,
							minDecimals: 2,
						})}
					</StyledBalance>
				</StyledInputsWrapper>
				<SublineWrapper>
					<StyledGasSelector
						gasLimitEstimate={approved ? swapTx.gasLimit : approveTx.gasLimit}
						onGasPriceChange={approved ? setSwapGasCost : setApproveGasCost}
						optimismLayerOneFee={null}
						altVersion
					/>
				</SublineWrapper>
			</StyledBackgroundTab>
			{buttonLoading ? (
				<Loader inline />
			) : (
				<>
					{priceInfo && (
						<StyledPriceImpact danger={priceInfo.priceImpact.greaterThan(new Percent(5, 100))}>
							{t('debt.actions.manage.price-impact')}&nbsp;
							{priceInfo.priceImpact.toSignificant(2)}%
						</StyledPriceImpact>
					)}
					<StyledButton
						size="lg"
						onClick={approved ? swapTokens : approveRouter}
						variant="primary"
						disabled={utils.parseUnits(amountToSend || '0', 18).eq(0) && expectedAmountOut.eq(0)}
					>
						{approved ? t('debt.actions.manage.swap') : t('debt.actions.manage.approve')}
					</StyledButton>
				</>
			)}
		</StyledHedgeWrapper>
	);
}

const StyledHedgeWrapper = styled.div`
	width: 100%;
	height: 100%;
	margin: 16px;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const StyledInputsWrapper = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	width: 100%;
	height: 100%;
	margin-top: 80px;
`;

const StyledBackgroundTab = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	width: 100%;
	height: 400px;
	background-color: ${(props) => props.theme.colors.black};
	padding: 16px;
`;

const StyledOutput = styled.span`
	text-transform: none;
	color: white;
`;

const StyledGasSelector = styled(GasSelector)`
	width: 100px;
	display: inline;
`;

const SublineWrapper = styled.div`
	display: flex;
	justify-content: space-evenly;
`;

const StyledPriceImpact = styled(StyledOutput)<{ danger?: boolean }>`
	color: ${({ danger }) => (danger ? colors.red : '')};
	font-size: 12px;
`;
