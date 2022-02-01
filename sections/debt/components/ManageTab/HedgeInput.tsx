import { StyledInput } from 'components/Input/NumericInput';
import Connector from 'containers/Connector';
import { useState } from 'react';
import styled from 'styled-components';
import Button from 'components/Button';
import { getdSNXSUSDImmutablesAndPool, quoterContract } from 'constants/uniswap';
import { CurrencyAmount, TradeType, Percent, Currency, Token } from '@uniswap/sdk-core';
import { Trade, Route } from '@uniswap/v3-sdk';
import { AlphaRouter, SwapRoute } from '@uniswap/smart-order-router';
import { BigNumber, Contract, providers, utils } from 'ethers';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import { JsonRpcBatchProvider } from '@ethersproject/providers';

interface HedgeInputProps {}

const SNXDebtMirrorToken = new Token(
	1,
	'0x5f7f94a1dd7b15594d17543beb8b30b111dd464c',
	18,
	'dSNX',
	'SNX Debt Mirror'
);

export default function HedgeInput({}: HedgeInputProps) {
	const [amountToSend, setAmountToSend] = useState('');
	const { provider, signer } = Connector.useContainer();
	const router = new AlphaRouter({ chainId: 1, provider: provider as providers.BaseProvider });
	const walletAddress = useRecoilValue(walletAddressState);
	const [trade, setTrade] = useState<SwapRoute>();

	const fetchInformation = async () => {
		const [immutables, pool, poolContract] = await getdSNXSUSDImmutablesAndPool(provider!);
		const typedValueParsed = '100000000000000000000';
		const sUSDAmount = CurrencyAmount.fromRawAmount(pool.token0, typedValueParsed);
		const route = await router.route(sUSDAmount, SNXDebtMirrorToken, TradeType.EXACT_INPUT, {
			recipient: walletAddress!,
			slippageTolerance: new Percent(5, 100),
			deadline: 100,
		});
		console.log(route);
		/* 	 	const uniswapRouter = new Contract(
			'0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
			abi,
			provider!
		); */
		/* 	const sUSDContract = new Contract(
			pool.token0.address,
			['function approve(address spender, uint256 amount) public returns (bool)'],
			signer!
		); */
		if (pool && immutables && provider) {
			const swapRoute = new Route([pool], pool.token0, pool.token1);
			const amountOut = await quoterContract
				.connect(provider)
				.callStatic.quoteExactInputSingle(
					immutables.token0,
					immutables.token1,
					immutables.fee,
					utils.parseUnits(amountToSend, 18).toString(),
					0
				);
			const uncheckedTradeExample = Trade.createUncheckedTrade({
				route: swapRoute,
				inputAmount: CurrencyAmount.fromRawAmount(
					pool.token0,
					utils.parseUnits(amountToSend, 18).toString()
				),
				outputAmount: CurrencyAmount.fromRawAmount(pool.token1, amountOut.toString()),
				tradeType: TradeType.EXACT_INPUT,
			});
			console.log(
				uncheckedTradeExample.swaps[0].inputAmount.toSignificant(),
				uncheckedTradeExample.swaps[0].outputAmount.toSignificant(),
				uncheckedTradeExample
			);

			poolContract.callStatic
				.swap(
					walletAddress,
					true,
					utils.parseUnits(amountToSend, 18).toString(),
					pool.sqrtRatioX96.toString(),
					utils.formatBytes32String('')
				)
				.then(console.log);
			//	setTrade({ trade: uncheckedTradeExample, amountOut: amountOut.toString() });
			/* const approveGas = await sUSDContract.estimateGas.approve(
				'0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
				utils.parseUnits(amountToSend, 18)
			); */
			/* 	console.log(approveGas.toString());
			const gas = await uniswapRouter.estimateGas.swapExactTokensForTokens(
				utils.parseUnits(amountToSend, 18),
				BigNumber.from(uncheckedTradeExample.swaps[0].outputAmount.numerator.toString()),
				[pool.token0.address, pool.token1.address],
				walletAddress!
			);
			console.log(gas.toString());  */
			/* uniswapRouter.callStatic
				.swapExactTokensForTokens(
					utils.parseUnits(amountToSend, 18),
					BigNumber.from(uncheckedTradeExample.swaps[0].outputAmount.numerator.toString()),
					[pool.token0.address, pool.token1.address],
					walletAddress!,
					{ gasPrice: gas }
				)
				.then((data) => console.log(data)); */
		}
	};
	return (
		<StyledInputWrapper>
			<StyledHedgeInput onChange={(e) => setAmountToSend(e.target.value)} value={amountToSend} />
			<Button onClick={fetchInformation} variant="primary">
				Trade
			</Button>
			{/* <span>
				{trade?.route.map((route) => (
					<span>
						{route.tokenPath.map((path) => (
							<span>{path.symbol} =</span>
						))}
					</span>
				))}
			</span>
			<span>
				{trade?.trade.outputAmount.toSignificant(2)}, {trade?.trade.outputAmount.toFixed(2)}
			</span>
			<span>{trade?.estimatedGasUsed.toString()}</span> */}
		</StyledInputWrapper>
	);
}

const StyledInputWrapper = styled.div`
	width: 100%;
`;

const StyledHedgeInput = styled(StyledInput)``;
