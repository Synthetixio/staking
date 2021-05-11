import React, { FC, useMemo } from 'react';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import BN from 'bn.js';

import { useRecoilValue } from 'recoil';

import {
	TableNoResults,
	TableNoResultsTitle,
	FlexDiv,
	Tooltip,
	FlexDivCentered,
} from 'styles/common';

import { appReadyState } from 'store/app';
import { isWalletConnectedState } from 'store/wallet';
import { CryptoBalance } from 'queries/walletBalances/types';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import Table from 'components/Table';
import Currency from 'components/Currency';
import SynthHolding from 'components/SynthHolding';
import Button from 'components/Button';

import { ProgressBarType } from 'components/ProgressBar/ProgressBar';

import Connector from 'containers/Connector';
import { SynthsTotalSupplyData } from 'queries/synths/useSynthsTotalSupplyQuery';
import { zeroBN } from 'utils/formatters/number';
import { CryptoCurrency, Synths } from 'constants/currency';

import Info from 'assets/svg/app/info.svg';

const SHOW_HEDGING_INDICATOR_THRESHOLD = new BN(0.1);

type DebtPoolTableProps = {
	synthBalances: CryptoBalance[];
	cryptoBalances: CryptoBalance[];
	synthsTotalSupply: SynthsTotalSupplyData;
	synthsTotalValue: BN;
	isLoading: boolean;
	isLoaded: boolean;
};

