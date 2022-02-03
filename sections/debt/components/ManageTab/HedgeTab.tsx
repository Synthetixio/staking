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
import { dSNXBalance } from 'store/debt';
import { formatCryptoCurrency } from 'utils/formatters/number';
import { wei } from '@synthetixio/wei';
import { ExternalLink, FlexDivColCentered } from 'styles/common';
import { Route, Trade, Pool } from '@uniswap/v3-sdk';
import { CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core';
import colors from 'styles/theme/colors';

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
	const balanceOfdSNX = useRecoilValue(dSNXBalance);
	const setBalanceOfdSNX = useSetRecoilState(dSNXBalance);
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
				fetchdSNXContract();
			},
			enabled: approved,
		}
	);

	const fetchdSNXContract = () => {
		dSNXContract
			.connect(provider!)
			.balanceOf(walletAddress)
			.then((balance: BigNumber) => {
				setBalanceOfdSNX(balance);
			});
	};

	useEffect(() => {
		fetchdSNXContract();
	}, []);

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
	}, [amountToSend]);

	const needsToApprove = async () => {
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
					utils.parseUnits(amountToSend || '0', 18),
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
			<StyledBackgroundTab>
				<StyledInputsWrapper>
					<StyledInputWrapper>
						<StyledInputLabel>
							{t('debt.actions.manage.buying')}
							<StyledCryptoCurrencyBox>
								<StyledCryptoCurrencyImage src="https://raw.githubusercontent.com/Synthetixio/synthetix-assets/v2.0.10/synths/sUSD.svg" />{' '}
								dSNX
							</StyledCryptoCurrencyBox>
						</StyledInputLabel>
						<StyledHedgeInput type="number" value={utils.formatUnits(expectedAmountOut, 18)} />
						<StyledBalance>
							{t('debt.actions.manage.balance')}
							{formatCryptoCurrency(wei(balanceOfdSNX), {
								maxDecimals: 1,
								minDecimals: 2,
							})}
						</StyledBalance>
					</StyledInputWrapper>
					<StyledSpacer />
					<StyledInputWrapper>
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
							// @ts-ignore
							autoFocus="autofocus"
						/>
						<StyledBalance>
							{t('debt.actions.manage.balance-usd')}
							{formatCryptoCurrency(wei(sUSDBalance), {
								maxDecimals: 1,
								minDecimals: 2,
							})}
							<StyledMaxButton
								variant="text"
								onClick={() => {
									setAmountToSend(utils.formatUnits(sUSDBalance, 18));
								}}
							>
								{t('debt.actions.manage.max')}
							</StyledMaxButton>
						</StyledBalance>
					</StyledInputWrapper>
				</StyledInputsWrapper>

				<SublineWrapper>
					<StyledGasSelector
						gasLimitEstimate={approved ? swapTx.gasLimit : approveTx.gasLimit}
						onGasPriceChange={approved ? setSwapGasCost : setApproveGasCost}
						optimismLayerOneFee={null}
						altVersion
					/>
					<StyledUniswapLink href="https://info.uniswap.org/#/pools/0x9957c4795ab663622db54fc48fda874da59150ff">
						Uniswap pool
					</StyledUniswapLink>
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
	width: 100%;
	height: 100px;
	margin-top: 80px;
`;

const StyledInputWrapper = styled(FlexDivColCentered)`
	width: 100%;
`;

const StyledBackgroundTab = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	width: 100%;
	height: 100%;
	background-color: ${colors.black};
	padding: 16px;
`;

const StyledInputLabel = styled.div`
	display: flex;
	justify-content: center;
	align-items: baseline;
`;

const StyledHedgeInput = styled(StyledInput)`
	width: 250px;
`;

const StyledBalance = styled.div`
	text-transform: none;
	text-align: center;
	margin-top: 16px;
`;

const StyledCryptoCurrencyBox = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-evenly;
	font-size: 12px;
	margin-top: 14px;
	color: ${colors.white};
	background-color: ${colors.navy};
	border: 1px solid ${colors.grayBlue};
	padding: 4px;
	text-transform: none;
	margin-left: 8px;
	width: 85px;
`;

const StyledCryptoCurrencyImage = styled.img`
	width: 24px;
	height: 24px;
`;

const StyledButton = styled(Button)`
	width: 100%;
	margin-top: 16px;
	align-self: flex-end;
	text-transform: none;
`;

const StyledSpacer = styled.div`
	border-left: 1px solid ${colors.mutedBlue};
	height: 150px;
`;

const StyledMaxButton = styled(Button)`
	margin-left: 16px;
	line-height: 0px;
	height: 20px;
`;

const StyledOutput = styled.span`
	text-transform: none;
	color: white;
`;

const StyledGasSelector = styled(GasSelector)`
	width: 100px;
	display: inline;
`;

const StyledUniswapLink = styled(ExternalLink)`
	font-size: 10px;
	align-self: flex-end;
`;

const SublineWrapper = styled.div`
	display: flex;
	justify-content: space-evenly;
`;

const StyledPriceImpact = styled(StyledOutput)<{ danger?: boolean }>`
	color: ${({ danger }) => (danger ? colors.red : '')};
	font-size: 12px;
`;