const DebtPoolTable: FC<DebtPoolTableProps> = ({
	synthBalances,
	cryptoBalances,
	synthsTotalSupply,
	synthsTotalValue,
	isLoading,
	isLoaded,
}) => {
	const { t } = useTranslation();
	const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();
	const { connectWallet } = Connector.useContainer();
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const [renBTCBalance, wBTCBalance, wETHBalance, ETHBalance] = useMemo(
		() => [
			cryptoBalances.find((cryptoBalance) => cryptoBalance.currencyKey === CryptoCurrency.RENBTC),
			cryptoBalances.find((cryptoBalance) => cryptoBalance.currencyKey === CryptoCurrency.WBTC),
			cryptoBalances.find((cryptoBalance) => cryptoBalance.currencyKey === CryptoCurrency.WETH),
			cryptoBalances.find((cryptoBalance) => cryptoBalance.currencyKey === CryptoCurrency.ETH),
		],
		[cryptoBalances]
	);

	const mergedTotalValue = useMemo(
		() =>
			[renBTCBalance, wBTCBalance, wETHBalance, ETHBalance].reduce((total, current) => {
				const usdValue = current?.usdBalance ?? zeroBN;
				return total.add(usdValue);
			}, synthsTotalValue),
		[ETHBalance, renBTCBalance, wBTCBalance, wETHBalance, synthsTotalValue]
	);

	const mergedBTCBalances = useMemo((): CryptoBalance => {
		const sBTCBalance = synthBalances.find(
			(synthBalance) => synthBalance.currencyKey === Synths.sBTC
		);

		const sBTCAmount = sBTCBalance?.balance ?? zeroBN;
		const sBTCUSDAmount = sBTCBalance?.usdBalance ?? zeroBN;
		const renBTCAmount = renBTCBalance?.balance ?? zeroBN;
		const renBTCUSDAmount = renBTCBalance?.usdBalance ?? zeroBN;
		const wBTCAmount = wBTCBalance?.balance ?? zeroBN;
		const wBTCUSDAmount = wBTCBalance?.usdBalance ?? zeroBN;

		return {
			currencyKey: Synths.sBTC,
			balance: sBTCAmount.add(renBTCAmount).add(wBTCAmount),
			usdBalance: sBTCUSDAmount.add(renBTCUSDAmount).add(wBTCUSDAmount),
		};
	}, [synthBalances, renBTCBalance, wBTCBalance]);

	const mergedETHBalances = useMemo((): CryptoBalance => {
		const sETHBalance = synthBalances.find(
			(synthBalance) => synthBalance.currencyKey === Synths.sETH
		);

		const sETHAmount = sETHBalance?.balance ?? zeroBN;
		const sETHUSDAmount = sETHBalance?.usdBalance ?? zeroBN;
		const ETHAmount = ETHBalance?.balance ?? zeroBN;
		const ETHUSDAmount = ETHBalance?.usdBalance ?? zeroBN;
		const wETHAmount = wETHBalance?.balance ?? zeroBN;
		const wETHUSDAmount = wETHBalance?.usdBalance ?? zeroBN;

		return {
			currencyKey: Synths.sETH,
			balance: sETHAmount.add(ETHAmount).add(wETHAmount),
			usdBalance: sETHUSDAmount.add(ETHUSDAmount).add(wETHUSDAmount),
		};
	}, [synthBalances, ETHBalance, wETHBalance]);

	// Replace sETH and sBTC entries with the combined balances of all ETH-related and BTC-related assets
	const mergedBalances = useMemo(
		() =>
			synthBalances
				.filter(({ currencyKey }) => currencyKey !== Synths.sETH && currencyKey !== Synths.sBTC)
				.concat([mergedETHBalances, mergedBTCBalances])
				.filter(({ balance }) => balance.gt(zeroBN)),
		[synthBalances, mergedBTCBalances, mergedETHBalances]
	);

	const assetColumns = useMemo(() => {
		if (!isAppReady) {
			return [];
		}

		const columns = [
			{
				Header: <>{t('synths.assets.synths.table.asset')}</>,
				accessor: 'currencyKey',
				Cell: (cellProps: CellProps<CryptoBalance, CryptoBalance['currencyKey']>) => {
					let displayName = cellProps.value;
					if (cellProps.value === Synths.sETH) {
						displayName = CryptoCurrency.ETH;
					} else if (cellProps.value === Synths.sBTC) {
						displayName = CryptoCurrency.BTC;
					}
					return (
						<Legend>
							<Currency.Name currencyKey={displayName} showIcon={true} />
							{(displayName === CryptoCurrency.ETH || displayName === CryptoCurrency.BTC) && (
								<PortfolioTableTooltip currencyKey={cellProps.value} />
							)}
						</Legend>
					);
				},

				sortable: false,
				width: 100,
			},
			{
				Header: <>{t('synths.assets.synths.table.balance')}</>,
				id: 'balance',
				accessor: (originalRow: any) => originalRow.balance.toNumber(),
				sortType: 'basic',
				Cell: (cellProps: CellProps<CryptoBalance, CryptoBalance['balance']>) => (
					<Currency.Amount
						amountCurrencyKey={cellProps.row.original.currencyKey}
						amount={cellProps.value}
						valueCurrencyKey={selectedPriceCurrency.name}
						totalValue={cellProps.row.original.usdBalance}
						sign={selectedPriceCurrency.sign}
						conversionRate={selectPriceCurrencyRate}
					/>
				),
				width: 100,
				sortable: false,
			},
			{
				Header: <>{t('synths.assets.synths.table.percentage-of-portfolio')}</>,
				id: 'holdings',
				accessor: (originalRow: any) => originalRow.usdBalance.toNumber(),
				sortType: 'basic',
				Cell: (cellProps: CellProps<CryptoBalance>) => {
					let variant: ProgressBarType = 'rainbow';
					if (synthsTotalSupply && synthsTotalSupply.supplyData && mergedTotalValue) {
						const { currencyKey } = cellProps.row.original;
						const poolCurrencyPercent = synthsTotalSupply.supplyData[currencyKey].poolProportion;

						if (poolCurrencyPercent) {
							const holdingPercent = mergedTotalValue.isZero()
								? zeroBN
								: cellProps.row.original.usdBalance.div(mergedTotalValue);
							const deviationFromPool = holdingPercent.sub(poolCurrencyPercent);

							if (deviationFromPool.abs().gte(SHOW_HEDGING_INDICATOR_THRESHOLD)) {
								variant = 'red-simple';
							} else {
								variant = 'green-simple';
							}
						}
					}

					return (
						<SynthHoldingWrapper>
							<SynthHolding
								usdBalance={cellProps.row.original.usdBalance}
								totalUSDBalance={mergedTotalValue ?? zeroBN}
								progressBarVariant={variant}
							/>
						</SynthHoldingWrapper>
					);
				},
				width: 100,
				sortable: false,
			},
			{
				Header: <>{t('synths.assets.synths.table.debt-pool-proportion')}</>,
				id: 'debt-pool-proportion',
				accessor: (originalRow: any) => originalRow.usdBalance.toNumber(),
				sortType: 'basic',
				Cell: (cellProps: CellProps<CryptoBalance>) => {
					const { currencyKey } = cellProps.row.original;
					if (!synthsTotalSupply || !synthsTotalSupply.supplyData) return null;
					const totalPoolValue = synthsTotalSupply?.totalValue ?? zeroBN;
					const currencyValue = synthsTotalSupply.supplyData[currencyKey]?.value ?? zeroBN;

					return (
						<SynthHoldingWrapper>
							<SynthHolding usdBalance={currencyValue} totalUSDBalance={totalPoolValue} />
						</SynthHoldingWrapper>
					);
				},
				width: 100,
				sortable: false,
			},
		];

		return columns;
	}, [
		selectedPriceCurrency.sign,
		t,
		isAppReady,
		synthsTotalSupply,
		selectPriceCurrencyRate,
		selectedPriceCurrency.name,
		mergedTotalValue,
	]);

	if (!isWalletConnected) {
		return (
			<DefaultContainer>
				<Button variant="primary" onClick={connectWallet}>
					{t('common.wallet.connect-wallet')}
				</Button>
			</DefaultContainer>
		);
	}

	return (
		<StyledTable
			palette="primary"
			columns={assetColumns}
			data={mergedBalances && mergedBalances.length > 0 ? mergedBalances : []}
			isLoading={isLoading}
			noResultsMessage={
				isLoaded && mergedBalances.length === 0 ? (
					<TableNoResults>
						<TableNoResultsTitle>{t('common.table.no-data')}</TableNoResultsTitle>
					</TableNoResults>
				) : undefined
			}
			showPagination={true}
		/>
	);
};

type PortfolioTableTooptipProps = {
	currencyKey: string;
};

const PortfolioTableTooltip: FC<PortfolioTableTooptipProps> = ({ currencyKey }) => {
	return (
		<StyledTooltip
			arrow={false}
			content={
				<Trans
					i18nKey={`debt.actions.hedge.info.portfolio-table.${currencyKey}-tooltip`}
					components={[<Strong />, <Strong />]}
				></Trans>
			}
		>
			<TooltipIconContainer>
				<Svg src={Info} />
			</TooltipIconContainer>
		</StyledTooltip>
	);
};

const Legend = styled(FlexDiv)`
	align-items: center;
`;

const SynthHoldingWrapper = styled.div`
	width: 100px;
`;

const StyledTable = styled(Table)`
	padding: 0 10px;
	.table-body-cell {
		height: 40px;
	}
	.table-body-cell,
	.table-header-cell {
		&:last-child {
			justify-content: flex-end;
		}
	}
`;

const StyledTooltip = styled(Tooltip)`
	background: ${(props) => props.theme.colors.navy};
	.tippy-arrow {
		color: ${(props) => props.theme.colors.navy};
	}
	.tippy-content {
		font-size: 14px;
	}
`;

const TooltipIconContainer = styled(FlexDiv)`
	margin-left: 14px;
	align-items: center;
	height: 100%;
`;

const Strong = styled.strong`
	font-family: ${(props) => props.theme.fonts.interBold};
`;

const DefaultContainer = styled(FlexDivCentered)`
	width: 100%;
	justify-content: center;
`;

export default DebtPoolTable;
